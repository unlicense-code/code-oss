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
var ChatWidget_1;
import * as dom from '../../../../base/browser/dom.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { disposableTimeout, timeout } from '../../../../base/common/async.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable, DisposableStore, MutableDisposable, combinedDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { ResourceSet } from '../../../../base/common/map.js';
import { Schemas } from '../../../../base/common/network.js';
import { extUri, isEqual } from '../../../../base/common/resources.js';
import { isDefined } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { localize } from '../../../../nls.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { WorkbenchObjectTree } from '../../../../platform/list/browser/listService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { buttonSecondaryBackground, buttonSecondaryForeground, buttonSecondaryHoverBackground } from '../../../../platform/theme/common/colorRegistry.js';
import { asCssVariable } from '../../../../platform/theme/common/colorUtils.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ChatAgentLocation, IChatAgentService, isChatWelcomeMessageContent } from '../common/chatAgents.js';
import { ChatContextKeys } from '../common/chatContextKeys.js';
import { IChatEditingService } from '../common/chatEditingService.js';
import { ChatRequestAgentPart, chatAgentLeader, chatSubcommandLeader, formatChatQuestion } from '../common/chatParserTypes.js';
import { ChatRequestParser } from '../common/chatRequestParser.js';
import { IChatService } from '../common/chatService.js';
import { IChatSlashCommandService } from '../common/chatSlashCommands.js';
import { ChatViewModel, isRequestVM, isResponseVM } from '../common/chatViewModel.js';
import { CodeBlockModelCollection } from '../common/codeBlockModelCollection.js';
import { IChatAccessibilityService, IChatWidgetService } from './chat.js';
import { ChatAccessibilityProvider } from './chatAccessibilityProvider.js';
import { ChatDragAndDrop } from './chatDragAndDrop.js';
import { ChatInputPart } from './chatInputPart.js';
import { ChatListDelegate, ChatListItemRenderer } from './chatListRenderer.js';
import { ChatEditorOptions } from './chatOptions.js';
import './media/chat.css';
import './media/chatAgentHover.css';
import './media/chatViewWelcome.css';
import { ChatViewWelcomePart } from './viewsWelcome/chatViewWelcomeController.js';
const $ = dom.$;
function revealLastElement(list) {
    const newScrollTop = list.scrollHeight - list.renderHeight;
    list.scrollTop = newScrollTop;
}
export function isQuickChat(widget) {
    return 'viewContext' in widget && 'isQuickChat' in widget.viewContext && Boolean(widget.viewContext.isQuickChat);
}
const PersistWelcomeMessageContentKey = 'chat.welcomeMessageContent';
let ChatWidget = class ChatWidget extends Disposable {
    static { ChatWidget_1 = this; }
    static { this.CONTRIBS = []; }
    get visible() {
        return this._visible;
    }
    set viewModel(viewModel) {
        if (this._viewModel === viewModel) {
            return;
        }
        this.viewModelDisposables.clear();
        this._viewModel = viewModel;
        if (viewModel) {
            this.viewModelDisposables.add(viewModel);
        }
        this._onDidChangeViewModel.fire();
    }
    get viewModel() {
        return this._viewModel;
    }
    get parsedInput() {
        if (this.parsedChatRequest === undefined) {
            if (!this.viewModel) {
                return { text: '', parts: [] };
            }
            this.parsedChatRequest = this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(this.viewModel.sessionId, this.getInput(), this.location, { selectedAgent: this._lastSelectedAgent });
        }
        return this.parsedChatRequest;
    }
    get scopedContextKeyService() {
        return this.contextKeyService;
    }
    get location() {
        return this._location.location;
    }
    constructor(location, _viewContext, viewOptions, styles, codeEditorService, contextKeyService, instantiationService, chatService, chatAgentService, chatWidgetService, contextMenuService, chatAccessibilityService, logService, themeService, chatSlashCommandService, chatEditingService, storageService, telemetryService) {
        super();
        this.viewOptions = viewOptions;
        this.styles = styles;
        this.contextKeyService = contextKeyService;
        this.instantiationService = instantiationService;
        this.chatService = chatService;
        this.chatAgentService = chatAgentService;
        this.chatWidgetService = chatWidgetService;
        this.contextMenuService = contextMenuService;
        this.chatAccessibilityService = chatAccessibilityService;
        this.logService = logService;
        this.themeService = themeService;
        this.chatSlashCommandService = chatSlashCommandService;
        this.chatEditingService = chatEditingService;
        this.storageService = storageService;
        this.telemetryService = telemetryService;
        this._onDidSubmitAgent = this._register(new Emitter());
        this.onDidSubmitAgent = this._onDidSubmitAgent.event;
        this._onDidChangeAgent = this._register(new Emitter());
        this.onDidChangeAgent = this._onDidChangeAgent.event;
        this._onDidFocus = this._register(new Emitter());
        this.onDidFocus = this._onDidFocus.event;
        this._onDidChangeViewModel = this._register(new Emitter());
        this.onDidChangeViewModel = this._onDidChangeViewModel.event;
        this._onDidScroll = this._register(new Emitter());
        this.onDidScroll = this._onDidScroll.event;
        this._onDidClear = this._register(new Emitter());
        this.onDidClear = this._onDidClear.event;
        this._onDidAcceptInput = this._register(new Emitter());
        this.onDidAcceptInput = this._onDidAcceptInput.event;
        this._onDidHide = this._register(new Emitter());
        this.onDidHide = this._onDidHide.event;
        this._onDidChangeParsedInput = this._register(new Emitter());
        this.onDidChangeParsedInput = this._onDidChangeParsedInput.event;
        this._onWillMaybeChangeHeight = new Emitter();
        this.onWillMaybeChangeHeight = this._onWillMaybeChangeHeight.event;
        this._onDidChangeHeight = this._register(new Emitter());
        this.onDidChangeHeight = this._onDidChangeHeight.event;
        this._onDidChangeContentHeight = new Emitter();
        this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
        this.contribs = [];
        this.visibleChangeCount = 0;
        this._visible = false;
        this.previousTreeScrollHeight = 0;
        /**
         * Whether the list is scroll-locked to the bottom. Initialize to true so that we can scroll to the bottom on first render.
         * The initial render leads to a lot of `onDidChangeTreeContentHeight` as the renderer works out the real heights of rows.
         */
        this.scrollLock = true;
        this.viewModelDisposables = this._register(new DisposableStore());
        this.viewContext = _viewContext ?? {};
        if (typeof location === 'object') {
            this._location = location;
        }
        else {
            this._location = { location };
        }
        ChatContextKeys.inChatSession.bindTo(contextKeyService).set(true);
        ChatContextKeys.location.bindTo(contextKeyService).set(this._location.location);
        ChatContextKeys.inQuickChat.bindTo(contextKeyService).set(isQuickChat(this));
        this.agentInInput = ChatContextKeys.inputHasAgent.bindTo(contextKeyService);
        this.requestInProgress = ChatContextKeys.requestInProgress.bindTo(contextKeyService);
        this._codeBlockModelCollection = this._register(instantiationService.createInstance(CodeBlockModelCollection));
        const chatEditingSessionDisposables = this._register(new DisposableStore());
        this._register(this.chatEditingService.onDidCreateEditingSession((session) => {
            if (session.chatSessionId !== this.viewModel?.sessionId) {
                // this chat editing session is for a different chat widget
                return;
            }
            // make sure to clean up anything related to the prev session (if any)
            chatEditingSessionDisposables.clear();
            this.renderChatEditingSessionState(null); // this is necessary to make sure we dispose previous buttons, etc.
            chatEditingSessionDisposables.add(session.onDidChange(() => {
                this.renderChatEditingSessionState(session);
            }));
            chatEditingSessionDisposables.add(session.onDidDispose(() => {
                chatEditingSessionDisposables.clear();
                this.renderChatEditingSessionState(null);
            }));
            chatEditingSessionDisposables.add(this.onDidChangeParsedInput(() => {
                this.renderChatEditingSessionState(session);
            }));
            chatEditingSessionDisposables.add(this.inputEditor.onDidChangeModelContent(() => {
                if (this.getInput() === '') {
                    this.refreshParsedInput();
                    this.renderChatEditingSessionState(session);
                }
            }));
            this.renderChatEditingSessionState(session);
        }));
        if (this._location.location === ChatAgentLocation.EditingSession) {
            let currentEditSession = undefined;
            this._register(this.onDidChangeViewModel(async () => {
                const sessionId = this._viewModel?.sessionId;
                if (sessionId !== currentEditSession?.chatSessionId) {
                    if (currentEditSession && (currentEditSession.state.get() !== 3 /* ChatEditingSessionState.Disposed */)) {
                        await currentEditSession.stop();
                    }
                    if (sessionId) {
                        currentEditSession = await this.chatEditingService.startOrContinueEditingSession(sessionId, { silent: true });
                    }
                    else {
                        currentEditSession = undefined;
                    }
                }
            }));
        }
        this._register(codeEditorService.registerCodeEditorOpenHandler(async (input, _source, _sideBySide) => {
            const resource = input.resource;
            if (resource.scheme !== Schemas.vscodeChatCodeBlock) {
                return null;
            }
            const responseId = resource.path.split('/').at(1);
            if (!responseId) {
                return null;
            }
            const item = this.viewModel?.getItems().find(item => item.id === responseId);
            if (!item) {
                return null;
            }
            // TODO: needs to reveal the chat view
            this.reveal(item);
            await timeout(0); // wait for list to actually render
            for (const codeBlockPart of this.renderer.editorsInUse()) {
                if (extUri.isEqual(codeBlockPart.uri, resource, true)) {
                    const editor = codeBlockPart.editor;
                    let relativeTop = 0;
                    const editorDomNode = editor.getDomNode();
                    if (editorDomNode) {
                        const row = dom.findParentWithClass(editorDomNode, 'monaco-list-row');
                        if (row) {
                            relativeTop = dom.getTopLeftOffset(editorDomNode).top - dom.getTopLeftOffset(row).top;
                        }
                    }
                    if (input.options?.selection) {
                        const editorSelectionTopOffset = editor.getTopForPosition(input.options.selection.startLineNumber, input.options.selection.startColumn);
                        relativeTop += editorSelectionTopOffset;
                        editor.focus();
                        editor.setSelection({
                            startLineNumber: input.options.selection.startLineNumber,
                            startColumn: input.options.selection.startColumn,
                            endLineNumber: input.options.selection.endLineNumber ?? input.options.selection.startLineNumber,
                            endColumn: input.options.selection.endColumn ?? input.options.selection.startColumn
                        });
                    }
                    this.reveal(item, relativeTop);
                    return editor;
                }
            }
            return null;
        }));
        const loadedWelcomeContent = storageService.getObject(`${PersistWelcomeMessageContentKey}.${this.location}`, -1 /* StorageScope.APPLICATION */);
        if (isChatWelcomeMessageContent(loadedWelcomeContent)) {
            this.persistedWelcomeMessage = loadedWelcomeContent;
        }
        this._register(this.onDidChangeParsedInput(() => this.updateChatInputContext()));
    }
    set lastSelectedAgent(agent) {
        this.parsedChatRequest = undefined;
        this._lastSelectedAgent = agent;
        this._onDidChangeParsedInput.fire();
    }
    get lastSelectedAgent() {
        return this._lastSelectedAgent;
    }
    get supportsFileReferences() {
        return !!this.viewOptions.supportsFileReferences;
    }
    get input() {
        return this.inputPart;
    }
    get inputEditor() {
        return this.inputPart.inputEditor;
    }
    get inputUri() {
        return this.inputPart.inputUri;
    }
    get contentHeight() {
        return this.inputPart.contentHeight + this.tree.contentHeight;
    }
    get attachmentModel() {
        return this.inputPart.attachmentModel;
    }
    render(parent) {
        const viewId = 'viewId' in this.viewContext ? this.viewContext.viewId : undefined;
        this.editorOptions = this._register(this.instantiationService.createInstance(ChatEditorOptions, viewId, this.styles.listForeground, this.styles.inputEditorBackground, this.styles.resultEditorBackground));
        const renderInputOnTop = this.viewOptions.renderInputOnTop ?? false;
        const renderFollowups = this.viewOptions.renderFollowups ?? !renderInputOnTop;
        const renderStyle = this.viewOptions.renderStyle;
        this.container = dom.append(parent, $('.interactive-session'));
        this.welcomeMessageContainer = dom.append(this.container, $('.chat-welcome-view-container', { style: 'display: none' }));
        this.renderWelcomeViewContentIfNeeded();
        if (renderInputOnTop) {
            this.createInput(this.container, { renderFollowups, renderStyle });
            this.listContainer = dom.append(this.container, $(`.interactive-list`));
        }
        else {
            this.listContainer = dom.append(this.container, $(`.interactive-list`));
            this.createInput(this.container, { renderFollowups, renderStyle });
        }
        this.createList(this.listContainer, { ...this.viewOptions.rendererOptions, renderStyle });
        const scrollDownButton = this._register(new Button(this.listContainer, {
            supportIcons: true,
            buttonBackground: asCssVariable(buttonSecondaryBackground),
            buttonForeground: asCssVariable(buttonSecondaryForeground),
            buttonHoverBackground: asCssVariable(buttonSecondaryHoverBackground),
        }));
        scrollDownButton.element.classList.add('chat-scroll-down');
        scrollDownButton.label = `$(${Codicon.chevronDown.id})`;
        scrollDownButton.setTitle(localize('scrollDownButtonLabel', "Scroll down"));
        this._register(scrollDownButton.onDidClick(() => {
            this.scrollLock = true;
            revealLastElement(this.tree);
        }));
        this._register(this.editorOptions.onDidChange(() => this.onDidStyleChange()));
        this.onDidStyleChange();
        // Do initial render
        if (this.viewModel) {
            this.onDidChangeItems();
            revealLastElement(this.tree);
        }
        this.contribs = ChatWidget_1.CONTRIBS.map(contrib => {
            try {
                return this._register(this.instantiationService.createInstance(contrib, this));
            }
            catch (err) {
                this.logService.error('Failed to instantiate chat widget contrib', toErrorMessage(err));
                return undefined;
            }
        }).filter(isDefined);
        this._register(this.instantiationService.createInstance(ChatDragAndDrop, this.container, this.inputPart, this.styles));
        this._register(this.chatWidgetService.register(this));
    }
    getContrib(id) {
        return this.contribs.find(c => c.id === id);
    }
    focusInput() {
        this.inputPart.focus();
    }
    hasInputFocus() {
        return this.inputPart.hasFocus();
    }
    refreshParsedInput() {
        if (!this.viewModel) {
            return;
        }
        this.parsedChatRequest = this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(this.viewModel.sessionId, this.getInput(), this.location, { selectedAgent: this._lastSelectedAgent });
        this._onDidChangeParsedInput.fire();
    }
    getSibling(item, type) {
        if (!isResponseVM(item)) {
            return;
        }
        const items = this.viewModel?.getItems();
        if (!items) {
            return;
        }
        const responseItems = items.filter(i => isResponseVM(i));
        const targetIndex = responseItems.indexOf(item);
        if (targetIndex === undefined) {
            return;
        }
        const indexToFocus = type === 'next' ? targetIndex + 1 : targetIndex - 1;
        if (indexToFocus < 0 || indexToFocus > responseItems.length - 1) {
            return;
        }
        return responseItems[indexToFocus];
    }
    clear() {
        if (this._dynamicMessageLayoutData) {
            this._dynamicMessageLayoutData.enabled = true;
        }
        this._onDidClear.fire();
    }
    onDidChangeItems(skipDynamicLayout) {
        if (this.tree && this._visible) {
            const treeItems = (this.viewModel?.getItems() ?? [])
                .map((item) => {
                return {
                    element: item,
                    collapsed: false,
                    collapsible: false
                };
            });
            this.renderWelcomeViewContentIfNeeded();
            this._onWillMaybeChangeHeight.fire();
            this.tree.setChildren(null, treeItems, {
                diffIdentityProvider: {
                    getId: (element) => {
                        return element.dataId +
                            // Ensure re-rendering an element once slash commands are loaded, so the colorization can be applied.
                            `${(isRequestVM(element)) /* && !!this.lastSlashCommands ? '_scLoaded' : '' */}` +
                            // If a response is in the process of progressive rendering, we need to ensure that it will
                            // be re-rendered so progressive rendering is restarted, even if the model wasn't updated.
                            `${isResponseVM(element) && element.renderData ? `_${this.visibleChangeCount}` : ''}` +
                            // Re-render once content references are loaded
                            (isResponseVM(element) ? `_${element.contentReferences.length}` : '') +
                            // Re-render if element becomes hidden due to undo/redo
                            `_${element.isHidden ? '1' : '0'}` +
                            // Rerender request if we got new content references in the response
                            // since this may change how we render the corresponding attachments in the request
                            (isRequestVM(element) && element.contentReferences ? `_${element.contentReferences?.length}` : '');
                    },
                }
            });
            if (!skipDynamicLayout && this._dynamicMessageLayoutData) {
                this.layoutDynamicChatTreeItemMode();
            }
            const lastItem = treeItems[treeItems.length - 1]?.element;
            if (lastItem) {
                ChatContextKeys.lastItemId.bindTo(this.contextKeyService).set([lastItem.id]);
            }
            if (lastItem && isResponseVM(lastItem) && lastItem.isComplete) {
                this.renderFollowups(lastItem.replyFollowups, lastItem);
            }
            else if (!treeItems.length && this.viewModel) {
                this.renderFollowups(this.viewModel.model.sampleQuestions);
            }
            else {
                this.renderFollowups(undefined);
            }
        }
    }
    renderWelcomeViewContentIfNeeded() {
        const welcomeContent = this.viewModel?.model.welcomeMessage ?? this.persistedWelcomeMessage;
        if (welcomeContent && this.welcomeMessageContainer.children.length === 0 && !this.viewOptions.renderStyle) {
            const tips = this.viewOptions.supportsAdditionalParticipants
                ? new MarkdownString(localize('chatWidget.tips', "{0} or type {1} to attach context\n\n{2} to chat with extensions\n\nType {3} to use commands", '$(attach)', '#', '$(mention)', '/'), { supportThemeIcons: true })
                : new MarkdownString(localize('chatWidget.tips.withoutParticipants', "{0} or type {1} to attach context", '$(attach)', '#'), { supportThemeIcons: true });
            const welcomePart = this._register(this.instantiationService.createInstance(ChatViewWelcomePart, { ...welcomeContent, tips, }, { location: this.location }));
            dom.append(this.welcomeMessageContainer, welcomePart.element);
        }
        if (!this.viewOptions.renderStyle && this.viewModel) {
            const treeItems = this.viewModel.getItems();
            dom.setVisibility(treeItems.length === 0, this.welcomeMessageContainer);
            dom.setVisibility(treeItems.length !== 0, this.listContainer);
        }
    }
    async renderChatEditingSessionState(session) {
        this.inputPart.renderChatEditingSessionState(session, this);
        if (this.bodyDimension) {
            this.layout(this.bodyDimension.height, this.bodyDimension.width);
        }
    }
    async renderFollowups(items, response) {
        this.inputPart.renderFollowups(items, response);
        if (this.bodyDimension) {
            this.layout(this.bodyDimension.height, this.bodyDimension.width);
        }
    }
    setVisible(visible) {
        const wasVisible = this._visible;
        this._visible = visible;
        this.visibleChangeCount++;
        this.renderer.setVisible(visible);
        this.input.setVisible(visible);
        if (visible) {
            this._register(disposableTimeout(() => {
                // Progressive rendering paused while hidden, so start it up again.
                // Do it after a timeout because the container is not visible yet (it should be but offsetHeight returns 0 here)
                if (this._visible) {
                    this.onDidChangeItems(true);
                }
            }, 0));
        }
        else if (wasVisible) {
            this._onDidHide.fire();
        }
    }
    createList(listContainer, options) {
        const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.contextKeyService])));
        const delegate = scopedInstantiationService.createInstance(ChatListDelegate, this.viewOptions.defaultElementHeight ?? 200);
        const rendererDelegate = {
            getListLength: () => this.tree.getNode(null).visibleChildrenCount,
            onDidScroll: this.onDidScroll,
            container: listContainer
        };
        // Create a dom element to hold UI from editor widgets embedded in chat messages
        const overflowWidgetsContainer = document.createElement('div');
        overflowWidgetsContainer.classList.add('chat-overflow-widget-container', 'monaco-editor');
        listContainer.append(overflowWidgetsContainer);
        this.renderer = this._register(scopedInstantiationService.createInstance(ChatListItemRenderer, this.editorOptions, options, rendererDelegate, this._codeBlockModelCollection, overflowWidgetsContainer));
        this._register(this.renderer.onDidClickFollowup(item => {
            // is this used anymore?
            this.acceptInput(item.message);
        }));
        this._register(this.renderer.onDidClickRerunWithAgentOrCommandDetection(item => {
            const request = this.chatService.getSession(item.sessionId)?.getRequests().find(candidate => candidate.id === item.requestId);
            if (request) {
                const options = {
                    noCommandDetection: true,
                    attempt: request.attempt + 1,
                    location: this.location,
                    userSelectedModelId: this.input.currentLanguageModel
                };
                this.chatService.resendRequest(request, options).catch(e => this.logService.error('FAILED to rerun request', e));
            }
        }));
        this.tree = this._register(scopedInstantiationService.createInstance(WorkbenchObjectTree, 'Chat', listContainer, delegate, [this.renderer], {
            identityProvider: { getId: (e) => e.id },
            horizontalScrolling: false,
            alwaysConsumeMouseWheel: false,
            supportDynamicHeights: true,
            hideTwistiesOfChildlessElements: true,
            accessibilityProvider: this.instantiationService.createInstance(ChatAccessibilityProvider),
            keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => isRequestVM(e) ? e.message : isResponseVM(e) ? e.response.value : '' }, // TODO
            setRowLineHeight: false,
            filter: this.viewOptions.filter ? { filter: this.viewOptions.filter.bind(this.viewOptions), } : undefined,
            overrideStyles: {
                listFocusBackground: this.styles.listBackground,
                listInactiveFocusBackground: this.styles.listBackground,
                listActiveSelectionBackground: this.styles.listBackground,
                listFocusAndSelectionBackground: this.styles.listBackground,
                listInactiveSelectionBackground: this.styles.listBackground,
                listHoverBackground: this.styles.listBackground,
                listBackground: this.styles.listBackground,
                listFocusForeground: this.styles.listForeground,
                listHoverForeground: this.styles.listForeground,
                listInactiveFocusForeground: this.styles.listForeground,
                listInactiveSelectionForeground: this.styles.listForeground,
                listActiveSelectionForeground: this.styles.listForeground,
                listFocusAndSelectionForeground: this.styles.listForeground,
                listActiveSelectionIconForeground: undefined,
                listInactiveSelectionIconForeground: undefined,
            }
        }));
        this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
        this._register(this.tree.onDidChangeContentHeight(() => {
            this.onDidChangeTreeContentHeight();
        }));
        this._register(this.renderer.onDidChangeItemHeight(e => {
            this.tree.updateElementHeight(e.element, e.height);
        }));
        this._register(this.tree.onDidFocus(() => {
            this._onDidFocus.fire();
        }));
        this._register(this.tree.onDidScroll(() => {
            this._onDidScroll.fire();
            const isScrolledDown = this.tree.scrollTop >= this.tree.scrollHeight - this.tree.renderHeight - 2;
            this.container.classList.toggle('show-scroll-down', !isScrolledDown && !this.scrollLock);
        }));
    }
    onContextMenu(e) {
        e.browserEvent.preventDefault();
        e.browserEvent.stopPropagation();
        const selected = e.element;
        const scopedContextKeyService = this.contextKeyService.createOverlay([
            [ChatContextKeys.responseIsFiltered.key, isResponseVM(selected) && !!selected.errorDetails?.responseIsFiltered]
        ]);
        this.contextMenuService.showContextMenu({
            menuId: MenuId.ChatContext,
            menuActionOptions: { shouldForwardArgs: true },
            contextKeyService: scopedContextKeyService,
            getAnchor: () => e.anchor,
            getActionsContext: () => selected,
        });
    }
    onDidChangeTreeContentHeight() {
        // If the list was previously scrolled all the way down, ensure it stays scrolled down, if scroll lock is on
        if (this.tree.scrollHeight !== this.previousTreeScrollHeight) {
            const lastItem = this.viewModel?.getItems().at(-1);
            const lastResponseIsRendering = isResponseVM(lastItem) && lastItem.renderData;
            if (!lastResponseIsRendering || this.scrollLock) {
                // Due to rounding, the scrollTop + renderHeight will not exactly match the scrollHeight.
                // Consider the tree to be scrolled all the way down if it is within 2px of the bottom.
                const lastElementWasVisible = this.tree.scrollTop + this.tree.renderHeight >= this.previousTreeScrollHeight - 2;
                if (lastElementWasVisible) {
                    dom.scheduleAtNextAnimationFrame(dom.getWindow(this.listContainer), () => {
                        // Can't set scrollTop during this event listener, the list might overwrite the change
                        // TODO This doesn't necessarily work on the first try because of the dynamic heights of items and
                        // the way ListView works. Twice is usually enough. But this would work better if this lived inside ListView somehow
                        revealLastElement(this.tree);
                        revealLastElement(this.tree);
                    }, 0);
                }
            }
        }
        // TODO@roblourens add `show-scroll-down` class when button should show
        // Show the button when content height changes, the list is not fully scrolled down, and (the latest response is currently rendering OR I haven't yet scrolled all the way down since the last response)
        // So for example it would not reappear if I scroll up and delete a message
        this.previousTreeScrollHeight = this.tree.scrollHeight;
        this._onDidChangeContentHeight.fire();
    }
    createInput(container, options) {
        this.inputPart = this._register(this.instantiationService.createInstance(ChatInputPart, this.location, {
            renderFollowups: options?.renderFollowups ?? true,
            renderStyle: options?.renderStyle === 'minimal' ? 'compact' : options?.renderStyle,
            menus: { executeToolbar: MenuId.ChatExecute, ...this.viewOptions.menus },
            editorOverflowWidgetsDomNode: this.viewOptions.editorOverflowWidgetsDomNode,
            enableImplicitContext: this.viewOptions.enableImplicitContext
        }, () => this.collectInputState()));
        this.inputPart.render(container, '', this);
        this._register(this.inputPart.onDidLoadInputState(state => {
            this.contribs.forEach(c => {
                if (c.setInputState) {
                    const contribState = (typeof state === 'object' && state?.[c.id]) ?? {};
                    c.setInputState(contribState);
                }
            });
            this.refreshParsedInput();
        }));
        this._register(this.inputPart.onDidFocus(() => this._onDidFocus.fire()));
        this._register(this.inputPart.onDidAcceptFollowup(e => {
            if (!this.viewModel) {
                return;
            }
            let msg = '';
            if (e.followup.agentId && e.followup.agentId !== this.chatAgentService.getDefaultAgent(this.location)?.id) {
                const agent = this.chatAgentService.getAgent(e.followup.agentId);
                if (!agent) {
                    return;
                }
                this.lastSelectedAgent = agent;
                msg = `${chatAgentLeader}${agent.name} `;
                if (e.followup.subCommand) {
                    msg += `${chatSubcommandLeader}${e.followup.subCommand} `;
                }
            }
            else if (!e.followup.agentId && e.followup.subCommand && this.chatSlashCommandService.hasCommand(e.followup.subCommand)) {
                msg = `${chatSubcommandLeader}${e.followup.subCommand} `;
            }
            msg += e.followup.message;
            this.acceptInput(msg);
            if (!e.response) {
                // Followups can be shown by the welcome message, then there is no response associated.
                // At some point we probably want telemetry for these too.
                return;
            }
            this.chatService.notifyUserAction({
                sessionId: this.viewModel.sessionId,
                requestId: e.response.requestId,
                agentId: e.response.agent?.id,
                command: e.response.slashCommand?.name,
                result: e.response.result,
                action: {
                    kind: 'followUp',
                    followup: e.followup
                },
            });
        }));
        this._register(this.inputPart.onDidChangeHeight(() => {
            if (this.bodyDimension) {
                this.layout(this.bodyDimension.height, this.bodyDimension.width);
            }
            this._onDidChangeContentHeight.fire();
        }));
        this._register(this.inputPart.attachmentModel.onDidChangeContext(() => {
            if (this.chatEditingService.currentEditingSession && this.chatEditingService.currentEditingSession?.chatSessionId === this.viewModel?.sessionId) {
                // TODO still needed? Do this inside input part and fire onDidChangeHeight?
                this.renderChatEditingSessionState(this.chatEditingService.currentEditingSession);
            }
        }));
        this._register(this.inputEditor.onDidChangeModelContent(() => {
            this.parsedChatRequest = undefined;
            this.updateChatInputContext();
        }));
        this._register(this.chatAgentService.onDidChangeAgents(() => this.parsedChatRequest = undefined));
    }
    onDidStyleChange() {
        this.container.style.setProperty('--vscode-interactive-result-editor-background-color', this.editorOptions.configuration.resultEditor.backgroundColor?.toString() ?? '');
        this.container.style.setProperty('--vscode-interactive-session-foreground', this.editorOptions.configuration.foreground?.toString() ?? '');
        this.container.style.setProperty('--vscode-chat-list-background', this.themeService.getColorTheme().getColor(this.styles.listBackground)?.toString() ?? '');
    }
    setModel(model, viewState) {
        if (!this.container) {
            throw new Error('Call render() before setModel()');
        }
        if (model.sessionId === this.viewModel?.sessionId) {
            return;
        }
        this._codeBlockModelCollection.clear();
        this.container.setAttribute('data-session-id', model.sessionId);
        this.viewModel = this.instantiationService.createInstance(ChatViewModel, model, this._codeBlockModelCollection);
        this.viewModelDisposables.add(Event.accumulate(this.viewModel.onDidChange, 0)(events => {
            if (!this.viewModel) {
                return;
            }
            this.requestInProgress.set(this.viewModel.requestInProgress);
            this.onDidChangeItems();
            if (events.some(e => e?.kind === 'addRequest') && this.visible) {
                revealLastElement(this.tree); // Now we know how big they actually are... how do we know that 2 rounds is enough
            }
            if (this.chatEditingService.currentEditingSession && this.chatEditingService.currentEditingSession?.chatSessionId === this.viewModel?.sessionId) {
                this.renderChatEditingSessionState(this.chatEditingService.currentEditingSession);
            }
        }));
        this.viewModelDisposables.add(this.viewModel.onDidDisposeModel(() => {
            // Ensure that view state is saved here, because we will load it again when a new model is assigned
            this.inputPart.saveState();
            // Disposes the viewmodel and listeners
            this.viewModel = undefined;
            this.onDidChangeItems();
        }));
        this.inputPart.initForNewChatModel(viewState);
        this.contribs.forEach(c => {
            if (c.setInputState && viewState.inputState?.[c.id]) {
                c.setInputState(viewState.inputState?.[c.id]);
            }
        });
        this.refreshParsedInput();
        this.viewModelDisposables.add(model.onDidChange((e) => {
            if (e.kind === 'setAgent') {
                this._onDidChangeAgent.fire({ agent: e.agent, slashCommand: e.command });
            }
            if (e.kind === 'addRequest') {
                if (this._location.location === ChatAgentLocation.EditingSession) {
                    this.chatEditingService.createSnapshot(e.request.id);
                }
            }
        }));
        if (this.tree && this.visible) {
            this.onDidChangeItems();
            revealLastElement(this.tree);
        }
        this.updateChatInputContext();
    }
    getFocus() {
        return this.tree.getFocus()[0] ?? undefined;
    }
    reveal(item, relativeTop) {
        this.tree.reveal(item, relativeTop);
    }
    focus(item) {
        const items = this.tree.getNode(null).children;
        const node = items.find(i => i.element?.id === item.id);
        if (!node) {
            return;
        }
        this.tree.setFocus([node.element]);
        this.tree.domFocus();
    }
    refilter() {
        this.tree.refilter();
    }
    setInputPlaceholder(placeholder) {
        this.viewModel?.setInputPlaceholder(placeholder);
    }
    resetInputPlaceholder() {
        this.viewModel?.resetInputPlaceholder();
    }
    setInput(value = '') {
        this.inputPart.setValue(value, false);
        this.refreshParsedInput();
    }
    getInput() {
        return this.inputPart.inputEditor.getValue();
    }
    logInputHistory() {
        this.inputPart.logInputHistory();
    }
    async acceptInput(query, options) {
        return this._acceptInput(query ? { query } : undefined, options);
    }
    async acceptInputWithPrefix(prefix) {
        this._acceptInput({ prefix });
    }
    collectInputState() {
        const inputState = {};
        this.contribs.forEach(c => {
            if (c.getInputState) {
                inputState[c.id] = c.getInputState();
            }
        });
        return inputState;
    }
    async _acceptInput(query, options) {
        if (this.viewModel) {
            this._onDidAcceptInput.fire();
            if (!this.viewOptions.autoScroll) {
                this.scrollLock = false;
            }
            const editorValue = this.getInput();
            const requestId = this.chatAccessibilityService.acceptRequest();
            const input = !query ? editorValue :
                'query' in query ? query.query :
                    `${query.prefix} ${editorValue}`;
            const isUserQuery = !query || 'prefix' in query;
            const requests = this.viewModel.model.getRequests();
            for (let i = requests.length - 1; i >= 0; i -= 1) {
                const request = requests[i];
                if (request.isHidden) {
                    this.chatService.removeRequest(this.viewModel.sessionId, request.id);
                }
            }
            let attachedContext = this.inputPart.getAttachedAndImplicitContext();
            let workingSet;
            if (this.location === ChatAgentLocation.EditingSession) {
                const uniqueWorkingSetEntries = new ResourceSet(); // NOTE: this is used for bookkeeping so the UI can avoid rendering references in the UI that are already shown in the working set
                const editingSessionAttachedContext = this.inputPart.chatEditWorkingSetFiles.map((v) => {
                    // Pick up everything that the user sees is part of the working set.
                    // This should never exceed the maximum file entries limit above.
                    uniqueWorkingSetEntries.add(v);
                    return this.attachmentModel.asVariableEntry(v);
                });
                let maximumFileEntries = this.chatEditingService.editingSessionFileLimit - editingSessionAttachedContext.length;
                // Then take any attachments that are not files
                for (const attachment of this.attachmentModel.attachments) {
                    if (!URI.isUri(attachment.value)) {
                        editingSessionAttachedContext.push(attachment);
                    }
                }
                const currentEditingSession = this.chatEditingService.currentEditingSessionObs.get();
                for (const file of uniqueWorkingSetEntries) {
                    // Make sure that any files that we sent are part of the working set
                    // but do not permanently add file variables from previous requests to the working set
                    // since the user may subsequently edit the chat history
                    currentEditingSession?.addFileToWorkingSet(file);
                }
                // Collect file variables from previous requests before sending the request
                const previousRequests = this.viewModel.model.getRequests();
                for (const request of previousRequests) {
                    for (const variable of request.variableData.variables) {
                        if (URI.isUri(variable.value) && variable.isFile && maximumFileEntries > 0) {
                            const uri = variable.value;
                            if (!uniqueWorkingSetEntries.has(uri)) {
                                editingSessionAttachedContext.push(variable);
                                uniqueWorkingSetEntries.add(variable.value);
                                maximumFileEntries -= 1;
                            }
                        }
                    }
                }
                workingSet = [...uniqueWorkingSetEntries.values()];
                attachedContext = editingSessionAttachedContext;
                this.telemetryService.publicLog2('chatEditing/workingSetSize', { originalSize: this.inputPart.attemptedWorkingSetEntriesCount, actualSize: uniqueWorkingSetEntries.size });
            }
            const result = await this.chatService.sendRequest(this.viewModel.sessionId, input, {
                userSelectedModelId: this.inputPart.currentLanguageModel,
                location: this.location,
                locationData: this._location.resolveData?.(),
                parserContext: { selectedAgent: this._lastSelectedAgent },
                attachedContext,
                workingSet,
                noCommandDetection: options?.noCommandDetection,
            });
            if (result) {
                this.inputPart.acceptInput(isUserQuery);
                this._onDidSubmitAgent.fire({ agent: result.agent, slashCommand: result.slashCommand });
                result.responseCompletePromise.then(() => {
                    const responses = this.viewModel?.getItems().filter(isResponseVM);
                    const lastResponse = responses?.[responses.length - 1];
                    this.chatAccessibilityService.acceptResponse(lastResponse, requestId, options?.isVoiceInput);
                    if (lastResponse?.result?.nextQuestion) {
                        const { prompt, participant, command } = lastResponse.result.nextQuestion;
                        const question = formatChatQuestion(this.chatAgentService, this.location, prompt, participant, command);
                        if (question) {
                            this.input.setValue(question, false);
                        }
                    }
                });
                return result.responseCreatedPromise;
            }
        }
        return undefined;
    }
    getCodeBlockInfosForResponse(response) {
        return this.renderer.getCodeBlockInfosForResponse(response);
    }
    getCodeBlockInfoForEditor(uri) {
        return this.renderer.getCodeBlockInfoForEditor(uri);
    }
    getFileTreeInfosForResponse(response) {
        return this.renderer.getFileTreeInfosForResponse(response);
    }
    getLastFocusedFileTreeForResponse(response) {
        return this.renderer.getLastFocusedFileTreeForResponse(response);
    }
    focusLastMessage() {
        if (!this.viewModel) {
            return;
        }
        const items = this.tree.getNode(null).children;
        const lastItem = items[items.length - 1];
        if (!lastItem) {
            return;
        }
        this.tree.setFocus([lastItem.element]);
        this.tree.domFocus();
    }
    layout(height, width) {
        width = Math.min(width, 850);
        this.bodyDimension = new dom.Dimension(width, height);
        const inputPartMaxHeight = this._dynamicMessageLayoutData?.enabled ? this._dynamicMessageLayoutData.maxHeight : height;
        this.inputPart.layout(inputPartMaxHeight, width);
        const inputPartHeight = this.inputPart.inputPartHeight;
        const lastElementVisible = this.tree.scrollTop + this.tree.renderHeight >= this.tree.scrollHeight - 2;
        const listHeight = Math.max(0, height - inputPartHeight);
        if (!this.viewOptions.autoScroll) {
            this.listContainer.style.setProperty('--chat-current-response-min-height', listHeight * .75 + 'px');
        }
        this.tree.layout(listHeight, width);
        this.tree.getHTMLElement().style.height = `${listHeight}px`;
        // Push the welcome message down so it doesn't change position when followups appear
        const followupsOffset = this.viewOptions.renderFollowups ? Math.max(100 - this.inputPart.followupsHeight, 0) : 0;
        this.welcomeMessageContainer.style.height = `${listHeight - followupsOffset}px`;
        this.welcomeMessageContainer.style.paddingBottom = `${followupsOffset}px`;
        this.renderer.layout(width);
        const lastItem = this.viewModel?.getItems().at(-1);
        const lastResponseIsRendering = isResponseVM(lastItem) && lastItem.renderData;
        if (lastElementVisible && (!lastResponseIsRendering || this.viewOptions.autoScroll)) {
            revealLastElement(this.tree);
        }
        this.listContainer.style.height = `${listHeight}px`;
        this._onDidChangeHeight.fire(height);
    }
    // An alternative to layout, this allows you to specify the number of ChatTreeItems
    // you want to show, and the max height of the container. It will then layout the
    // tree to show that many items.
    // TODO@TylerLeonhardt: This could use some refactoring to make it clear which layout strategy is being used
    setDynamicChatTreeItemLayout(numOfChatTreeItems, maxHeight) {
        this._dynamicMessageLayoutData = { numOfMessages: numOfChatTreeItems, maxHeight, enabled: true };
        this._register(this.renderer.onDidChangeItemHeight(() => this.layoutDynamicChatTreeItemMode()));
        const mutableDisposable = this._register(new MutableDisposable());
        this._register(this.tree.onDidScroll((e) => {
            // TODO@TylerLeonhardt this should probably just be disposed when this is disabled
            // and then set up again when it is enabled again
            if (!this._dynamicMessageLayoutData?.enabled) {
                return;
            }
            mutableDisposable.value = dom.scheduleAtNextAnimationFrame(dom.getWindow(this.listContainer), () => {
                if (!e.scrollTopChanged || e.heightChanged || e.scrollHeightChanged) {
                    return;
                }
                const renderHeight = e.height;
                const diff = e.scrollHeight - renderHeight - e.scrollTop;
                if (diff === 0) {
                    return;
                }
                const possibleMaxHeight = (this._dynamicMessageLayoutData?.maxHeight ?? maxHeight);
                const width = this.bodyDimension?.width ?? this.container.offsetWidth;
                this.inputPart.layout(possibleMaxHeight, width);
                const inputPartHeight = this.inputPart.inputPartHeight;
                const newHeight = Math.min(renderHeight + diff, possibleMaxHeight - inputPartHeight);
                this.layout(newHeight + inputPartHeight, width);
            });
        }));
    }
    updateDynamicChatTreeItemLayout(numOfChatTreeItems, maxHeight) {
        this._dynamicMessageLayoutData = { numOfMessages: numOfChatTreeItems, maxHeight, enabled: true };
        let hasChanged = false;
        let height = this.bodyDimension.height;
        let width = this.bodyDimension.width;
        if (maxHeight < this.bodyDimension.height) {
            height = maxHeight;
            hasChanged = true;
        }
        const containerWidth = this.container.offsetWidth;
        if (this.bodyDimension?.width !== containerWidth) {
            width = containerWidth;
            hasChanged = true;
        }
        if (hasChanged) {
            this.layout(height, width);
        }
    }
    get isDynamicChatTreeItemLayoutEnabled() {
        return this._dynamicMessageLayoutData?.enabled ?? false;
    }
    set isDynamicChatTreeItemLayoutEnabled(value) {
        if (!this._dynamicMessageLayoutData) {
            return;
        }
        this._dynamicMessageLayoutData.enabled = value;
    }
    layoutDynamicChatTreeItemMode() {
        if (!this.viewModel || !this._dynamicMessageLayoutData?.enabled) {
            return;
        }
        const width = this.bodyDimension?.width ?? this.container.offsetWidth;
        this.inputPart.layout(this._dynamicMessageLayoutData.maxHeight, width);
        const inputHeight = this.inputPart.inputPartHeight;
        const totalMessages = this.viewModel.getItems();
        // grab the last N messages
        const messages = totalMessages.slice(-this._dynamicMessageLayoutData.numOfMessages);
        const needsRerender = messages.some(m => m.currentRenderedHeight === undefined);
        const listHeight = needsRerender
            ? this._dynamicMessageLayoutData.maxHeight
            : messages.reduce((acc, message) => acc + message.currentRenderedHeight, 0);
        this.layout(Math.min(
        // we add an additional 18px in order to show that there is scrollable content
        inputHeight + listHeight + (totalMessages.length > 2 ? 18 : 0), this._dynamicMessageLayoutData.maxHeight), width);
        if (needsRerender || !listHeight) {
            // TODO: figure out a better place to reveal the last element
            revealLastElement(this.tree);
        }
    }
    saveState() {
        this.inputPart.saveState();
        if (this.viewModel?.model.welcomeMessage) {
            this.storageService.store(`${PersistWelcomeMessageContentKey}.${this.location}`, this.viewModel?.model.welcomeMessage, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
    }
    getViewState() {
        return {
            inputValue: this.getInput(),
            inputState: this.inputPart.getViewState(),
            selectedLanguageModelId: this.inputPart.currentLanguageModel,
        };
    }
    updateChatInputContext() {
        const currentAgent = this.parsedInput.parts.find(part => part instanceof ChatRequestAgentPart);
        this.agentInInput.set(!!currentAgent);
    }
};
ChatWidget = ChatWidget_1 = __decorate([
    __param(4, ICodeEditorService),
    __param(5, IContextKeyService),
    __param(6, IInstantiationService),
    __param(7, IChatService),
    __param(8, IChatAgentService),
    __param(9, IChatWidgetService),
    __param(10, IContextMenuService),
    __param(11, IChatAccessibilityService),
    __param(12, ILogService),
    __param(13, IThemeService),
    __param(14, IChatSlashCommandService),
    __param(15, IChatEditingService),
    __param(16, IStorageService),
    __param(17, ITelemetryService)
], ChatWidget);
export { ChatWidget };
export class ChatWidgetService extends Disposable {
    constructor() {
        super(...arguments);
        this._widgets = [];
        this._lastFocusedWidget = undefined;
        this._onDidAddWidget = this._register(new Emitter());
        this.onDidAddWidget = this._onDidAddWidget.event;
    }
    get lastFocusedWidget() {
        return this._lastFocusedWidget;
    }
    getAllWidgets(location) {
        return this._widgets.filter(w => w.location === location);
    }
    getWidgetByInputUri(uri) {
        return this._widgets.find(w => isEqual(w.inputUri, uri));
    }
    getWidgetByLocation(location) {
        return this._widgets.filter(w => w.location === location);
    }
    getWidgetBySessionId(sessionId) {
        return this._widgets.find(w => w.viewModel?.sessionId === sessionId);
    }
    setLastFocusedWidget(widget) {
        if (widget === this._lastFocusedWidget) {
            return;
        }
        this._lastFocusedWidget = widget;
    }
    register(newWidget) {
        if (this._widgets.some(widget => widget === newWidget)) {
            throw new Error('Cannot register the same widget multiple times');
        }
        this._widgets.push(newWidget);
        this._onDidAddWidget.fire(newWidget);
        return combinedDisposable(newWidget.onDidFocus(() => this.setLastFocusedWidget(newWidget)), toDisposable(() => this._widgets.splice(this._widgets.indexOf(newWidget), 1)));
    }
}
