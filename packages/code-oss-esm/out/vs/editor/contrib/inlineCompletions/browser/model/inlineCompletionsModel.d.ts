import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable, ITransaction } from '../../../../../base/common/observable.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ICodeEditor } from '../../../../browser/editorBrowser.js';
import { Position } from '../../../../common/core/position.js';
import { SingleTextEdit } from '../../../../common/core/textEdit.js';
import { Command, InlineCompletion, InlineCompletionTriggerKind } from '../../../../common/languages.js';
import { ILanguageConfigurationService } from '../../../../common/languages/languageConfigurationRegistry.js';
import { ITextModel } from '../../../../common/model.js';
import { IFeatureDebounceInformation } from '../../../../common/services/languageFeatureDebounce.js';
import { IModelContentChangedEvent } from '../../../../common/textModelEvents.js';
import { GhostTextOrReplacement } from './ghostText.js';
import { InlineCompletionWithUpdatedRange } from './inlineCompletionsSource.js';
import { InlineEdit } from './inlineEdit.js';
import { InlineCompletionItem } from './provideInlineCompletions.js';
import { SuggestItemInfo } from './suggestWidgetAdapter.js';
export declare class InlineCompletionsModel extends Disposable {
    readonly textModel: ITextModel;
    readonly selectedSuggestItem: IObservable<SuggestItemInfo | undefined>;
    readonly _textModelVersionId: IObservable<number | null, IModelContentChangedEvent | undefined>;
    private readonly _positions;
    private readonly _debounceValue;
    private readonly _suggestPreviewEnabled;
    private readonly _suggestPreviewMode;
    private readonly _inlineSuggestMode;
    private readonly _enabled;
    private readonly _inlineEditsEnabled;
    private readonly _editor;
    private readonly _instantiationService;
    private readonly _commandService;
    private readonly _languageConfigurationService;
    private readonly _source;
    private readonly _isActive;
    private readonly _onlyRequestInlineEditsSignal;
    private readonly _forceUpdateExplicitlySignal;
    private readonly _selectedInlineCompletionId;
    private readonly _primaryPosition;
    private _isAcceptingPartially;
    get isAcceptingPartially(): boolean;
    private readonly _editorObs;
    constructor(textModel: ITextModel, selectedSuggestItem: IObservable<SuggestItemInfo | undefined>, _textModelVersionId: IObservable<number | null, IModelContentChangedEvent | undefined>, _positions: IObservable<readonly Position[]>, _debounceValue: IFeatureDebounceInformation, _suggestPreviewEnabled: IObservable<boolean>, _suggestPreviewMode: IObservable<'prefix' | 'subword' | 'subwordSmart'>, _inlineSuggestMode: IObservable<'prefix' | 'subword' | 'subwordSmart'>, _enabled: IObservable<boolean>, _inlineEditsEnabled: IObservable<boolean>, _editor: ICodeEditor, _instantiationService: IInstantiationService, _commandService: ICommandService, _languageConfigurationService: ILanguageConfigurationService);
    private readonly _preserveCurrentCompletionReasons;
    private _getReason;
    readonly dontRefetchSignal: import("../../../../../base/common/observable.js").IObservableSignal<void>;
    private readonly _fetchInlineCompletionsPromise;
    trigger(tx?: ITransaction): Promise<void>;
    triggerExplicitly(tx?: ITransaction, onlyFetchInlineEdits?: boolean): Promise<void>;
    stop(stopReason?: 'explicitCancel' | 'automatic', tx?: ITransaction): void;
    private readonly _collapsedInlineEditId;
    collapseInlineEdit(): void;
    private readonly _inlineCompletionItems;
    private readonly _filteredInlineCompletionItems;
    readonly selectedInlineCompletionIndex: IObservable<number, unknown>;
    readonly selectedInlineCompletion: IObservable<InlineCompletionWithUpdatedRange | undefined, unknown>;
    readonly activeCommands: IObservable<Command[], unknown>;
    readonly lastTriggerKind: IObservable<InlineCompletionTriggerKind | undefined>;
    readonly inlineCompletionsCount: IObservable<number | undefined, unknown>;
    readonly state: IObservable<{
        kind: "ghostText";
        edits: readonly SingleTextEdit[];
        primaryGhostText: GhostTextOrReplacement;
        ghostTexts: readonly GhostTextOrReplacement[];
        suggestItem: SuggestItemInfo | undefined;
        inlineCompletion: InlineCompletionWithUpdatedRange | undefined;
    } | {
        kind: "inlineEdit";
        edits: readonly SingleTextEdit[];
        inlineEdit: InlineEdit;
        inlineCompletion: InlineCompletionWithUpdatedRange;
        cursorAtInlineEdit: boolean;
    } | undefined, unknown>;
    private readonly _alwaysShowInlineEdit;
    protected readonly _resetAlwaysShowInlineEdit: import("../../../../../base/common/lifecycle.js").IDisposable;
    readonly status: IObservable<"loading" | "ghostText" | "inlineEdit" | "noSuggestion", unknown>;
    readonly inlineCompletionState: IObservable<{
        kind: "ghostText";
        edits: readonly SingleTextEdit[];
        primaryGhostText: GhostTextOrReplacement;
        ghostTexts: readonly GhostTextOrReplacement[];
        suggestItem: SuggestItemInfo | undefined;
        inlineCompletion: InlineCompletionWithUpdatedRange | undefined;
    } | undefined, unknown>;
    readonly inlineEditState: IObservable<{
        kind: "inlineEdit";
        edits: readonly SingleTextEdit[];
        inlineEdit: InlineEdit;
        inlineCompletion: InlineCompletionWithUpdatedRange;
        cursorAtInlineEdit: boolean;
    } | undefined, unknown>;
    readonly inlineEditAvailable: IObservable<boolean, unknown>;
    private _computeAugmentation;
    readonly ghostTexts: IObservable<readonly GhostTextOrReplacement[] | undefined, unknown>;
    readonly primaryGhostText: IObservable<GhostTextOrReplacement | undefined, unknown>;
    private readonly _tabShouldIndent;
    readonly tabShouldJumpToInlineEdit: IObservable<boolean, unknown>;
    readonly tabShouldAcceptInlineEdit: IObservable<boolean, unknown>;
    private _deltaSelectedInlineCompletionIndex;
    next(): Promise<void>;
    previous(): Promise<void>;
    accept(editor: ICodeEditor): Promise<void>;
    acceptNextWord(editor: ICodeEditor): Promise<void>;
    acceptNextLine(editor: ICodeEditor): Promise<void>;
    private _acceptNext;
    handleSuggestAccepted(item: SuggestItemInfo): void;
    extractReproSample(): Repro;
    private _jumpedTo;
    jump(): void;
    handleInlineCompletionShown(inlineCompletion: InlineCompletionItem): Promise<void>;
}
interface Repro {
    documentValue: string;
    inlineCompletion: InlineCompletion | undefined;
}
export declare enum VersionIdChangeReason {
    Undo = 0,
    Redo = 1,
    AcceptWord = 2,
    Other = 3
}
export declare function getSecondaryEdits(textModel: ITextModel, positions: readonly Position[], primaryEdit: SingleTextEdit): SingleTextEdit[];
export {};
