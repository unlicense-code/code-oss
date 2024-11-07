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
import { Emitter } from '../../../../base/common/event.js';
import { IUpdateService, State } from '../../../../platform/update/common/update.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
import { IHostService } from '../../host/browser/host.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
let BrowserUpdateService = class BrowserUpdateService extends Disposable {
    get state() { return this._state; }
    set state(state) {
        this._state = state;
        this._onStateChange.fire(state);
    }
    constructor(environmentService, hostService) {
        super();
        this.environmentService = environmentService;
        this.hostService = hostService;
        this._onStateChange = this._register(new Emitter());
        this.onStateChange = this._onStateChange.event;
        this._state = State.Uninitialized;
        this.checkForUpdates(false);
    }
    async isLatestVersion() {
        const update = await this.doCheckForUpdates(false);
        if (update === undefined) {
            return undefined; // no update provider
        }
        return !!update;
    }
    async checkForUpdates(explicit) {
        await this.doCheckForUpdates(explicit);
    }
    async doCheckForUpdates(explicit) {
        if (this.environmentService.options && this.environmentService.options.updateProvider) {
            const updateProvider = this.environmentService.options.updateProvider;
            // State -> Checking for Updates
            this.state = State.CheckingForUpdates(explicit);
            const update = await updateProvider.checkForUpdate();
            if (update) {
                // State -> Downloaded
                this.state = State.Ready({ version: update.version, productVersion: update.version });
            }
            else {
                // State -> Idle
                this.state = State.Idle(1 /* UpdateType.Archive */);
            }
            return update;
        }
        return undefined; // no update provider to ask
    }
    async downloadUpdate() {
        // no-op
    }
    async applyUpdate() {
        this.hostService.reload();
    }
    async quitAndInstall() {
        this.hostService.reload();
    }
    async _applySpecificUpdate(packagePath) {
        // noop
    }
};
BrowserUpdateService = __decorate([
    __param(0, IBrowserWorkbenchEnvironmentService),
    __param(1, IHostService)
], BrowserUpdateService);
export { BrowserUpdateService };
registerSingleton(IUpdateService, BrowserUpdateService, 0 /* InstantiationType.Eager */);
