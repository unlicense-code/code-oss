import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare class WordContextKey {
    private readonly _editor;
    static readonly AtEnd: RawContextKey<boolean>;
    private readonly _ckAtEnd;
    private readonly _configListener;
    private _enabled;
    private _selectionListener?;
    constructor(_editor: ICodeEditor, contextKeyService: IContextKeyService);
    dispose(): void;
    private _update;
}
