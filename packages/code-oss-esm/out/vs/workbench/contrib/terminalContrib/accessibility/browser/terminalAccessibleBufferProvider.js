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
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ITerminalService } from '../../../terminal/browser/terminal.js';
let TerminalAccessibleBufferProvider = class TerminalAccessibleBufferProvider extends Disposable {
    constructor(_instance, _bufferTracker, customHelp, configurationService, terminalService) {
        super();
        this._instance = _instance;
        this._bufferTracker = _bufferTracker;
        this.id = "terminal" /* AccessibleViewProviderId.Terminal */;
        this.options = { type: "view" /* AccessibleViewType.View */, language: 'terminal', id: "terminal" /* AccessibleViewProviderId.Terminal */ };
        this.verbositySettingKey = "accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */;
        this._onDidRequestClearProvider = new Emitter();
        this.onDidRequestClearLastProvider = this._onDidRequestClearProvider.event;
        this.options.customHelp = customHelp;
        this.options.position = configurationService.getValue("terminal.integrated.accessibleViewPreserveCursorPosition" /* TerminalAccessibilitySettingId.AccessibleViewPreserveCursorPosition */) ? 'initial-bottom' : 'bottom';
        this._register(this._instance.onDisposed(() => this._onDidRequestClearProvider.fire("terminal" /* AccessibleViewProviderId.Terminal */)));
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.accessibleViewPreserveCursorPosition" /* TerminalAccessibilitySettingId.AccessibleViewPreserveCursorPosition */)) {
                this.options.position = configurationService.getValue("terminal.integrated.accessibleViewPreserveCursorPosition" /* TerminalAccessibilitySettingId.AccessibleViewPreserveCursorPosition */) ? 'initial-bottom' : 'bottom';
            }
        }));
        this._focusedInstance = terminalService.activeInstance;
        this._register(terminalService.onDidChangeActiveInstance(() => {
            if (terminalService.activeInstance && this._focusedInstance?.instanceId !== terminalService.activeInstance?.instanceId) {
                this._onDidRequestClearProvider.fire("terminal" /* AccessibleViewProviderId.Terminal */);
                this._focusedInstance = terminalService.activeInstance;
            }
        }));
    }
    onClose() {
        this._instance.focus();
    }
    provideContent() {
        this._bufferTracker.update();
        return this._bufferTracker.lines.join('\n');
    }
    getSymbols() {
        const commands = this._getCommandsWithEditorLine() ?? [];
        const symbols = [];
        for (const command of commands) {
            const label = command.command.command;
            if (label) {
                symbols.push({
                    label,
                    lineNumber: command.lineNumber
                });
            }
        }
        return symbols;
    }
    _getCommandsWithEditorLine() {
        const capability = this._instance.capabilities.get(2 /* TerminalCapability.CommandDetection */);
        const commands = capability?.commands;
        const currentCommand = capability?.currentCommand;
        if (!commands?.length) {
            return;
        }
        const result = [];
        for (const command of commands) {
            const lineNumber = this._getEditorLineForCommand(command);
            if (lineNumber === undefined) {
                continue;
            }
            result.push({ command, lineNumber, exitCode: command.exitCode });
        }
        if (currentCommand) {
            const lineNumber = this._getEditorLineForCommand(currentCommand);
            if (lineNumber !== undefined) {
                result.push({ command: currentCommand, lineNumber });
            }
        }
        return result;
    }
    _getEditorLineForCommand(command) {
        let line;
        if ('marker' in command) {
            line = command.marker?.line;
        }
        else if ('commandStartMarker' in command) {
            line = command.commandStartMarker?.line;
        }
        if (line === undefined || line < 0) {
            return;
        }
        line = this._bufferTracker.bufferToEditorLineMapping.get(line);
        if (line === undefined) {
            return;
        }
        return line + 1;
    }
};
TerminalAccessibleBufferProvider = __decorate([
    __param(3, IConfigurationService),
    __param(4, ITerminalService)
], TerminalAccessibleBufferProvider);
export { TerminalAccessibleBufferProvider };
