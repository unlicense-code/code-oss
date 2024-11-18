import { ITerminalCompletionProvider } from './terminalCompletionService.js';
import { ISimpleCompletion } from '../../../../services/suggest/browser/simpleCompletionItem.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import type { ITerminalAddon, Terminal } from '@xterm/xterm';
import { Event } from '../../../../../base/common/event.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { GeneralShellType } from '../../../../../platform/terminal/common/terminal.js';
import { ITerminalCapabilityStore } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
export declare const enum VSCodeSuggestOscPt {
    Completions = "Completions",
    CompletionsPwshCommands = "CompletionsPwshCommands"
}
export type CompressedPwshCompletion = [
    completionText: string,
    resultType: number,
    toolTip?: string,
    customIcon?: string
];
export type PwshCompletion = {
    CompletionText: string;
    ResultType: number;
    ToolTip?: string;
    CustomIcon?: string;
};
declare const enum RequestCompletionsSequence {
    Contextual = "\u001B[24~e",// F12,e
    Global = "\u001B[24~f",// F12,f
    Git = "\u001B[24~g",// F12,g
    Code = "\u001B[24~h"
}
export declare class PwshCompletionProviderAddon extends Disposable implements ITerminalAddon, ITerminalCompletionProvider {
    private readonly _configurationService;
    private readonly _storageService;
    static readonly ID = "terminal.pwshCompletionProvider";
    static cachedPwshCommands: Set<ISimpleCompletion>;
    readonly shellTypes: GeneralShellType[];
    private _codeCompletionsRequested;
    private _gitCompletionsRequested;
    private _lastUserDataTimestamp;
    private _terminal?;
    private _mostRecentCompletion?;
    private _promptInputModel?;
    private _currentPromptInputState?;
    private _enableWidget;
    isPasting: boolean;
    private _completionsDeferred;
    private readonly _onBell;
    readonly onBell: Event<void>;
    private readonly _onAcceptedCompletion;
    readonly onAcceptedCompletion: Event<string>;
    private readonly _onDidReceiveCompletions;
    readonly onDidReceiveCompletions: Event<void>;
    private readonly _onDidRequestSendText;
    readonly onDidRequestSendText: Event<RequestCompletionsSequence>;
    constructor(providedPwshCommands: Set<ISimpleCompletion> | undefined, capabilities: ITerminalCapabilityStore, _configurationService: IConfigurationService, _storageService: IStorageService);
    clearSuggestCache(): void;
    activate(xterm: Terminal): void;
    private _handleVSCodeSequence;
    private _handleCompletionsSequence;
    private _handleCompletionsPwshCommandsSequence;
    private _resolveCompletions;
    private _getCompletionsPromise;
    provideCompletions(value: string): Promise<ISimpleCompletion[] | undefined>;
}
export declare function parseCompletionsFromShell(rawCompletions: PwshCompletion | PwshCompletion[] | CompressedPwshCompletion[] | CompressedPwshCompletion, replacementIndex: number, replacementLength: number): ISimpleCompletion[];
export {};
