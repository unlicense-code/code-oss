import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { EditorAction, ServicesAccessor } from '../../../browser/editorExtensions.js';
import { Range } from '../../../common/core/range.js';
import { Selection } from '../../../common/core/selection.js';
import { IEditorContribution, ScrollType } from '../../../common/editorCommon.js';
import { FindMatch } from '../../../common/model.js';
import { CommonFindController } from '../../find/browser/findController.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
export declare class InsertCursorAbove extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export declare class InsertCursorBelow extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export declare class MultiCursorSessionResult {
    readonly selections: Selection[];
    readonly revealRange: Range;
    readonly revealScrollType: ScrollType;
    constructor(selections: Selection[], revealRange: Range, revealScrollType: ScrollType);
}
export declare class MultiCursorSession {
    private readonly _editor;
    readonly findController: CommonFindController;
    readonly isDisconnectedFromFindController: boolean;
    readonly searchText: string;
    readonly wholeWord: boolean;
    readonly matchCase: boolean;
    currentMatch: Selection | null;
    static create(editor: ICodeEditor, findController: CommonFindController): MultiCursorSession | null;
    constructor(_editor: ICodeEditor, findController: CommonFindController, isDisconnectedFromFindController: boolean, searchText: string, wholeWord: boolean, matchCase: boolean, currentMatch: Selection | null);
    addSelectionToNextFindMatch(): MultiCursorSessionResult | null;
    moveSelectionToNextFindMatch(): MultiCursorSessionResult | null;
    private _getNextMatch;
    addSelectionToPreviousFindMatch(): MultiCursorSessionResult | null;
    moveSelectionToPreviousFindMatch(): MultiCursorSessionResult | null;
    private _getPreviousMatch;
    selectAll(searchScope: Range[] | null): FindMatch[];
}
export declare class MultiCursorSelectionController extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.multiCursorController";
    private readonly _editor;
    private _ignoreSelectionChange;
    private _session;
    private readonly _sessionDispose;
    static get(editor: ICodeEditor): MultiCursorSelectionController | null;
    constructor(editor: ICodeEditor);
    dispose(): void;
    private _beginSessionIfNeeded;
    private _endSession;
    private _setSelections;
    private _expandEmptyToWord;
    private _applySessionResult;
    getSession(findController: CommonFindController): MultiCursorSession | null;
    addSelectionToNextFindMatch(findController: CommonFindController): void;
    addSelectionToPreviousFindMatch(findController: CommonFindController): void;
    moveSelectionToNextFindMatch(findController: CommonFindController): void;
    moveSelectionToPreviousFindMatch(findController: CommonFindController): void;
    selectAll(findController: CommonFindController): void;
    selectAllUsingSelections(selections: Selection[]): void;
}
export declare abstract class MultiCursorSelectionControllerAction extends EditorAction {
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
    protected abstract _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class AddSelectionToNextFindMatchAction extends MultiCursorSelectionControllerAction {
    constructor();
    protected _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class AddSelectionToPreviousFindMatchAction extends MultiCursorSelectionControllerAction {
    constructor();
    protected _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class MoveSelectionToNextFindMatchAction extends MultiCursorSelectionControllerAction {
    constructor();
    protected _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class MoveSelectionToPreviousFindMatchAction extends MultiCursorSelectionControllerAction {
    constructor();
    protected _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class SelectHighlightsAction extends MultiCursorSelectionControllerAction {
    constructor();
    protected _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class CompatChangeAll extends MultiCursorSelectionControllerAction {
    constructor();
    protected _run(multiCursorController: MultiCursorSelectionController, findController: CommonFindController): void;
}
export declare class SelectionHighlighter extends Disposable implements IEditorContribution {
    private readonly _languageFeaturesService;
    static readonly ID = "editor.contrib.selectionHighlighter";
    private readonly editor;
    private _isEnabled;
    private readonly _decorations;
    private readonly updateSoon;
    private state;
    constructor(editor: ICodeEditor, _languageFeaturesService: ILanguageFeaturesService);
    private _update;
    private static _createState;
    private _setState;
    dispose(): void;
}
export declare class FocusNextCursor extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export declare class FocusPreviousCursor extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
