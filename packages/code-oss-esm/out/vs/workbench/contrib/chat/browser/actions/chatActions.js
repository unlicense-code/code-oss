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
import { toAction } from '../../../../../base/common/actions.js';
import { coalesce } from '../../../../../base/common/arrays.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { fromNowByDay } from '../../../../../base/common/date.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { EditorAction2 } from '../../../../../editor/browser/editorExtensions.js';
import { Position } from '../../../../../editor/common/core/position.js';
import { SuggestController } from '../../../../../editor/contrib/suggest/browser/suggestController.js';
import { localize, localize2 } from '../../../../../nls.js';
import { IActionViewItemService } from '../../../../../platform/actions/browser/actionViewItemService.js';
import { DropdownWithPrimaryActionViewItem } from '../../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js';
import { Action2, MenuId, MenuItemAction, MenuRegistry, registerAction2, SubmenuItemAction } from '../../../../../platform/actions/common/actions.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IsLinuxContext, IsWindowsContext } from '../../../../../platform/contextkey/common/contextkeys.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { ToggleTitleBarConfigAction } from '../../../../browser/parts/titlebar/titlebarActions.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { ACTIVE_GROUP, IEditorService } from '../../../../services/editor/common/editorService.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { IExtensionsWorkbenchService } from '../../../extensions/common/extensions.js';
import { ChatAgentLocation, IChatAgentService } from '../../common/chatAgents.js';
import { ChatContextKeys } from '../../common/chatContextKeys.js';
import { extractAgentAndCommand } from '../../common/chatParserTypes.js';
import { IChatService } from '../../common/chatService.js';
import { isRequestVM } from '../../common/chatViewModel.js';
import { IChatWidgetHistoryService } from '../../common/chatWidgetHistoryService.js';
import { CHAT_VIEW_ID, IChatWidgetService, showChatView } from '../chat.js';
import { ChatEditorInput } from '../chatEditorInput.js';
import { convertBufferToScreenshotVariable } from '../contrib/screenshot.js';
import { clearChatEditor } from './chatClear.js';
import product from '../../../../../platform/product/common/product.js';
import { URI } from '../../../../../base/common/uri.js';
import { IHostService } from '../../../../services/host/browser/host.js';
import { isCancellationError } from '../../../../../base/common/errors.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IChatVariablesService } from '../../common/chatVariables.js';
import { IAuthenticationService } from '../../../../services/authentication/common/authentication.js';
import { Registry } from '../../../../../platform/registry/common/platform.js';
import { MarkdownString } from '../../../../../base/common/htmlContent.js';
export const CHAT_CATEGORY = localize2('chat.category', 'Chat');
export const CHAT_OPEN_ACTION_ID = 'workbench.action.chat.open';
const defaultChat = {
    extensionId: product.defaultChatAgent?.extensionId ?? '',
    name: product.defaultChatAgent?.name ?? '',
    providerId: product.defaultChatAgent?.providerId ?? '',
    providerName: product.defaultChatAgent?.providerName ?? '',
    providerScopes: product.defaultChatAgent?.providerScopes ?? [],
    icon: Codicon[product.defaultChatAgent?.icon ?? 'commentDiscussion'],
    documentationUrl: product.defaultChatAgent?.documentationUrl ?? '',
    gettingStartedCommand: product.defaultChatAgent?.gettingStartedCommand ?? '',
    welcomeTitle: product.defaultChatAgent?.welcomeTitle ?? '',
};
class OpenChatGlobalAction extends Action2 {
    static { this.TITLE = localize2('openChat', "Open Chat"); }
    constructor() {
        super({
            id: CHAT_OPEN_ACTION_ID,
            title: OpenChatGlobalAction.TITLE,
            icon: defaultChat.icon,
            f1: true,
            precondition: ChatContextKeys.panelParticipantRegistered,
            category: CHAT_CATEGORY,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 39 /* KeyCode.KeyI */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 39 /* KeyCode.KeyI */
                }
            },
            menu: {
                id: MenuId.ChatCommandCenter,
                group: 'a_chat',
                order: 1
            }
        });
    }
    async run(accessor, opts) {
        opts = typeof opts === 'string' ? { query: opts } : opts;
        const chatService = accessor.get(IChatService);
        const chatVariablesService = accessor.get(IChatVariablesService);
        const viewsService = accessor.get(IViewsService);
        const hostService = accessor.get(IHostService);
        const chatWidget = await showChatView(viewsService);
        if (!chatWidget) {
            return;
        }
        if (opts?.previousRequests?.length && chatWidget.viewModel) {
            for (const { request, response } of opts.previousRequests) {
                chatService.addCompleteRequest(chatWidget.viewModel.sessionId, request, undefined, 0, { message: response });
            }
        }
        if (opts?.attachScreenshot) {
            const screenshot = await hostService.getScreenshot();
            if (screenshot) {
                chatWidget.attachmentModel.addContext(convertBufferToScreenshotVariable(screenshot));
            }
        }
        if (opts?.query) {
            if (opts.isPartialQuery) {
                chatWidget.setInput(opts.query);
            }
            else {
                chatWidget.acceptInput(opts.query);
            }
        }
        if (opts?.variableIds && opts.variableIds.length > 0) {
            const actualVariables = chatVariablesService.getVariables(ChatAgentLocation.Panel);
            for (const actualVariable of actualVariables) {
                if (opts.variableIds.includes(actualVariable.id)) {
                    chatWidget.attachmentModel.addContext({
                        range: undefined,
                        id: actualVariable.id ?? '',
                        value: undefined,
                        fullName: actualVariable.fullName,
                        name: actualVariable.name,
                        icon: actualVariable.icon
                    });
                }
            }
        }
        chatWidget.focusInput();
    }
}
class ChatHistoryAction extends Action2 {
    constructor() {
        super({
            id: `workbench.action.chat.history`,
            title: localize2('chat.history.label', "Show Chats..."),
            menu: {
                id: MenuId.ViewTitle,
                when: ContextKeyExpr.equals('view', CHAT_VIEW_ID),
                group: 'navigation',
                order: 2
            },
            category: CHAT_CATEGORY,
            icon: Codicon.history,
            f1: true,
            precondition: ChatContextKeys.enabled
        });
    }
    async run(accessor) {
        const chatService = accessor.get(IChatService);
        const quickInputService = accessor.get(IQuickInputService);
        const viewsService = accessor.get(IViewsService);
        const editorService = accessor.get(IEditorService);
        const showPicker = () => {
            const openInEditorButton = {
                iconClass: ThemeIcon.asClassName(Codicon.file),
                tooltip: localize('interactiveSession.history.editor', "Open in Editor"),
            };
            const deleteButton = {
                iconClass: ThemeIcon.asClassName(Codicon.x),
                tooltip: localize('interactiveSession.history.delete', "Delete"),
            };
            const renameButton = {
                iconClass: ThemeIcon.asClassName(Codicon.pencil),
                tooltip: localize('chat.history.rename', "Rename"),
            };
            const getPicks = () => {
                const items = chatService.getHistory();
                items.sort((a, b) => (b.lastMessageDate ?? 0) - (a.lastMessageDate ?? 0));
                let lastDate = undefined;
                const picks = items.flatMap((i) => {
                    const timeAgoStr = fromNowByDay(i.lastMessageDate, true, true);
                    const separator = timeAgoStr !== lastDate ? {
                        type: 'separator', label: timeAgoStr,
                    } : undefined;
                    lastDate = timeAgoStr;
                    return [
                        separator,
                        {
                            label: i.title,
                            description: i.isActive ? `(${localize('currentChatLabel', 'current')})` : '',
                            chat: i,
                            buttons: i.isActive ? [renameButton] : [
                                renameButton,
                                openInEditorButton,
                                deleteButton,
                            ]
                        }
                    ];
                });
                return coalesce(picks);
            };
            const store = new DisposableStore();
            const picker = store.add(quickInputService.createQuickPick({ useSeparators: true }));
            picker.placeholder = localize('interactiveSession.history.pick', "Switch to chat");
            const picks = getPicks();
            picker.items = picks;
            store.add(picker.onDidTriggerItemButton(async (context) => {
                if (context.button === openInEditorButton) {
                    const options = { target: { sessionId: context.item.chat.sessionId }, pinned: true };
                    editorService.openEditor({ resource: ChatEditorInput.getNewEditorUri(), options }, ACTIVE_GROUP);
                    picker.hide();
                }
                else if (context.button === deleteButton) {
                    chatService.removeHistoryEntry(context.item.chat.sessionId);
                    picker.items = getPicks();
                }
                else if (context.button === renameButton) {
                    const title = await quickInputService.input({ title: localize('newChatTitle', "New chat title"), value: context.item.chat.title });
                    if (title) {
                        chatService.setChatSessionTitle(context.item.chat.sessionId, title);
                    }
                    // The quick input hides the picker, it gets disposed, so we kick it off from scratch
                    showPicker();
                }
            }));
            store.add(picker.onDidAccept(async () => {
                try {
                    const item = picker.selectedItems[0];
                    const sessionId = item.chat.sessionId;
                    const view = await viewsService.openView(CHAT_VIEW_ID);
                    view.loadSession(sessionId);
                }
                finally {
                    picker.hide();
                }
            }));
            store.add(picker.onDidHide(() => store.dispose()));
            picker.show();
        };
        showPicker();
    }
}
class OpenChatEditorAction extends Action2 {
    constructor() {
        super({
            id: `workbench.action.openChat`,
            title: localize2('interactiveSession.open', "Open Editor"),
            f1: true,
            category: CHAT_CATEGORY,
            precondition: ChatContextKeys.enabled
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        await editorService.openEditor({ resource: ChatEditorInput.getNewEditorUri(), options: { pinned: true } });
    }
}
class ChatAddAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.chat.addParticipant',
            title: localize2('chatWith', "Chat with Extension"),
            icon: Codicon.mention,
            f1: false,
            category: CHAT_CATEGORY,
            menu: {
                id: MenuId.ChatInput,
                when: ChatContextKeys.location.isEqualTo(ChatAgentLocation.Panel),
                group: 'navigation',
                order: 1
            }
        });
    }
    async run(accessor, ...args) {
        const widgetService = accessor.get(IChatWidgetService);
        const context = args[0];
        const widget = context?.widget ?? widgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        const hasAgentOrCommand = extractAgentAndCommand(widget.parsedInput);
        if (hasAgentOrCommand?.agentPart || hasAgentOrCommand?.commandPart) {
            return;
        }
        const suggestCtrl = SuggestController.get(widget.inputEditor);
        if (suggestCtrl) {
            const curText = widget.inputEditor.getValue();
            const newValue = curText ? `@ ${curText}` : '@';
            if (!curText.startsWith('@')) {
                widget.inputEditor.setValue(newValue);
            }
            widget.inputEditor.setPosition(new Position(1, 2));
            suggestCtrl.triggerSuggest(undefined, true);
        }
    }
}
export function registerChatActions() {
    registerAction2(OpenChatGlobalAction);
    registerAction2(ChatHistoryAction);
    registerAction2(OpenChatEditorAction);
    registerAction2(ChatAddAction);
    registerAction2(class ClearChatInputHistoryAction extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.chat.clearInputHistory',
                title: localize2('interactiveSession.clearHistory.label', "Clear Input History"),
                precondition: ChatContextKeys.enabled,
                category: CHAT_CATEGORY,
                f1: true,
            });
        }
        async run(accessor, ...args) {
            const historyService = accessor.get(IChatWidgetHistoryService);
            historyService.clearHistory();
        }
    });
    registerAction2(class ClearChatHistoryAction extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.chat.clearHistory',
                title: localize2('chat.clear.label', "Clear All Workspace Chats"),
                precondition: ChatContextKeys.enabled,
                category: CHAT_CATEGORY,
                f1: true,
            });
        }
        async run(accessor, ...args) {
            const editorGroupsService = accessor.get(IEditorGroupsService);
            const viewsService = accessor.get(IViewsService);
            const chatService = accessor.get(IChatService);
            chatService.clearAllHistoryEntries();
            const chatView = viewsService.getViewWithId(CHAT_VIEW_ID);
            if (chatView) {
                chatView.widget.clear();
            }
            // Clear all chat editors. Have to go this route because the chat editor may be in the background and
            // not have a ChatEditorInput.
            editorGroupsService.groups.forEach(group => {
                group.editors.forEach(editor => {
                    if (editor instanceof ChatEditorInput) {
                        clearChatEditor(accessor, editor);
                    }
                });
            });
        }
    });
    registerAction2(class FocusChatAction extends EditorAction2 {
        constructor() {
            super({
                id: 'chat.action.focus',
                title: localize2('actions.interactiveSession.focus', 'Focus Chat List'),
                precondition: ContextKeyExpr.and(ChatContextKeys.inChatInput),
                category: CHAT_CATEGORY,
                keybinding: [
                    // On mac, require that the cursor is at the top of the input, to avoid stealing cmd+up to move the cursor to the top
                    {
                        when: ContextKeyExpr.and(ChatContextKeys.inputCursorAtTop, ChatContextKeys.inQuickChat.negate()),
                        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                    },
                    // On win/linux, ctrl+up can always focus the chat list
                    {
                        when: ContextKeyExpr.and(ContextKeyExpr.or(IsWindowsContext, IsLinuxContext), ChatContextKeys.inQuickChat.negate()),
                        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                    },
                    {
                        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inQuickChat),
                        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    }
                ]
            });
        }
        runEditorCommand(accessor, editor) {
            const editorUri = editor.getModel()?.uri;
            if (editorUri) {
                const widgetService = accessor.get(IChatWidgetService);
                widgetService.getWidgetByInputUri(editorUri)?.focusLastMessage();
            }
        }
    });
    registerAction2(class FocusChatInputAction extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.chat.focusInput',
                title: localize2('interactiveSession.focusInput.label', "Focus Chat Input"),
                f1: false,
                keybinding: [
                    {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inChatInput.negate(), ChatContextKeys.inQuickChat.negate()),
                    },
                    {
                        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inChatInput.negate(), ChatContextKeys.inQuickChat),
                        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    }
                ]
            });
        }
        run(accessor, ...args) {
            const widgetService = accessor.get(IChatWidgetService);
            widgetService.lastFocusedWidget?.focusInput();
        }
    });
    registerAction2(InstallChatAction);
    registerAction2(SignInAndInstallChatAction);
    registerAction2(LearnMoreChatAction);
}
export function stringifyItem(item, includeName = true) {
    if (isRequestVM(item)) {
        return (includeName ? `${item.username}: ` : '') + item.messageText;
    }
    else {
        return (includeName ? `${item.username}: ` : '') + item.response.toString();
    }
}
// --- command center chat
MenuRegistry.appendMenuItem(MenuId.CommandCenter, {
    submenu: MenuId.ChatCommandCenter,
    title: localize('title4', "Chat"),
    icon: defaultChat.icon,
    when: ContextKeyExpr.and(ContextKeyExpr.has('config.chat.commandCenter.enabled'), ContextKeyExpr.or(ChatContextKeys.panelParticipantRegistered, ChatContextKeys.ChatSetup.entitled, ContextKeyExpr.has('config.chat.experimental.offerSetup'))),
    order: 10001,
});
registerAction2(class ToggleChatControl extends ToggleTitleBarConfigAction {
    constructor() {
        super('chat.commandCenter.enabled', localize('toggle.chatControl', 'Chat Controls'), localize('toggle.chatControlsDescription', "Toggle visibility of the Chat Controls in title bar"), 3, false, ContextKeyExpr.and(ContextKeyExpr.has('config.window.commandCenter'), ContextKeyExpr.or(ChatContextKeys.panelParticipantRegistered, ChatContextKeys.ChatSetup.entitled, ContextKeyExpr.has('config.chat.experimental.offerSetup'))));
    }
});
let ChatCommandCenterRendering = class ChatCommandCenterRendering {
    static { this.ID = 'chat.commandCenterRendering'; }
    constructor(actionViewItemService, agentService, instantiationService) {
        this._store = new DisposableStore();
        // --- action to show dropdown
        const that = this;
        const showDropdownActionId = 'chatMenu.showDropdown';
        registerAction2(class OpenChatMenuDropdown extends Action2 {
            constructor() {
                super({
                    id: showDropdownActionId,
                    title: defaultChat.name,
                    f1: false
                });
            }
            run() {
                that._dropdown?.showDropdown();
            }
        });
        // --- chat setup welcome
        const descriptor = {
            title: defaultChat.welcomeTitle,
            when: ChatContextKeys.ChatSetup.running,
            icon: defaultChat.icon,
            progress: localize('setupChatRunning', "Getting Chat ready for you..."),
            content: new MarkdownString(`\n\n[${localize('learnMore', "Learn More")}](${defaultChat.documentationUrl})`, { isTrusted: true }),
        };
        Registry.as("workbench.registry.chat.viewsWelcome" /* ChatViewsWelcomeExtensions.ChatViewsWelcomeRegistry */).register(descriptor);
        // --- dropdown menu
        this._store.add(actionViewItemService.register(MenuId.CommandCenter, MenuId.ChatCommandCenter, (action, options) => {
            if (!(action instanceof SubmenuItemAction)) {
                return undefined;
            }
            const dropdownAction = toAction({
                id: 'chat.commandCenter.more',
                label: localize('more', "More..."),
                run() { }
            });
            const chatExtensionInstalled = agentService.getAgents().some(agent => agent.isDefault);
            const primaryAction = instantiationService.createInstance(MenuItemAction, {
                id: chatExtensionInstalled ? CHAT_OPEN_ACTION_ID : showDropdownActionId,
                title: chatExtensionInstalled ? OpenChatGlobalAction.TITLE : defaultChat.name,
                icon: defaultChat.icon,
            }, undefined, undefined, undefined, undefined);
            this._dropdown = instantiationService.createInstance(DropdownWithPrimaryActionViewItem, primaryAction, dropdownAction, action.actions, '', { ...options, skipTelemetry: true });
            return this._dropdown;
        }, agentService.onDidChangeAgents));
    }
    dispose() {
        this._store.dispose();
    }
};
ChatCommandCenterRendering = __decorate([
    __param(0, IActionViewItemService),
    __param(1, IChatAgentService),
    __param(2, IInstantiationService)
], ChatCommandCenterRendering);
export { ChatCommandCenterRendering };
class InstallChatAction extends Action2 {
    static { this.ID = 'workbench.action.chat.install'; }
    static { this.TITLE = localize2('installChat', "Install {0}", defaultChat.name); }
    constructor() {
        super({
            id: InstallChatAction.ID,
            title: InstallChatAction.TITLE,
            category: CHAT_CATEGORY,
            menu: {
                id: MenuId.ChatCommandCenter,
                group: 'a_atfirst',
                order: 1,
                when: ContextKeyExpr.and(ChatContextKeys.panelParticipantRegistered.negate(), ContextKeyExpr.or(ChatContextKeys.ChatSetup.entitled, ChatContextKeys.ChatSetup.signedIn))
            }
        });
    }
    run(accessor) {
        return InstallChatAction.install(accessor, false);
    }
    static async install(accessor, signedIn) {
        const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const productService = accessor.get(IProductService);
        const telemetryService = accessor.get(ITelemetryService);
        const contextKeyService = accessor.get(IContextKeyService);
        const viewsService = accessor.get(IViewsService);
        const setupRunningContextKey = ChatContextKeys.ChatSetup.running.bindTo(contextKeyService);
        let installResult;
        try {
            setupRunningContextKey.set(true);
            showChatView(viewsService);
            await extensionsWorkbenchService.install(defaultChat.extensionId, {
                enable: true,
                isMachineScoped: false,
                installPreReleaseVersion: productService.quality !== 'stable'
            }, CHAT_VIEW_ID);
            installResult = 'installed';
        }
        catch (error) {
            installResult = isCancellationError(error) ? 'cancelled' : 'failedInstall';
        }
        finally {
            setupRunningContextKey.reset();
        }
        telemetryService.publicLog2('commandCenter.chatInstall', { installResult, signedIn });
    }
}
class SignInAndInstallChatAction extends Action2 {
    static { this.ID = 'workbench.action.chat.signInAndInstall'; }
    static { this.TITLE = localize2('signInAndInstallChat', "Sign in to use {0}", defaultChat.name); }
    constructor() {
        super({
            id: SignInAndInstallChatAction.ID,
            title: SignInAndInstallChatAction.TITLE,
            category: CHAT_CATEGORY,
            menu: {
                id: MenuId.ChatCommandCenter,
                group: 'a_atfirst',
                order: 1,
                when: ContextKeyExpr.and(ChatContextKeys.panelParticipantRegistered.negate(), ChatContextKeys.ChatSetup.entitled.negate(), ChatContextKeys.ChatSetup.signedIn.negate())
            }
        });
    }
    async run(accessor) {
        const authenticationService = accessor.get(IAuthenticationService);
        const instantiationService = accessor.get(IInstantiationService);
        const telemetryService = accessor.get(ITelemetryService);
        let session;
        try {
            session = await authenticationService.createSession(defaultChat.providerId, defaultChat.providerScopes);
        }
        catch (error) {
            // noop
        }
        if (session) {
            instantiationService.invokeFunction(accessor => InstallChatAction.install(accessor, true));
        }
        else {
            telemetryService.publicLog2('commandCenter.chatInstall', { installResult: 'failedNotSignedIn', signedIn: false });
        }
    }
}
class LearnMoreChatAction extends Action2 {
    static { this.ID = 'workbench.action.chat.learnMore'; }
    static { this.TITLE = localize2('learnMore', "Learn More"); }
    constructor() {
        super({
            id: LearnMoreChatAction.ID,
            title: LearnMoreChatAction.TITLE,
            category: CHAT_CATEGORY,
            menu: [{
                    id: MenuId.ChatCommandCenter,
                    group: 'a_atfirst',
                    order: 2,
                    when: ChatContextKeys.panelParticipantRegistered.negate()
                }, {
                    id: MenuId.ChatCommandCenter,
                    group: 'z_atlast',
                    order: 1,
                    when: ChatContextKeys.panelParticipantRegistered
                }]
        });
    }
    async run(accessor) {
        const openerService = accessor.get(IOpenerService);
        if (defaultChat.documentationUrl) {
            openerService.open(URI.parse(defaultChat.documentationUrl));
        }
    }
}
