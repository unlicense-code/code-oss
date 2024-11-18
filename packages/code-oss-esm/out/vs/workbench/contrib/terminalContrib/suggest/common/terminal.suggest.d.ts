export declare const enum TerminalSuggestCommandId {
    SelectPrevSuggestion = "workbench.action.terminal.selectPrevSuggestion",
    SelectPrevPageSuggestion = "workbench.action.terminal.selectPrevPageSuggestion",
    SelectNextSuggestion = "workbench.action.terminal.selectNextSuggestion",
    SelectNextPageSuggestion = "workbench.action.terminal.selectNextPageSuggestion",
    AcceptSelectedSuggestion = "workbench.action.terminal.acceptSelectedSuggestion",
    AcceptSelectedSuggestionEnter = "workbench.action.terminal.acceptSelectedSuggestionEnter",
    HideSuggestWidget = "workbench.action.terminal.hideSuggestWidget",
    ClearSuggestCache = "workbench.action.terminal.clearSuggestCache",
    RequestCompletions = "workbench.action.terminal.requestCompletions"
}
export declare const defaultTerminalSuggestCommandsToSkipShell: TerminalSuggestCommandId[];
