import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IRange } from '../../../common/core/range.js';
import { IDiffEditor, IEditor } from '../../../common/editorCommon.js';
import { ITextModel } from '../../../common/model.js';
import { IQuickAccessProvider, IQuickAccessProviderRunOptions } from '../../../../platform/quickinput/common/quickAccess.js';
import { IKeyMods, IQuickPick, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
export interface IEditorNavigationQuickAccessOptions {
    canAcceptInBackground?: boolean;
}
export interface IQuickAccessTextEditorContext {
    /**
     * The current active editor.
     */
    readonly editor: IEditor;
    /**
     * If defined, allows to restore the original view state
     * the text editor had before quick access opened.
     */
    restoreViewState?: () => void;
}
/**
 * A reusable quick access provider for the editor with support
 * for adding decorations for navigating in the currently active file
 * (for example "Go to line", "Go to symbol").
 */
export declare abstract class AbstractEditorNavigationQuickAccessProvider implements IQuickAccessProvider {
    protected options?: IEditorNavigationQuickAccessOptions | undefined;
    constructor(options?: IEditorNavigationQuickAccessOptions | undefined);
    provide(picker: IQuickPick<IQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): IDisposable;
    private doProvide;
    /**
     * Subclasses to implement if they can operate on the text editor.
     */
    protected canProvideWithTextEditor(editor: IEditor): boolean;
    /**
     * Subclasses to implement to provide picks for the picker when an editor is active.
     */
    protected abstract provideWithTextEditor(context: IQuickAccessTextEditorContext, picker: IQuickPick<IQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): IDisposable;
    /**
     * Subclasses to implement to provide picks for the picker when no editor is active.
     */
    protected abstract provideWithoutTextEditor(picker: IQuickPick<IQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken): IDisposable;
    protected gotoLocation({ editor }: IQuickAccessTextEditorContext, options: {
        range: IRange;
        keyMods: IKeyMods;
        forceSideBySide?: boolean;
        preserveFocus?: boolean;
    }): void;
    protected getModel(editor: IEditor | IDiffEditor): ITextModel | undefined;
    /**
     * Subclasses to provide an event when the active editor control changes.
     */
    protected abstract readonly onDidActiveTextEditorControlChange: Event<void>;
    /**
     * Subclasses to provide the current active editor control.
     */
    protected abstract activeTextEditorControl: IEditor | undefined;
    private rangeHighlightDecorationId;
    addDecorations(editor: IEditor, range: IRange): void;
    clearDecorations(editor: IEditor): void;
}
