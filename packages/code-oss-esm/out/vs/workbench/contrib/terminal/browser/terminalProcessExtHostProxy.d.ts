import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IProcessReadyEvent, IShellLaunchConfig, ITerminalChildProcess, ITerminalDimensions, ITerminalLaunchError, IProcessProperty, ProcessPropertyType, IProcessPropertyMap } from '../../../../platform/terminal/common/terminal.js';
import { ITerminalService } from './terminal.js';
import { ITerminalProcessExtHostProxy } from '../common/terminal.js';
export declare class TerminalProcessExtHostProxy extends Disposable implements ITerminalChildProcess, ITerminalProcessExtHostProxy {
    instanceId: number;
    private _cols;
    private _rows;
    private readonly _terminalService;
    readonly id = 0;
    readonly shouldPersist = false;
    private readonly _onProcessData;
    readonly onProcessData: Event<string>;
    private readonly _onProcessReady;
    get onProcessReady(): Event<IProcessReadyEvent>;
    private readonly _onStart;
    readonly onStart: Event<void>;
    private readonly _onInput;
    readonly onInput: Event<string>;
    private readonly _onBinary;
    readonly onBinary: Event<string>;
    private readonly _onResize;
    readonly onResize: Event<{
        cols: number;
        rows: number;
    }>;
    private readonly _onAcknowledgeDataEvent;
    readonly onAcknowledgeDataEvent: Event<number>;
    private readonly _onShutdown;
    readonly onShutdown: Event<boolean>;
    private readonly _onRequestInitialCwd;
    readonly onRequestInitialCwd: Event<void>;
    private readonly _onRequestCwd;
    readonly onRequestCwd: Event<void>;
    private readonly _onDidChangeProperty;
    readonly onDidChangeProperty: Event<IProcessProperty<any>>;
    private readonly _onProcessExit;
    readonly onProcessExit: Event<number | undefined>;
    private _pendingInitialCwdRequests;
    private _pendingCwdRequests;
    constructor(instanceId: number, _cols: number, _rows: number, _terminalService: ITerminalService);
    emitData(data: string): void;
    emitTitle(title: string): void;
    emitReady(pid: number, cwd: string): void;
    emitProcessProperty({ type, value }: IProcessProperty<any>): void;
    emitExit(exitCode: number | undefined): void;
    emitOverrideDimensions(dimensions: ITerminalDimensions | undefined): void;
    emitResolvedShellLaunchConfig(shellLaunchConfig: IShellLaunchConfig): void;
    emitInitialCwd(initialCwd: string): void;
    emitCwd(cwd: string): void;
    start(): Promise<ITerminalLaunchError | undefined>;
    shutdown(immediate: boolean): void;
    input(data: string): void;
    resize(cols: number, rows: number): void;
    clearBuffer(): void | Promise<void>;
    acknowledgeDataEvent(): void;
    setUnicodeVersion(version: '6' | '11'): Promise<void>;
    processBinary(data: string): Promise<void>;
    getInitialCwd(): Promise<string>;
    getCwd(): Promise<string>;
    refreshProperty<T extends ProcessPropertyType>(type: T): Promise<any>;
    updateProperty<T extends ProcessPropertyType>(type: T, value: IProcessPropertyMap[T]): Promise<void>;
}
