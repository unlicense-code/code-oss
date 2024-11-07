/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BrowserExtensionHostKindPicker_1;
import { mainWindow } from '../../../../base/browser/window.js';
import { Schemas } from '../../../../base/common/network.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { getLogs } from '../../../../platform/log/browser/log.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRemoteAuthorityResolverService, RemoteAuthorityResolverError } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { IRemoteExtensionsScannerService } from '../../../../platform/remote/common/remoteExtensionsScanner.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
import { IWebExtensionsScannerService, IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from '../../extensionManagement/common/extensionManagement.js';
import { WebWorkerExtensionHost } from './webWorkerExtensionHost.js';
import { FetchFileSystemProvider } from './webWorkerFileSystemProvider.js';
import { AbstractExtensionService, ResolvedExtensions, checkEnabledAndProposedAPI } from '../common/abstractExtensionService.js';
import { extensionHostKindToString, extensionRunningPreferenceToString } from '../common/extensionHostKind.js';
import { IExtensionManifestPropertiesService } from '../common/extensionManifestPropertiesService.js';
import { filterExtensionDescriptions } from '../common/extensionRunningLocationTracker.js';
import { ExtensionHostExtensions, IExtensionService, toExtensionDescription } from '../common/extensions.js';
import { ExtensionsProposedApi } from '../common/extensionsProposedApi.js';
import { dedupExtensions } from '../common/extensionsUtil.js';
import { RemoteExtensionHost } from '../common/remoteExtensionHost.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { IRemoteExplorerService } from '../../remote/common/remoteExplorerService.js';
import { IUserDataInitializationService } from '../../userData/browser/userDataInit.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
let ExtensionService = class ExtensionService extends AbstractExtensionService {
    constructor(instantiationService, notificationService, _browserEnvironmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, _webExtensionsScannerService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, _userDataInitializationService, _userDataProfileService, _workspaceTrustManagementService, _remoteExplorerService, dialogService) {
        const extensionsProposedApi = instantiationService.createInstance(ExtensionsProposedApi);
        const extensionHostFactory = new BrowserExtensionHostFactory(extensionsProposedApi, () => this._scanWebExtensions(), () => this._getExtensionRegistrySnapshotWhenReady(), instantiationService, remoteAgentService, remoteAuthorityResolverService, extensionEnablementService, logService);
        super(extensionsProposedApi, extensionHostFactory, new BrowserExtensionHostKindPicker(logService), instantiationService, notificationService, _browserEnvironmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService, logService, remoteAgentService, remoteExtensionsScannerService, lifecycleService, remoteAuthorityResolverService, dialogService);
        this._browserEnvironmentService = _browserEnvironmentService;
        this._webExtensionsScannerService = _webExtensionsScannerService;
        this._userDataInitializationService = _userDataInitializationService;
        this._userDataProfileService = _userDataProfileService;
        this._workspaceTrustManagementService = _workspaceTrustManagementService;
        this._remoteExplorerService = _remoteExplorerService;
        // Initialize installed extensions first and do it only after workbench is ready
        lifecycleService.when(2 /* LifecyclePhase.Ready */).then(async () => {
            await this._userDataInitializationService.initializeInstalledExtensions(this._instantiationService);
            this._initialize();
        });
        this._initFetchFileSystem();
    }
    _initFetchFileSystem() {
        const provider = new FetchFileSystemProvider();
        this._register(this._fileService.registerProvider(Schemas.http, provider));
        this._register(this._fileService.registerProvider(Schemas.https, provider));
    }
    async _scanWebExtensions() {
        const system = [], user = [], development = [];
        try {
            await Promise.all([
                this._webExtensionsScannerService.scanSystemExtensions().then(extensions => system.push(...extensions.map(e => toExtensionDescription(e)))),
                this._webExtensionsScannerService.scanUserExtensions(this._userDataProfileService.currentProfile.extensionsResource, { skipInvalidExtensions: true }).then(extensions => user.push(...extensions.map(e => toExtensionDescription(e)))),
                this._webExtensionsScannerService.scanExtensionsUnderDevelopment().then(extensions => development.push(...extensions.map(e => toExtensionDescription(e, true))))
            ]);
        }
        catch (error) {
            this._logService.error(error);
        }
        return dedupExtensions(system, user, [], development, this._logService);
    }
    async _resolveExtensionsDefault() {
        const [localExtensions, remoteExtensions] = await Promise.all([
            this._scanWebExtensions(),
            this._remoteExtensionsScannerService.scanExtensions()
        ]);
        return new ResolvedExtensions(localExtensions, remoteExtensions, /*hasLocalProcess*/ false, /*allowRemoteExtensionsInLocalWebWorker*/ true);
    }
    async _resolveExtensions() {
        if (!this._browserEnvironmentService.expectsResolverExtension) {
            return this._resolveExtensionsDefault();
        }
        const remoteAuthority = this._environmentService.remoteAuthority;
        // Now that the canonical URI provider has been registered, we need to wait for the trust state to be
        // calculated. The trust state will be used while resolving the authority, however the resolver can
        // override the trust state through the resolver result.
        await this._workspaceTrustManagementService.workspaceResolved;
        let resolverResult;
        try {
            resolverResult = await this._resolveAuthorityInitial(remoteAuthority);
        }
        catch (err) {
            if (RemoteAuthorityResolverError.isHandled(err)) {
                console.log(`Error handled: Not showing a notification for the error`);
            }
            this._remoteAuthorityResolverService._setResolvedAuthorityError(remoteAuthority, err);
            // Proceed with the local extension host
            return this._resolveExtensionsDefault();
        }
        // set the resolved authority
        this._remoteAuthorityResolverService._setResolvedAuthority(resolverResult.authority, resolverResult.options);
        this._remoteExplorerService.setTunnelInformation(resolverResult.tunnelInformation);
        // monitor for breakage
        const connection = this._remoteAgentService.getConnection();
        if (connection) {
            connection.onDidStateChange(async (e) => {
                if (e.type === 0 /* PersistentConnectionEventType.ConnectionLost */) {
                    this._remoteAuthorityResolverService._clearResolvedAuthority(remoteAuthority);
                }
            });
            connection.onReconnecting(() => this._resolveAuthorityAgain());
        }
        return this._resolveExtensionsDefault();
    }
    async _onExtensionHostExit(code) {
        // Dispose everything associated with the extension host
        await this._doStopExtensionHosts();
        // If we are running extension tests, forward logs and exit code
        const automatedWindow = mainWindow;
        if (typeof automatedWindow.codeAutomationExit === 'function') {
            automatedWindow.codeAutomationExit(code, await getLogs(this._fileService, this._environmentService));
        }
    }
    async _resolveAuthority(remoteAuthority) {
        return this._resolveAuthorityOnExtensionHosts(2 /* ExtensionHostKind.LocalWebWorker */, remoteAuthority);
    }
};
ExtensionService = __decorate([
    __param(0, IInstantiationService),
    __param(1, INotificationService),
    __param(2, IBrowserWorkbenchEnvironmentService),
    __param(3, ITelemetryService),
    __param(4, IWorkbenchExtensionEnablementService),
    __param(5, IFileService),
    __param(6, IProductService),
    __param(7, IWorkbenchExtensionManagementService),
    __param(8, IWorkspaceContextService),
    __param(9, IConfigurationService),
    __param(10, IExtensionManifestPropertiesService),
    __param(11, IWebExtensionsScannerService),
    __param(12, ILogService),
    __param(13, IRemoteAgentService),
    __param(14, IRemoteExtensionsScannerService),
    __param(15, ILifecycleService),
    __param(16, IRemoteAuthorityResolverService),
    __param(17, IUserDataInitializationService),
    __param(18, IUserDataProfileService),
    __param(19, IWorkspaceTrustManagementService),
    __param(20, IRemoteExplorerService),
    __param(21, IDialogService)
], ExtensionService);
export { ExtensionService };
let BrowserExtensionHostFactory = class BrowserExtensionHostFactory {
    constructor(_extensionsProposedApi, _scanWebExtensions, _getExtensionRegistrySnapshotWhenReady, _instantiationService, _remoteAgentService, _remoteAuthorityResolverService, _extensionEnablementService, _logService) {
        this._extensionsProposedApi = _extensionsProposedApi;
        this._scanWebExtensions = _scanWebExtensions;
        this._getExtensionRegistrySnapshotWhenReady = _getExtensionRegistrySnapshotWhenReady;
        this._instantiationService = _instantiationService;
        this._remoteAgentService = _remoteAgentService;
        this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
        this._extensionEnablementService = _extensionEnablementService;
        this._logService = _logService;
    }
    createExtensionHost(runningLocations, runningLocation, isInitialStart) {
        switch (runningLocation.kind) {
            case 1 /* ExtensionHostKind.LocalProcess */: {
                return null;
            }
            case 2 /* ExtensionHostKind.LocalWebWorker */: {
                const startup = (isInitialStart
                    ? 2 /* ExtensionHostStartup.EagerManualStart */
                    : 1 /* ExtensionHostStartup.EagerAutoStart */);
                return this._instantiationService.createInstance(WebWorkerExtensionHost, runningLocation, startup, this._createLocalExtensionHostDataProvider(runningLocations, runningLocation, isInitialStart));
            }
            case 3 /* ExtensionHostKind.Remote */: {
                const remoteAgentConnection = this._remoteAgentService.getConnection();
                if (remoteAgentConnection) {
                    return this._instantiationService.createInstance(RemoteExtensionHost, runningLocation, this._createRemoteExtensionHostDataProvider(runningLocations, remoteAgentConnection.remoteAuthority));
                }
                return null;
            }
        }
    }
    _createLocalExtensionHostDataProvider(runningLocations, desiredRunningLocation, isInitialStart) {
        return {
            getInitData: async () => {
                if (isInitialStart) {
                    // Here we load even extensions that would be disabled by workspace trust
                    const localExtensions = checkEnabledAndProposedAPI(this._logService, this._extensionEnablementService, this._extensionsProposedApi, await this._scanWebExtensions(), /* ignore workspace trust */ true);
                    const runningLocation = runningLocations.computeRunningLocation(localExtensions, [], false);
                    const myExtensions = filterExtensionDescriptions(localExtensions, runningLocation, extRunningLocation => desiredRunningLocation.equals(extRunningLocation));
                    const extensions = new ExtensionHostExtensions(0, localExtensions, myExtensions.map(extension => extension.identifier));
                    return { extensions };
                }
                else {
                    // restart case
                    const snapshot = await this._getExtensionRegistrySnapshotWhenReady();
                    const myExtensions = runningLocations.filterByRunningLocation(snapshot.extensions, desiredRunningLocation);
                    const extensions = new ExtensionHostExtensions(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                    return { extensions };
                }
            }
        };
    }
    _createRemoteExtensionHostDataProvider(runningLocations, remoteAuthority) {
        return {
            remoteAuthority: remoteAuthority,
            getInitData: async () => {
                const snapshot = await this._getExtensionRegistrySnapshotWhenReady();
                const remoteEnv = await this._remoteAgentService.getEnvironment();
                if (!remoteEnv) {
                    throw new Error('Cannot provide init data for remote extension host!');
                }
                const myExtensions = runningLocations.filterByExtensionHostKind(snapshot.extensions, 3 /* ExtensionHostKind.Remote */);
                const extensions = new ExtensionHostExtensions(snapshot.versionId, snapshot.extensions, myExtensions.map(extension => extension.identifier));
                return {
                    connectionData: this._remoteAuthorityResolverService.getConnectionData(remoteAuthority),
                    pid: remoteEnv.pid,
                    appRoot: remoteEnv.appRoot,
                    extensionHostLogsPath: remoteEnv.extensionHostLogsPath,
                    globalStorageHome: remoteEnv.globalStorageHome,
                    workspaceStorageHome: remoteEnv.workspaceStorageHome,
                    extensions,
                };
            }
        };
    }
};
BrowserExtensionHostFactory = __decorate([
    __param(3, IInstantiationService),
    __param(4, IRemoteAgentService),
    __param(5, IRemoteAuthorityResolverService),
    __param(6, IWorkbenchExtensionEnablementService),
    __param(7, ILogService)
], BrowserExtensionHostFactory);
let BrowserExtensionHostKindPicker = BrowserExtensionHostKindPicker_1 = class BrowserExtensionHostKindPicker {
    constructor(_logService) {
        this._logService = _logService;
    }
    pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
        const result = BrowserExtensionHostKindPicker_1.pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference);
        this._logService.trace(`pickRunningLocation for ${extensionId.value}, extension kinds: [${extensionKinds.join(', ')}], isInstalledLocally: ${isInstalledLocally}, isInstalledRemotely: ${isInstalledRemotely}, preference: ${extensionRunningPreferenceToString(preference)} => ${extensionHostKindToString(result)}`);
        return result;
    }
    static pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
        const result = [];
        let canRunRemotely = false;
        for (const extensionKind of extensionKinds) {
            if (extensionKind === 'ui' && isInstalledRemotely) {
                // ui extensions run remotely if possible (but only as a last resort)
                if (preference === 2 /* ExtensionRunningPreference.Remote */) {
                    return 3 /* ExtensionHostKind.Remote */;
                }
                else {
                    canRunRemotely = true;
                }
            }
            if (extensionKind === 'workspace' && isInstalledRemotely) {
                // workspace extensions run remotely if possible
                if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 2 /* ExtensionRunningPreference.Remote */) {
                    return 3 /* ExtensionHostKind.Remote */;
                }
                else {
                    result.push(3 /* ExtensionHostKind.Remote */);
                }
            }
            if (extensionKind === 'web' && (isInstalledLocally || isInstalledRemotely)) {
                // web worker extensions run in the local web worker if possible
                if (preference === 0 /* ExtensionRunningPreference.None */ || preference === 1 /* ExtensionRunningPreference.Local */) {
                    return 2 /* ExtensionHostKind.LocalWebWorker */;
                }
                else {
                    result.push(2 /* ExtensionHostKind.LocalWebWorker */);
                }
            }
        }
        if (canRunRemotely) {
            result.push(3 /* ExtensionHostKind.Remote */);
        }
        return (result.length > 0 ? result[0] : null);
    }
};
BrowserExtensionHostKindPicker = BrowserExtensionHostKindPicker_1 = __decorate([
    __param(0, ILogService)
], BrowserExtensionHostKindPicker);
export { BrowserExtensionHostKindPicker };
registerSingleton(IExtensionService, ExtensionService, 0 /* InstantiationType.Eager */);
