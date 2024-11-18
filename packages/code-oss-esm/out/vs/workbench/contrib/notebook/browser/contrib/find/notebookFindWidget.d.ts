import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { Range } from '../../../../../../editor/common/core/range.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextKey, IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService, IContextViewService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { FindModel } from './findModel.js';
import { SimpleFindReplaceWidget } from './notebookFindReplaceWidget.js';
import { ICellViewModel, INotebookEditor, INotebookEditorContribution } from '../../notebookBrowser.js';
import { INotebookFindScope } from '../../../common/notebookCommon.js';
export interface IShowNotebookFindWidgetOptions {
    isRegex?: boolean;
    wholeWord?: boolean;
    matchCase?: boolean;
    matchIndex?: number;
    focus?: boolean;
    searchStringSeededFrom?: {
        cell: ICellViewModel;
        range: Range;
    };
    findScope?: INotebookFindScope;
}
export declare class NotebookFindContrib extends Disposable implements INotebookEditorContribution {
    private readonly notebookEditor;
    private readonly instantiationService;
    static readonly id: string;
    private readonly _widget;
    constructor(notebookEditor: INotebookEditor, instantiationService: IInstantiationService);
    get widget(): NotebookFindWidget;
    show(initialInput?: string, options?: IShowNotebookFindWidgetOptions): Promise<void>;
    hide(): void;
    replace(searchString: string | undefined): void;
}
declare class NotebookFindWidget extends SimpleFindReplaceWidget implements INotebookEditorContribution {
    protected _findWidgetFocused: IContextKey<boolean>;
    private _isFocused;
    private _showTimeout;
    private _hideTimeout;
    private _previousFocusElement?;
    private _findModel;
    constructor(_notebookEditor: INotebookEditor, contextViewService: IContextViewService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, contextMenuService: IContextMenuService, hoverService: IHoverService, instantiationService: IInstantiationService);
    get findModel(): FindModel;
    get isFocused(): boolean;
    private _onFindInputKeyDown;
    private _onReplaceInputKeyDown;
    protected onInputChanged(): boolean;
    private findIndex;
    protected find(previous: boolean): void;
    protected replaceOne(): void;
    protected replaceAll(): void;
    protected findFirst(): void;
    protected onFocusTrackerFocus(): void;
    protected onFocusTrackerBlur(): void;
    protected onReplaceInputFocusTrackerFocus(): void;
    protected onReplaceInputFocusTrackerBlur(): void;
    protected onFindInputFocusTrackerFocus(): void;
    protected onFindInputFocusTrackerBlur(): void;
    show(initialInput?: string, options?: IShowNotebookFindWidgetOptions): Promise<void>;
    replace(initialFindInput?: string, initialReplaceInput?: string): void;
    hide(): void;
    protected _updateMatchesCount(): void;
    private _getAriaLabel;
    dispose(): void;
}
export {};
