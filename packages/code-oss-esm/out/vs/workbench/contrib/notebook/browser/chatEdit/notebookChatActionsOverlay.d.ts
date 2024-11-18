import { Disposable } from '../../../../../base/common/lifecycle.js';
import { INotebookEditor } from '../notebookBrowser.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatEditingService, IModifiedFileEntry } from '../../../chat/common/chatEditingService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { CellDiffInfo } from '../diff/notebookDiffViewModel.js';
export declare class NotebookChatActionsOverlayController extends Disposable {
    private readonly notebookEditor;
    private readonly _chatEditingService;
    constructor(notebookEditor: INotebookEditor, cellDiffInfo: IObservable<CellDiffInfo[] | undefined, unknown>, _chatEditingService: IChatEditingService, instantiationService: IInstantiationService);
}
export declare class NotebookChatActionsOverlay extends Disposable {
    private readonly _editorService;
    constructor(notebookEditor: INotebookEditor, entry: IModifiedFileEntry, cellDiffInfo: IObservable<CellDiffInfo[] | undefined, unknown>, nextEntry: IModifiedFileEntry, previousEntry: IModifiedFileEntry, _editorService: IEditorService, instaService: IInstantiationService);
}
