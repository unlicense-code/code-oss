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
var AbstractExtensionService_1;
import { Barrier } from '../../../../base/common/async.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Emitter } from '../../../../base/common/event.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import * as perf from '../../../../base/common/performance.js';
import { isCI } from '../../../../base/common/platform.js';
import { isEqualOrParent } from '../../../../base/common/resources.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { isDefined } from '../../../../base/common/types.js';
import * as nls from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ImplicitActivationEvents } from '../../../../platform/extensionManagement/common/implicitActivationEvents.js';
import { ExtensionIdentifier, ExtensionIdentifierMap } from '../../../../platform/extensions/common/extensions.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { handleVetos } from '../../../../platform/lifecycle/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IRemoteAuthorityResolverService, RemoteAuthorityResolverError, RemoteAuthorityResolverErrorCode, getRemoteAuthorityPrefix } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { IRemoteExtensionsScannerService } from '../../../../platform/remote/common/remoteExtensionsScanner.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { Extensions as ExtensionFeaturesExtensions, } from '../../extensionManagement/common/extensionFeatures.js';
import { IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from '../../extensionManagement/common/extensionManagement.js';
import { LockableExtensionDescriptionRegistry } from './extensionDescriptionRegistry.js';
import { parseExtensionDevOptions } from './extensionDevOptions.js';
import { ExtensionHostManager } from './extensionHostManager.js';
import { IExtensionManifestPropertiesService } from './extensionManifestPropertiesService.js';
import { LocalProcessRunningLocation, LocalWebWorkerRunningLocation, RemoteRunningLocation } from './extensionRunningLocation.js';
import { ExtensionRunningLocationTracker, filterExtensionIdentifiers } from './extensionRunningLocationTracker.js';
import { ActivationTimes, ExtensionPointContribution, toExtension, toExtensionDescription } from './extensions.js';
import { ExtensionMessageCollector, ExtensionsRegistry } from './extensionsRegistry.js';
import { LazyCreateExtensionHostManager } from './lazyCreateExtensionHostManager.js';
import { checkActivateWorkspaceContainsExtension, checkGlobFileExists } from './workspaceContains.js';
import { ILifecycleService, WillShutdownJoinerOrder } from '../../lifecycle/common/lifecycle.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
const hasOwnProperty = Object.hasOwnProperty;
const NO_OP_VOID_PROMISE = Promise.resolve(undefined);
let AbstractExtensionService = AbstractExtensionService_1 = class AbstractExtensionService extends Disposable {
    constructor(options, _extensionsProposedApi, _extensionHostFactory, _extensionHostKindPicker, _instantiationService, _notificationService, _environmentService, _telemetryService, _extensionEnablementService, _fileService, _productService, _extensionManagementService, _contextService, _configurationService, _extensionManifestPropertiesService, _logService, _remoteAgentService, _remoteExtensionsScannerService, _lifecycleService, _remoteAuthorityResolverService, _dialogService) {
        super();
        this._extensionsProposedApi = _extensionsProposedApi;
        this._extensionHostFactory = _extensionHostFactory;
        this._extensionHostKindPicker = _extensionHostKindPicker;
        this._instantiationService = _instantiationService;
        this._notificationService = _notificationService;
        this._environmentService = _environmentService;
        this._telemetryService = _telemetryService;
        this._extensionEnablementService = _extensionEnablementService;
        this._fileService = _fileService;
        this._productService = _productService;
        this._extensionManagementService = _extensionManagementService;
        this._contextService = _contextService;
        this._configurationService = _configurationService;
        this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
        this._logService = _logService;
        this._remoteAgentService = _remoteAgentService;
        this._remoteExtensionsScannerService = _remoteExtensionsScannerService;
        this._lifecycleService = _lifecycleService;
        this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
        this._dialogService = _dialogService;
        this._onDidRegisterExtensions = this._register(new Emitter());
        this.onDidRegisterExtensions = this._onDidRegisterExtensions.event;
        this._onDidChangeExtensionsStatus = this._register(new Emitter());
        this.onDidChangeExtensionsStatus = this._onDidChangeExtensionsStatus.event;
        this._onDidChangeExtensions = this._register(new Emitter({ leakWarningThreshold: 400 }));
        this.onDidChangeExtensions = this._onDidChangeExtensions.event;
        this._onWillActivateByEvent = this._register(new Emitter());
        this.onWillActivateByEvent = this._onWillActivateByEvent.event;
        this._onDidChangeResponsiveChange = this._register(new Emitter());
        this.onDidChangeResponsiveChange = this._onDidChangeResponsiveChange.event;
        this._onWillStop = this._register(new Emitter());
        this.onWillStop = this._onWillStop.event;
        this._activationEventReader = new ImplicitActivationAwareReader();
        this._registry = new LockableExtensionDescriptionRegistry(this._activationEventReader);
        this._installedExtensionsReady = new Barrier();
        this._extensionStatus = new ExtensionIdentifierMap();
        this._allRequestedActivateEvents = new Set();
        this._remoteCrashTracker = new ExtensionHostCrashTracker();
        this._deltaExtensionsQueue = [];
        this._inHandleDeltaExtensions = false;
        this._extensionHostManagers = this._register(new ExtensionHostCollection());
        this._resolveAuthorityAttempt = 0;
        this._hasLocalProcess = options.hasLocalProcess;
        this._allowRemoteExtensionsInLocalWebWorker = options.allowRemoteExtensionsInLocalWebWorker;
        // help the file service to activate providers by activating extensions by file system event
        this._register(this._fileService.onWillActivateFileSystemProvider(e => {
            if (e.scheme !== Schemas.vscodeRemote) {
                e.join(this.activateByEvent(`onFileSystem:${e.scheme}`));
            }
        }));
        this._runningLocations = new ExtensionRunningLocationTracker(this._registry, this._extensionHostKindPicker, this._environmentService, this._configurationService, this._logService, this._extensionManifestPropertiesService);
        this._register(this._extensionEnablementService.onEnablementChanged((extensions) => {
            const toAdd = [];
            const toRemove = [];
            for (const extension of extensions) {
                if (this._safeInvokeIsEnabled(extension)) {
                    // an extension has been enabled
                    toAdd.push(extension);
                }
                else {
                    // an extension has been disabled
                    toRemove.push(extension);
                }
            }
            if (isCI) {
                this._logService.info(`AbstractExtensionService.onEnablementChanged fired for ${extensions.map(e => e.identifier.id).join(', ')}`);
            }
            this._handleDeltaExtensions(new DeltaExtensionsQueueItem(toAdd, toRemove));
        }));
        this._register(this._extensionManagementService.onDidChangeProfile(({ added, removed }) => {
            if (added.length || removed.length) {
                if (isCI) {
                    this._logService.info(`AbstractExtensionService.onDidChangeProfile fired`);
                }
                this._handleDeltaExtensions(new DeltaExtensionsQueueItem(added, removed));
            }
        }));
        this._register(this._extensionManagementService.onDidEnableExtensions(extensions => {
            if (extensions.length) {
                if (isCI) {
                    this._logService.info(`AbstractExtensionService.onDidEnableExtensions fired`);
                }
                this._handleDeltaExtensions(new DeltaExtensionsQueueItem(extensions, []));
            }
        }));
        this._register(this._extensionManagementService.onDidInstallExtensions((result) => {
            const extensions = [];
            for (const { local, operation } of result) {
                if (local && local.isValid && operation !== 4 /* InstallOperation.Migrate */ && this._safeInvokeIsEnabled(local)) {
                    extensions.push(local);
                }
            }
            if (extensions.length) {
                if (isCI) {
                    this._logService.info(`AbstractExtensionService.onDidInstallExtensions fired for ${extensions.map(e => e.identifier.id).join(', ')}`);
                }
                this._handleDeltaExtensions(new DeltaExtensionsQueueItem(extensions, []));
            }
        }));
        this._register(this._extensionManagementService.onDidUninstallExtension((event) => {
            if (!event.error) {
                // an extension has been uninstalled
                if (isCI) {
                    this._logService.info(`AbstractExtensionService.onDidUninstallExtension fired for ${event.identifier.id}`);
                }
                this._handleDeltaExtensions(new DeltaExtensionsQueueItem([], [event.identifier.id]));
            }
        }));
        this._register(this._lifecycleService.onWillShutdown(event => {
            if (this._remoteAgentService.getConnection()) {
                event.join(async () => {
                    // We need to disconnect the management connection before killing the local extension host.
                    // Otherwise, the local extension host might terminate the underlying tunnel before the
                    // management connection has a chance to send its disconnection message.
                    try {
                        await this._remoteAgentService.endConnection();
                        await this._doStopExtensionHosts();
                        this._remoteAgentService.getConnection()?.dispose();
                    }
                    catch {
                        this._logService.warn('Error while disconnecting remote agent');
                    }
                }, {
                    id: 'join.disconnectRemote',
                    label: nls.localize('disconnectRemote', "Disconnect Remote Agent"),
                    order: WillShutdownJoinerOrder.Last // after others have joined that might depend on a remote connection
                });
            }
            else {
                event.join(this._doStopExtensionHosts(), {
                    id: 'join.stopExtensionHosts',
                    label: nls.localize('stopExtensionHosts', "Stopping Extension Hosts"),
                });
            }
        }));
    }
    _getExtensionHostManagers(kind) {
        return this._extensionHostManagers.getByKind(kind);
    }
    //#region deltaExtensions
    async _handleDeltaExtensions(item) {
        this._deltaExtensionsQueue.push(item);
        if (this._inHandleDeltaExtensions) {
            // Let the current item finish, the new one will be picked up
            return;
        }
        let lock = null;
        try {
            this._inHandleDeltaExtensions = true;
            // wait for _initialize to finish before hanlding any delta extension events
            await this._installedExtensionsReady.wait();
            lock = await this._registry.acquireLock('handleDeltaExtensions');
            while (this._deltaExtensionsQueue.length > 0) {
                const item = this._deltaExtensionsQueue.shift();
                await this._deltaExtensions(lock, item.toAdd, item.toRemove);
            }
        }
        finally {
            this._inHandleDeltaExtensions = false;
            lock?.dispose();
        }
    }
    async _deltaExtensions(lock, _toAdd, _toRemove) {
        if (isCI) {
            this._logService.info(`AbstractExtensionService._deltaExtensions: toAdd: [${_toAdd.map(e => e.identifier.id).join(',')}] toRemove: [${_toRemove.map(e => typeof e === 'string' ? e : e.identifier.id).join(',')}]`);
        }
        let toRemove = [];
        for (let i = 0, len = _toRemove.length; i < len; i++) {
            const extensionOrId = _toRemove[i];
            const extensionId = (typeof extensionOrId === 'string' ? extensionOrId : extensionOrId.identifier.id);
            const extension = (typeof extensionOrId === 'string' ? null : extensionOrId);
            const extensionDescription = this._registry.getExtensionDescription(extensionId);
            if (!extensionDescription) {
                // ignore disabling/uninstalling an extension which is not running
                continue;
            }
            if (extension && extensionDescription.extensionLocation.scheme !== extension.location.scheme) {
                // this event is for a different extension than mine (maybe for the local extension, while I have the remote extension)
                continue;
            }
            if (!this.canRemoveExtension(extensionDescription)) {
                // uses non-dynamic extension point or is activated
                continue;
            }
            toRemove.push(extensionDescription);
        }
        const toAdd = [];
        for (let i = 0, len = _toAdd.length; i < len; i++) {
            const extension = _toAdd[i];
            const extensionDescription = toExtensionDescription(extension, false);
            if (!extensionDescription) {
                // could not scan extension...
                continue;
            }
            if (!this._canAddExtension(extensionDescription, toRemove)) {
                continue;
            }
            toAdd.push(extensionDescription);
        }
        if (toAdd.length === 0 && toRemove.length === 0) {
            return;
        }
        // Update the local registry
        const result = this._registry.deltaExtensions(lock, toAdd, toRemove.map(e => e.identifier));
        this._onDidChangeExtensions.fire({ added: toAdd, removed: toRemove });
        toRemove = toRemove.concat(result.removedDueToLooping);
        if (result.removedDueToLooping.length > 0) {
            this._notificationService.notify({
                severity: Severity.Error,
                message: nls.localize('looping', "The following extensions contain dependency loops and have been disabled: {0}", result.removedDueToLooping.map(e => `'${e.identifier.value}'`).join(', '))
            });
        }
        // enable or disable proposed API per extension
        this._extensionsProposedApi.updateEnabledApiProposals(toAdd);
        // Update extension points
        this._doHandleExtensionPoints([].concat(toAdd).concat(toRemove), false);
        // Update the extension host
        await this._updateExtensionsOnExtHosts(result.versionId, toAdd, toRemove.map(e => e.identifier));
        for (let i = 0; i < toAdd.length; i++) {
            this._activateAddedExtensionIfNeeded(toAdd[i]);
        }
    }
    async _updateExtensionsOnExtHosts(versionId, toAdd, toRemove) {
        const removedRunningLocation = this._runningLocations.deltaExtensions(toAdd, toRemove);
        const promises = this._extensionHostManagers.map(extHostManager => this._updateExtensionsOnExtHost(extHostManager, versionId, toAdd, toRemove, removedRunningLocation));
        await Promise.all(promises);
    }
    async _updateExtensionsOnExtHost(extensionHostManager, versionId, toAdd, toRemove, removedRunningLocation) {
        const myToAdd = this._runningLocations.filterByExtensionHostManager(toAdd, extensionHostManager);
        const myToRemove = filterExtensionIdentifiers(toRemove, removedRunningLocation, extRunningLocation => extensionHostManager.representsRunningLocation(extRunningLocation));
        const addActivationEvents = ImplicitActivationEvents.createActivationEventsMap(toAdd);
        if (isCI) {
            const printExtIds = (extensions) => extensions.map(e => e.identifier.value).join(',');
            const printIds = (extensions) => extensions.map(e => e.value).join(',');
            this._logService.info(`AbstractExtensionService: Calling deltaExtensions: toRemove: [${printIds(toRemove)}], toAdd: [${printExtIds(toAdd)}], myToRemove: [${printIds(myToRemove)}], myToAdd: [${printExtIds(myToAdd)}],`);
        }
        await extensionHostManager.deltaExtensions({ versionId, toRemove, toAdd, addActivationEvents, myToRemove, myToAdd: myToAdd.map(extension => extension.identifier) });
    }
    canAddExtension(extension) {
        return this._canAddExtension(extension, []);
    }
    _canAddExtension(extension, extensionsBeingRemoved) {
        // (Also check for renamed extensions)
        const existing = this._registry.getExtensionDescriptionByIdOrUUID(extension.identifier, extension.id);
        if (existing) {
            // This extension is already known (most likely at a different version)
            // so it cannot be added again unless it is removed first
            const isBeingRemoved = extensionsBeingRemoved.some((extensionDescription) => ExtensionIdentifier.equals(extension.identifier, extensionDescription.identifier));
            if (!isBeingRemoved) {
                return false;
            }
        }
        const extensionKinds = this._runningLocations.readExtensionKinds(extension);
        const isRemote = extension.extensionLocation.scheme === Schemas.vscodeRemote;
        const extensionHostKind = this._extensionHostKindPicker.pickExtensionHostKind(extension.identifier, extensionKinds, !isRemote, isRemote, 0 /* ExtensionRunningPreference.None */);
        if (extensionHostKind === null) {
            return false;
        }
        return true;
    }
    canRemoveExtension(extension) {
        const extensionDescription = this._registry.getExtensionDescription(extension.identifier);
        if (!extensionDescription) {
            // Can't remove an extension that is unknown!
            return false;
        }
        if (this._extensionStatus.get(extensionDescription.identifier)?.activationStarted) {
            // Extension is running, cannot remove it safely
            return false;
        }
        return true;
    }
    async _activateAddedExtensionIfNeeded(extensionDescription) {
        let shouldActivate = false;
        let shouldActivateReason = null;
        let hasWorkspaceContains = false;
        const activationEvents = this._activationEventReader.readActivationEvents(extensionDescription);
        for (const activationEvent of activationEvents) {
            if (this._allRequestedActivateEvents.has(activationEvent)) {
                // This activation event was fired before the extension was added
                shouldActivate = true;
                shouldActivateReason = activationEvent;
                break;
            }
            if (activationEvent === '*') {
                shouldActivate = true;
                shouldActivateReason = activationEvent;
                break;
            }
            if (/^workspaceContains/.test(activationEvent)) {
                hasWorkspaceContains = true;
            }
            if (activationEvent === 'onStartupFinished') {
                shouldActivate = true;
                shouldActivateReason = activationEvent;
                break;
            }
        }
        if (shouldActivate) {
            await Promise.all(this._extensionHostManagers.map(extHostManager => extHostManager.activate(extensionDescription.identifier, { startup: false, extensionId: extensionDescription.identifier, activationEvent: shouldActivateReason }))).then(() => { });
        }
        else if (hasWorkspaceContains) {
            const workspace = await this._contextService.getCompleteWorkspace();
            const forceUsingSearch = !!this._environmentService.remoteAuthority;
            const host = {
                logService: this._logService,
                folders: workspace.folders.map(folder => folder.uri),
                forceUsingSearch: forceUsingSearch,
                exists: (uri) => this._fileService.exists(uri),
                checkExists: (folders, includes, token) => this._instantiationService.invokeFunction((accessor) => checkGlobFileExists(accessor, folders, includes, token))
            };
            const result = await checkActivateWorkspaceContainsExtension(host, extensionDescription);
            if (!result) {
                return;
            }
            await Promise.all(this._extensionHostManagers.map(extHostManager => extHostManager.activate(extensionDescription.identifier, { startup: false, extensionId: extensionDescription.identifier, activationEvent: result.activationEvent }))).then(() => { });
        }
    }
    //#endregion
    async _initialize() {
        perf.mark('code/willLoadExtensions');
        this._startExtensionHostsIfNecessary(true, []);
        const lock = await this._registry.acquireLock('_initialize');
        try {
            await this._resolveAndProcessExtensions(lock);
            // Start extension hosts which are not automatically started
            const snapshot = this._registry.getSnapshot();
            for (const extHostManager of this._extensionHostManagers) {
                if (extHostManager.startup !== 1 /* ExtensionHostStartup.EagerAutoStart */) {
                    const extensions = this._runningLocations.filterByExtensionHostManager(snapshot.extensions, extHostManager);
                    extHostManager.start(snapshot.versionId, snapshot.extensions, extensions.map(extension => extension.identifier));
                }
            }
        }
        finally {
            lock.dispose();
        }
        this._releaseBarrier();
        perf.mark('code/didLoadExtensions');
        await this._handleExtensionTests();
    }
    async _resolveAndProcessExtensions(lock) {
        let resolverExtensions = [];
        let localExtensions = [];
        let remoteExtensions = [];
        for await (const extensions of this._resolveExtensions()) {
            if (extensions instanceof ResolverExtensions) {
                resolverExtensions = checkEnabledAndProposedAPI(this._logService, this._extensionEnablementService, this._extensionsProposedApi, extensions.extensions, false);
                this._registry.deltaExtensions(lock, resolverExtensions, []);
                this._doHandleExtensionPoints(resolverExtensions, true);
            }
            if (extensions instanceof LocalExtensions) {
                localExtensions = checkEnabledAndProposedAPI(this._logService, this._extensionEnablementService, this._extensionsProposedApi, extensions.extensions, false);
            }
            if (extensions instanceof RemoteExtensions) {
                remoteExtensions = checkEnabledAndProposedAPI(this._logService, this._extensionEnablementService, this._extensionsProposedApi, extensions.extensions, false);
            }
        }
        // `initializeRunningLocation` will look at the complete picture (e.g. an extension installed on both sides),
        // takes care of duplicates and picks a running location for each extension
        this._runningLocations.initializeRunningLocation(localExtensions, remoteExtensions);
        this._startExtensionHostsIfNecessary(true, []);
        // Some remote extensions could run locally in the web worker, so store them
        const remoteExtensionsThatNeedToRunLocally = (this._allowRemoteExtensionsInLocalWebWorker ? this._runningLocations.filterByExtensionHostKind(remoteExtensions, 2 /* ExtensionHostKind.LocalWebWorker */) : []);
        const localProcessExtensions = (this._hasLocalProcess ? this._runningLocations.filterByExtensionHostKind(localExtensions, 1 /* ExtensionHostKind.LocalProcess */) : []);
        const localWebWorkerExtensions = this._runningLocations.filterByExtensionHostKind(localExtensions, 2 /* ExtensionHostKind.LocalWebWorker */);
        remoteExtensions = this._runningLocations.filterByExtensionHostKind(remoteExtensions, 3 /* ExtensionHostKind.Remote */);
        // Add locally the remote extensions that need to run locally in the web worker
        for (const ext of remoteExtensionsThatNeedToRunLocally) {
            if (!includes(localWebWorkerExtensions, ext.identifier)) {
                localWebWorkerExtensions.push(ext);
            }
        }
        const allExtensions = remoteExtensions.concat(localProcessExtensions).concat(localWebWorkerExtensions);
        let toAdd = allExtensions;
        if (resolverExtensions.length) {
            // Add extensions that are not registered as resolvers but are in the final resolved set
            toAdd = allExtensions.filter(extension => !resolverExtensions.some(e => ExtensionIdentifier.equals(e.identifier, extension.identifier) && e.extensionLocation.toString() === extension.extensionLocation.toString()));
            // Remove extensions that are registered as resolvers but are not in the final resolved set
            if (allExtensions.length < toAdd.length + resolverExtensions.length) {
                const toRemove = resolverExtensions.filter(registered => !allExtensions.some(e => ExtensionIdentifier.equals(e.identifier, registered.identifier) && e.extensionLocation.toString() === registered.extensionLocation.toString()));
                if (toRemove.length) {
                    this._registry.deltaExtensions(lock, [], toRemove.map(e => e.identifier));
                    this._doHandleExtensionPoints(toRemove, true);
                }
            }
        }
        const result = this._registry.deltaExtensions(lock, toAdd, []);
        if (result.removedDueToLooping.length > 0) {
            this._notificationService.notify({
                severity: Severity.Error,
                message: nls.localize('looping', "The following extensions contain dependency loops and have been disabled: {0}", result.removedDueToLooping.map(e => `'${e.identifier.value}'`).join(', '))
            });
        }
        this._doHandleExtensionPoints(this._registry.getAllExtensionDescriptions(), false);
    }
    async _handleExtensionTests() {
        if (!this._environmentService.isExtensionDevelopment || !this._environmentService.extensionTestsLocationURI) {
            return;
        }
        const extensionHostManager = this.findTestExtensionHost(this._environmentService.extensionTestsLocationURI);
        if (!extensionHostManager) {
            const msg = nls.localize('extensionTestError', "No extension host found that can launch the test runner at {0}.", this._environmentService.extensionTestsLocationURI.toString());
            console.error(msg);
            this._notificationService.error(msg);
            return;
        }
        let exitCode;
        try {
            exitCode = await extensionHostManager.extensionTestsExecute();
            if (isCI) {
                this._logService.info(`Extension host test runner exit code: ${exitCode}`);
            }
        }
        catch (err) {
            if (isCI) {
                this._logService.error(`Extension host test runner error`, err);
            }
            console.error(err);
            exitCode = 1 /* ERROR */;
        }
        this._onExtensionHostExit(exitCode);
    }
    findTestExtensionHost(testLocation) {
        let runningLocation = null;
        for (const extension of this._registry.getAllExtensionDescriptions()) {
            if (isEqualOrParent(testLocation, extension.extensionLocation)) {
                runningLocation = this._runningLocations.getRunningLocation(extension.identifier);
                break;
            }
        }
        if (runningLocation === null) {
            // not sure if we should support that, but it was possible to have an test outside an extension
            if (testLocation.scheme === Schemas.vscodeRemote) {
                runningLocation = new RemoteRunningLocation();
            }
            else {
                // When a debugger attaches to the extension host, it will surface all console.log messages from the extension host,
                // but not necessarily from the window. So it would be best if any errors get printed to the console of the extension host.
                // That is why here we use the local process extension host even for non-file URIs
                runningLocation = new LocalProcessRunningLocation(0);
            }
        }
        if (runningLocation !== null) {
            return this._extensionHostManagers.getByRunningLocation(runningLocation);
        }
        return null;
    }
    _releaseBarrier() {
        this._installedExtensionsReady.open();
        this._onDidRegisterExtensions.fire(undefined);
        this._onDidChangeExtensionsStatus.fire(this._registry.getAllExtensionDescriptions().map(e => e.identifier));
    }
    //#region remote authority resolving
    async _resolveAuthorityInitial(remoteAuthority) {
        const MAX_ATTEMPTS = 5;
        for (let attempt = 1;; attempt++) {
            try {
                return this._resolveAuthorityWithLogging(remoteAuthority);
            }
            catch (err) {
                if (RemoteAuthorityResolverError.isNoResolverFound(err)) {
                    // There is no point in retrying if there is no resolver found
                    throw err;
                }
                if (RemoteAuthorityResolverError.isNotAvailable(err)) {
                    // The resolver is not available and asked us to not retry
                    throw err;
                }
                if (attempt >= MAX_ATTEMPTS) {
                    // Too many failed attempts, give up
                    throw err;
                }
            }
        }
    }
    async _resolveAuthorityAgain() {
        const remoteAuthority = this._environmentService.remoteAuthority;
        if (!remoteAuthority) {
            return;
        }
        this._remoteAuthorityResolverService._clearResolvedAuthority(remoteAuthority);
        try {
            const result = await this._resolveAuthorityWithLogging(remoteAuthority);
            this._remoteAuthorityResolverService._setResolvedAuthority(result.authority, result.options);
        }
        catch (err) {
            this._remoteAuthorityResolverService._setResolvedAuthorityError(remoteAuthority, err);
        }
    }
    async _resolveAuthorityWithLogging(remoteAuthority) {
        const authorityPrefix = getRemoteAuthorityPrefix(remoteAuthority);
        const sw = StopWatch.create(false);
        this._logService.info(`Invoking resolveAuthority(${authorityPrefix})...`);
        try {
            perf.mark(`code/willResolveAuthority/${authorityPrefix}`);
            const result = await this._resolveAuthority(remoteAuthority);
            perf.mark(`code/didResolveAuthorityOK/${authorityPrefix}`);
            this._logService.info(`resolveAuthority(${authorityPrefix}) returned '${result.authority.connectTo}' after ${sw.elapsed()} ms`);
            return result;
        }
        catch (err) {
            perf.mark(`code/didResolveAuthorityError/${authorityPrefix}`);
            this._logService.error(`resolveAuthority(${authorityPrefix}) returned an error after ${sw.elapsed()} ms`, err);
            throw err;
        }
    }
    async _resolveAuthorityOnExtensionHosts(kind, remoteAuthority) {
        const extensionHosts = this._getExtensionHostManagers(kind);
        if (extensionHosts.length === 0) {
            // no local process extension hosts
            throw new Error(`Cannot resolve authority`);
        }
        this._resolveAuthorityAttempt++;
        const results = await Promise.all(extensionHosts.map(extHost => extHost.resolveAuthority(remoteAuthority, this._resolveAuthorityAttempt)));
        let bestErrorResult = null;
        for (const result of results) {
            if (result.type === 'ok') {
                return result.value;
            }
            if (!bestErrorResult) {
                bestErrorResult = result;
                continue;
            }
            const bestErrorIsUnknown = (bestErrorResult.error.code === RemoteAuthorityResolverErrorCode.Unknown);
            const errorIsUnknown = (result.error.code === RemoteAuthorityResolverErrorCode.Unknown);
            if (bestErrorIsUnknown && !errorIsUnknown) {
                bestErrorResult = result;
            }
        }
        // we can only reach this if there is an error
        throw new RemoteAuthorityResolverError(bestErrorResult.error.message, bestErrorResult.error.code, bestErrorResult.error.detail);
    }
    //#endregion
    //#region Stopping / Starting / Restarting
    stopExtensionHosts(reason, auto) {
        return this._doStopExtensionHostsWithVeto(reason, auto);
    }
    async _doStopExtensionHosts() {
        const previouslyActivatedExtensionIds = [];
        for (const extensionStatus of this._extensionStatus.values()) {
            if (extensionStatus.activationStarted) {
                previouslyActivatedExtensionIds.push(extensionStatus.id);
            }
        }
        await this._extensionHostManagers.stopAllInReverse();
        for (const extensionStatus of this._extensionStatus.values()) {
            extensionStatus.clearRuntimeStatus();
        }
        if (previouslyActivatedExtensionIds.length > 0) {
            this._onDidChangeExtensionsStatus.fire(previouslyActivatedExtensionIds);
        }
    }
    async _doStopExtensionHostsWithVeto(reason, auto = false) {
        if (auto && this._environmentService.isExtensionDevelopment) {
            return false;
        }
        const vetos = [];
        const vetoReasons = new Set();
        this._onWillStop.fire({
            reason,
            auto,
            veto(value, reason) {
                vetos.push(value);
                if (typeof value === 'boolean') {
                    if (value === true) {
                        vetoReasons.add(reason);
                    }
                }
                else {
                    value.then(value => {
                        if (value) {
                            vetoReasons.add(reason);
                        }
                    }).catch(error => {
                        vetoReasons.add(nls.localize('extensionStopVetoError', "{0} (Error: {1})", reason, toErrorMessage(error)));
                    });
                }
            }
        });
        const veto = await handleVetos(vetos, error => this._logService.error(error));
        if (!veto) {
            await this._doStopExtensionHosts();
        }
        else {
            if (!auto) {
                const vetoReasonsArray = Array.from(vetoReasons);
                this._logService.warn(`Extension host was not stopped because of veto (stop reason: ${reason}, veto reason: ${vetoReasonsArray.join(', ')})`);
                await this._dialogService.warn(nls.localize('extensionStopVetoMessage', "The following operation was blocked: {0}", reason), vetoReasonsArray.length === 1 ?
                    nls.localize('extensionStopVetoDetailsOne', "The reason for blocking the operation: {0}", vetoReasonsArray[0]) :
                    nls.localize('extensionStopVetoDetailsMany', "The reasons for blocking the operation:\n- {0}", vetoReasonsArray.join('\n -')));
            }
        }
        return !veto;
    }
    _startExtensionHostsIfNecessary(isInitialStart, initialActivationEvents) {
        const locations = [];
        for (let affinity = 0; affinity <= this._runningLocations.maxLocalProcessAffinity; affinity++) {
            locations.push(new LocalProcessRunningLocation(affinity));
        }
        for (let affinity = 0; affinity <= this._runningLocations.maxLocalWebWorkerAffinity; affinity++) {
            locations.push(new LocalWebWorkerRunningLocation(affinity));
        }
        locations.push(new RemoteRunningLocation());
        for (const location of locations) {
            if (this._extensionHostManagers.getByRunningLocation(location)) {
                // already running
                continue;
            }
            const res = this._createExtensionHostManager(location, isInitialStart, initialActivationEvents);
            if (res) {
                const [extHostManager, disposableStore] = res;
                this._extensionHostManagers.add(extHostManager, disposableStore);
            }
        }
    }
    _createExtensionHostManager(runningLocation, isInitialStart, initialActivationEvents) {
        const extensionHost = this._extensionHostFactory.createExtensionHost(this._runningLocations, runningLocation, isInitialStart);
        if (!extensionHost) {
            return null;
        }
        const processManager = this._doCreateExtensionHostManager(extensionHost, initialActivationEvents);
        const disposableStore = new DisposableStore();
        disposableStore.add(processManager.onDidExit(([code, signal]) => this._onExtensionHostCrashOrExit(processManager, code, signal)));
        disposableStore.add(processManager.onDidChangeResponsiveState((responsiveState) => {
            this._logService.info(`Extension host (${processManager.friendyName}) is ${responsiveState === 0 /* ResponsiveState.Responsive */ ? 'responsive' : 'unresponsive'}.`);
            this._onDidChangeResponsiveChange.fire({
                extensionHostKind: processManager.kind,
                isResponsive: responsiveState === 0 /* ResponsiveState.Responsive */,
                getInspectListener: (tryEnableInspector) => {
                    return processManager.getInspectPort(tryEnableInspector);
                }
            });
        }));
        return [processManager, disposableStore];
    }
    _doCreateExtensionHostManager(extensionHost, initialActivationEvents) {
        const internalExtensionService = this._acquireInternalAPI(extensionHost);
        if (extensionHost.startup === 3 /* ExtensionHostStartup.Lazy */ && initialActivationEvents.length === 0) {
            return this._instantiationService.createInstance(LazyCreateExtensionHostManager, extensionHost, internalExtensionService);
        }
        return this._instantiationService.createInstance(ExtensionHostManager, extensionHost, initialActivationEvents, internalExtensionService);
    }
    _onExtensionHostCrashOrExit(extensionHost, code, signal) {
        // Unexpected termination
        const isExtensionDevHost = parseExtensionDevOptions(this._environmentService).isExtensionDevHost;
        if (!isExtensionDevHost) {
            this._onExtensionHostCrashed(extensionHost, code, signal);
            return;
        }
        this._onExtensionHostExit(code);
    }
    _onExtensionHostCrashed(extensionHost, code, signal) {
        console.error(`Extension host (${extensionHost.friendyName}) terminated unexpectedly. Code: ${code}, Signal: ${signal}`);
        if (extensionHost.kind === 1 /* ExtensionHostKind.LocalProcess */) {
            this._doStopExtensionHosts();
        }
        else if (extensionHost.kind === 3 /* ExtensionHostKind.Remote */) {
            if (signal) {
                this._onRemoteExtensionHostCrashed(extensionHost, signal);
            }
            this._extensionHostManagers.stopOne(extensionHost);
        }
    }
    _getExtensionHostExitInfoWithTimeout(reconnectionToken) {
        return new Promise((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                reject(new Error('getExtensionHostExitInfo timed out'));
            }, 2000);
            this._remoteAgentService.getExtensionHostExitInfo(reconnectionToken).then((r) => {
                clearTimeout(timeoutHandle);
                resolve(r);
            }, reject);
        });
    }
    async _onRemoteExtensionHostCrashed(extensionHost, reconnectionToken) {
        try {
            const info = await this._getExtensionHostExitInfoWithTimeout(reconnectionToken);
            if (info) {
                this._logService.error(`Extension host (${extensionHost.friendyName}) terminated unexpectedly with code ${info.code}.`);
            }
            this._logExtensionHostCrash(extensionHost);
            this._remoteCrashTracker.registerCrash();
            if (this._remoteCrashTracker.shouldAutomaticallyRestart()) {
                this._logService.info(`Automatically restarting the remote extension host.`);
                this._notificationService.status(nls.localize('extensionService.autoRestart', "The remote extension host terminated unexpectedly. Restarting..."), { hideAfter: 5000 });
                this._startExtensionHostsIfNecessary(false, Array.from(this._allRequestedActivateEvents.keys()));
            }
            else {
                this._notificationService.prompt(Severity.Error, nls.localize('extensionService.crash', "Remote Extension host terminated unexpectedly 3 times within the last 5 minutes."), [{
                        label: nls.localize('restart', "Restart Remote Extension Host"),
                        run: () => {
                            this._startExtensionHostsIfNecessary(false, Array.from(this._allRequestedActivateEvents.keys()));
                        }
                    }]);
            }
        }
        catch (err) {
            // maybe this wasn't an extension host crash and it was a permanent disconnection
        }
    }
    _logExtensionHostCrash(extensionHost) {
        const activatedExtensions = [];
        for (const extensionStatus of this._extensionStatus.values()) {
            if (extensionStatus.activationStarted && extensionHost.containsExtension(extensionStatus.id)) {
                activatedExtensions.push(extensionStatus.id);
            }
        }
        if (activatedExtensions.length > 0) {
            this._logService.error(`Extension host (${extensionHost.friendyName}) terminated unexpectedly. The following extensions were running: ${activatedExtensions.map(id => id.value).join(', ')}`);
        }
        else {
            this._logService.error(`Extension host (${extensionHost.friendyName}) terminated unexpectedly. No extensions were activated.`);
        }
    }
    async startExtensionHosts(updates) {
        await this._doStopExtensionHosts();
        if (updates) {
            await this._handleDeltaExtensions(new DeltaExtensionsQueueItem(updates.toAdd, updates.toRemove));
        }
        const lock = await this._registry.acquireLock('startExtensionHosts');
        try {
            this._startExtensionHostsIfNecessary(false, Array.from(this._allRequestedActivateEvents.keys()));
            const localProcessExtensionHosts = this._getExtensionHostManagers(1 /* ExtensionHostKind.LocalProcess */);
            await Promise.all(localProcessExtensionHosts.map(extHost => extHost.ready()));
        }
        finally {
            lock.dispose();
        }
    }
    //#endregion
    //#region IExtensionService
    activateByEvent(activationEvent, activationKind = 0 /* ActivationKind.Normal */) {
        if (this._installedExtensionsReady.isOpen()) {
            // Extensions have been scanned and interpreted
            // Record the fact that this activationEvent was requested (in case of a restart)
            this._allRequestedActivateEvents.add(activationEvent);
            if (!this._registry.containsActivationEvent(activationEvent)) {
                // There is no extension that is interested in this activation event
                return NO_OP_VOID_PROMISE;
            }
            return this._activateByEvent(activationEvent, activationKind);
        }
        else {
            // Extensions have not been scanned yet.
            // Record the fact that this activationEvent was requested (in case of a restart)
            this._allRequestedActivateEvents.add(activationEvent);
            if (activationKind === 1 /* ActivationKind.Immediate */) {
                // Do not wait for the normal start-up of the extension host(s)
                return this._activateByEvent(activationEvent, activationKind);
            }
            return this._installedExtensionsReady.wait().then(() => this._activateByEvent(activationEvent, activationKind));
        }
    }
    _activateByEvent(activationEvent, activationKind) {
        const result = Promise.all(this._extensionHostManagers.map(extHostManager => extHostManager.activateByEvent(activationEvent, activationKind))).then(() => { });
        this._onWillActivateByEvent.fire({
            event: activationEvent,
            activation: result
        });
        return result;
    }
    activateById(extensionId, reason) {
        return this._activateById(extensionId, reason);
    }
    activationEventIsDone(activationEvent) {
        if (!this._installedExtensionsReady.isOpen()) {
            return false;
        }
        if (!this._registry.containsActivationEvent(activationEvent)) {
            // There is no extension that is interested in this activation event
            return true;
        }
        return this._extensionHostManagers.every(manager => manager.activationEventIsDone(activationEvent));
    }
    whenInstalledExtensionsRegistered() {
        return this._installedExtensionsReady.wait();
    }
    get extensions() {
        return this._registry.getAllExtensionDescriptions();
    }
    _getExtensionRegistrySnapshotWhenReady() {
        return this._installedExtensionsReady.wait().then(() => this._registry.getSnapshot());
    }
    getExtension(id) {
        return this._installedExtensionsReady.wait().then(() => {
            return this._registry.getExtensionDescription(id);
        });
    }
    readExtensionPointContributions(extPoint) {
        return this._installedExtensionsReady.wait().then(() => {
            const availableExtensions = this._registry.getAllExtensionDescriptions();
            const result = [];
            for (const desc of availableExtensions) {
                if (desc.contributes && hasOwnProperty.call(desc.contributes, extPoint.name)) {
                    result.push(new ExtensionPointContribution(desc, desc.contributes[extPoint.name]));
                }
            }
            return result;
        });
    }
    getExtensionsStatus() {
        const result = Object.create(null);
        if (this._registry) {
            const extensions = this._registry.getAllExtensionDescriptions();
            for (const extension of extensions) {
                const extensionStatus = this._extensionStatus.get(extension.identifier);
                result[extension.identifier.value] = {
                    id: extension.identifier,
                    messages: extensionStatus?.messages ?? [],
                    activationStarted: extensionStatus?.activationStarted ?? false,
                    activationTimes: extensionStatus?.activationTimes ?? undefined,
                    runtimeErrors: extensionStatus?.runtimeErrors ?? [],
                    runningLocation: this._runningLocations.getRunningLocation(extension.identifier),
                };
            }
        }
        return result;
    }
    async getInspectPorts(extensionHostKind, tryEnableInspector) {
        const result = await Promise.all(this._getExtensionHostManagers(extensionHostKind).map(extHost => extHost.getInspectPort(tryEnableInspector)));
        // remove 0s:
        return result.filter(isDefined);
    }
    async setRemoteEnvironment(env) {
        await this._extensionHostManagers
            .map(manager => manager.setRemoteEnvironment(env));
    }
    //#endregion
    // --- impl
    _safeInvokeIsEnabled(extension) {
        try {
            return this._extensionEnablementService.isEnabled(extension);
        }
        catch (err) {
            return false;
        }
    }
    _doHandleExtensionPoints(affectedExtensions, onlyResolverExtensionPoints) {
        const affectedExtensionPoints = Object.create(null);
        for (const extensionDescription of affectedExtensions) {
            if (extensionDescription.contributes) {
                for (const extPointName in extensionDescription.contributes) {
                    if (hasOwnProperty.call(extensionDescription.contributes, extPointName)) {
                        affectedExtensionPoints[extPointName] = true;
                    }
                }
            }
        }
        const messageHandler = (msg) => this._handleExtensionPointMessage(msg);
        const availableExtensions = this._registry.getAllExtensionDescriptions();
        const extensionPoints = ExtensionsRegistry.getExtensionPoints();
        perf.mark(onlyResolverExtensionPoints ? 'code/willHandleResolverExtensionPoints' : 'code/willHandleExtensionPoints');
        for (const extensionPoint of extensionPoints) {
            if (affectedExtensionPoints[extensionPoint.name] && (!onlyResolverExtensionPoints || extensionPoint.canHandleResolver)) {
                perf.mark(`code/willHandleExtensionPoint/${extensionPoint.name}`);
                AbstractExtensionService_1._handleExtensionPoint(extensionPoint, availableExtensions, messageHandler);
                perf.mark(`code/didHandleExtensionPoint/${extensionPoint.name}`);
            }
        }
        perf.mark(onlyResolverExtensionPoints ? 'code/didHandleResolverExtensionPoints' : 'code/didHandleExtensionPoints');
    }
    _getOrCreateExtensionStatus(extensionId) {
        if (!this._extensionStatus.has(extensionId)) {
            this._extensionStatus.set(extensionId, new ExtensionStatus(extensionId));
        }
        return this._extensionStatus.get(extensionId);
    }
    _handleExtensionPointMessage(msg) {
        const extensionStatus = this._getOrCreateExtensionStatus(msg.extensionId);
        extensionStatus.addMessage(msg);
        const extension = this._registry.getExtensionDescription(msg.extensionId);
        const strMsg = `[${msg.extensionId.value}]: ${msg.message}`;
        if (msg.type === Severity.Error) {
            if (extension && extension.isUnderDevelopment) {
                // This message is about the extension currently being developed
                this._notificationService.notify({ severity: Severity.Error, message: strMsg });
            }
            this._logService.error(strMsg);
        }
        else if (msg.type === Severity.Warning) {
            if (extension && extension.isUnderDevelopment) {
                // This message is about the extension currently being developed
                this._notificationService.notify({ severity: Severity.Warning, message: strMsg });
            }
            this._logService.warn(strMsg);
        }
        else {
            this._logService.info(strMsg);
        }
        if (msg.extensionId && this._environmentService.isBuilt && !this._environmentService.isExtensionDevelopment) {
            const { type, extensionId, extensionPointId, message } = msg;
            this._telemetryService.publicLog2('extensionsMessage', {
                type, extensionId: extensionId.value, extensionPointId, message
            });
        }
    }
    static _handleExtensionPoint(extensionPoint, availableExtensions, messageHandler) {
        const users = [];
        for (const desc of availableExtensions) {
            if (desc.contributes && hasOwnProperty.call(desc.contributes, extensionPoint.name)) {
                users.push({
                    description: desc,
                    value: desc.contributes[extensionPoint.name],
                    collector: new ExtensionMessageCollector(messageHandler, desc, extensionPoint.name)
                });
            }
        }
        extensionPoint.acceptUsers(users);
    }
    //#region Called by extension host
    _acquireInternalAPI(extensionHost) {
        return {
            _activateById: (extensionId, reason) => {
                return this._activateById(extensionId, reason);
            },
            _onWillActivateExtension: (extensionId) => {
                return this._onWillActivateExtension(extensionId, extensionHost.runningLocation);
            },
            _onDidActivateExtension: (extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) => {
                return this._onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason);
            },
            _onDidActivateExtensionError: (extensionId, error) => {
                return this._onDidActivateExtensionError(extensionId, error);
            },
            _onExtensionRuntimeError: (extensionId, err) => {
                return this._onExtensionRuntimeError(extensionId, err);
            }
        };
    }
    async _activateById(extensionId, reason) {
        const results = await Promise.all(this._extensionHostManagers.map(manager => manager.activate(extensionId, reason)));
        const activated = results.some(e => e);
        if (!activated) {
            throw new Error(`Unknown extension ${extensionId.value}`);
        }
    }
    _onWillActivateExtension(extensionId, runningLocation) {
        this._runningLocations.set(extensionId, runningLocation);
        const extensionStatus = this._getOrCreateExtensionStatus(extensionId);
        extensionStatus.onWillActivate();
    }
    _onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
        const extensionStatus = this._getOrCreateExtensionStatus(extensionId);
        extensionStatus.setActivationTimes(new ActivationTimes(codeLoadingTime, activateCallTime, activateResolvedTime, activationReason));
        this._onDidChangeExtensionsStatus.fire([extensionId]);
    }
    _onDidActivateExtensionError(extensionId, error) {
        this._telemetryService.publicLog2('extensionActivationError', {
            extensionId: extensionId.value,
            error: error.message
        });
    }
    _onExtensionRuntimeError(extensionId, err) {
        const extensionStatus = this._getOrCreateExtensionStatus(extensionId);
        extensionStatus.addRuntimeError(err);
        this._onDidChangeExtensionsStatus.fire([extensionId]);
    }
};
AbstractExtensionService = AbstractExtensionService_1 = __decorate([
    __param(4, IInstantiationService),
    __param(5, INotificationService),
    __param(6, IWorkbenchEnvironmentService),
    __param(7, ITelemetryService),
    __param(8, IWorkbenchExtensionEnablementService),
    __param(9, IFileService),
    __param(10, IProductService),
    __param(11, IWorkbenchExtensionManagementService),
    __param(12, IWorkspaceContextService),
    __param(13, IConfigurationService),
    __param(14, IExtensionManifestPropertiesService),
    __param(15, ILogService),
    __param(16, IRemoteAgentService),
    __param(17, IRemoteExtensionsScannerService),
    __param(18, ILifecycleService),
    __param(19, IRemoteAuthorityResolverService),
    __param(20, IDialogService)
], AbstractExtensionService);
export { AbstractExtensionService };
class ExtensionHostCollection extends Disposable {
    constructor() {
        super(...arguments);
        this._extensionHostManagers = [];
    }
    dispose() {
        for (let i = this._extensionHostManagers.length - 1; i >= 0; i--) {
            const manager = this._extensionHostManagers[i];
            manager.extensionHost.disconnect();
            manager.dispose();
        }
        this._extensionHostManagers = [];
        super.dispose();
    }
    add(extensionHostManager, disposableStore) {
        this._extensionHostManagers.push(new ExtensionHostManagerData(extensionHostManager, disposableStore));
    }
    async stopAllInReverse() {
        // See https://github.com/microsoft/vscode/issues/152204
        // Dispose extension hosts in reverse creation order because the local extension host
        // might be critical in sustaining a connection to the remote extension host
        for (let i = this._extensionHostManagers.length - 1; i >= 0; i--) {
            const manager = this._extensionHostManagers[i];
            await manager.extensionHost.disconnect();
            manager.dispose();
        }
        this._extensionHostManagers = [];
    }
    async stopOne(extensionHostManager) {
        const index = this._extensionHostManagers.findIndex(el => el.extensionHost === extensionHostManager);
        if (index >= 0) {
            this._extensionHostManagers.splice(index, 1);
            await extensionHostManager.disconnect();
            extensionHostManager.dispose();
        }
    }
    getByKind(kind) {
        return this.filter(el => el.kind === kind);
    }
    getByRunningLocation(runningLocation) {
        for (const el of this._extensionHostManagers) {
            if (el.extensionHost.representsRunningLocation(runningLocation)) {
                return el.extensionHost;
            }
        }
        return null;
    }
    *[Symbol.iterator]() {
        for (const extensionHostManager of this._extensionHostManagers) {
            yield extensionHostManager.extensionHost;
        }
    }
    map(callback) {
        return this._extensionHostManagers.map(el => callback(el.extensionHost));
    }
    every(callback) {
        return this._extensionHostManagers.every(el => callback(el.extensionHost));
    }
    filter(callback) {
        return this._extensionHostManagers.filter(el => callback(el.extensionHost)).map(el => el.extensionHost);
    }
}
class ExtensionHostManagerData {
    constructor(extensionHost, disposableStore) {
        this.extensionHost = extensionHost;
        this.disposableStore = disposableStore;
    }
    dispose() {
        this.disposableStore.dispose();
        this.extensionHost.dispose();
    }
}
export class ResolverExtensions {
    constructor(extensions) {
        this.extensions = extensions;
    }
}
export class LocalExtensions {
    constructor(extensions) {
        this.extensions = extensions;
    }
}
export class RemoteExtensions {
    constructor(extensions) {
        this.extensions = extensions;
    }
}
class DeltaExtensionsQueueItem {
    constructor(toAdd, toRemove) {
        this.toAdd = toAdd;
        this.toRemove = toRemove;
    }
}
export function isResolverExtension(extension) {
    return !!extension.activationEvents?.some(activationEvent => activationEvent.startsWith('onResolveRemoteAuthority:'));
}
/**
 * @argument extensions The extensions to be checked.
 * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
 */
export function checkEnabledAndProposedAPI(logService, extensionEnablementService, extensionsProposedApi, extensions, ignoreWorkspaceTrust) {
    // enable or disable proposed API per extension
    extensionsProposedApi.updateEnabledApiProposals(extensions);
    // keep only enabled extensions
    return filterEnabledExtensions(logService, extensionEnablementService, extensions, ignoreWorkspaceTrust);
}
/**
 * Return the subset of extensions that are enabled.
 * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
 */
export function filterEnabledExtensions(logService, extensionEnablementService, extensions, ignoreWorkspaceTrust) {
    const enabledExtensions = [], extensionsToCheck = [], mappedExtensions = [];
    for (const extension of extensions) {
        if (extension.isUnderDevelopment) {
            // Never disable extensions under development
            enabledExtensions.push(extension);
        }
        else {
            extensionsToCheck.push(extension);
            mappedExtensions.push(toExtension(extension));
        }
    }
    const enablementStates = extensionEnablementService.getEnablementStates(mappedExtensions, ignoreWorkspaceTrust ? { trusted: true } : undefined);
    for (let index = 0; index < enablementStates.length; index++) {
        if (extensionEnablementService.isEnabledEnablementState(enablementStates[index])) {
            enabledExtensions.push(extensionsToCheck[index]);
        }
        else {
            if (isCI) {
                logService.info(`filterEnabledExtensions: extension '${extensionsToCheck[index].identifier.value}' is disabled`);
            }
        }
    }
    return enabledExtensions;
}
/**
 * @argument extension The extension to be checked.
 * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
 */
export function extensionIsEnabled(logService, extensionEnablementService, extension, ignoreWorkspaceTrust) {
    return filterEnabledExtensions(logService, extensionEnablementService, [extension], ignoreWorkspaceTrust).includes(extension);
}
function includes(extensions, identifier) {
    for (const extension of extensions) {
        if (ExtensionIdentifier.equals(extension.identifier, identifier)) {
            return true;
        }
    }
    return false;
}
export class ExtensionStatus {
    get messages() {
        return this._messages;
    }
    get activationTimes() {
        return this._activationTimes;
    }
    get runtimeErrors() {
        return this._runtimeErrors;
    }
    get activationStarted() {
        return this._activationStarted;
    }
    constructor(id) {
        this.id = id;
        this._messages = [];
        this._activationTimes = null;
        this._runtimeErrors = [];
        this._activationStarted = false;
    }
    clearRuntimeStatus() {
        this._activationStarted = false;
        this._activationTimes = null;
        this._runtimeErrors = [];
    }
    addMessage(msg) {
        this._messages.push(msg);
    }
    setActivationTimes(activationTimes) {
        this._activationTimes = activationTimes;
    }
    addRuntimeError(err) {
        this._runtimeErrors.push(err);
    }
    onWillActivate() {
        this._activationStarted = true;
    }
}
export class ExtensionHostCrashTracker {
    constructor() {
        this._recentCrashes = [];
    }
    static { this._TIME_LIMIT = 5 * 60 * 1000; } // 5 minutes
    static { this._CRASH_LIMIT = 3; }
    _removeOldCrashes() {
        const limit = Date.now() - ExtensionHostCrashTracker._TIME_LIMIT;
        while (this._recentCrashes.length > 0 && this._recentCrashes[0].timestamp < limit) {
            this._recentCrashes.shift();
        }
    }
    registerCrash() {
        this._removeOldCrashes();
        this._recentCrashes.push({ timestamp: Date.now() });
    }
    shouldAutomaticallyRestart() {
        this._removeOldCrashes();
        return (this._recentCrashes.length < ExtensionHostCrashTracker._CRASH_LIMIT);
    }
}
/**
 * This can run correctly only on the renderer process because that is the only place
 * where all extension points and all implicit activation events generators are known.
 */
export class ImplicitActivationAwareReader {
    readActivationEvents(extensionDescription) {
        return ImplicitActivationEvents.readActivationEvents(extensionDescription);
    }
}
class ActivationFeatureMarkdowneRenderer extends Disposable {
    constructor() {
        super(...arguments);
        this.type = 'markdown';
    }
    shouldRender(manifest) {
        return !!manifest.activationEvents;
    }
    render(manifest) {
        const activationEvents = manifest.activationEvents || [];
        const data = new MarkdownString();
        if (activationEvents.length) {
            for (const activationEvent of activationEvents) {
                data.appendMarkdown(`- \`${activationEvent}\`\n`);
            }
        }
        return {
            data,
            dispose: () => { }
        };
    }
}
Registry.as(ExtensionFeaturesExtensions.ExtensionFeaturesRegistry).registerExtensionFeature({
    id: 'activationEvents',
    label: nls.localize('activation', "Activation Events"),
    access: {
        canToggle: false
    },
    renderer: new SyncDescriptor(ActivationFeatureMarkdowneRenderer),
});
