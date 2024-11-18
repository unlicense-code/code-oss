var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { createDecorator } from '../../../../../platform/instantiation/common/instantiation.js';
export const ITerminalCompletionService = createDecorator('terminalCompletionService');
export var ISimpleCompletionKind;
(function (ISimpleCompletionKind) {
    ISimpleCompletionKind[ISimpleCompletionKind["File"] = 0] = "File";
    ISimpleCompletionKind[ISimpleCompletionKind["Folder"] = 1] = "Folder";
    ISimpleCompletionKind[ISimpleCompletionKind["Flag"] = 2] = "Flag";
    ISimpleCompletionKind[ISimpleCompletionKind["Method"] = 3] = "Method";
})(ISimpleCompletionKind || (ISimpleCompletionKind = {}));
// TODO: make name consistent
let TerminalCompletionService = class TerminalCompletionService extends Disposable {
    constructor(_configurationService) {
        super();
        this._configurationService = _configurationService;
        this._providers = new Map();
    }
    registerTerminalCompletionProvider(extensionIdentifier, id, provider, ...triggerCharacters) {
        let extMap = this._providers.get(extensionIdentifier);
        if (!extMap) {
            extMap = new Map();
            this._providers.set(extensionIdentifier, extMap);
        }
        provider.triggerCharacters = triggerCharacters;
        extMap.set(id, provider);
        return toDisposable(() => {
            const extMap = this._providers.get(extensionIdentifier);
            if (extMap) {
                extMap.delete(id);
                if (extMap.size === 0) {
                    this._providers.delete(extensionIdentifier);
                }
            }
        });
    }
    async provideCompletions(promptValue, cursorPosition, shellType) {
        const completionItems = [];
        if (!this._providers || !this._providers.values) {
            return undefined;
        }
        // TODO: Use Promise.all so all providers are called in parallel
        for (const providerMap of this._providers.values()) {
            for (const [extensionId, provider] of providerMap) {
                if (provider.shellTypes && !provider.shellTypes.includes(shellType)) {
                    continue;
                }
                const completions = await provider.provideCompletions(promptValue, cursorPosition);
                const devModeEnabled = this._configurationService.getValue("terminal.integrated.developer.devMode" /* TerminalSettingId.DevMode */);
                if (completions) {
                    for (const completion of completions) {
                        if (devModeEnabled && !completion.detail?.includes(extensionId)) {
                            completion.detail = `(${extensionId}) ${completion.detail ?? ''}`;
                        }
                        completionItems.push(completion);
                    }
                }
            }
        }
        return completionItems.length > 0 ? completionItems : undefined;
    }
};
TerminalCompletionService = __decorate([
    __param(0, IConfigurationService)
], TerminalCompletionService);
export { TerminalCompletionService };
