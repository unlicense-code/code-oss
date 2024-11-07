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
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { ExtensionIdentifier } from '../../../../../platform/extensions/common/extensions.js';
import { CHAT_OPEN_ACTION_ID } from './chatActions.js';
import { IExtensionManagementService } from '../../../../../platform/extensionManagement/common/extensionManagement.js';
let ChatGettingStartedContribution = class ChatGettingStartedContribution extends Disposable {
    static { this.ID = 'workbench.contrib.chatGettingStarted'; }
    constructor(productService, extensionService, commandService, extensionManagementService) {
        super();
        this.productService = productService;
        this.extensionService = extensionService;
        this.commandService = commandService;
        this.extensionManagementService = extensionManagementService;
        this.recentlyInstalled = false;
        if (!this.productService.gitHubEntitlement) {
            return;
        }
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.extensionManagementService.onDidInstallExtensions(async (result) => {
            for (const e of result) {
                if (ExtensionIdentifier.equals(this.productService.gitHubEntitlement.extensionId, e.identifier.id) && e.operation === 2 /* InstallOperation.Install */) {
                    this.recentlyInstalled = true;
                    return;
                }
            }
        }));
        this._register(this.extensionService.onDidChangeExtensionsStatus(async (event) => {
            for (const ext of event) {
                if (ExtensionIdentifier.equals(this.productService.gitHubEntitlement.extensionId, ext.value)) {
                    const extensionStatus = this.extensionService.getExtensionsStatus();
                    if (extensionStatus[ext.value].activationTimes && this.recentlyInstalled) {
                        await this.commandService.executeCommand(CHAT_OPEN_ACTION_ID);
                        this.recentlyInstalled = false;
                        return;
                    }
                }
            }
        }));
    }
};
ChatGettingStartedContribution = __decorate([
    __param(0, IProductService),
    __param(1, IExtensionService),
    __param(2, ICommandService),
    __param(3, IExtensionManagementService)
], ChatGettingStartedContribution);
export { ChatGettingStartedContribution };
