import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IChatEditingService } from '../../../chat/common/chatEditingService.js';
import { NotebookTextModel } from '../../common/model/notebookTextModel.js';
import { INotebookEditor } from '../notebookBrowser.js';
import { CellDiffInfo } from '../diff/notebookDiffViewModel.js';
import { CellKind } from '../../common/notebookCommon.js';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { IEditorWorkerService } from '../../../../../editor/common/services/editorWorker.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { INotebookOriginalCellModelFactory } from './notebookOriginalCellModelFactory.js';
export declare class NotebookCellDiffDecorator extends DisposableStore {
    readonly editor: ICodeEditor;
    private readonly originalCellValue;
    private readonly cellKind;
    private readonly _chatEditingService;
    private readonly _editorWorkerService;
    private readonly originalCellModelFactory;
    private readonly _decorations;
    private _viewZones;
    private readonly throttledDecorator;
    constructor(editor: ICodeEditor, originalCellValue: string, cellKind: CellKind, _chatEditingService: IChatEditingService, _editorWorkerService: IEditorWorkerService, originalCellModelFactory: INotebookOriginalCellModelFactory);
    dispose(): void;
    update(): void;
    private _updateImpl;
    private _clearRendering;
    private _originalModel?;
    private getOrCreateOriginalModel;
    private _updateWithDiff;
}
export declare class NotebookInsertedCellDecorator extends Disposable {
    private readonly notebookEditor;
    private readonly decorators;
    constructor(notebookEditor: INotebookEditor);
    apply(diffInfo: CellDiffInfo[]): void;
    clear(): void;
}
export declare class NotebookDeletedCellDecorator extends Disposable {
    private readonly _notebookEditor;
    private readonly languageService;
    private readonly zoneRemover;
    private readonly createdViewZones;
    constructor(_notebookEditor: INotebookEditor, languageService: ILanguageService);
    apply(diffInfo: CellDiffInfo[], original: NotebookTextModel): void;
    clear(): void;
    private _createWidget;
    private _createWidgetImpl;
}
export declare class NotebookDeletedCellWidget extends Disposable {
    private readonly _notebookEditor;
    private readonly code;
    private readonly language;
    private readonly languageService;
    private readonly container;
    constructor(_notebookEditor: INotebookEditor, code: string, language: string, container: HTMLElement, languageService: ILanguageService);
    render(): Promise<number>;
}
