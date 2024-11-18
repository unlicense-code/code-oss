/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var TerminalSuggestCommandId;
(function (TerminalSuggestCommandId) {
    TerminalSuggestCommandId["SelectPrevSuggestion"] = "workbench.action.terminal.selectPrevSuggestion";
    TerminalSuggestCommandId["SelectPrevPageSuggestion"] = "workbench.action.terminal.selectPrevPageSuggestion";
    TerminalSuggestCommandId["SelectNextSuggestion"] = "workbench.action.terminal.selectNextSuggestion";
    TerminalSuggestCommandId["SelectNextPageSuggestion"] = "workbench.action.terminal.selectNextPageSuggestion";
    TerminalSuggestCommandId["AcceptSelectedSuggestion"] = "workbench.action.terminal.acceptSelectedSuggestion";
    TerminalSuggestCommandId["AcceptSelectedSuggestionEnter"] = "workbench.action.terminal.acceptSelectedSuggestionEnter";
    TerminalSuggestCommandId["HideSuggestWidget"] = "workbench.action.terminal.hideSuggestWidget";
    TerminalSuggestCommandId["ClearSuggestCache"] = "workbench.action.terminal.clearSuggestCache";
    TerminalSuggestCommandId["RequestCompletions"] = "workbench.action.terminal.requestCompletions";
})(TerminalSuggestCommandId || (TerminalSuggestCommandId = {}));
export const defaultTerminalSuggestCommandsToSkipShell = [
    "workbench.action.terminal.selectPrevSuggestion" /* TerminalSuggestCommandId.SelectPrevSuggestion */,
    "workbench.action.terminal.selectPrevPageSuggestion" /* TerminalSuggestCommandId.SelectPrevPageSuggestion */,
    "workbench.action.terminal.selectNextSuggestion" /* TerminalSuggestCommandId.SelectNextSuggestion */,
    "workbench.action.terminal.selectNextPageSuggestion" /* TerminalSuggestCommandId.SelectNextPageSuggestion */,
    "workbench.action.terminal.acceptSelectedSuggestion" /* TerminalSuggestCommandId.AcceptSelectedSuggestion */,
    "workbench.action.terminal.acceptSelectedSuggestionEnter" /* TerminalSuggestCommandId.AcceptSelectedSuggestionEnter */,
    "workbench.action.terminal.hideSuggestWidget" /* TerminalSuggestCommandId.HideSuggestWidget */,
    "workbench.action.terminal.clearSuggestCache" /* TerminalSuggestCommandId.ClearSuggestCache */,
    "workbench.action.terminal.requestCompletions" /* TerminalSuggestCommandId.RequestCompletions */,
];
