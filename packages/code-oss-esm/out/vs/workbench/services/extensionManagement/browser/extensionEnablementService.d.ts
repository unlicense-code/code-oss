import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IExtensionManagementService, IExtensionIdentifier, IGlobalExtensionEnablementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IWorkbenchExtensionEnablementService, EnablementState, IExtensionManagementServerService, IWorkbenchExtensionManagementService } from '../common/extensionManagement.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IExtension } from '../../../../platform/extensions/common/extensions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IUserDataSyncAccountService } from '../../../../platform/userDataSync/common/userDataSyncAccount.js';
import { IUserDataSyncEnablementService } from '../../../../platform/userDataSync/common/userDataSync.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IHostService } from '../../host/browser/host.js';
import { IExtensionBisectService } from './extensionBisect.js';
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IExtensionManifestPropertiesService } from '../../extensions/common/extensionManifestPropertiesService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
type WorkspaceType = {
    readonly virtual: boolean;
    readonly trusted: boolean;
};
export declare class ExtensionEnablementService extends Disposable implements IWorkbenchExtensionEnablementService {
    protected readonly globalExtensionEnablementService: IGlobalExtensionEnablementService;
    private readonly contextService;
    private readonly environmentService;
    private readonly configurationService;
    private readonly extensionManagementServerService;
    private readonly userDataSyncEnablementService;
    private readonly userDataSyncAccountService;
    private readonly lifecycleService;
    private readonly notificationService;
    private readonly extensionBisectService;
    private readonly workspaceTrustManagementService;
    private readonly workspaceTrustRequestService;
    private readonly extensionManifestPropertiesService;
    readonly _serviceBrand: undefined;
    private readonly _onEnablementChanged;
    readonly onEnablementChanged: Event<readonly IExtension[]>;
    protected readonly extensionsManager: ExtensionsManager;
    private readonly storageManager;
    private extensionsDisabledByExtensionDependency;
    constructor(storageService: IStorageService, globalExtensionEnablementService: IGlobalExtensionEnablementService, contextService: IWorkspaceContextService, environmentService: IWorkbenchEnvironmentService, extensionManagementService: IExtensionManagementService, configurationService: IConfigurationService, extensionManagementServerService: IExtensionManagementServerService, userDataSyncEnablementService: IUserDataSyncEnablementService, userDataSyncAccountService: IUserDataSyncAccountService, lifecycleService: ILifecycleService, notificationService: INotificationService, hostService: IHostService, extensionBisectService: IExtensionBisectService, workspaceTrustManagementService: IWorkspaceTrustManagementService, workspaceTrustRequestService: IWorkspaceTrustRequestService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, instantiationService: IInstantiationService);
    private get hasWorkspace();
    private get allUserExtensionsDisabled();
    getEnablementState(extension: IExtension): EnablementState;
    getEnablementStates(extensions: IExtension[], workspaceTypeOverrides?: Partial<WorkspaceType>): EnablementState[];
    getDependenciesEnablementStates(extension: IExtension): [IExtension, EnablementState][];
    canChangeEnablement(extension: IExtension): boolean;
    canChangeWorkspaceEnablement(extension: IExtension): boolean;
    private throwErrorIfCannotChangeEnablement;
    private throwErrorIfEnablementStateCannotBeChanged;
    private throwErrorIfCannotChangeWorkspaceEnablement;
    setEnablement(extensions: IExtension[], newState: EnablementState): Promise<boolean[]>;
    private getExtensionsToEnableRecursively;
    private _setUserEnablementState;
    isEnabled(extension: IExtension): boolean;
    isEnabledEnablementState(enablementState: EnablementState): boolean;
    isDisabledGlobally(extension: IExtension): boolean;
    private _computeEnablementState;
    private _isDisabledInEnv;
    private _isEnabledInEnv;
    private _isDisabledByVirtualWorkspace;
    private _isDisabledByExtensionKind;
    private _isDisabledByWorkspaceTrust;
    private _isDisabledByExtensionDependency;
    private _getUserEnablementState;
    private _isDisabledGlobally;
    private _enableExtension;
    private _disableExtension;
    private _enableExtensionInWorkspace;
    private _disableExtensionInWorkspace;
    private _addToWorkspaceDisabledExtensions;
    private _removeFromWorkspaceDisabledExtensions;
    private _addToWorkspaceEnabledExtensions;
    private _removeFromWorkspaceEnabledExtensions;
    protected _getWorkspaceEnabledExtensions(): IExtensionIdentifier[];
    private _setEnabledExtensions;
    protected _getWorkspaceDisabledExtensions(): IExtensionIdentifier[];
    private _setDisabledExtensions;
    private _getExtensions;
    private _setExtensions;
    private _onDidChangeGloballyDisabledExtensions;
    private _onDidChangeExtensions;
    updateExtensionsEnablementsWhenWorkspaceTrustChanges(): Promise<void>;
    private getWorkspaceType;
    private _reset;
}
declare class ExtensionsManager extends Disposable {
    private readonly extensionManagementService;
    private readonly extensionManagementServerService;
    private readonly logService;
    private _extensions;
    get extensions(): readonly IExtension[];
    private _onDidChangeExtensions;
    readonly onDidChangeExtensions: Event<{
        added: readonly IExtension[];
        removed: readonly IExtension[];
        readonly isProfileSwitch: boolean;
    }>;
    private readonly initializePromise;
    private disposed;
    constructor(extensionManagementService: IWorkbenchExtensionManagementService, extensionManagementServerService: IExtensionManagementServerService, logService: ILogService);
    whenInitialized(): Promise<void>;
    private initialize;
    private updateExtensions;
}
export {};
