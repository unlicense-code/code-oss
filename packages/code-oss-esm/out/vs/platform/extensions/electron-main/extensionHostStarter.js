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
var ExtensionHostStarter_1;
import { Promises } from '../../../base/common/async.js';
import { canceled } from '../../../base/common/errors.js';
import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { WindowUtilityProcess } from '../../utilityProcess/electron-main/utilityProcess.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
let ExtensionHostStarter = class ExtensionHostStarter extends Disposable {
    static { ExtensionHostStarter_1 = this; }
    static { this._lastId = 0; }
    constructor(_logService, _lifecycleMainService, _windowsMainService, _telemetryService) {
        super();
        this._logService = _logService;
        this._lifecycleMainService = _lifecycleMainService;
        this._windowsMainService = _windowsMainService;
        this._telemetryService = _telemetryService;
        this._extHosts = new Map();
        this._shutdown = false;
        // On shutdown: gracefully await extension host shutdowns
        this._register(this._lifecycleMainService.onWillShutdown(e => {
            this._shutdown = true;
            e.join('extHostStarter', this._waitForAllExit(6000));
        }));
    }
    dispose() {
        // Intentionally not killing the extension host processes
        super.dispose();
    }
    _getExtHost(id) {
        const extHostProcess = this._extHosts.get(id);
        if (!extHostProcess) {
            throw new Error(`Unknown extension host!`);
        }
        return extHostProcess;
    }
    onDynamicStdout(id) {
        return this._getExtHost(id).onStdout;
    }
    onDynamicStderr(id) {
        return this._getExtHost(id).onStderr;
    }
    onDynamicMessage(id) {
        return this._getExtHost(id).onMessage;
    }
    onDynamicExit(id) {
        return this._getExtHost(id).onExit;
    }
    async createExtensionHost() {
        if (this._shutdown) {
            throw canceled();
        }
        const id = String(++ExtensionHostStarter_1._lastId);
        const extHost = new WindowUtilityProcess(this._logService, this._windowsMainService, this._telemetryService, this._lifecycleMainService);
        this._extHosts.set(id, extHost);
        const disposable = extHost.onExit(({ pid, code, signal }) => {
            disposable.dispose();
            this._logService.info(`Extension host with pid ${pid} exited with code: ${code}, signal: ${signal}.`);
            setTimeout(() => {
                extHost.dispose();
                this._extHosts.delete(id);
            });
            // See https://github.com/microsoft/vscode/issues/194477
            // We have observed that sometimes the process sends an exit
            // event, but does not really exit and is stuck in an endless
            // loop. In these cases we kill the process forcefully after
            // a certain timeout.
            setTimeout(() => {
                try {
                    process.kill(pid, 0); // will throw if the process doesn't exist anymore.
                    this._logService.error(`Extension host with pid ${pid} still exists, forcefully killing it...`);
                    process.kill(pid);
                }
                catch (er) {
                    // ignore, as the process is already gone
                }
            }, 1000);
        });
        return { id };
    }
    async start(id, opts) {
        if (this._shutdown) {
            throw canceled();
        }
        const extHost = this._getExtHost(id);
        extHost.start({
            ...opts,
            type: 'extensionHost',
            entryPoint: 'vs/workbench/api/node/extensionHostProcess',
            args: ['--skipWorkspaceStorageLock'],
            execArgv: opts.execArgv,
            allowLoadingUnsignedLibraries: true,
            respondToAuthRequestsFromMainProcess: true,
            correlationId: id
        });
        const pid = await Event.toPromise(extHost.onSpawn);
        return { pid };
    }
    async enableInspectPort(id) {
        if (this._shutdown) {
            throw canceled();
        }
        const extHostProcess = this._extHosts.get(id);
        if (!extHostProcess) {
            return false;
        }
        return extHostProcess.enableInspectPort();
    }
    async kill(id) {
        if (this._shutdown) {
            throw canceled();
        }
        const extHostProcess = this._extHosts.get(id);
        if (!extHostProcess) {
            // already gone!
            return;
        }
        extHostProcess.kill();
    }
    async _killAllNow() {
        for (const [, extHost] of this._extHosts) {
            extHost.kill();
        }
    }
    async _waitForAllExit(maxWaitTimeMs) {
        const exitPromises = [];
        for (const [, extHost] of this._extHosts) {
            exitPromises.push(extHost.waitForExit(maxWaitTimeMs));
        }
        return Promises.settled(exitPromises).then(() => { });
    }
};
ExtensionHostStarter = ExtensionHostStarter_1 = __decorate([
    __param(0, ILogService),
    __param(1, ILifecycleMainService),
    __param(2, IWindowsMainService),
    __param(3, ITelemetryService)
], ExtensionHostStarter);
export { ExtensionHostStarter };
