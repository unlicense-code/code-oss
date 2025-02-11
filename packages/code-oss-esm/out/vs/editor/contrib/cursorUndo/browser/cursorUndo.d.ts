import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { EditorAction, ServicesAccessor } from '../../../browser/editorExtensions.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
export declare class CursorUndoRedoController extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.cursorUndoRedoController";
    static get(editor: ICodeEditor): CursorUndoRedoController | null;
    private readonly _editor;
    private _isCursorUndoRedo;
    private _undoStack;
    private _redoStack;
    constructor(editor: ICodeEditor);
    cursorUndo(): void;
    cursorRedo(): void;
    private _applyState;
}
export declare class CursorUndo extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export declare class CursorRedo extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
