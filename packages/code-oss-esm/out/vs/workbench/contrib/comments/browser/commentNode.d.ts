import * as languages from '../../../../editor/common/languages.js';
import { Action, IActionRunner } from '../../../../base/common/actions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { MarkdownRenderer } from '../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ICommentService } from './commentService.js';
import { LayoutableEditor } from './simpleCommentEditor.js';
import { Event } from '../../../../base/common/event.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { ToolBar } from '../../../../base/browser/ui/toolbar/toolbar.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { ICommentThreadWidget } from '../common/commentThreadWidget.js';
import { SubmenuEntryActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ActionViewItem, IActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { ICellRange } from '../../notebook/common/notebookRange.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
export declare class CommentNode<T extends IRange | ICellRange> extends Disposable {
    private readonly parentEditor;
    private commentThread;
    comment: languages.Comment;
    private pendingEdit;
    private owner;
    private resource;
    private parentThread;
    private markdownRenderer;
    private instantiationService;
    private commentService;
    private notificationService;
    private contextMenuService;
    private configurationService;
    private hoverService;
    private accessibilityService;
    private keybindingService;
    private readonly textModelService;
    private _domNode;
    private _body;
    private _avatar;
    private _md;
    private _plainText;
    private _clearTimeout;
    private _editAction;
    private _commentEditContainer;
    private _commentDetailsContainer;
    private _actionsToolbarContainer;
    private _reactionsActionBar?;
    private _reactionActionsContainer?;
    private _commentEditor;
    private _commentEditorDisposables;
    private _commentEditorModel;
    private _editorHeight;
    private _isPendingLabel;
    private _timestamp;
    private _timestampWidget;
    private _contextKeyService;
    private _commentContextValue;
    private _commentMenus;
    private _scrollable;
    private _scrollableElement;
    protected actionRunner?: IActionRunner;
    protected toolbar: ToolBar | undefined;
    private _commentFormActions;
    private _commentEditorActions;
    private readonly _onDidClick;
    get domNode(): HTMLElement;
    isEditing: boolean;
    constructor(parentEditor: LayoutableEditor, commentThread: languages.CommentThread<T>, comment: languages.Comment, pendingEdit: languages.PendingComment | undefined, owner: string, resource: URI, parentThread: ICommentThreadWidget, markdownRenderer: MarkdownRenderer, instantiationService: IInstantiationService, commentService: ICommentService, notificationService: INotificationService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, hoverService: IHoverService, accessibilityService: IAccessibilityService, keybindingService: IKeybindingService, textModelService: ITextModelService);
    private activeCommentListeners;
    private createScroll;
    private updateCommentBody;
    private updateCommentUserIcon;
    get onDidClick(): Event<CommentNode<T>>;
    private createTimestamp;
    private updateTimestamp;
    private createHeader;
    private toggleToolbarHidden;
    private getToolbarActions;
    private get commentNodeContext();
    private createToolbar;
    private createActionsToolbar;
    actionViewItemProvider(action: Action, options: IActionViewItemOptions): ActionViewItem | SubmenuEntryActionViewItem;
    submitComment(): Promise<void>;
    private createReactionPicker;
    private createReactionsContainer;
    get commentBodyValue(): string;
    private createCommentEditor;
    private calculateEditorHeight;
    getPendingEdit(): languages.PendingComment | undefined;
    private removeCommentEditor;
    layout(widthInPixel?: number): void;
    switchToEditMode(): Promise<void>;
    private createCommentWidgetFormActions;
    private createCommentWidgetEditorActions;
    setFocus(focused: boolean, visible?: boolean): void;
    private registerActionBarListeners;
    update(newComment: languages.Comment): Promise<void>;
    private onContextMenu;
    focus(): void;
    dispose(): void;
}
