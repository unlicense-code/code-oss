import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IChatEditingService } from '../common/chatEditingService.js';
export declare const ctxHasEditorModification: RawContextKey<boolean>;
export declare class ChatEditorController extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _chatEditingService;
    static readonly ID = "editor.contrib.chatEditorController";
    private readonly _sessionStore;
    private readonly _decorations;
    private _viewZones;
    private readonly _ctxHasEditorModification;
    static get(editor: ICodeEditor): ChatEditorController | null;
    constructor(_editor: ICodeEditor, _chatEditingService: IChatEditingService, contextKeyService: IContextKeyService);
    dispose(): void;
    private _update;
    private _updateSessionDecorations;
    private _getEntry;
    private _clearRendering;
    private _updateWithDiff;
    revealNext(strict?: boolean): boolean;
    revealPrevious(strict?: boolean): boolean;
    private _reveal;
}
