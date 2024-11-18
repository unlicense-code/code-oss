import { Event } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { ILanguageConfigurationService } from '../../../../../../editor/common/languages/languageConfigurationRegistry.js';
import { ITextModelService } from '../../../../../../editor/common/services/resolverService.js';
import { IAccessibilityService } from '../../../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IUndoRedoService } from '../../../../../../platform/undoRedo/common/undoRedo.js';
import { CellFindMatchWithIndex, ICellViewModel, INotebookEditor, INotebookEditorContribution } from '../../notebookBrowser.js';
export declare enum NotebookMultiCursorState {
    Idle = 0,
    Selecting = 1,
    Editing = 2
}
export declare const NOTEBOOK_MULTI_CURSOR_CONTEXT: {
    IsNotebookMultiCursor: RawContextKey<boolean>;
    NotebookMultiSelectCursorState: RawContextKey<NotebookMultiCursorState>;
};
export declare class NotebookMultiCursorController extends Disposable implements INotebookEditorContribution {
    private readonly notebookEditor;
    private readonly contextKeyService;
    private readonly textModelService;
    private readonly languageConfigurationService;
    private readonly accessibilityService;
    private readonly configurationService;
    private readonly undoRedoService;
    static readonly id: string;
    private word;
    private startPosition;
    private trackedCells;
    private readonly _onDidChangeAnchorCell;
    readonly onDidChangeAnchorCell: Event<void>;
    private anchorCell;
    private readonly anchorDisposables;
    private readonly cursorsDisposables;
    private cursorsControllers;
    private state;
    getState(): NotebookMultiCursorState;
    private _nbIsMultiSelectSession;
    private _nbMultiSelectState;
    constructor(notebookEditor: INotebookEditor, contextKeyService: IContextKeyService, textModelService: ITextModelService, languageConfigurationService: ILanguageConfigurationService, accessibilityService: IAccessibilityService, configurationService: IConfigurationService, undoRedoService: IUndoRedoService);
    private syncAnchorListeners;
    private syncCursorsControllers;
    private createCursorController;
    private constructCoordinatesConverter;
    private constructCursorSimpleModel;
    private handleEditorOperationEvent;
    private executeEditorOperation;
    private updateFinalUndoRedo;
    resetToIdleState(): void;
    findAndTrackNextSelection(focusedCell: ICellViewModel): Promise<void>;
    selectAllMatches(focusedCell: ICellViewModel, matches?: CellFindMatchWithIndex[]): Promise<void>;
    private handleFindWidgetSelectAllMatches;
    private handleCellEditorSelectAllMatches;
    private updateTrackedCell;
    deleteLeft(): Promise<void>;
    deleteRight(): Promise<void>;
    undo(): Promise<void>;
    redo(): Promise<void>;
    private constructCellEditorOptions;
    /**
     * Updates the multicursor selection decorations for a specific matched cell
     *
     * @param cell -- match object containing the viewmodel + selections
     */
    private initializeMultiSelectDecorations;
    private updateLazyDecorations;
    private clearDecorations;
    private getWord;
    private getClassName;
    dispose(): void;
}
