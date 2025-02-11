import { URI } from '../../../../base/common/uri.js';
import './media/searchview.css';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IEditor } from '../../../../editor/common/editorCommon.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService, IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { WorkbenchCompressibleAsyncDataTree } from '../../../../platform/list/browser/listService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IViewPaneOptions, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { ExcludePatternInputWidget, IncludePatternInputWidget } from './patternInputWidget.js';
import { IFindInFilesArgs } from './searchActionsFind.js';
import { SearchWidget } from './searchWidget.js';
import { IReplaceService } from './replace.js';
import { ISearchHistoryService } from '../common/searchHistoryService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { ISearchComplete } from '../../../services/search/common/search.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { INotebookService } from '../../notebook/common/notebookService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { ISearchViewModelWorkbenchService } from './searchTreeModel/searchViewModelWorkbenchService.js';
import { RenderableMatch, FileMatchOrMatch, ISearchModel, ISearchResult } from './searchTreeModel/searchTreeCommon.js';
export declare enum SearchViewPosition {
    SideBar = 0,
    Panel = 1
}
export declare class SearchView extends ViewPane {
    private readonly fileService;
    private readonly editorService;
    private readonly codeEditorService;
    private readonly progressService;
    private readonly notificationService;
    private readonly dialogService;
    private readonly commandService;
    private readonly contextViewService;
    private readonly contextService;
    private readonly searchViewModelWorkbenchService;
    private readonly replaceService;
    private readonly textFileService;
    private readonly preferencesService;
    private readonly searchHistoryService;
    private readonly accessibilityService;
    private readonly storageService;
    private readonly notebookService;
    private readonly logService;
    private readonly accessibilitySignalService;
    private static readonly ACTIONS_RIGHT_CLASS_NAME;
    private isDisposed;
    private container;
    private queryBuilder;
    private viewModel;
    private memento;
    private viewletVisible;
    private inputBoxFocused;
    private inputPatternIncludesFocused;
    private inputPatternExclusionsFocused;
    private firstMatchFocused;
    private fileMatchOrMatchFocused;
    private fileMatchOrFolderMatchFocus;
    private fileMatchOrFolderMatchWithResourceFocus;
    private fileMatchFocused;
    private folderMatchFocused;
    private folderMatchWithResourceFocused;
    private matchFocused;
    private isEditableItem;
    private hasSearchResultsKey;
    private lastFocusState;
    private searchStateKey;
    private hasSearchPatternKey;
    private hasReplacePatternKey;
    private hasFilePatternKey;
    private hasSomeCollapsibleResultKey;
    private tree;
    private treeLabels;
    private viewletState;
    private messagesElement;
    private readonly messageDisposables;
    private searchWidgetsContainerElement;
    private searchWidget;
    private size;
    private queryDetails;
    private toggleQueryDetailsButton;
    private inputPatternExcludes;
    private inputPatternIncludes;
    private resultsElement;
    private currentSelectedFileMatch;
    private delayedRefresh;
    private changedWhileHidden;
    private searchWithoutFolderMessageElement;
    private currentSearchQ;
    private addToSearchHistoryDelayer;
    private toggleCollapseStateDelayer;
    private triggerQueryDelayer;
    private pauseSearching;
    private treeAccessibilityProvider;
    private treeViewKey;
    private _visibleMatches;
    private _refreshResultsScheduler;
    private _onSearchResultChangedDisposable;
    private searchDataSource;
    private refreshTreeController;
    constructor(options: IViewPaneOptions, fileService: IFileService, editorService: IEditorService, codeEditorService: ICodeEditorService, progressService: IProgressService, notificationService: INotificationService, dialogService: IDialogService, commandService: ICommandService, contextViewService: IContextViewService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, configurationService: IConfigurationService, contextService: IWorkspaceContextService, searchViewModelWorkbenchService: ISearchViewModelWorkbenchService, contextKeyService: IContextKeyService, replaceService: IReplaceService, textFileService: ITextFileService, preferencesService: IPreferencesService, themeService: IThemeService, searchHistoryService: ISearchHistoryService, contextMenuService: IContextMenuService, accessibilityService: IAccessibilityService, keybindingService: IKeybindingService, storageService: IStorageService, openerService: IOpenerService, telemetryService: ITelemetryService, hoverService: IHoverService, notebookService: INotebookService, logService: ILogService, accessibilitySignalService: IAccessibilitySignalService);
    queueRefreshTree(): Promise<void>;
    get isTreeLayoutViewVisible(): boolean;
    private set isTreeLayoutViewVisible(value);
    setTreeView(visible: boolean): Promise<void>;
    private get state();
    private set state(value);
    getContainer(): HTMLElement;
    get searchResult(): ISearchResult;
    get model(): ISearchModel;
    private refreshHasAISetting;
    private onDidChangeWorkbenchState;
    private refreshInputs;
    replaceSearchModel(searchModel: ISearchModel, asyncResults: Promise<ISearchComplete>): Promise<void>;
    protected renderBody(parent: HTMLElement): void;
    private updateIndentStyles;
    private onVisibilityChanged;
    get searchAndReplaceWidget(): SearchWidget;
    get searchIncludePattern(): IncludePatternInputWidget;
    get searchExcludePattern(): ExcludePatternInputWidget;
    private createSearchWidget;
    shouldShowAIResults(): boolean;
    private onConfigurationUpdated;
    private trackInputBox;
    private onSearchResultsChanged;
    private refreshAndUpdateCount;
    private originalShouldCollapse;
    private shouldCollapseAccordingToConfig;
    private replaceAll;
    private buildAfterReplaceAllMessage;
    private buildReplaceAllConfirmationMessage;
    private clearMessage;
    private createSearchResultsView;
    private onContextMenu;
    private hasSomeCollapsible;
    selectNextMatch(): Promise<void>;
    selectPreviousMatch(): Promise<void>;
    moveFocusToResults(): void;
    focus(): void;
    updateTextFromFindWidgetOrSelection({ allowUnselectedWord, allowSearchOnType }: {
        allowUnselectedWord?: boolean | undefined;
        allowSearchOnType?: boolean | undefined;
    }): boolean;
    private updateTextFromFindWidget;
    private updateTextFromSelection;
    private updateText;
    focusNextInputBox(): void;
    private moveFocusFromSearchOrReplace;
    focusPreviousInputBox(): void;
    private moveFocusFromResults;
    private reLayout;
    protected layoutBody(height: number, width: number): void;
    getControl(): WorkbenchCompressibleAsyncDataTree<ISearchResult, RenderableMatch, void>;
    allSearchFieldsClear(): boolean;
    allFilePatternFieldsClear(): boolean;
    hasSearchResults(): boolean;
    clearSearchResults(clearInput?: boolean): void;
    clearFilePatternFields(): void;
    cancelSearch(focus?: boolean): boolean;
    private selectTreeIfNotSelected;
    private getSearchTextFromEditor;
    private showsFileTypes;
    toggleCaseSensitive(): void;
    toggleWholeWords(): void;
    toggleRegex(): void;
    togglePreserveCase(): void;
    setSearchParameters(args?: IFindInFilesArgs): void;
    toggleQueryDetails(moveFocus?: boolean, show?: boolean, skipLayout?: boolean, reverse?: boolean): void;
    searchInFolders(folderPaths?: string[]): void;
    searchOutsideOfFolders(folderPaths?: string[]): void;
    private _searchWithIncludeOrExclude;
    triggerQueryChange(_options?: {
        preserveFocus?: boolean;
        triggeredOnType?: boolean;
        delay?: number;
        shouldKeepAIResults?: boolean;
    }): void;
    private _getExcludePattern;
    private _getIncludePattern;
    private _onQueryChanged;
    private validateQuery;
    private onQueryTriggered;
    private _updateResults;
    private expandIfSingularResult;
    private onSearchComplete;
    private onSearchError;
    addAIResults(): Promise<void>;
    private doSearch;
    private onOpenSettings;
    private openSettings;
    private onLearnMore;
    private onSearchAgain;
    private onEnableExcludes;
    private onDisableSearchInOpenEditors;
    private updateSearchResultCount;
    private addMessage;
    private buildResultCountMessage;
    private showSearchWithoutFolderMessage;
    private showEmptyStage;
    private shouldOpenInNotebookEditor;
    private onFocus;
    open(element: FileMatchOrMatch, preserveFocus?: boolean, sideBySide?: boolean, pinned?: boolean, resourceInput?: URI): Promise<void>;
    openEditorWithMultiCursor(element: FileMatchOrMatch): Promise<void>;
    private onUntitledDidDispose;
    private onFilesChanged;
    private get searchConfig();
    private clearHistory;
    saveState(): void;
    private _saveSearchHistoryService;
    private updateFileStats;
    private removeFileStats;
    dispose(): void;
}
export declare function getEditorSelectionFromMatch(element: FileMatchOrMatch, viewModel: ISearchModel): import("../../../../editor/common/core/range.js").Range | {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
} | undefined;
export declare function getSelectionTextFromEditor(allowUnselectedWord: boolean, activeEditor: IEditor): string | null;
