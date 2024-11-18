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
var PwshCompletionProviderAddon_1;
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { Event, Emitter } from '../../../../../base/common/event.js';
import * as dom from '../../../../../base/browser/dom.js';
import { sep } from '../../../../../base/common/path.js';
import { SuggestAddon } from './terminalSuggestAddon.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { terminalSuggestConfigSection } from '../common/terminalSuggestConfiguration.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { DeferredPromise } from '../../../../../base/common/async.js';
export var VSCodeSuggestOscPt;
(function (VSCodeSuggestOscPt) {
    VSCodeSuggestOscPt["Completions"] = "Completions";
    VSCodeSuggestOscPt["CompletionsPwshCommands"] = "CompletionsPwshCommands";
})(VSCodeSuggestOscPt || (VSCodeSuggestOscPt = {}));
var Constants;
(function (Constants) {
    Constants["CachedPwshCommandsStorageKey"] = "terminal.suggest.pwshCommands";
})(Constants || (Constants = {}));
var RequestCompletionsSequence;
(function (RequestCompletionsSequence) {
    RequestCompletionsSequence["Contextual"] = "\u001B[24~e";
    RequestCompletionsSequence["Global"] = "\u001B[24~f";
    RequestCompletionsSequence["Git"] = "\u001B[24~g";
    RequestCompletionsSequence["Code"] = "\u001B[24~h"; // F12,h
})(RequestCompletionsSequence || (RequestCompletionsSequence = {}));
let PwshCompletionProviderAddon = class PwshCompletionProviderAddon extends Disposable {
    static { PwshCompletionProviderAddon_1 = this; }
    static { this.ID = 'terminal.pwshCompletionProvider'; }
    constructor(providedPwshCommands, capabilities, _configurationService, _storageService) {
        super();
        this._configurationService = _configurationService;
        this._storageService = _storageService;
        this.shellTypes = ["pwsh" /* GeneralShellType.PowerShell */];
        this._codeCompletionsRequested = false;
        this._gitCompletionsRequested = false;
        this._lastUserDataTimestamp = 0;
        this._enableWidget = true;
        this.isPasting = false;
        this._completionsDeferred = null;
        this._onBell = this._register(new Emitter());
        this.onBell = this._onBell.event;
        this._onAcceptedCompletion = this._register(new Emitter());
        this.onAcceptedCompletion = this._onAcceptedCompletion.event;
        this._onDidReceiveCompletions = this._register(new Emitter());
        this.onDidReceiveCompletions = this._onDidReceiveCompletions.event;
        this._onDidRequestSendText = this._register(new Emitter());
        this.onDidRequestSendText = this._onDidRequestSendText.event;
        this._register(Event.runAndSubscribe(Event.any(capabilities.onDidAddCapabilityType, capabilities.onDidRemoveCapabilityType), () => {
            const commandDetection = capabilities.get(2 /* TerminalCapability.CommandDetection */);
            if (commandDetection) {
                if (this._promptInputModel !== commandDetection.promptInputModel) {
                    this._promptInputModel = commandDetection.promptInputModel;
                }
            }
            else {
                this._promptInputModel = undefined;
            }
        }));
        PwshCompletionProviderAddon_1.cachedPwshCommands = providedPwshCommands || new Set();
        // Attempt to load cached pwsh commands if not already loaded
        if (PwshCompletionProviderAddon_1.cachedPwshCommands.size === 0) {
            const config = this._storageService.get("terminal.suggest.pwshCommands" /* Constants.CachedPwshCommandsStorageKey */, -1 /* StorageScope.APPLICATION */, undefined);
            if (config !== undefined) {
                const completions = JSON.parse(config);
                for (const c of completions) {
                    PwshCompletionProviderAddon_1.cachedPwshCommands.add(c);
                }
            }
        }
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.suggest.enabled" /* TerminalSuggestSettingId.Enabled */)) {
                this.clearSuggestCache();
            }
        }));
    }
    clearSuggestCache() {
        PwshCompletionProviderAddon_1.cachedPwshCommands.clear();
        this._storageService.remove("terminal.suggest.pwshCommands" /* Constants.CachedPwshCommandsStorageKey */, -1 /* StorageScope.APPLICATION */);
    }
    activate(xterm) {
        this._terminal = xterm;
        this._register(xterm.onData(() => {
            this._lastUserDataTimestamp = Date.now();
        }));
        const config = this._configurationService.getValue(terminalSuggestConfigSection);
        const enabled = config.enabled;
        if (!enabled) {
            return;
        }
        this._register(xterm.parser.registerOscHandler(633 /* ShellIntegrationOscPs.VSCode */, data => {
            return this._handleVSCodeSequence(data);
        }));
    }
    _handleVSCodeSequence(data) {
        if (!this._terminal) {
            return false;
        }
        // Pass the sequence along to the capability
        const [command, ...args] = data.split(';');
        switch (command) {
            case "Completions" /* VSCodeSuggestOscPt.Completions */:
                this._handleCompletionsSequence(this._terminal, data, command, args);
                return true;
            case "CompletionsPwshCommands" /* VSCodeSuggestOscPt.CompletionsPwshCommands */:
                return this._handleCompletionsPwshCommandsSequence(this._terminal, data, command, args);
        }
        // Unrecognized sequence
        return false;
    }
    _handleCompletionsSequence(terminal, data, command, args) {
        this._onDidReceiveCompletions.fire();
        // Nothing to handle if the terminal is not attached
        if (!terminal.element || !this._enableWidget || !this._promptInputModel) {
            this._resolveCompletions(undefined);
            return;
        }
        // Only show the suggest widget if the terminal is focused
        if (!dom.isAncestorOfActiveElement(terminal.element)) {
            this._resolveCompletions(undefined);
            return;
        }
        let replacementIndex = 0;
        let replacementLength = this._promptInputModel.cursorIndex;
        this._currentPromptInputState = {
            value: this._promptInputModel.value,
            prefix: this._promptInputModel.prefix,
            suffix: this._promptInputModel.suffix,
            cursorIndex: this._promptInputModel.cursorIndex,
            ghostTextIndex: this._promptInputModel.ghostTextIndex
        };
        let leadingLineContent = this._currentPromptInputState.prefix.substring(replacementIndex, replacementIndex + replacementLength);
        const firstChar = leadingLineContent.length === 0 ? '' : leadingLineContent[0];
        const isGlobalCommand = !leadingLineContent.includes(' ') && firstChar !== '[';
        // This is a TabExpansion2 result
        if (!isGlobalCommand) {
            replacementIndex = parseInt(args[0]);
            replacementLength = parseInt(args[1]);
            leadingLineContent = this._promptInputModel.prefix;
        }
        const payload = data.slice(command.length + args[0].length + args[1].length + args[2].length + 4 /*semi-colons*/);
        const rawCompletions = args.length === 0 || payload.length === 0 ? undefined : JSON.parse(payload);
        const completions = parseCompletionsFromShell(rawCompletions, replacementIndex, replacementLength);
        // This is a global command, add cached commands list to completions
        if (isGlobalCommand) {
            for (const c of PwshCompletionProviderAddon_1.cachedPwshCommands) {
                c.replacementIndex = replacementIndex;
                c.replacementLength = replacementLength;
                completions.push(c);
            }
        }
        if (this._mostRecentCompletion?.isDirectory && completions.every(c => c.isDirectory)) {
            completions.push(this._mostRecentCompletion);
        }
        this._mostRecentCompletion = undefined;
        this._resolveCompletions(completions);
    }
    async _handleCompletionsPwshCommandsSequence(terminal, data, command, args) {
        const type = args[0];
        const rawCompletions = JSON.parse(data.slice(command.length + type.length + 2 /*semi-colons*/));
        const completions = parseCompletionsFromShell(rawCompletions, 0, 0);
        const set = PwshCompletionProviderAddon_1.cachedPwshCommands;
        set.clear();
        for (const c of completions) {
            set.add(c);
        }
        this._storageService.store("terminal.suggest.pwshCommands" /* Constants.CachedPwshCommandsStorageKey */, JSON.stringify(Array.from(set.values())), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        return true;
    }
    _resolveCompletions(result) {
        if (!this._completionsDeferred) {
            return;
        }
        this._completionsDeferred.complete(result);
        // Resolved, clear the deferred promise
        this._completionsDeferred = null;
    }
    _getCompletionsPromise() {
        this._completionsDeferred = new DeferredPromise();
        return this._completionsDeferred.p;
    }
    provideCompletions(value) {
        const builtinCompletionsConfig = this._configurationService.getValue(terminalSuggestConfigSection).builtinCompletions;
        if (!this._codeCompletionsRequested && builtinCompletionsConfig.pwshCode) {
            this._onDidRequestSendText.fire("\u001B[24~h" /* RequestCompletionsSequence.Code */);
            this._codeCompletionsRequested = true;
        }
        if (!this._gitCompletionsRequested && builtinCompletionsConfig.pwshGit) {
            this._onDidRequestSendText.fire("\u001B[24~g" /* RequestCompletionsSequence.Git */);
            this._gitCompletionsRequested = true;
        }
        // Request global pwsh completions if there are none cached
        if (PwshCompletionProviderAddon_1.cachedPwshCommands.size === 0) {
            this._onDidRequestSendText.fire("\u001B[24~f" /* RequestCompletionsSequence.Global */);
        }
        // Ensure that a key has been pressed since the last accepted completion in order to prevent
        // completions being requested again right after accepting a completion
        if (this._lastUserDataTimestamp > SuggestAddon.lastAcceptedCompletionTimestamp) {
            this._onDidRequestSendText.fire("\u001B[24~e" /* RequestCompletionsSequence.Contextual */);
        }
        return this._getCompletionsPromise();
    }
};
PwshCompletionProviderAddon = PwshCompletionProviderAddon_1 = __decorate([
    __param(2, IConfigurationService),
    __param(3, IStorageService)
], PwshCompletionProviderAddon);
export { PwshCompletionProviderAddon };
export function parseCompletionsFromShell(rawCompletions, replacementIndex, replacementLength) {
    if (!rawCompletions) {
        return [];
    }
    let typedRawCompletions;
    if (!Array.isArray(rawCompletions)) {
        typedRawCompletions = [rawCompletions];
    }
    else {
        if (rawCompletions.length === 0) {
            return [];
        }
        if (typeof rawCompletions[0] === 'string') {
            typedRawCompletions = [rawCompletions].map(e => ({
                CompletionText: e[0],
                ResultType: e[1],
                ToolTip: e[2],
                CustomIcon: e[3],
            }));
        }
        else if (Array.isArray(rawCompletions[0])) {
            typedRawCompletions = rawCompletions.map(e => ({
                CompletionText: e[0],
                ResultType: e[1],
                ToolTip: e[2],
                CustomIcon: e[3],
            }));
        }
        else {
            typedRawCompletions = rawCompletions;
        }
    }
    return typedRawCompletions.map(e => rawCompletionToISimpleCompletion(e, replacementIndex, replacementLength));
}
function rawCompletionToISimpleCompletion(rawCompletion, replacementIndex, replacementLength) {
    // HACK: Somewhere along the way from the powershell script to here, the path separator at the
    // end of directories may go missing, likely because `\"` -> `"`. As a result, make sure there
    // is a trailing separator at the end of all directory completions. This should not be done for
    // `.` and `..` entries because they are optimized not for navigating to different directories
    // but for passing as args.
    let label = rawCompletion.CompletionText;
    if (rawCompletion.ResultType === 4 &&
        !label.match(/^[\-+]$/) && // Don't add a `/` to `-` or `+` (navigate location history)
        !label.match(/^\.\.?$/) &&
        !label.match(/[\\\/]$/)) {
        const separator = label.match(/(?<sep>[\\\/])/)?.groups?.sep ?? sep;
        label = label + separator;
    }
    // If tooltip is not present it means it's the same as label
    const detail = rawCompletion.ToolTip ?? label;
    // Pwsh gives executables a result type of 2, but we want to treat them as files wrt the sorting
    // and file extension score boost. An example of where this improves the experience is typing
    // `git`, `git.exe` should appear at the top and beat `git-lfs.exe`. Keep the same icon though.
    const icon = getIcon(rawCompletion.ResultType, rawCompletion.CustomIcon);
    const isExecutable = rawCompletion.ResultType === 2 && rawCompletion.CompletionText.match(/\.[a-z0-9]{2,4}$/i);
    if (isExecutable) {
        rawCompletion.ResultType = 3;
    }
    return {
        label,
        icon,
        detail,
        isFile: rawCompletion.ResultType === 3,
        isDirectory: rawCompletion.ResultType === 4,
        isKeyword: rawCompletion.ResultType === 12,
        replacementIndex,
        replacementLength
    };
}
function getIcon(resultType, customIconId) {
    if (customIconId) {
        const icon = customIconId in Codicon ? Codicon[customIconId] : Codicon.symbolText;
        if (icon) {
            return icon;
        }
    }
    return pwshTypeToIconMap[resultType] ?? Codicon.symbolText;
}
/**
 * A map of the pwsh result type enum's value to the corresponding icon to use in completions.
 *
 * | Value | Name              | Description
 * |-------|-------------------|------------
 * | 0     | Text              | An unknown result type, kept as text only
 * | 1     | History           | A history result type like the items out of get-history
 * | 2     | Command           | A command result type like the items out of get-command
 * | 3     | ProviderItem      | A provider item
 * | 4     | ProviderContainer | A provider container
 * | 5     | Property          | A property result type like the property items out of get-member
 * | 6     | Method            | A method result type like the method items out of get-member
 * | 7     | ParameterName     | A parameter name result type like the Parameters property out of get-command items
 * | 8     | ParameterValue    | A parameter value result type
 * | 9     | Variable          | A variable result type like the items out of get-childitem variable:
 * | 10    | Namespace         | A namespace
 * | 11    | Type              | A type name
 * | 12    | Keyword           | A keyword
 * | 13    | DynamicKeyword    | A dynamic keyword
 *
 * @see https://docs.microsoft.com/en-us/dotnet/api/system.management.automation.completionresulttype?view=powershellsdk-7.0.0
 */
const pwshTypeToIconMap = {
    0: Codicon.symbolText,
    1: Codicon.history,
    2: Codicon.symbolMethod,
    3: Codicon.symbolFile,
    4: Codicon.folder,
    5: Codicon.symbolProperty,
    6: Codicon.symbolMethod,
    7: Codicon.symbolVariable,
    8: Codicon.symbolValue,
    9: Codicon.symbolVariable,
    10: Codicon.symbolNamespace,
    11: Codicon.symbolInterface,
    12: Codicon.symbolKeyword,
    13: Codicon.symbolKeyword
};
