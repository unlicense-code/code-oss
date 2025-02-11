import { KeyCode } from '../../../../base/common/keyCodes.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import './dnd.css';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { Position } from '../../../common/core/position.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
export declare class DragAndDropController extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.dragAndDrop";
    private readonly _editor;
    private _dragSelection;
    private readonly _dndDecorationIds;
    private _mouseDown;
    private _modifierPressed;
    static readonly TRIGGER_KEY_VALUE: KeyCode;
    static get(editor: ICodeEditor): DragAndDropController | null;
    constructor(editor: ICodeEditor);
    private onEditorBlur;
    private onEditorKeyDown;
    private onEditorKeyUp;
    private _onEditorMouseDown;
    private _onEditorMouseUp;
    private _onEditorMouseDrag;
    private _onEditorMouseDropCanceled;
    private _onEditorMouseDrop;
    private static readonly _DECORATION_OPTIONS;
    showAt(position: Position): void;
    private _removeDecoration;
    private _hitContent;
    private _hitMargin;
    dispose(): void;
}
