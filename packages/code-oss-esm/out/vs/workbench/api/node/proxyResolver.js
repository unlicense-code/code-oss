/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from '../../../base/common/uri.js';
import { LogLevel as LogServiceLevel } from '../../../platform/log/common/log.js';
import { LogLevel, createHttpPatch, createProxyResolver, createTlsPatch, createNetPatch, loadSystemCertificates, getOrLoadAdditionalCertificates } from '@vscode/proxy-agent';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const http = require('http');
const https = require('https');
const tls = require('tls');
const net = require('net');
const undici = require('undici');
const systemCertificatesV2Default = false;
const useElectronFetchDefault = false;
export function connectProxyResolver(extHostWorkspace, configProvider, extensionService, extHostLogService, mainThreadTelemetry, initData, disposables) {
    const useHostProxy = initData.environment.useHostProxy;
    const doUseHostProxy = typeof useHostProxy === 'boolean' ? useHostProxy : !initData.remote.isRemote;
    const params = {
        resolveProxy: url => extHostWorkspace.resolveProxy(url),
        lookupProxyAuthorization: lookupProxyAuthorization.bind(undefined, extHostWorkspace, extHostLogService, mainThreadTelemetry, configProvider, {}, {}, initData.remote.isRemote, doUseHostProxy),
        getProxyURL: () => configProvider.getConfiguration('http').get('proxy'),
        getProxySupport: () => configProvider.getConfiguration('http').get('proxySupport') || 'off',
        getNoProxyConfig: () => configProvider.getConfiguration('http').get('noProxy') || [],
        addCertificatesV1: () => certSettingV1(configProvider),
        addCertificatesV2: () => certSettingV2(configProvider),
        log: extHostLogService,
        getLogLevel: () => {
            const level = extHostLogService.getLevel();
            switch (level) {
                case LogServiceLevel.Trace: return LogLevel.Trace;
                case LogServiceLevel.Debug: return LogLevel.Debug;
                case LogServiceLevel.Info: return LogLevel.Info;
                case LogServiceLevel.Warning: return LogLevel.Warning;
                case LogServiceLevel.Error: return LogLevel.Error;
                case LogServiceLevel.Off: return LogLevel.Off;
                default: return never(level);
            }
            function never(level) {
                extHostLogService.error('Unknown log level', level);
                return LogLevel.Debug;
            }
        },
        proxyResolveTelemetry: () => { },
        useHostProxy: doUseHostProxy,
        loadAdditionalCertificates: async () => {
            const promises = [];
            if (initData.remote.isRemote) {
                promises.push(loadSystemCertificates({ log: extHostLogService }));
            }
            if (doUseHostProxy) {
                extHostLogService.trace('ProxyResolver#loadAdditionalCertificates: Loading certificates from main process');
                const certs = extHostWorkspace.loadCertificates(); // Loading from main process to share cache.
                certs.then(certs => extHostLogService.trace('ProxyResolver#loadAdditionalCertificates: Loaded certificates from main process', certs.length));
                promises.push(certs);
            }
            // Using https.globalAgent because it is shared with proxy.test.ts and mutable.
            if (initData.environment.extensionTestsLocationURI && https.globalAgent.testCertificates?.length) {
                extHostLogService.trace('ProxyResolver#loadAdditionalCertificates: Loading test certificates');
                promises.push(Promise.resolve(https.globalAgent.testCertificates));
            }
            return (await Promise.all(promises)).flat();
        },
        env: process.env,
    };
    const { resolveProxyWithRequest, resolveProxyURL } = createProxyResolver(params);
    patchGlobalFetch(configProvider, mainThreadTelemetry, initData, resolveProxyURL, params.lookupProxyAuthorization, getOrLoadAdditionalCertificates.bind(undefined, params), disposables);
    const lookup = createPatchedModules(params, resolveProxyWithRequest);
    return configureModuleLoading(extensionService, lookup);
}
const unsafeHeaders = [
    'content-length',
    'host',
    'trailer',
    'te',
    'upgrade',
    'cookie2',
    'keep-alive',
    'transfer-encoding',
    'set-cookie',
];
function patchGlobalFetch(configProvider, mainThreadTelemetry, initData, resolveProxyURL, lookupProxyAuthorization, loadAdditionalCertificates, disposables) {
    if (!globalThis.__vscodeOriginalFetch) {
        const originalFetch = globalThis.fetch;
        globalThis.__vscodeOriginalFetch = originalFetch;
        const patchedFetch = patchFetch(originalFetch, configProvider, resolveProxyURL, lookupProxyAuthorization, loadAdditionalCertificates);
        globalThis.__vscodePatchedFetch = patchedFetch;
        let useElectronFetch = false;
        if (!initData.remote.isRemote) {
            useElectronFetch = configProvider.getConfiguration('http').get('electronFetch', useElectronFetchDefault);
            disposables.add(configProvider.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('http.electronFetch')) {
                    useElectronFetch = configProvider.getConfiguration('http').get('electronFetch', useElectronFetchDefault);
                }
            }));
        }
        // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
        globalThis.fetch = async function fetch(input, init) {
            function getRequestProperty(name) {
                return init && name in init ? init[name] : typeof input === 'object' && 'cache' in input ? input[name] : undefined;
            }
            // Limitations: https://github.com/electron/electron/pull/36733#issuecomment-1405615494
            // net.fetch fails on manual redirect: https://github.com/electron/electron/issues/43715
            const urlString = typeof input === 'string' ? input : 'cache' in input ? input.url : input.toString();
            const isDataUrl = urlString.startsWith('data:');
            if (isDataUrl) {
                recordFetchFeatureUse(mainThreadTelemetry, 'data');
            }
            const isBlobUrl = urlString.startsWith('blob:');
            if (isBlobUrl) {
                recordFetchFeatureUse(mainThreadTelemetry, 'blob');
            }
            const isManualRedirect = getRequestProperty('redirect') === 'manual';
            if (isManualRedirect) {
                recordFetchFeatureUse(mainThreadTelemetry, 'manualRedirect');
            }
            const integrity = getRequestProperty('integrity');
            if (integrity) {
                recordFetchFeatureUse(mainThreadTelemetry, 'integrity');
            }
            if (!useElectronFetch || isDataUrl || isBlobUrl || isManualRedirect || integrity) {
                const response = await patchedFetch(input, init, urlString);
                monitorResponseProperties(mainThreadTelemetry, response, urlString);
                return response;
            }
            // Unsupported headers: https://source.chromium.org/chromium/chromium/src/+/main:services/network/public/cpp/header_util.cc;l=32;drc=ee7299f8961a1b05a3554efcc496b6daa0d7f6e1
            if (init?.headers) {
                const headers = new Headers(init.headers);
                for (const header of unsafeHeaders) {
                    headers.delete(header);
                }
                init = { ...init, headers };
            }
            // Support for URL: https://github.com/electron/electron/issues/43712
            const electronInput = input instanceof URL ? input.toString() : input;
            const electron = require('electron');
            const response = await electron.net.fetch(electronInput, init);
            monitorResponseProperties(mainThreadTelemetry, response, urlString);
            return response;
        };
    }
}
function patchFetch(originalFetch, configProvider, resolveProxyURL, lookupProxyAuthorization, loadAdditionalCertificates) {
    return async function patchedFetch(input, init, urlString) {
        const config = configProvider.getConfiguration('http');
        const enabled = config.get('fetchAdditionalSupport');
        if (!enabled) {
            return originalFetch(input, init);
        }
        const proxySupport = config.get('proxySupport') || 'off';
        const doResolveProxy = proxySupport === 'override' || proxySupport === 'fallback' || (proxySupport === 'on' && (init?.dispatcher) === undefined);
        const addCerts = config.get('systemCertificates');
        if (!doResolveProxy && !addCerts) {
            return originalFetch(input, init);
        }
        if (!urlString) { // for testing
            urlString = typeof input === 'string' ? input : 'cache' in input ? input.url : input.toString();
        }
        const proxyURL = doResolveProxy ? await resolveProxyURL(urlString) : undefined;
        if (!proxyURL && !addCerts) {
            return originalFetch(input, init);
        }
        const ca = addCerts ? [...tls.rootCertificates, ...await loadAdditionalCertificates()] : undefined;
        if (!proxyURL) {
            const modifiedInit = {
                ...init,
                dispatcher: new undici.Agent({
                    allowH2: true,
                    connect: { ca },
                })
            };
            return originalFetch(input, modifiedInit);
        }
        const state = {};
        const proxyAuthorization = await lookupProxyAuthorization(proxyURL, undefined, state);
        const modifiedInit = {
            ...init,
            dispatcher: new undici.ProxyAgent({
                uri: proxyURL,
                allowH2: true,
                headers: proxyAuthorization ? { 'Proxy-Authorization': proxyAuthorization } : undefined,
                ...(addCerts ? {
                    proxyTls: { ca },
                    requestTls: { ca },
                } : {}),
                clientFactory: (origin, opts) => new undici.Pool(origin, opts).compose((dispatch) => {
                    class ProxyAuthHandler extends undici.DecoratorHandler {
                        constructor(dispatch, options, handler) {
                            super(handler);
                            this.dispatch = dispatch;
                            this.options = options;
                            this.handler = handler;
                        }
                        onConnect(abort) {
                            this.abort = abort;
                            this.handler.onConnect?.(abort);
                        }
                        onError(err) {
                            if (!(err instanceof ProxyAuthError)) {
                                return this.handler.onError?.(err);
                            }
                            (async () => {
                                try {
                                    const proxyAuthorization = await lookupProxyAuthorization(proxyURL, err.proxyAuthenticate, state);
                                    if (proxyAuthorization) {
                                        if (!this.options.headers) {
                                            this.options.headers = ['Proxy-Authorization', proxyAuthorization];
                                        }
                                        else if (Array.isArray(this.options.headers)) {
                                            const i = this.options.headers.findIndex((value, index) => index % 2 === 0 && value.toLowerCase() === 'proxy-authorization');
                                            if (i === -1) {
                                                this.options.headers.push('Proxy-Authorization', proxyAuthorization);
                                            }
                                            else {
                                                this.options.headers[i + 1] = proxyAuthorization;
                                            }
                                        }
                                        else {
                                            this.options.headers['Proxy-Authorization'] = proxyAuthorization;
                                        }
                                        this.dispatch(this.options, this);
                                    }
                                    else {
                                        this.handler.onError?.(new undici.errors.RequestAbortedError(`Proxy response (407) ?.== 200 when HTTP Tunneling`)); // Mimick undici's behavior
                                    }
                                }
                                catch (err) {
                                    this.handler.onError?.(err);
                                }
                            })();
                        }
                        onUpgrade(statusCode, headers, socket) {
                            if (statusCode === 407 && headers) {
                                const proxyAuthenticate = [];
                                for (let i = 0; i < headers.length; i += 2) {
                                    if (headers[i].toString().toLowerCase() === 'proxy-authenticate') {
                                        proxyAuthenticate.push(headers[i + 1].toString());
                                    }
                                }
                                if (proxyAuthenticate.length) {
                                    this.abort?.(new ProxyAuthError(proxyAuthenticate));
                                    return;
                                }
                            }
                            this.handler.onUpgrade?.(statusCode, headers, socket);
                        }
                    }
                    return function proxyAuthDispatch(options, handler) {
                        return dispatch(options, new ProxyAuthHandler(dispatch, options, handler));
                    };
                }),
            })
        };
        return originalFetch(input, modifiedInit);
    };
}
class ProxyAuthError extends Error {
    constructor(proxyAuthenticate) {
        super('Proxy authentication required');
        this.proxyAuthenticate = proxyAuthenticate;
    }
}
function monitorResponseProperties(mainThreadTelemetry, response, urlString) {
    const originalUrl = response.url;
    Object.defineProperty(response, 'url', {
        get() {
            recordFetchFeatureUse(mainThreadTelemetry, 'url');
            return originalUrl || urlString;
        }
    });
    const originalType = response.type;
    Object.defineProperty(response, 'type', {
        get() {
            recordFetchFeatureUse(mainThreadTelemetry, 'typeProperty');
            return originalType !== 'default' ? originalType : 'basic';
        }
    });
}
const fetchFeatureUse = {
    url: 0,
    typeProperty: 0,
    data: 0,
    blob: 0,
    integrity: 0,
    manualRedirect: 0,
};
let timer;
function recordFetchFeatureUse(mainThreadTelemetry, feature) {
    if (!fetchFeatureUse[feature]++) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            mainThreadTelemetry.$publicLog2('fetchFeatureUse', fetchFeatureUse);
        }, 10000); // collect additional features for 10 seconds
        timer.unref();
    }
}
function createPatchedModules(params, resolveProxy) {
    function mergeModules(module, patch) {
        return Object.assign(module.default || module, patch);
    }
    return {
        http: mergeModules(http, createHttpPatch(params, http, resolveProxy)),
        https: mergeModules(https, createHttpPatch(params, https, resolveProxy)),
        net: mergeModules(net, createNetPatch(params, net)),
        tls: mergeModules(tls, createTlsPatch(params, tls))
    };
}
function certSettingV1(configProvider) {
    const http = configProvider.getConfiguration('http');
    return !http.get('experimental.systemCertificatesV2', systemCertificatesV2Default) && !!http.get('systemCertificates');
}
function certSettingV2(configProvider) {
    const http = configProvider.getConfiguration('http');
    return !!http.get('experimental.systemCertificatesV2', systemCertificatesV2Default) && !!http.get('systemCertificates');
}
const modulesCache = new Map();
function configureModuleLoading(extensionService, lookup) {
    return extensionService.getExtensionPathIndex()
        .then(extensionPaths => {
        const node_module = require('module');
        const original = node_module._load;
        node_module._load = function load(request, parent, isMain) {
            if (request === 'net') {
                return lookup.net;
            }
            if (request === 'tls') {
                return lookup.tls;
            }
            if (request !== 'http' && request !== 'https') {
                return original.apply(this, arguments);
            }
            const ext = extensionPaths.findSubstr(URI.file(parent.filename));
            let cache = modulesCache.get(ext);
            if (!cache) {
                modulesCache.set(ext, cache = {});
            }
            if (!cache[request]) {
                const mod = lookup[request];
                cache[request] = { ...mod }; // Copy to work around #93167.
            }
            return cache[request];
        };
    });
}
async function lookupProxyAuthorization(extHostWorkspace, extHostLogService, mainThreadTelemetry, configProvider, proxyAuthenticateCache, basicAuthCache, isRemote, useHostProxy, proxyURL, proxyAuthenticate, state) {
    const cached = proxyAuthenticateCache[proxyURL];
    if (proxyAuthenticate) {
        proxyAuthenticateCache[proxyURL] = proxyAuthenticate;
    }
    extHostLogService.trace('ProxyResolver#lookupProxyAuthorization callback', `proxyURL:${proxyURL}`, `proxyAuthenticate:${proxyAuthenticate}`, `proxyAuthenticateCache:${cached}`);
    const header = proxyAuthenticate || cached;
    const authenticate = Array.isArray(header) ? header : typeof header === 'string' ? [header] : [];
    sendTelemetry(mainThreadTelemetry, authenticate, isRemote);
    if (authenticate.some(a => /^(Negotiate|Kerberos)( |$)/i.test(a)) && !state.kerberosRequested) {
        state.kerberosRequested = true;
        try {
            const kerberos = await import('kerberos');
            const url = new URL(proxyURL);
            const spn = configProvider.getConfiguration('http').get('proxyKerberosServicePrincipal')
                || (process.platform === 'win32' ? `HTTP/${url.hostname}` : `HTTP@${url.hostname}`);
            extHostLogService.debug('ProxyResolver#lookupProxyAuthorization Kerberos authentication lookup', `proxyURL:${proxyURL}`, `spn:${spn}`);
            const client = await kerberos.initializeClient(spn);
            const response = await client.step('');
            return 'Negotiate ' + response;
        }
        catch (err) {
            extHostLogService.debug('ProxyResolver#lookupProxyAuthorization Kerberos authentication failed', err);
        }
        if (isRemote && useHostProxy) {
            extHostLogService.debug('ProxyResolver#lookupProxyAuthorization Kerberos authentication lookup on host', `proxyURL:${proxyURL}`);
            const auth = await extHostWorkspace.lookupKerberosAuthorization(proxyURL);
            if (auth) {
                return 'Negotiate ' + auth;
            }
        }
    }
    const basicAuthHeader = authenticate.find(a => /^Basic( |$)/i.test(a));
    if (basicAuthHeader) {
        try {
            const cachedAuth = basicAuthCache[proxyURL];
            if (cachedAuth) {
                if (state.basicAuthCacheUsed) {
                    extHostLogService.debug('ProxyResolver#lookupProxyAuthorization Basic authentication deleting cached credentials', `proxyURL:${proxyURL}`);
                    delete basicAuthCache[proxyURL];
                }
                else {
                    extHostLogService.debug('ProxyResolver#lookupProxyAuthorization Basic authentication using cached credentials', `proxyURL:${proxyURL}`);
                    state.basicAuthCacheUsed = true;
                    return cachedAuth;
                }
            }
            state.basicAuthAttempt = (state.basicAuthAttempt || 0) + 1;
            const realm = / realm="([^"]+)"/i.exec(basicAuthHeader)?.[1];
            extHostLogService.debug('ProxyResolver#lookupProxyAuthorization Basic authentication lookup', `proxyURL:${proxyURL}`, `realm:${realm}`);
            const url = new URL(proxyURL);
            const authInfo = {
                scheme: 'basic',
                host: url.hostname,
                port: Number(url.port),
                realm: realm || '',
                isProxy: true,
                attempt: state.basicAuthAttempt,
            };
            const credentials = await extHostWorkspace.lookupAuthorization(authInfo);
            if (credentials) {
                extHostLogService.debug('ProxyResolver#lookupProxyAuthorization Basic authentication received credentials', `proxyURL:${proxyURL}`, `realm:${realm}`);
                const auth = 'Basic ' + Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
                basicAuthCache[proxyURL] = auth;
                return auth;
            }
            else {
                extHostLogService.debug('ProxyResolver#lookupProxyAuthorization Basic authentication received no credentials', `proxyURL:${proxyURL}`, `realm:${realm}`);
            }
        }
        catch (err) {
            extHostLogService.error('ProxyResolver#lookupProxyAuthorization Basic authentication failed', err);
        }
    }
    return undefined;
}
let telemetrySent = false;
function sendTelemetry(mainThreadTelemetry, authenticate, isRemote) {
    if (telemetrySent || !authenticate.length) {
        return;
    }
    telemetrySent = true;
    mainThreadTelemetry.$publicLog2('proxyAuthenticationRequest', {
        authenticationType: authenticate.map(a => a.split(' ')[0]).join(','),
        extensionHostType: isRemote ? 'remote' : 'local',
    });
}
