/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as errors from './errors.js';
import * as platform from './platform.js';
import { equalsIgnoreCase, startsWithIgnoreCase } from './strings.js';
import { URI } from './uri.js';
import * as paths from './path.js';
export var Schemas;
(function (Schemas) {
    /**
     * A schema that is used for models that exist in memory
     * only and that have no correspondence on a server or such.
     */
    Schemas.inMemory = 'inmemory';
    /**
     * A schema that is used for setting files
     */
    Schemas.vscode = 'vscode';
    /**
     * A schema that is used for internal private files
     */
    Schemas.internal = 'private';
    /**
     * A walk-through document.
     */
    Schemas.walkThrough = 'walkThrough';
    /**
     * An embedded code snippet.
     */
    Schemas.walkThroughSnippet = 'walkThroughSnippet';
    Schemas.http = 'http';
    Schemas.https = 'https';
    Schemas.file = 'file';
    Schemas.mailto = 'mailto';
    Schemas.untitled = 'untitled';
    Schemas.data = 'data';
    Schemas.command = 'command';
    Schemas.vscodeRemote = 'vscode-remote';
    Schemas.vscodeRemoteResource = 'vscode-remote-resource';
    Schemas.vscodeManagedRemoteResource = 'vscode-managed-remote-resource';
    Schemas.vscodeUserData = 'vscode-userdata';
    Schemas.vscodeCustomEditor = 'vscode-custom-editor';
    Schemas.vscodeNotebookCell = 'vscode-notebook-cell';
    Schemas.vscodeNotebookCellMetadata = 'vscode-notebook-cell-metadata';
    Schemas.vscodeNotebookCellMetadataDiff = 'vscode-notebook-cell-metadata-diff';
    Schemas.vscodeNotebookCellOutput = 'vscode-notebook-cell-output';
    Schemas.vscodeNotebookCellOutputDiff = 'vscode-notebook-cell-output-diff';
    Schemas.vscodeNotebookMetadata = 'vscode-notebook-metadata';
    Schemas.vscodeInteractiveInput = 'vscode-interactive-input';
    Schemas.vscodeSettings = 'vscode-settings';
    Schemas.vscodeWorkspaceTrust = 'vscode-workspace-trust';
    Schemas.vscodeTerminal = 'vscode-terminal';
    /** Scheme used for code blocks in chat. */
    Schemas.vscodeChatCodeBlock = 'vscode-chat-code-block';
    /** Scheme used for LHS of code compare (aka diff) blocks in chat. */
    Schemas.vscodeChatCodeCompareBlock = 'vscode-chat-code-compare-block';
    /** Scheme used for the chat input editor. */
    Schemas.vscodeChatSesssion = 'vscode-chat-editor';
    /**
     * Scheme used internally for webviews that aren't linked to a resource (i.e. not custom editors)
     */
    Schemas.webviewPanel = 'webview-panel';
    /**
     * Scheme used for loading the wrapper html and script in webviews.
     */
    Schemas.vscodeWebview = 'vscode-webview';
    /**
     * Scheme used for extension pages
     */
    Schemas.extension = 'extension';
    /**
     * Scheme used as a replacement of `file` scheme to load
     * files with our custom protocol handler (desktop only).
     */
    Schemas.vscodeFileResource = 'vscode-file';
    /**
     * Scheme used for temporary resources
     */
    Schemas.tmp = 'tmp';
    /**
     * Scheme used vs live share
     */
    Schemas.vsls = 'vsls';
    /**
     * Scheme used for the Source Control commit input's text document
     */
    Schemas.vscodeSourceControl = 'vscode-scm';
    /**
     * Scheme used for input box for creating comments.
     */
    Schemas.commentsInput = 'comment';
    /**
     * Scheme used for special rendering of settings in the release notes
     */
    Schemas.codeSetting = 'code-setting';
    /**
     * Scheme used for output panel resources
     */
    Schemas.outputChannel = 'output';
    /**
     * Scheme used for the accessible view
     */
    Schemas.accessibleView = 'accessible-view';
})(Schemas || (Schemas = {}));
export function matchesScheme(target, scheme) {
    if (URI.isUri(target)) {
        return equalsIgnoreCase(target.scheme, scheme);
    }
    else {
        return startsWithIgnoreCase(target, scheme + ':');
    }
}
export function matchesSomeScheme(target, ...schemes) {
    return schemes.some(scheme => matchesScheme(target, scheme));
}
export const connectionTokenCookieName = 'vscode-tkn';
export const connectionTokenQueryName = 'tkn';
class RemoteAuthoritiesImpl {
    constructor() {
        this._hosts = Object.create(null);
        this._ports = Object.create(null);
        this._connectionTokens = Object.create(null);
        this._preferredWebSchema = 'http';
        this._delegate = null;
        this._serverRootPath = '/';
    }
    setPreferredWebSchema(schema) {
        this._preferredWebSchema = schema;
    }
    setDelegate(delegate) {
        this._delegate = delegate;
    }
    setServerRootPath(product, serverBasePath) {
        this._serverRootPath = getServerRootPath(product, serverBasePath);
    }
    getServerRootPath() {
        return this._serverRootPath;
    }
    get _remoteResourcesPath() {
        return paths.posix.join(this._serverRootPath, Schemas.vscodeRemoteResource);
    }
    set(authority, host, port) {
        this._hosts[authority] = host;
        this._ports[authority] = port;
    }
    setConnectionToken(authority, connectionToken) {
        this._connectionTokens[authority] = connectionToken;
    }
    getPreferredWebSchema() {
        return this._preferredWebSchema;
    }
    rewrite(uri) {
        if (this._delegate) {
            try {
                return this._delegate(uri);
            }
            catch (err) {
                errors.onUnexpectedError(err);
                return uri;
            }
        }
        const authority = uri.authority;
        let host = this._hosts[authority];
        if (host && host.indexOf(':') !== -1 && host.indexOf('[') === -1) {
            host = `[${host}]`;
        }
        const port = this._ports[authority];
        const connectionToken = this._connectionTokens[authority];
        let query = `path=${encodeURIComponent(uri.path)}`;
        if (typeof connectionToken === 'string') {
            query += `&${connectionTokenQueryName}=${encodeURIComponent(connectionToken)}`;
        }
        return URI.from({
            scheme: platform.isWeb ? this._preferredWebSchema : Schemas.vscodeRemoteResource,
            authority: `${host}:${port}`,
            path: this._remoteResourcesPath,
            query
        });
    }
}
export const RemoteAuthorities = new RemoteAuthoritiesImpl();
export function getServerRootPath(product, basePath) {
    return paths.posix.join(basePath ?? '/', `${product.quality ?? 'oss'}-${product.commit ?? 'dev'}`);
}
export const builtinExtensionsPath = 'vs/../../extensions';
export const nodeModulesPath = 'vs/../../node_modules';
export const nodeModulesAsarPath = 'vs/../../node_modules.asar';
export const nodeModulesAsarUnpackedPath = 'vs/../../node_modules.asar.unpacked';
export const VSCODE_AUTHORITY = 'vscode-app';
class FileAccessImpl {
    static { this.FALLBACK_AUTHORITY = VSCODE_AUTHORITY; }
    /**
     * Returns a URI to use in contexts where the browser is responsible
     * for loading (e.g. fetch()) or when used within the DOM.
     *
     * **Note:** use `dom.ts#asCSSUrl` whenever the URL is to be used in CSS context.
     */
    asBrowserUri(resourcePath) {
        const uri = this.toUri(resourcePath);
        return this.uriToBrowserUri(uri);
    }
    /**
     * Returns a URI to use in contexts where the browser is responsible
     * for loading (e.g. fetch()) or when used within the DOM.
     *
     * **Note:** use `dom.ts#asCSSUrl` whenever the URL is to be used in CSS context.
     */
    uriToBrowserUri(uri) {
        // Handle remote URIs via `RemoteAuthorities`
        if (uri.scheme === Schemas.vscodeRemote) {
            return RemoteAuthorities.rewrite(uri);
        }
        // Convert to `vscode-file` resource..
        if (
        // ...only ever for `file` resources
        uri.scheme === Schemas.file &&
            (
            // ...and we run in native environments
            platform.isNative ||
                // ...or web worker extensions on desktop
                (platform.webWorkerOrigin === `${Schemas.vscodeFileResource}://${FileAccessImpl.FALLBACK_AUTHORITY}`))) {
            return uri.with({
                scheme: Schemas.vscodeFileResource,
                // We need to provide an authority here so that it can serve
                // as origin for network and loading matters in chromium.
                // If the URI is not coming with an authority already, we
                // add our own
                authority: uri.authority || FileAccessImpl.FALLBACK_AUTHORITY,
                query: null,
                fragment: null
            });
        }
        return uri;
    }
    /**
     * Returns the `file` URI to use in contexts where node.js
     * is responsible for loading.
     */
    asFileUri(resourcePath) {
        const uri = this.toUri(resourcePath);
        return this.uriToFileUri(uri);
    }
    /**
     * Returns the `file` URI to use in contexts where node.js
     * is responsible for loading.
     */
    uriToFileUri(uri) {
        // Only convert the URI if it is `vscode-file:` scheme
        if (uri.scheme === Schemas.vscodeFileResource) {
            return uri.with({
                scheme: Schemas.file,
                // Only preserve the `authority` if it is different from
                // our fallback authority. This ensures we properly preserve
                // Windows UNC paths that come with their own authority.
                authority: uri.authority !== FileAccessImpl.FALLBACK_AUTHORITY ? uri.authority : null,
                query: null,
                fragment: null
            });
        }
        return uri;
    }
    toUri(uriOrModule, moduleIdToUrl) {
        if (URI.isUri(uriOrModule)) {
            return uriOrModule;
        }
        if (globalThis._VSCODE_FILE_ROOT) {
            const rootUriOrPath = globalThis._VSCODE_FILE_ROOT;
            // File URL (with scheme)
            if (/^\w[\w\d+.-]*:\/\//.test(rootUriOrPath)) {
                return URI.joinPath(URI.parse(rootUriOrPath, true), uriOrModule);
            }
            // File Path (no scheme)
            const modulePath = paths.join(rootUriOrPath, uriOrModule);
            return URI.file(modulePath);
        }
        return URI.parse(moduleIdToUrl.toUrl(uriOrModule));
    }
}
export const FileAccess = new FileAccessImpl();
export var COI;
(function (COI) {
    const coiHeaders = new Map([
        ['1', { 'Cross-Origin-Opener-Policy': 'same-origin' }],
        ['2', { 'Cross-Origin-Embedder-Policy': 'require-corp' }],
        ['3', { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' }],
    ]);
    COI.CoopAndCoep = Object.freeze(coiHeaders.get('3'));
    const coiSearchParamName = 'vscode-coi';
    /**
     * Extract desired headers from `vscode-coi` invocation
     */
    function getHeadersFromQuery(url) {
        let params;
        if (typeof url === 'string') {
            params = new URL(url).searchParams;
        }
        else if (url instanceof URL) {
            params = url.searchParams;
        }
        else if (URI.isUri(url)) {
            params = new URL(url.toString(true)).searchParams;
        }
        const value = params?.get(coiSearchParamName);
        if (!value) {
            return undefined;
        }
        return coiHeaders.get(value);
    }
    COI.getHeadersFromQuery = getHeadersFromQuery;
    /**
     * Add the `vscode-coi` query attribute based on wanting `COOP` and `COEP`. Will be a noop when `crossOriginIsolated`
     * isn't enabled the current context
     */
    function addSearchParam(urlOrSearch, coop, coep) {
        if (!globalThis.crossOriginIsolated) {
            // depends on the current context being COI
            return;
        }
        const value = coop && coep ? '3' : coep ? '2' : '1';
        if (urlOrSearch instanceof URLSearchParams) {
            urlOrSearch.set(coiSearchParamName, value);
        }
        else {
            urlOrSearch[coiSearchParamName] = value;
        }
    }
    COI.addSearchParam = addSearchParam;
})(COI || (COI = {}));
