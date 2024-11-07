/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MoveChatViewContribution_1;
import { Codicon } from '../../../../base/common/codicons.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { IViewDescriptorService, Extensions as ViewExtensions } from '../../../common/views.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { ChatContextKeys } from '../common/chatContextKeys.js';
import { CHAT_VIEW_ID, showChatView } from './chat.js';
import { CHAT_SIDEBAR_OLD_VIEW_PANEL_ID, CHAT_SIDEBAR_PANEL_ID } from './chatViewPane.js';
// TODO@bpasero TODO@sbatten remove after a few months
export class MovedChatViewPane extends ViewPane {
    shouldShowWelcome() {
        return true;
    }
}
let MoveChatViewContribution = class MoveChatViewContribution extends Disposable {
    static { MoveChatViewContribution_1 = this; }
    static { this.ID = 'workbench.contrib.chatMovedViewWelcomeView'; }
    static { this.hideMovedChatWelcomeViewStorageKey = 'workbench.chat.hideMovedChatWelcomeView'; }
    constructor(contextKeyService, viewDescriptorService, extensionManagementService, productService, viewsService, paneCompositePartService, storageService, configurationService, keybindingService) {
        super();
        this.contextKeyService = contextKeyService;
        this.viewDescriptorService = viewDescriptorService;
        this.extensionManagementService = extensionManagementService;
        this.productService = productService;
        this.viewsService = viewsService;
        this.paneCompositePartService = paneCompositePartService;
        this.storageService = storageService;
        this.configurationService = configurationService;
        this.keybindingService = keybindingService;
        this.showWelcomeViewCtx = ChatContextKeys.shouldShowMovedViewWelcome.bindTo(this.contextKeyService);
        this.initialize();
    }
    async initialize() {
        const hidden = this.storageService.getBoolean(MoveChatViewContribution_1.hideMovedChatWelcomeViewStorageKey, -1 /* StorageScope.APPLICATION */, false);
        // If the view is already hidden, then we just want to register keybindings.
        if (hidden) {
            this.registerKeybindings();
            return;
        }
        await this.hideViewIfCopilotIsNotInstalled();
        this.updateContextKey();
        this.registerListeners();
        this.registerKeybindings();
        this.registerCommands();
        this.registerMovedChatWelcomeView();
        this.hideViewIfOldViewIsMovedFromDefaultLocation();
    }
    markViewToHide() {
        this.storageService.store(MoveChatViewContribution_1.hideMovedChatWelcomeViewStorageKey, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        this.updateContextKey();
    }
    async hideViewIfCopilotIsNotInstalled() {
        const extensions = await this.extensionManagementService.getInstalled();
        const installed = extensions.find(value => ExtensionIdentifier.equals(value.identifier.id, this.productService.gitHubEntitlement?.extensionId));
        if (!installed) {
            this.markViewToHide();
        }
    }
    hideViewIfOldViewIsMovedFromDefaultLocation() {
        // If the chat view is not actually moved to the new view container, then we should hide the welcome view.
        const newViewContainer = this.viewDescriptorService.getViewContainerById(CHAT_SIDEBAR_PANEL_ID);
        if (!newViewContainer) {
            return;
        }
        const currentChatViewContainer = this.viewDescriptorService.getViewContainerByViewId(CHAT_VIEW_ID);
        if (currentChatViewContainer !== newViewContainer) {
            this.markViewToHide();
            return;
        }
        // If the chat view is in the new location, but the old view container was in the auxiliary bar anyway, then we should hide the welcome view.
        const oldViewContainer = this.viewDescriptorService.getViewContainerById(CHAT_SIDEBAR_OLD_VIEW_PANEL_ID);
        if (!oldViewContainer) {
            return;
        }
        const oldLocation = this.viewDescriptorService.getViewContainerLocation(oldViewContainer);
        if (oldLocation === 2 /* ViewContainerLocation.AuxiliaryBar */) {
            this.markViewToHide();
        }
    }
    updateContextKey() {
        const hidden = this.storageService.getBoolean(MoveChatViewContribution_1.hideMovedChatWelcomeViewStorageKey, -1 /* StorageScope.APPLICATION */, false);
        this.showWelcomeViewCtx.set(!hidden);
    }
    registerListeners() {
        this._register(this.storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, MoveChatViewContribution_1.hideMovedChatWelcomeViewStorageKey, this._store)(() => this.updateContextKey()));
    }
    registerKeybindings() {
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: CHAT_SIDEBAR_OLD_VIEW_PANEL_ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ChatContextKeys.panelParticipantRegistered,
            primary: 0,
            handler: accessor => showChatView(accessor.get(IViewsService))
        });
    }
    registerCommands() {
        CommandsRegistry.registerCommand({
            id: '_chatMovedViewWelcomeView.ok',
            handler: async (accessor) => {
                showChatView(accessor.get(IViewsService));
                this.markViewToHide();
            }
        });
        CommandsRegistry.registerCommand({
            id: '_chatMovedViewWelcomeView.restore',
            handler: async () => {
                const oldViewContainer = this.viewDescriptorService.getViewContainerById(CHAT_SIDEBAR_OLD_VIEW_PANEL_ID);
                const newViewContainer = this.viewDescriptorService.getViewContainerById(CHAT_SIDEBAR_PANEL_ID);
                if (!oldViewContainer || !newViewContainer) {
                    this.markViewToHide();
                    return;
                }
                const oldLocation = this.viewDescriptorService.getViewContainerLocation(oldViewContainer);
                const newLocation = this.viewDescriptorService.getViewContainerLocation(newViewContainer);
                if (oldLocation === newLocation || oldLocation === null || newLocation === null) {
                    this.markViewToHide();
                    return;
                }
                const viewContainerIds = this.paneCompositePartService.getPaneCompositeIds(oldLocation);
                const targetIndex = viewContainerIds.indexOf(oldViewContainer.id);
                this.viewDescriptorService.moveViewContainerToLocation(newViewContainer, oldLocation, targetIndex);
                this.viewsService.openViewContainer(newViewContainer.id, true);
                this.markViewToHide();
            }
        });
        CommandsRegistry.registerCommand({
            id: '_chatMovedViewWelcomeView.learnMore',
            handler: async (accessor) => {
                const openerService = accessor.get(IOpenerService);
                openerService.open(URI.parse('https://aka.ms/vscode-secondary-sidebar'));
            }
        });
    }
    registerMovedChatWelcomeView() {
        // This is a welcome view container intended to show up where the old chat view was positioned to inform
        // the user that we have changed the default location and how they can move it back or use the new location.
        const title = localize2('chat.viewContainer.movedChat.label', "Chat (Old Location)");
        const icon = Codicon.commentDiscussion;
        const viewContainerId = CHAT_SIDEBAR_OLD_VIEW_PANEL_ID;
        const viewContainer = Registry.as(ViewExtensions.ViewContainersRegistry).registerViewContainer({
            id: viewContainerId,
            title,
            icon,
            ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [viewContainerId, { mergeViewWithContainerWhenSingleView: true }]),
            storageId: viewContainerId,
            hideIfEmpty: true,
            order: 100,
        }, 0 /* ViewContainerLocation.Sidebar */, { doNotRegisterOpenCommand: true });
        const viewId = 'workbench.chat.movedView.welcomeView';
        const viewDescriptor = {
            id: viewId,
            name: title,
            order: 1,
            canToggleVisibility: false,
            canMoveView: false,
            when: ContextKeyExpr.and(ChatContextKeys.shouldShowMovedViewWelcome, ContextKeyExpr.or(ChatContextKeys.panelParticipantRegistered, ChatContextKeys.extensionInvalid)),
            ctorDescriptor: new SyncDescriptor(MovedChatViewPane, [{ id: viewId }]),
        };
        Registry.as(ViewExtensions.ViewsRegistry).registerViews([viewDescriptor], viewContainer);
        const secondarySideBarLeft = this.configurationService.getValue('workbench.sideBar.location') !== 'left';
        let welcomeViewMainMessage = secondarySideBarLeft ?
            localize('chatMovedMainMessage1Left', "Chat has been moved to the Secondary Side Bar on the left for a more integrated AI experience in your editor.") :
            localize('chatMovedMainMessage1Right', "Chat has been moved to the Secondary Side Bar on the right for a more integrated AI experience in your editor.");
        const chatViewKeybinding = this.keybindingService.lookupKeybinding(CHAT_SIDEBAR_PANEL_ID)?.getLabel();
        const copilotIcon = `$(${this.productService.defaultChatAgent?.icon ?? 'comment-discussion'})`;
        let quicklyAccessMessage = undefined;
        if (this.hasCommandCenterChat() && chatViewKeybinding) {
            quicklyAccessMessage = localize('chatMovedCommandCenterAndKeybind', "You can quickly access Chat via the new Copilot icon ({0}) in the editor title bar or with the keyboard shortcut {1}.", copilotIcon, chatViewKeybinding);
        }
        else if (this.hasCommandCenterChat()) {
            quicklyAccessMessage = localize('chatMovedCommandCenter', "You can quickly access Chat via the new Copilot icon ({0}) in the editor title bar.", copilotIcon);
        }
        else if (chatViewKeybinding) {
            quicklyAccessMessage = localize('chatMovedKeybind', "You can quickly access Chat with the keyboard shortcut {0}.", chatViewKeybinding);
        }
        if (quicklyAccessMessage) {
            welcomeViewMainMessage = `${welcomeViewMainMessage}\n\n${quicklyAccessMessage}`;
        }
        const okButton = `[${localize('ok', "Got it")}](command:_chatMovedViewWelcomeView.ok)`;
        const restoreButton = `[${localize('restore', "Restore Old Location")}](command:_chatMovedViewWelcomeView.restore)`;
        const welcomeViewFooterMessage = localize('chatMovedFooterMessage', "[Learn more](command:_chatMovedViewWelcomeView.learnMore) about the Secondary Side Bar.");
        const viewsRegistry = Registry.as(ViewExtensions.ViewsRegistry);
        return viewsRegistry.registerViewWelcomeContent(viewId, {
            content: [welcomeViewMainMessage, okButton, restoreButton, welcomeViewFooterMessage].join('\n\n'),
            renderSecondaryButtons: true,
            when: ContextKeyExpr.and(ChatContextKeys.shouldShowMovedViewWelcome, ContextKeyExpr.or(ChatContextKeys.panelParticipantRegistered, ChatContextKeys.extensionInvalid))
        });
    }
    hasCommandCenterChat() {
        if (this.configurationService.getValue('chat.commandCenter.enabled') === false ||
            this.configurationService.getValue('window.commandCenter') === false) {
            return false;
        }
        return true;
    }
};
MoveChatViewContribution = MoveChatViewContribution_1 = __decorate([
    __param(0, IContextKeyService),
    __param(1, IViewDescriptorService),
    __param(2, IExtensionManagementService),
    __param(3, IProductService),
    __param(4, IViewsService),
    __param(5, IPaneCompositePartService),
    __param(6, IStorageService),
    __param(7, IConfigurationService),
    __param(8, IKeybindingService)
], MoveChatViewContribution);
export { MoveChatViewContribution };
registerWorkbenchContribution2(MoveChatViewContribution.ID, MoveChatViewContribution, 1 /* WorkbenchPhase.BlockStartup */);
