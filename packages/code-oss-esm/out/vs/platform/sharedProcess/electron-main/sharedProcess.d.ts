import { MessagePortMain } from 'electron';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { IPolicyService } from '../../policy/common/policy.js';
import { ILoggerMainService } from '../../log/electron-main/loggerService.js';
export declare class SharedProcess extends Disposable {
    private readonly machineId;
    private readonly sqmId;
    private readonly devDeviceId;
    private readonly environmentMainService;
    private readonly userDataProfilesService;
    private readonly lifecycleMainService;
    private readonly logService;
    private readonly loggerMainService;
    private readonly policyService;
    private readonly firstWindowConnectionBarrier;
    private utilityProcess;
    private utilityProcessLogListener;
    private readonly _onDidCrash;
    readonly onDidCrash: import("../../../base/common/event.js").Event<void>;
    constructor(machineId: string, sqmId: string, devDeviceId: string, environmentMainService: IEnvironmentMainService, userDataProfilesService: IUserDataProfilesService, lifecycleMainService: ILifecycleMainService, logService: ILogService, loggerMainService: ILoggerMainService, policyService: IPolicyService);
    private registerListeners;
    private onWindowConnection;
    private onWillShutdown;
    private _whenReady;
    whenReady(): Promise<void>;
    private _whenIpcReady;
    private get whenIpcReady();
    private createUtilityProcess;
    private createSharedProcessConfiguration;
    connect(payload?: unknown): Promise<MessagePortMain>;
}
