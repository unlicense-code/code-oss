import { Emitter, Event, PauseableEmitter } from '../../../../../base/common/event.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { ICodeEditorService } from '../../../../../editor/browser/services/codeEditorService.js';
import * as editorCommon from '../../../../../editor/common/editorCommon.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IUndoRedoService } from '../../../../../platform/undoRedo/common/undoRedo.js';
import { CellFindMatch, CodeCellLayoutChangeEvent, CodeCellLayoutInfo, ICellOutputViewModel, ICellViewModel } from '../notebookBrowser.js';
import { NotebookOptionsChangeEvent } from '../notebookOptions.js';
import { NotebookLayoutInfo } from '../notebookViewEvents.js';
import { ViewContext } from './viewContext.js';
import { NotebookCellTextModel } from '../../common/model/notebookCellTextModel.js';
import { CellKind, INotebookFindOptions, NotebookCellOutputsSplice } from '../../common/notebookCommon.js';
import { ICellExecutionError, ICellExecutionStateChangedEvent } from '../../common/notebookExecutionStateService.js';
import { INotebookService } from '../../common/notebookService.js';
import { BaseCellViewModel } from './baseCellViewModel.js';
export declare const outputDisplayLimit = 500;
export declare class CodeCellViewModel extends BaseCellViewModel implements ICellViewModel {
    readonly viewContext: ViewContext;
    private readonly _notebookService;
    readonly cellKind = CellKind.Code;
    protected readonly _onLayoutInfoRead: Emitter<void>;
    readonly onLayoutInfoRead: Event<void>;
    protected readonly _onDidStartExecution: Emitter<ICellExecutionStateChangedEvent>;
    readonly onDidStartExecution: Event<ICellExecutionStateChangedEvent>;
    protected readonly _onDidStopExecution: Emitter<ICellExecutionStateChangedEvent>;
    readonly onDidStopExecution: Event<ICellExecutionStateChangedEvent>;
    protected readonly _onDidChangeOutputs: Emitter<NotebookCellOutputsSplice>;
    readonly onDidChangeOutputs: Event<NotebookCellOutputsSplice>;
    private readonly _onDidRemoveOutputs;
    readonly onDidRemoveOutputs: Event<readonly ICellOutputViewModel[]>;
    private _outputCollection;
    private _outputsTop;
    protected _pauseableEmitter: PauseableEmitter<CodeCellLayoutChangeEvent>;
    readonly onDidChangeLayout: Event<CodeCellLayoutChangeEvent>;
    private _editorHeight;
    set editorHeight(height: number);
    get editorHeight(): number;
    private _chatHeight;
    set chatHeight(height: number);
    get chatHeight(): number;
    private _hoveringOutput;
    get outputIsHovered(): boolean;
    set outputIsHovered(v: boolean);
    private _focusOnOutput;
    get outputIsFocused(): boolean;
    set outputIsFocused(v: boolean);
    private _focusInputInOutput;
    get inputInOutputIsFocused(): boolean;
    set inputInOutputIsFocused(v: boolean);
    private _outputMinHeight;
    private get outputMinHeight();
    /**
     * The minimum height of the output region. It's only set to non-zero temporarily when replacing an output with a new one.
     * It's reset to 0 when the new output is rendered, or in one second.
     */
    private set outputMinHeight(value);
    private _layoutInfo;
    get layoutInfo(): CodeCellLayoutInfo;
    private _outputViewModels;
    get outputsViewModels(): ICellOutputViewModel[];
    get executionError(): IObservable<ICellExecutionError | undefined>;
    private readonly _executionError;
    constructor(viewType: string, model: NotebookCellTextModel, initialNotebookLayoutInfo: NotebookLayoutInfo | null, viewContext: ViewContext, configurationService: IConfigurationService, _notebookService: INotebookService, modelService: ITextModelService, undoRedoService: IUndoRedoService, codeEditorService: ICodeEditorService);
    updateExecutionState(e: ICellExecutionStateChangedEvent): void;
    updateOptions(e: NotebookOptionsChangeEvent): void;
    pauseLayout(): void;
    resumeLayout(): void;
    layoutChange(state: CodeCellLayoutChangeEvent, source?: string): void;
    private _fireOnDidChangeLayout;
    restoreEditorViewState(editorViewStates: editorCommon.ICodeEditorViewState | null, totalHeight?: number): void;
    getDynamicHeight(): number;
    getHeight(lineHeight: number): number;
    private estimateEditorHeight;
    private computeTotalHeight;
    protected onDidChangeTextModelContent(): void;
    onDeselect(): void;
    updateOutputShowMoreContainerHeight(height: number): void;
    updateOutputMinHeight(height: number): void;
    unlockOutputHeight(): void;
    updateOutputHeight(index: number, height: number, source?: string): void;
    getOutputOffsetInContainer(index: number): number;
    getOutputOffset(index: number): number;
    spliceOutputHeights(start: number, deleteCnt: number, heights: number[]): void;
    private _ensureOutputsTop;
    private readonly _hasFindResult;
    readonly hasFindResult: Event<boolean>;
    startFind(value: string, options: INotebookFindOptions): CellFindMatch | null;
    dispose(): void;
}
