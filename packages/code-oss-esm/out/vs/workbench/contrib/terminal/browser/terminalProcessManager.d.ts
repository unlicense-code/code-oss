import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { OperatingSystem } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { ISerializedCommandDetectionCapability } from '../../../../platform/terminal/common/capabilities/capabilities.js';
import { TerminalCapabilityStore } from '../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js';
import { IProcessDataEvent, IProcessProperty, IProcessPropertyMap, IProcessReadyEvent, IReconnectionProperties, IShellLaunchConfig, ITerminalBackend, ITerminalLaunchError, ITerminalLogService, ProcessPropertyType } from '../../../../platform/terminal/common/terminal.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ITerminalConfigurationService, ITerminalInstanceService } from './terminal.js';
import { IEnvironmentVariableInfo, IEnvironmentVariableService } from '../common/environmentVariable.js';
import { IBeforeProcessDataEvent, ITerminalProcessManager, ITerminalProfileResolverService, ProcessState } from '../common/terminal.js';
import { IConfigurationResolverService } from '../../../services/configurationResolver/common/configurationResolver.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IHistoryService } from '../../../services/history/common/history.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IEnvironmentVariableCollection, IMergedEnvironmentVariableCollection } from '../../../../platform/terminal/common/environmentVariable.js';
/**
 * Holds all state related to the creation and management of terminal processes.
 *
 * Internal definitions:
 * - Process: The process launched with the terminalProcess.ts file, or the pty as a whole
 * - Pty Process: The pseudoterminal parent process (or the conpty/winpty agent process)
 * - Shell Process: The pseudoterminal child process (ie. the shell)
 */
export declare class TerminalProcessManager extends Disposable implements ITerminalProcessManager {
    private readonly _instanceId;
    private readonly _historyService;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly _workspaceContextService;
    private readonly _configurationResolverService;
    private readonly _workbenchEnvironmentService;
    private readonly _productService;
    private readonly _remoteAgentService;
    private readonly _pathService;
    private readonly _environmentVariableService;
    private readonly _terminalConfigurationService;
    private readonly _terminalProfileResolverService;
    private readonly _configurationService;
    private readonly _terminalInstanceService;
    private readonly _telemetryService;
    private readonly _notificationService;
    processState: ProcessState;
    ptyProcessReady: Promise<void>;
    shellProcessId: number | undefined;
    readonly remoteAuthority: string | undefined;
    os: OperatingSystem | undefined;
    userHome: string | undefined;
    environmentVariableInfo: IEnvironmentVariableInfo | undefined;
    backend: ITerminalBackend | undefined;
    readonly capabilities: TerminalCapabilityStore;
    readonly shellIntegrationNonce: string;
    private _isDisposed;
    private _process;
    private _processType;
    private _preLaunchInputQueue;
    private _initialCwd;
    private _extEnvironmentVariableCollection;
    private _ackDataBufferer;
    private _hasWrittenData;
    private _hasChildProcesses;
    private _ptyResponsiveListener;
    private _ptyListenersAttached;
    private _dataFilter;
    private _processListeners?;
    private _isDisconnected;
    private _shellLaunchConfig?;
    private _dimensions;
    private readonly _onPtyDisconnect;
    readonly onPtyDisconnect: Event<void>;
    private readonly _onPtyReconnect;
    readonly onPtyReconnect: Event<void>;
    private readonly _onProcessReady;
    readonly onProcessReady: Event<IProcessReadyEvent>;
    private readonly _onProcessStateChange;
    readonly onProcessStateChange: Event<void>;
    private readonly _onBeforeProcessData;
    readonly onBeforeProcessData: Event<IBeforeProcessDataEvent>;
    private readonly _onProcessData;
    readonly onProcessData: Event<IProcessDataEvent>;
    private readonly _onProcessReplayComplete;
    readonly onProcessReplayComplete: Event<void>;
    private readonly _onDidChangeProperty;
    readonly onDidChangeProperty: Event<IProcessProperty<any>>;
    private readonly _onEnvironmentVariableInfoChange;
    readonly onEnvironmentVariableInfoChanged: Event<IEnvironmentVariableInfo>;
    private readonly _onProcessExit;
    readonly onProcessExit: Event<number | undefined>;
    private readonly _onRestoreCommands;
    readonly onRestoreCommands: Event<ISerializedCommandDetectionCapability>;
    private _cwdWorkspaceFolder;
    get persistentProcessId(): number | undefined;
    get shouldPersist(): boolean;
    get hasWrittenData(): boolean;
    get hasChildProcesses(): boolean;
    get reconnectionProperties(): IReconnectionProperties | undefined;
    get extEnvironmentVariableCollection(): IMergedEnvironmentVariableCollection | undefined;
    constructor(_instanceId: number, cwd: string | URI | undefined, environmentVariableCollections: ReadonlyMap<string, IEnvironmentVariableCollection> | undefined, shellIntegrationNonce: string | undefined, _historyService: IHistoryService, _instantiationService: IInstantiationService, _logService: ITerminalLogService, _workspaceContextService: IWorkspaceContextService, _configurationResolverService: IConfigurationResolverService, _workbenchEnvironmentService: IWorkbenchEnvironmentService, _productService: IProductService, _remoteAgentService: IRemoteAgentService, _pathService: IPathService, _environmentVariableService: IEnvironmentVariableService, _terminalConfigurationService: ITerminalConfigurationService, _terminalProfileResolverService: ITerminalProfileResolverService, _configurationService: IConfigurationService, _terminalInstanceService: ITerminalInstanceService, _telemetryService: ITelemetryService, _notificationService: INotificationService);
    freePortKillProcess(port: string): Promise<void>;
    dispose(immediate?: boolean): void;
    private _createPtyProcessReadyPromise;
    detachFromProcess(forcePersist?: boolean): Promise<void>;
    createProcess(shellLaunchConfig: IShellLaunchConfig, cols: number, rows: number, reset?: boolean): Promise<ITerminalLaunchError | {
        injectedArgs: string[];
    } | undefined>;
    relaunch(shellLaunchConfig: IShellLaunchConfig, cols: number, rows: number, reset: boolean): Promise<ITerminalLaunchError | {
        injectedArgs: string[];
    } | undefined>;
    private _resolveEnvironment;
    private _launchLocalProcess;
    private _setupPtyHostListeners;
    getBackendOS(): Promise<OperatingSystem>;
    setDimensions(cols: number, rows: number): Promise<void>;
    setDimensions(cols: number, rows: number, sync: false): Promise<void>;
    setDimensions(cols: number, rows: number, sync: true): void;
    setUnicodeVersion(version: '6' | '11'): Promise<void>;
    private _resize;
    write(data: string): Promise<void>;
    processBinary(data: string): Promise<void>;
    get initialCwd(): string;
    refreshProperty<T extends ProcessPropertyType>(type: T): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(type: T, value: IProcessPropertyMap[T]): Promise<void>;
    acknowledgeDataEvent(charCount: number): void;
    private _onExit;
    private _setProcessState;
    private _onEnvironmentVariableCollectionChange;
    clearBuffer(): Promise<void>;
}
