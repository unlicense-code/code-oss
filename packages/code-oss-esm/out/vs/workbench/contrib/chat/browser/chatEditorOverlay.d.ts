import './media/chatEditorOverlay.css';
import { IReader, ITransaction } from '../../../../base/common/observable.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IChatEditingService } from '../common/chatEditingService.js';
export declare const navigationBearingFakeActionId = "chatEditor.navigation.bearings";
export declare class ObservableAnimatedValue {
    static const(value: number): ObservableAnimatedValue;
    private readonly _value;
    constructor(initialValue: AnimatedValue);
    setAnimation(value: AnimatedValue, tx: ITransaction | undefined): void;
    changeAnimation(fn: (prev: AnimatedValue) => AnimatedValue, tx: ITransaction | undefined): void;
    getValue(reader: IReader | undefined): number;
}
export declare class AnimatedValue {
    readonly startValue: number;
    readonly endValue: number;
    readonly durationMs: number;
    static const(value: number): AnimatedValue;
    readonly startTimeMs: number;
    constructor(startValue: number, endValue: number, durationMs: number);
    isFinished(): boolean;
    getValue(): number;
}
export declare class ChatEditorOverlayController implements IEditorContribution {
    private readonly _editor;
    static readonly ID = "editor.contrib.chatOverlayController";
    private readonly _store;
    static get(editor: ICodeEditor): ChatEditorOverlayController | null;
    constructor(_editor: ICodeEditor, chatEditingService: IChatEditingService, instaService: IInstantiationService);
    dispose(): void;
}
