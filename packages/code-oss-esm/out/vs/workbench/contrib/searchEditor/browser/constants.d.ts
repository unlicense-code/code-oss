import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const InSearchEditor: RawContextKey<boolean>;
export declare const SearchEditorScheme = "search-editor";
export declare const SearchEditorWorkingCopyTypeId = "search/editor";
export declare const SearchEditorFindMatchClass = "searchEditorFindMatch";
export declare const SearchEditorID = "workbench.editor.searchEditor";
export declare const OpenNewEditorCommandId = "search.action.openNewEditor";
export declare const OpenEditorCommandId = "search.action.openEditor";
export declare const ToggleSearchEditorContextLinesCommandId = "toggleSearchEditorContextLines";
export declare const SearchEditorInputTypeId = "workbench.editorinputs.searchEditorInput";
export type SearchConfiguration = {
    query: string;
    filesToInclude: string;
    filesToExclude: string;
    contextLines: number;
    matchWholeWord: boolean;
    isCaseSensitive: boolean;
    isRegexp: boolean;
    useExcludeSettingsAndIgnoreFiles: boolean;
    showIncludesExcludes: boolean;
    onlyOpenEditors: boolean;
    notebookSearchConfig: {
        includeMarkupInput: boolean;
        includeMarkupPreview: boolean;
        includeCodeInput: boolean;
        includeOutput: boolean;
    };
};
