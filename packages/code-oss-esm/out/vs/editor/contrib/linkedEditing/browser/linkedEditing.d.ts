import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { EditorAction, ServicesAccessor } from '../../../browser/editorExtensions.js';
import { IPosition } from '../../../common/core/position.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { ILanguageFeatureDebounceService } from '../../../common/services/languageFeatureDebounce.js';
import './linkedEditing.css';
export declare const CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE: RawContextKey<boolean>;
export declare class LinkedEditingContribution extends Disposable implements IEditorContribution {
    private readonly languageConfigurationService;
    static readonly ID = "editor.contrib.linkedEditing";
    private static readonly DECORATION;
    static get(editor: ICodeEditor): LinkedEditingContribution | null;
    private _debounceDuration;
    private readonly _editor;
    private readonly _providers;
    private _enabled;
    private readonly _visibleContextKey;
    private readonly _debounceInformation;
    private _rangeUpdateTriggerPromise;
    private _rangeSyncTriggerPromise;
    private _currentRequestCts;
    private _currentRequestPosition;
    private _currentRequestModelVersion;
    private _currentDecorations;
    private _syncRangesToken;
    private _languageWordPattern;
    private _currentWordPattern;
    private _ignoreChangeEvent;
    private readonly _localToDispose;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, languageFeaturesService: ILanguageFeaturesService, languageConfigurationService: ILanguageConfigurationService, languageFeatureDebounceService: ILanguageFeatureDebounceService);
    private reinitialize;
    private _syncRanges;
    dispose(): void;
    clearRanges(): void;
    get currentUpdateTriggerPromise(): Promise<any>;
    get currentSyncTriggerPromise(): Promise<any>;
    updateRanges(force?: boolean): Promise<void>;
    setDebounceDuration(timeInMS: number): void;
}
export declare class LinkedEditingAction extends EditorAction {
    constructor();
    runCommand(accessor: ServicesAccessor, args: [URI, IPosition]): void | Promise<void>;
    run(_accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare const editorLinkedEditingBackground: string;
