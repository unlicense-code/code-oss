import './media/notificationsCenter.css';
import './media/notificationsActions.css';
import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { INotificationsModel } from '../../../common/notifications.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { INotificationsCenterController } from './notificationsCommands.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
export declare class NotificationsCenter extends Themable implements INotificationsCenterController {
    private readonly container;
    private readonly model;
    private readonly instantiationService;
    private readonly layoutService;
    private readonly contextKeyService;
    private readonly editorGroupService;
    private readonly keybindingService;
    private readonly notificationService;
    private readonly accessibilitySignalService;
    private readonly contextMenuService;
    private static readonly MAX_DIMENSIONS;
    private static readonly MAX_NOTIFICATION_SOURCES;
    private readonly _onDidChangeVisibility;
    readonly onDidChangeVisibility: import("../../../../base/common/event.js").Event<void>;
    private notificationsCenterContainer;
    private notificationsCenterHeader;
    private notificationsCenterTitle;
    private notificationsList;
    private _isVisible;
    private workbenchDimensions;
    private readonly notificationsCenterVisibleContextKey;
    private clearAllAction;
    private configureDoNotDisturbAction;
    constructor(container: HTMLElement, model: INotificationsModel, themeService: IThemeService, instantiationService: IInstantiationService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, editorGroupService: IEditorGroupsService, keybindingService: IKeybindingService, notificationService: INotificationService, accessibilitySignalService: IAccessibilitySignalService, contextMenuService: IContextMenuService);
    private registerListeners;
    private onDidChangeFilter;
    get isVisible(): boolean;
    show(): void;
    private updateTitle;
    private create;
    private getKeybindingLabel;
    private onDidChangeNotification;
    hide(): void;
    updateStyles(): void;
    layout(dimension: Dimension | undefined): void;
    clearAll(): void;
}
