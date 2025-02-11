import { ICodeEditor, IActiveCodeEditor } from '../../../browser/editorBrowser.js';
import { IRange } from '../../../common/core/range.js';
import { CancellationTokenSource, CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ITextModel } from '../../../common/model.js';
import { EditorKeybindingCancellationTokenSource } from './keybindingCancellation.js';
export declare const enum CodeEditorStateFlag {
    Value = 1,
    Selection = 2,
    Position = 4,
    Scroll = 8
}
export declare class EditorState {
    private readonly flags;
    private readonly position;
    private readonly selection;
    private readonly modelVersionId;
    private readonly scrollLeft;
    private readonly scrollTop;
    constructor(editor: ICodeEditor, flags: number);
    private _equals;
    validate(editor: ICodeEditor): boolean;
}
/**
 * A cancellation token source that cancels when the editor changes as expressed
 * by the provided flags
 * @param range If provided, changes in position and selection within this range will not trigger cancellation
 */
export declare class EditorStateCancellationTokenSource extends EditorKeybindingCancellationTokenSource implements IDisposable {
    private readonly _listener;
    constructor(editor: IActiveCodeEditor, flags: CodeEditorStateFlag, range?: IRange, parent?: CancellationToken);
    dispose(): void;
}
/**
 * A cancellation token source that cancels when the provided model changes
 */
export declare class TextModelCancellationTokenSource extends CancellationTokenSource implements IDisposable {
    private _listener;
    constructor(model: ITextModel, parent?: CancellationToken);
    dispose(): void;
}
