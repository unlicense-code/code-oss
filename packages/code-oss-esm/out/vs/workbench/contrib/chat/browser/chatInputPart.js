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
var ChatInputPart_1;
import * as dom from '../../../../base/browser/dom.js';
import { addDisposableListener } from '../../../../base/browser/dom.js';
import { DEFAULT_FONT_FAMILY } from '../../../../base/browser/fonts.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import * as aria from '../../../../base/browser/ui/aria/aria.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { createInstantHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { renderLabelWithIcons } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { ProgressBar } from '../../../../base/browser/ui/progressbar/progressbar.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { Promises } from '../../../../base/common/async.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { HistoryNavigator2 } from '../../../../base/common/history.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { ResourceSet } from '../../../../base/common/map.js';
import { basename, dirname } from '../../../../base/common/path.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { EditorExtensionsRegistry } from '../../../../editor/browser/editorExtensions.js';
import { CodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { EditorOptions } from '../../../../editor/common/config/editorOptions.js';
import { Range } from '../../../../editor/common/core/range.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { CopyPasteController } from '../../../../editor/contrib/dropOrPasteInto/browser/copyPasteController.js';
import { ContentHoverController } from '../../../../editor/contrib/hover/browser/contentHoverController.js';
import { GlyphHoverController } from '../../../../editor/contrib/hover/browser/glyphHoverController.js';
import { SuggestController } from '../../../../editor/contrib/suggest/browser/suggestController.js';
import { localize } from '../../../../nls.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { MenuWorkbenchButtonBar } from '../../../../platform/actions/browser/buttonbar.js';
import { DropdownWithPrimaryActionViewItem } from '../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js';
import { getFlatActionBarActions, getFlatContextMenuActions, MenuEntryActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { MenuWorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { IMenuService, MenuId, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { FileKind, IFileService } from '../../../../platform/files/common/files.js';
import { registerAndCreateHistoryNavigationContext } from '../../../../platform/history/browser/contextScopedHistoryWidget.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { FolderThemeIcon, IThemeService } from '../../../../platform/theme/common/themeService.js';
import { fillEditorsDragData } from '../../../browser/dnd.js';
import { ResourceLabels } from '../../../browser/labels.js';
import { ResourceContextKey } from '../../../common/contextkeys.js';
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from '../../../services/editor/common/editorService.js';
import { getSimpleCodeEditorWidgetOptions, getSimpleEditorOptions, setupSimpleEditorSelectionStyling } from '../../codeEditor/browser/simpleEditorOptions.js';
import { revealInSideBarCommand } from '../../files/browser/fileActions.contribution.js';
import { ChatAgentLocation, IChatAgentService } from '../common/chatAgents.js';
import { ChatContextKeys } from '../common/chatContextKeys.js';
import { IChatEditingService } from '../common/chatEditingService.js';
import { ChatRequestDynamicVariablePart } from '../common/chatParserTypes.js';
import { IChatWidgetHistoryService } from '../common/chatWidgetHistoryService.js';
import { ILanguageModelsService } from '../common/languageModels.js';
import { CancelAction, ChatModelPickerActionId, ChatSubmitSecondaryAgentAction, ChatSubmitAction } from './actions/chatExecuteActions.js';
import { ImplicitContextAttachmentWidget } from './attachments/implicitContextAttachment.js';
import { ChatAttachmentModel } from './chatAttachmentModel.js';
import { CollapsibleListPool } from './chatContentParts/chatReferencesContentPart.js';
import { ChatEditingShowChangesAction } from './chatEditing/chatEditingActions.js';
import { ChatEditingSaveAllAction } from './chatEditorSaving.js';
import { ChatFollowups } from './chatFollowups.js';
import { ChatImplicitContext } from './contrib/chatImplicitContext.js';
const $ = dom.$;
const INPUT_EDITOR_MAX_HEIGHT = 250;
let ChatInputPart = class ChatInputPart extends Disposable {
    static { ChatInputPart_1 = this; }
    static { this.INPUT_SCHEME = 'chatSessionInput'; }
    static { this._counter = 0; }
    get attachmentModel() {
        return this._attachmentModel;
    }
    getAttachedAndImplicitContext() {
        const contextArr = [...this.attachmentModel.attachments];
        if (this.implicitContext?.enabled && this.implicitContext.value) {
            contextArr.push(this.implicitContext.toBaseEntry());
        }
        return contextArr;
    }
    get implicitContext() {
        return this._implicitContext;
    }
    get inputPartHeight() {
        return this._inputPartHeight;
    }
    get followupsHeight() {
        return this._followupsHeight;
    }
    get inputEditor() {
        return this._inputEditor;
    }
    get currentLanguageModel() {
        return this._currentLanguageModel;
    }
    get selectedElements() {
        const edits = [];
        const editsList = this._chatEditList?.object;
        const selectedElements = editsList?.getSelectedElements() ?? [];
        for (const element of selectedElements) {
            if (element.kind === 'reference' && URI.isUri(element.reference)) {
                edits.push(element.reference);
            }
        }
        return edits;
    }
    /**
     * The number of working set entries that the user actually wanted to attach.
     * This is less than or equal to {@link ChatInputPart.chatEditWorkingSetFiles}.
     */
    get attemptedWorkingSetEntriesCount() {
        return this._attemptedWorkingSetEntriesCount;
    }
    get chatEditWorkingSetFiles() {
        return this._combinedChatEditWorkingSetEntries;
    }
    constructor(
    // private readonly editorOptions: ChatEditorOptions, // TODO this should be used
    location, options, getContribsInputState, historyService, modelService, instantiationService, contextKeyService, contextMenuService, configurationService, keybindingService, accessibilityService, languageModelsService, logService, hoverService, fileService, commandService, editorService, openerService, chatEditingService, menuService, languageService, themeService) {
        super();
        this.location = location;
        this.options = options;
        this.historyService = historyService;
        this.modelService = modelService;
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this.contextMenuService = contextMenuService;
        this.configurationService = configurationService;
        this.keybindingService = keybindingService;
        this.accessibilityService = accessibilityService;
        this.languageModelsService = languageModelsService;
        this.logService = logService;
        this.hoverService = hoverService;
        this.fileService = fileService;
        this.commandService = commandService;
        this.editorService = editorService;
        this.openerService = openerService;
        this.chatEditingService = chatEditingService;
        this.menuService = menuService;
        this.languageService = languageService;
        this.themeService = themeService;
        this._onDidLoadInputState = this._register(new Emitter());
        this.onDidLoadInputState = this._onDidLoadInputState.event;
        this._onDidChangeHeight = this._register(new Emitter());
        this.onDidChangeHeight = this._onDidChangeHeight.event;
        this._onDidFocus = this._register(new Emitter());
        this.onDidFocus = this._onDidFocus.event;
        this._onDidBlur = this._register(new Emitter());
        this.onDidBlur = this._onDidBlur.event;
        this._onDidChangeContext = this._register(new Emitter());
        this.onDidChangeContext = this._onDidChangeContext.event;
        this._onDidAcceptFollowup = this._register(new Emitter());
        this.onDidAcceptFollowup = this._onDidAcceptFollowup.event;
        this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
        this._onDidChangeVisibility = this._register(new Emitter());
        this._contextResourceLabels = this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility.event });
        this.inputEditorHeight = 0;
        this.followupsDisposables = this._register(new DisposableStore());
        this.attachedContextDisposables = this._register(new MutableDisposable());
        this._inputPartHeight = 0;
        this._followupsHeight = 0;
        this._waitForPersistedLanguageModel = this._register(new MutableDisposable());
        this._onDidChangeCurrentLanguageModel = this._register(new Emitter());
        this.inputUri = URI.parse(`${ChatInputPart_1.INPUT_SCHEME}:input-${ChatInputPart_1._counter++}`);
        this._chatEditsActionsDisposables = this._register(new DisposableStore());
        this._chatEditsDisposables = this._register(new DisposableStore());
        this._attemptedWorkingSetEntriesCount = 0;
        this._combinedChatEditWorkingSetEntries = [];
        this._attachmentModel = this._register(new ChatAttachmentModel());
        this.getInputState = () => {
            return {
                ...getContribsInputState(),
                chatContextAttachments: this._attachmentModel.attachments,
            };
        };
        this.inputEditorMaxHeight = this.options.renderStyle === 'compact' ? INPUT_EDITOR_MAX_HEIGHT / 3 : INPUT_EDITOR_MAX_HEIGHT;
        this.inputEditorHasText = ChatContextKeys.inputHasText.bindTo(contextKeyService);
        this.chatCursorAtTop = ChatContextKeys.inputCursorAtTop.bindTo(contextKeyService);
        this.inputEditorHasFocus = ChatContextKeys.inputHasFocus.bindTo(contextKeyService);
        this.history = this.loadHistory();
        this._register(this.historyService.onDidClearHistory(() => this.history = new HistoryNavigator2([{ text: '' }], 50, historyKeyFn)));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */)) {
                this.inputEditor.updateOptions({ ariaLabel: this._getAriaLabel() });
            }
        }));
        this._chatEditsListPool = this._register(this.instantiationService.createInstance(CollapsibleListPool, this._onDidChangeVisibility.event, MenuId.ChatEditingWidgetModifiedFilesToolbar));
        this._hasFileAttachmentContextKey = ChatContextKeys.hasFileAttachments.bindTo(contextKeyService);
    }
    setCurrentLanguageModelToDefault() {
        const defaultLanguageModel = this.languageModelsService.getLanguageModelIds().find(id => this.languageModelsService.lookupLanguageModel(id)?.isDefault);
        const hasUserSelectableLanguageModels = this.languageModelsService.getLanguageModelIds().find(id => {
            const model = this.languageModelsService.lookupLanguageModel(id);
            return model?.isUserSelectable && !model.isDefault;
        });
        this._currentLanguageModel = hasUserSelectableLanguageModels ? defaultLanguageModel : undefined;
    }
    setCurrentLanguageModelByUser(modelId) {
        this._currentLanguageModel = modelId;
        // The user changed the language model, so we don't wait for the persisted option to be registered
        this._waitForPersistedLanguageModel.clear();
        if (this.cachedDimensions) {
            this.layout(this.cachedDimensions.height, this.cachedDimensions.width);
        }
    }
    loadHistory() {
        const history = this.historyService.getHistory(this.location);
        if (history.length === 0) {
            history.push({ text: '' });
        }
        return new HistoryNavigator2(history, 50, historyKeyFn);
    }
    _getAriaLabel() {
        const verbose = this.configurationService.getValue("accessibility.verbosity.panelChat" /* AccessibilityVerbositySettingId.Chat */);
        if (verbose) {
            const kbLabel = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
            return kbLabel ? localize('actions.chat.accessibiltyHelp', "Chat Input,  Type to ask questions or type / for topics, press enter to send out the request. Use {0} for Chat Accessibility Help.", kbLabel) : localize('chatInput.accessibilityHelpNoKb', "Chat Input,  Type code here and press Enter to run. Use the Chat Accessibility Help command for more information.");
        }
        return localize('chatInput', "Chat Input");
    }
    initForNewChatModel(state) {
        this.history = this.loadHistory();
        this.history.add({
            text: state.inputValue ?? this.history.current().text,
            state: state.inputState ?? this.getInputState()
        });
        const attachments = state.inputState?.chatContextAttachments ?? [];
        this._attachmentModel.clearAndSetContext(...attachments);
        if (state.inputValue) {
            this.setValue(state.inputValue, false);
        }
        if (state.selectedLanguageModelId) {
            const model = this.languageModelsService.lookupLanguageModel(state.selectedLanguageModelId);
            if (model) {
                this._currentLanguageModel = state.selectedLanguageModelId;
                this._onDidChangeCurrentLanguageModel.fire(this._currentLanguageModel);
            }
            else {
                this._waitForPersistedLanguageModel.value = this.languageModelsService.onDidChangeLanguageModels(e => {
                    const persistedModel = e.added?.find(m => m.identifier === state.selectedLanguageModelId);
                    if (persistedModel) {
                        this._waitForPersistedLanguageModel.clear();
                        if (persistedModel.metadata.isUserSelectable) {
                            this._currentLanguageModel = state.selectedLanguageModelId;
                            this._onDidChangeCurrentLanguageModel.fire(this._currentLanguageModel);
                        }
                    }
                });
            }
        }
    }
    logInputHistory() {
        const historyStr = [...this.history].map(entry => JSON.stringify(entry)).join('\n');
        this.logService.info(`[${this.location}] Chat input history:`, historyStr);
    }
    setVisible(visible) {
        this._onDidChangeVisibility.fire(visible);
    }
    get element() {
        return this.container;
    }
    showPreviousValue() {
        const inputState = this.getInputState();
        if (this.history.isAtEnd()) {
            this.saveCurrentValue(inputState);
        }
        else {
            if (!this.history.has({ text: this._inputEditor.getValue(), state: inputState })) {
                this.saveCurrentValue(inputState);
                this.history.resetCursor();
            }
        }
        this.navigateHistory(true);
    }
    showNextValue() {
        const inputState = this.getInputState();
        if (this.history.isAtEnd()) {
            return;
        }
        else {
            if (!this.history.has({ text: this._inputEditor.getValue(), state: inputState })) {
                this.saveCurrentValue(inputState);
                this.history.resetCursor();
            }
        }
        this.navigateHistory(false);
    }
    navigateHistory(previous) {
        const historyEntry = previous ?
            this.history.previous() : this.history.next();
        const historyAttachments = historyEntry.state?.chatContextAttachments ?? [];
        this._attachmentModel.clearAndSetContext(...historyAttachments);
        aria.status(historyEntry.text);
        this.setValue(historyEntry.text, true);
        this._onDidLoadInputState.fire(historyEntry.state);
        const model = this._inputEditor.getModel();
        if (!model) {
            return;
        }
        if (previous) {
            const endOfFirstViewLine = this._inputEditor._getViewModel()?.getLineLength(1) ?? 1;
            const endOfFirstModelLine = model.getLineLength(1);
            if (endOfFirstViewLine === endOfFirstModelLine) {
                // Not wrapped - set cursor to the end of the first line
                this._inputEditor.setPosition({ lineNumber: 1, column: endOfFirstViewLine + 1 });
            }
            else {
                // Wrapped - set cursor one char short of the end of the first view line.
                // If it's after the next character, the cursor shows on the second line.
                this._inputEditor.setPosition({ lineNumber: 1, column: endOfFirstViewLine });
            }
        }
        else {
            this._inputEditor.setPosition(getLastPosition(model));
        }
    }
    setValue(value, transient) {
        this.inputEditor.setValue(value);
        // always leave cursor at the end
        this.inputEditor.setPosition({ lineNumber: 1, column: value.length + 1 });
        if (!transient) {
            this.saveCurrentValue(this.getInputState());
        }
    }
    saveCurrentValue(inputState) {
        const newEntry = { text: this._inputEditor.getValue(), state: inputState };
        this.history.replaceLast(newEntry);
    }
    focus() {
        this._inputEditor.focus();
    }
    hasFocus() {
        return this._inputEditor.hasWidgetFocus();
    }
    /**
     * Reset the input and update history.
     * @param userQuery If provided, this will be added to the history. Followups and programmatic queries should not be passed.
     */
    async acceptInput(isUserQuery) {
        if (isUserQuery) {
            const userQuery = this._inputEditor.getValue();
            const entry = { text: userQuery, state: this.getInputState() };
            this.history.replaceLast(entry);
            this.history.add({ text: '' });
        }
        // Clear attached context, fire event to clear input state, and clear the input editor
        this.attachmentModel.clear();
        this._onDidLoadInputState.fire({});
        if (this.accessibilityService.isScreenReaderOptimized() && isMacintosh) {
            this._acceptInputForVoiceover();
        }
        else {
            this._inputEditor.focus();
            this._inputEditor.setValue('');
        }
    }
    _acceptInputForVoiceover() {
        const domNode = this._inputEditor.getDomNode();
        if (!domNode) {
            return;
        }
        // Remove the input editor from the DOM temporarily to prevent VoiceOver
        // from reading the cleared text (the request) to the user.
        domNode.remove();
        this._inputEditor.setValue('');
        this._inputEditorElement.appendChild(domNode);
        this._inputEditor.focus();
    }
    _handleAttachedContextChange() {
        this._hasFileAttachmentContextKey.set(Boolean(this._attachmentModel.attachments.find(a => a.isFile)));
        this.renderAttachedContext();
    }
    render(container, initialValue, widget) {
        let elements;
        if (this.options.renderStyle === 'compact') {
            elements = dom.h('.interactive-input-part', [
                dom.h('.interactive-input-and-edit-session', [
                    dom.h('.chat-editing-session@chatEditingSessionWidgetContainer'),
                    dom.h('.interactive-input-and-side-toolbar@inputAndSideToolbar', [
                        dom.h('.chat-input-container@inputContainer', [
                            dom.h('.chat-editor-container@editorContainer'),
                            dom.h('.chat-input-toolbars@inputToolbars'),
                        ]),
                    ]),
                    dom.h('.chat-attached-context@attachedContextContainer'),
                    dom.h('.interactive-input-followups@followupsContainer'),
                ])
            ]);
        }
        else {
            elements = dom.h('.interactive-input-part', [
                dom.h('.interactive-input-followups@followupsContainer'),
                dom.h('.chat-editing-session@chatEditingSessionWidgetContainer'),
                dom.h('.interactive-input-and-side-toolbar@inputAndSideToolbar', [
                    dom.h('.chat-input-container@inputContainer', [
                        dom.h('.chat-editor-container@editorContainer'),
                        dom.h('.chat-attached-context@attachedContextContainer'),
                        dom.h('.chat-input-toolbars@inputToolbars'),
                    ]),
                ]),
            ]);
        }
        this.container = elements.root;
        container.append(this.container);
        this.container.classList.toggle('compact', this.options.renderStyle === 'compact');
        this.followupsContainer = elements.followupsContainer;
        const inputAndSideToolbar = elements.inputAndSideToolbar; // The chat input and toolbar to the right
        const inputContainer = elements.inputContainer; // The chat editor, attachments, and toolbars
        const editorContainer = elements.editorContainer;
        this.attachedContextContainer = elements.attachedContextContainer;
        const toolbarsContainer = elements.inputToolbars;
        this.chatEditingSessionWidgetContainer = elements.chatEditingSessionWidgetContainer;
        this.renderAttachedContext();
        if (this.options.enableImplicitContext) {
            this._implicitContext = this._register(new ChatImplicitContext());
            this._register(this._implicitContext.onDidChangeValue(() => this._handleAttachedContextChange()));
        }
        this._register(this._attachmentModel.onDidChangeContext(() => this._handleAttachedContextChange()));
        this.renderChatEditingSessionState(null, widget);
        const inputScopedContextKeyService = this._register(this.contextKeyService.createScoped(inputContainer));
        ChatContextKeys.inChatInput.bindTo(inputScopedContextKeyService).set(true);
        const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, inputScopedContextKeyService])));
        const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this._register(registerAndCreateHistoryNavigationContext(inputScopedContextKeyService, this));
        this.historyNavigationBackwardsEnablement = historyNavigationBackwardsEnablement;
        this.historyNavigationForewardsEnablement = historyNavigationForwardsEnablement;
        const options = getSimpleEditorOptions(this.configurationService);
        options.overflowWidgetsDomNode = this.options.editorOverflowWidgetsDomNode;
        options.pasteAs = EditorOptions.pasteAs.defaultValue;
        options.readOnly = false;
        options.ariaLabel = this._getAriaLabel();
        options.fontFamily = DEFAULT_FONT_FAMILY;
        options.fontSize = 13;
        options.lineHeight = 20;
        options.padding = this.options.renderStyle === 'compact' ? { top: 2, bottom: 2 } : { top: 8, bottom: 8 };
        options.cursorWidth = 1;
        options.wrappingStrategy = 'advanced';
        options.bracketPairColorization = { enabled: false };
        options.suggest = {
            showIcons: false,
            showSnippets: false,
            showWords: true,
            showStatusBar: false,
            insertMode: 'replace',
        };
        options.scrollbar = { ...(options.scrollbar ?? {}), vertical: 'hidden' };
        options.stickyScroll = { enabled: false };
        this._inputEditorElement = dom.append(editorContainer, $(chatInputEditorContainerSelector));
        const editorOptions = getSimpleCodeEditorWidgetOptions();
        editorOptions.contributions?.push(...EditorExtensionsRegistry.getSomeEditorContributions([ContentHoverController.ID, GlyphHoverController.ID, CopyPasteController.ID]));
        this._inputEditor = this._register(scopedInstantiationService.createInstance(CodeEditorWidget, this._inputEditorElement, options, editorOptions));
        SuggestController.get(this._inputEditor)?.forceRenderingAbove();
        this._register(this._inputEditor.onDidChangeModelContent(() => {
            const currentHeight = Math.min(this._inputEditor.getContentHeight(), this.inputEditorMaxHeight);
            if (currentHeight !== this.inputEditorHeight) {
                this.inputEditorHeight = currentHeight;
                this._onDidChangeHeight.fire();
            }
            const model = this._inputEditor.getModel();
            const inputHasText = !!model && model.getValue().trim().length > 0;
            this.inputEditorHasText.set(inputHasText);
        }));
        this._register(this._inputEditor.onDidContentSizeChange(e => {
            if (e.contentHeightChanged) {
                this.inputEditorHeight = e.contentHeight;
                this._onDidChangeHeight.fire();
            }
        }));
        this._register(this._inputEditor.onDidFocusEditorText(() => {
            this.inputEditorHasFocus.set(true);
            this._onDidFocus.fire();
            inputContainer.classList.toggle('focused', true);
        }));
        this._register(this._inputEditor.onDidBlurEditorText(() => {
            this.inputEditorHasFocus.set(false);
            inputContainer.classList.toggle('focused', false);
            this._onDidBlur.fire();
        }));
        const hoverDelegate = this._register(createInstantHoverDelegate());
        this._register(dom.addStandardDisposableListener(toolbarsContainer, dom.EventType.CLICK, e => this.inputEditor.focus()));
        this.inputActionsToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, toolbarsContainer, MenuId.ChatInput, {
            telemetrySource: this.options.menus.telemetrySource,
            menuOptions: { shouldForwardArgs: true },
            hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
            hoverDelegate
        }));
        this.inputActionsToolbar.context = { widget };
        this._register(this.inputActionsToolbar.onDidChangeMenuItems(() => {
            if (this.cachedDimensions && typeof this.cachedInputToolbarWidth === 'number' && this.cachedInputToolbarWidth !== this.inputActionsToolbar.getItemsWidth()) {
                this.layout(this.cachedDimensions.height, this.cachedDimensions.width);
            }
        }));
        this.executeToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, toolbarsContainer, this.options.menus.executeToolbar, {
            telemetrySource: this.options.menus.telemetrySource,
            menuOptions: {
                shouldForwardArgs: true
            },
            hoverDelegate,
            hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */, // keep it lean when hiding items and avoid a "..." overflow menu
            actionViewItemProvider: (action, options) => {
                if (this.location === ChatAgentLocation.Panel || this.location === ChatAgentLocation.Editor) {
                    if ((action.id === ChatSubmitAction.ID || action.id === CancelAction.ID) && action instanceof MenuItemAction) {
                        const dropdownAction = this.instantiationService.createInstance(MenuItemAction, { id: 'chat.moreExecuteActions', title: localize('notebook.moreExecuteActionsLabel', "More..."), icon: Codicon.chevronDown }, undefined, undefined, undefined, undefined);
                        return this.instantiationService.createInstance(ChatSubmitDropdownActionItem, action, dropdownAction, options);
                    }
                }
                if (action.id === ChatModelPickerActionId && action instanceof MenuItemAction) {
                    if (!this._currentLanguageModel) {
                        this.setCurrentLanguageModelToDefault();
                    }
                    if (this._currentLanguageModel) {
                        const itemDelegate = {
                            onDidChangeModel: this._onDidChangeCurrentLanguageModel.event,
                            setModel: (modelId) => {
                                this.setCurrentLanguageModelByUser(modelId);
                            }
                        };
                        return this.instantiationService.createInstance(ModelPickerActionViewItem, action, this._currentLanguageModel, itemDelegate, { hoverDelegate: options.hoverDelegate, keybinding: options.keybinding ?? undefined });
                    }
                }
                return undefined;
            }
        }));
        this.executeToolbar.getElement().classList.add('chat-execute-toolbar');
        this.executeToolbar.context = { widget };
        this._register(this.executeToolbar.onDidChangeMenuItems(() => {
            if (this.cachedDimensions && typeof this.cachedExecuteToolbarWidth === 'number' && this.cachedExecuteToolbarWidth !== this.executeToolbar.getItemsWidth()) {
                this.layout(this.cachedDimensions.height, this.cachedDimensions.width);
            }
        }));
        if (this.options.menus.inputSideToolbar) {
            const toolbarSide = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, inputAndSideToolbar, this.options.menus.inputSideToolbar, {
                telemetrySource: this.options.menus.telemetrySource,
                menuOptions: {
                    shouldForwardArgs: true
                },
                hoverDelegate
            }));
            this.inputSideToolbarContainer = toolbarSide.getElement();
            toolbarSide.getElement().classList.add('chat-side-toolbar');
            toolbarSide.context = { widget };
        }
        let inputModel = this.modelService.getModel(this.inputUri);
        if (!inputModel) {
            inputModel = this.modelService.createModel('', null, this.inputUri, true);
            this._register(inputModel);
        }
        this.inputModel = inputModel;
        this.inputModel.updateOptions({ bracketColorizationOptions: { enabled: false, independentColorPoolPerBracketType: false } });
        this._inputEditor.setModel(this.inputModel);
        if (initialValue) {
            this.inputModel.setValue(initialValue);
            const lineNumber = this.inputModel.getLineCount();
            this._inputEditor.setPosition({ lineNumber, column: this.inputModel.getLineMaxColumn(lineNumber) });
        }
        const onDidChangeCursorPosition = () => {
            const model = this._inputEditor.getModel();
            if (!model) {
                return;
            }
            const position = this._inputEditor.getPosition();
            if (!position) {
                return;
            }
            const atTop = position.lineNumber === 1 && position.column - 1 <= (this._inputEditor._getViewModel()?.getLineLength(1) ?? 0);
            this.chatCursorAtTop.set(atTop);
            this.historyNavigationBackwardsEnablement.set(atTop);
            this.historyNavigationForewardsEnablement.set(position.equals(getLastPosition(model)));
        };
        this._register(this._inputEditor.onDidChangeCursorPosition(e => onDidChangeCursorPosition()));
        onDidChangeCursorPosition();
        this._register(this.themeService.onDidFileIconThemeChange(() => {
            this.renderAttachedContext();
        }));
    }
    async renderAttachedContext() {
        const container = this.attachedContextContainer;
        const oldHeight = container.offsetHeight;
        const store = new DisposableStore();
        this.attachedContextDisposables.value = store;
        dom.clearNode(container);
        const hoverDelegate = store.add(createInstantHoverDelegate());
        const attachments = this.location === ChatAgentLocation.EditingSession
            // Render as attachments anything that isn't a file, but still render specific ranges in a file
            ? [...this.attachmentModel.attachments.entries()].filter(([_, attachment]) => !attachment.isFile || attachment.isFile && typeof attachment.value === 'object' && !!attachment.value && 'range' in attachment.value)
            : [...this.attachmentModel.attachments.entries()];
        dom.setVisibility(Boolean(attachments.length) || Boolean(this.implicitContext?.value), this.attachedContextContainer);
        if (!attachments.length) {
            this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
        }
        if (this.implicitContext?.value) {
            const implicitPart = store.add(this.instantiationService.createInstance(ImplicitContextAttachmentWidget, this.implicitContext, this._contextResourceLabels));
            container.appendChild(implicitPart.domNode);
        }
        const attachmentInitPromises = [];
        for (const [index, attachment] of attachments) {
            const widget = dom.append(container, $('.chat-attached-context-attachment.show-file-icons'));
            const label = this._contextResourceLabels.create(widget, { supportIcons: true, hoverDelegate, hoverTargetOverride: widget });
            let ariaLabel;
            const resource = URI.isUri(attachment.value) ? attachment.value : attachment.value && typeof attachment.value === 'object' && 'uri' in attachment.value && URI.isUri(attachment.value.uri) ? attachment.value.uri : undefined;
            const range = attachment.value && typeof attachment.value === 'object' && 'range' in attachment.value && Range.isIRange(attachment.value.range) ? attachment.value.range : undefined;
            if (resource && (attachment.isFile || attachment.isDirectory)) {
                const fileBasename = basename(resource.path);
                const fileDirname = dirname(resource.path);
                const friendlyName = `${fileBasename} ${fileDirname}`;
                ariaLabel = range ? localize('chat.fileAttachmentWithRange', "Attached file, {0}, line {1} to line {2}", friendlyName, range.startLineNumber, range.endLineNumber) : localize('chat.fileAttachment', "Attached file, {0}", friendlyName);
                const fileOptions = { hidePath: true };
                label.setFile(resource, attachment.isFile ? {
                    ...fileOptions,
                    fileKind: FileKind.FILE,
                    range,
                } : {
                    ...fileOptions,
                    fileKind: FileKind.FOLDER,
                    icon: !this.themeService.getFileIconTheme().hasFolderIcons ? FolderThemeIcon : undefined
                });
                const scopedContextKeyService = store.add(this.contextKeyService.createScoped(widget));
                const resourceContextKey = store.add(new ResourceContextKey(scopedContextKeyService, this.fileService, this.languageService, this.modelService));
                resourceContextKey.set(resource);
                this.attachButtonAndDisposables(widget, index, attachment, hoverDelegate, {
                    contextMenuArg: resource,
                    contextKeyService: scopedContextKeyService,
                    contextMenuId: MenuId.ChatInputResourceAttachmentContext,
                });
                // Drag and drop
                widget.draggable = true;
                this._register(dom.addDisposableListener(widget, 'dragstart', e => {
                    this.instantiationService.invokeFunction(accessor => fillEditorsDragData(accessor, [resource], e));
                    e.dataTransfer?.setDragImage(widget, 0, 0);
                }));
            }
            else if (attachment.isImage) {
                ariaLabel = localize('chat.imageAttachment', "Attached image, {0}", attachment.name);
                const hoverElement = dom.$('div.chat-attached-context-hover');
                hoverElement.setAttribute('aria-label', ariaLabel);
                // Custom label
                const pillIcon = dom.$('div.chat-attached-context-pill', {}, dom.$('span.codicon.codicon-file-media'));
                const textLabel = dom.$('span.chat-attached-context-custom-text', {}, attachment.name);
                widget.appendChild(pillIcon);
                widget.appendChild(textLabel);
                attachmentInitPromises.push(Promises.withAsyncBody(async (resolve) => {
                    let buffer;
                    try {
                        this.attachButtonAndDisposables(widget, index, attachment, hoverDelegate);
                        if (attachment.value instanceof URI) {
                            const readFile = await this.fileService.readFile(attachment.value);
                            if (store.isDisposed) {
                                return;
                            }
                            buffer = readFile.value.buffer;
                        }
                        else {
                            buffer = attachment.value;
                        }
                        this.createImageElements(buffer, widget, hoverElement);
                    }
                    catch (error) {
                        console.error('Error processing attachment:', error);
                    }
                    widget.style.position = 'relative';
                    store.add(this.hoverService.setupManagedHover(hoverDelegate, widget, hoverElement, { trapFocus: false }));
                    resolve();
                }));
            }
            else {
                const attachmentLabel = attachment.fullName ?? attachment.name;
                const withIcon = attachment.icon?.id ? `$(${attachment.icon.id}) ${attachmentLabel}` : attachmentLabel;
                label.setLabel(withIcon, undefined);
                ariaLabel = localize('chat.attachment', "Attached context, {0}", attachment.name);
                this.attachButtonAndDisposables(widget, index, attachment, hoverDelegate);
            }
            await Promise.all(attachmentInitPromises);
            if (store.isDisposed) {
                return;
            }
            if (resource) {
                widget.style.cursor = 'pointer';
                store.add(dom.addDisposableListener(widget, dom.EventType.CLICK, (e) => {
                    dom.EventHelper.stop(e, true);
                    if (attachment.isDirectory) {
                        this.openResource(resource, true);
                    }
                    else {
                        this.openResource(resource, false, range);
                    }
                }));
                store.add(dom.addDisposableListener(widget, dom.EventType.KEY_DOWN, (e) => {
                    const event = new StandardKeyboardEvent(e);
                    if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                        dom.EventHelper.stop(e, true);
                        if (attachment.isDirectory) {
                            this.openResource(resource, true);
                        }
                        else {
                            this.openResource(resource, false, range);
                        }
                    }
                }));
            }
            widget.tabIndex = 0;
            widget.ariaLabel = ariaLabel;
        }
        if (oldHeight !== container.offsetHeight) {
            this._onDidChangeHeight.fire();
        }
    }
    openResource(resource, isDirectory, range) {
        if (isDirectory) {
            // Reveal Directory in explorer
            this.commandService.executeCommand(revealInSideBarCommand.id, resource);
            return;
        }
        // Open file in editor
        const openTextEditorOptions = range ? { selection: range } : undefined;
        const options = {
            fromUserGesture: true,
            editorOptions: openTextEditorOptions,
        };
        this.openerService.open(resource, options);
    }
    attachButtonAndDisposables(widget, index, attachment, hoverDelegate, contextMenuOpts) {
        const store = this.attachedContextDisposables.value;
        if (!store) {
            return;
        }
        const clearButton = new Button(widget, {
            supportIcons: true,
            hoverDelegate,
            title: localize('chat.attachment.clearButton', "Remove from context"),
        });
        // If this item is rendering in place of the last attached context item, focus the clear button so the user can continue deleting attached context items with the keyboard
        if (index === Math.min(this._indexOfLastAttachedContextDeletedWithKeyboard, this.attachmentModel.size - 1)) {
            clearButton.focus();
        }
        store.add(clearButton);
        clearButton.icon = Codicon.close;
        store.add(Event.once(clearButton.onDidClick)((e) => {
            this._attachmentModel.delete(attachment.id);
            // Set focus to the next attached context item if deletion was triggered by a keystroke (vs a mouse click)
            if (dom.isKeyboardEvent(e)) {
                const event = new StandardKeyboardEvent(e);
                if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                    this._indexOfLastAttachedContextDeletedWithKeyboard = index;
                }
            }
            if (this._attachmentModel.size === 0) {
                this.focus();
            }
            this._onDidChangeContext.fire({ removed: [attachment] });
        }));
        // Context menu
        if (contextMenuOpts) {
            store.add(dom.addDisposableListener(widget, dom.EventType.CONTEXT_MENU, async (domEvent) => {
                const event = new StandardMouseEvent(dom.getWindow(domEvent), domEvent);
                dom.EventHelper.stop(domEvent, true);
                this.contextMenuService.showContextMenu({
                    contextKeyService: contextMenuOpts.contextKeyService,
                    getAnchor: () => event,
                    getActions: () => {
                        const menu = this.menuService.getMenuActions(contextMenuOpts.contextMenuId, contextMenuOpts.contextKeyService, { arg: contextMenuOpts.contextMenuArg });
                        return getFlatContextMenuActions(menu);
                    },
                });
            }));
        }
    }
    // Helper function to create and replace image
    createImageElements(buffer, widget, hoverElement) {
        const blob = new Blob([buffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const pillImg = dom.$('img.chat-attached-context-pill-image', { src: url, alt: '' });
        const pill = dom.$('div.chat-attached-context-pill', {}, pillImg);
        const existingPill = widget.querySelector('.chat-attached-context-pill');
        if (existingPill) {
            existingPill.replaceWith(pill);
        }
        const hoverImage = dom.$('img.chat-attached-context-image', { src: url, alt: '' });
        // Update hover image
        hoverElement.appendChild(hoverImage);
        hoverImage.onload = () => {
            URL.revokeObjectURL(url);
        };
    }
    async renderChatEditingSessionState(chatEditingSession, chatWidget) {
        dom.setVisibility(Boolean(chatEditingSession), this.chatEditingSessionWidgetContainer);
        if (!chatEditingSession) {
            dom.clearNode(this.chatEditingSessionWidgetContainer);
            this._chatEditsDisposables.clear();
            this._chatEditList = undefined;
            this._combinedChatEditWorkingSetEntries = [];
            this._chatEditsProgress?.dispose();
            return;
        }
        const currentChatEditingState = chatEditingSession.state.get();
        if (this._chatEditList && !chatWidget?.viewModel?.requestInProgress && (currentChatEditingState === 2 /* ChatEditingSessionState.Idle */ || currentChatEditingState === 0 /* ChatEditingSessionState.Initial */)) {
            this._chatEditsProgress?.stop();
        }
        // Summary of number of files changed
        const innerContainer = this.chatEditingSessionWidgetContainer.querySelector('.chat-editing-session-container.show-file-icons') ?? dom.append(this.chatEditingSessionWidgetContainer, $('.chat-editing-session-container.show-file-icons'));
        const seenEntries = new ResourceSet();
        let entries = chatEditingSession?.entries.get().map((entry) => {
            seenEntries.add(entry.modifiedURI);
            return {
                reference: entry.modifiedURI,
                state: entry.state.get(),
                kind: 'reference',
            };
        }) ?? [];
        for (const attachment of this.attachmentModel.attachments) {
            if (attachment.isFile && URI.isUri(attachment.value) && !seenEntries.has(attachment.value)) {
                entries.unshift({
                    reference: attachment.value,
                    state: 4 /* WorkingSetEntryState.Attached */,
                    kind: 'reference',
                });
                seenEntries.add(attachment.value);
            }
        }
        for (const [file, state] of chatEditingSession.workingSet.entries()) {
            if (!seenEntries.has(file)) {
                entries.unshift({
                    reference: file,
                    state: state.state,
                    description: state.description,
                    kind: 'reference',
                });
                seenEntries.add(file);
            }
        }
        // Factor file variables that are part of the user query into the working set
        for (const part of chatWidget?.parsedInput.parts ?? []) {
            if (part instanceof ChatRequestDynamicVariablePart && part.isFile && URI.isUri(part.data) && !seenEntries.has(part.data)) {
                entries.unshift({
                    reference: part.data,
                    state: 4 /* WorkingSetEntryState.Attached */,
                    kind: 'reference',
                });
            }
        }
        entries.sort((a, b) => {
            if (a.kind === 'reference' && b.kind === 'reference') {
                if (a.state === b.state || a.state === undefined || b.state === undefined) {
                    return a.reference.toString().localeCompare(b.reference.toString());
                }
                return a.state - b.state;
            }
            return 0;
        });
        let remainingFileEntriesBudget = this.chatEditingService.editingSessionFileLimit;
        const overviewRegion = innerContainer.querySelector('.chat-editing-session-overview') ?? dom.append(innerContainer, $('.chat-editing-session-overview'));
        const overviewText = overviewRegion.querySelector('span') ?? dom.append(overviewRegion, $('span'));
        overviewText.textContent = localize('chatEditingSession.workingSet', 'Working Set');
        // Record the number of entries that the user wanted to add to the working set
        this._attemptedWorkingSetEntriesCount = entries.length;
        if (entries.length === 1) {
            overviewText.textContent += ' ' + localize('chatEditingSession.oneFile', '(1 file)');
        }
        else if (entries.length >= remainingFileEntriesBudget) {
            // The user tried to attach too many files, we have to drop anything after the limit
            const entriesToPreserve = [];
            const newEntries = [];
            for (let i = 0; i < entries.length; i += 1) {
                const entry = entries[i];
                // If this entry was here earlier and is still here, we should prioritize preserving it
                // so that nothing existing gets evicted
                const currentEntryUri = entry.kind === 'reference' && URI.isUri(entry.reference) ? entry.reference : undefined;
                if (this._combinedChatEditWorkingSetEntries.find((e) => e.toString() === currentEntryUri?.toString()) && remainingFileEntriesBudget > 0) {
                    entriesToPreserve.push(entry);
                    remainingFileEntriesBudget -= 1;
                }
                else {
                    newEntries.push(entry);
                }
            }
            const newEntriesThatFit = newEntries.slice(0, remainingFileEntriesBudget);
            entries = [...entriesToPreserve, ...newEntriesThatFit];
            remainingFileEntriesBudget -= newEntriesThatFit.length;
        }
        if (entries.length > 1) {
            overviewText.textContent += ' ' + localize('chatEditingSession.manyFiles', '({0} files)', entries.length);
        }
        // Clear out the previous actions (if any)
        this._chatEditsActionsDisposables.clear();
        // Chat editing session actions
        const actionsContainer = overviewRegion.querySelector('.chat-editing-session-actions') ?? dom.append(overviewRegion, $('.chat-editing-session-actions'));
        this._chatEditsActionsDisposables.add(this.instantiationService.createInstance(MenuWorkbenchButtonBar, actionsContainer, MenuId.ChatEditingWidgetToolbar, {
            telemetrySource: this.options.menus.telemetrySource,
            menuOptions: {
                arg: { sessionId: chatEditingSession.chatSessionId },
            },
            buttonConfigProvider: (action) => {
                if (action.id === ChatEditingShowChangesAction.ID || action.id === ChatEditingSaveAllAction.ID) {
                    return { showIcon: true, showLabel: false, isSecondary: true };
                }
                return undefined;
            }
        }));
        if (!chatEditingSession) {
            return;
        }
        if (currentChatEditingState === 1 /* ChatEditingSessionState.StreamingEdits */ || chatWidget?.viewModel?.requestInProgress) {
            this._chatEditsProgress ??= new ProgressBar(innerContainer);
            this._chatEditsProgress?.infinite().show(500);
        }
        // Working set
        const workingSetContainer = innerContainer.querySelector('.chat-editing-session-list') ?? dom.append(innerContainer, $('.chat-editing-session-list'));
        if (!this._chatEditList) {
            this._chatEditList = this._chatEditsListPool.get();
            const list = this._chatEditList.object;
            this._chatEditsDisposables.add(this._chatEditList);
            this._chatEditsDisposables.add(list.onDidFocus(() => {
                this._onDidFocus.fire();
            }));
            this._chatEditsDisposables.add(list.onDidOpen((e) => {
                if (e.element?.kind === 'reference' && URI.isUri(e.element.reference)) {
                    const modifiedFileUri = e.element.reference;
                    const entry = chatEditingSession.entries.get().find(entry => entry.modifiedURI.toString() === modifiedFileUri.toString());
                    const diffInfo = entry?.diffInfo.get();
                    const range = diffInfo?.changes.at(0)?.modified.toExclusiveRange();
                    this.editorService.openEditor({
                        resource: modifiedFileUri,
                        options: {
                            ...e.editorOptions,
                            selection: range,
                        }
                    }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
                }
            }));
            this._chatEditsDisposables.add(addDisposableListener(list.getHTMLElement(), 'click', e => {
                if (!this.hasFocus()) {
                    this._onDidFocus.fire();
                }
            }, true));
            dom.append(workingSetContainer, list.getHTMLElement());
            dom.append(innerContainer, workingSetContainer);
        }
        const maxItemsShown = 6;
        const itemsShown = Math.min(entries.length, maxItemsShown);
        const height = itemsShown * 22;
        const list = this._chatEditList.object;
        list.layout(height);
        list.getHTMLElement().style.height = `${height}px`;
        list.splice(0, list.length, entries);
        this._combinedChatEditWorkingSetEntries = coalesce(entries.map((e) => e.kind === 'reference' && URI.isUri(e.reference) ? e.reference : undefined));
        const addFilesElement = innerContainer.querySelector('.chat-editing-session-toolbar-actions') ?? dom.append(innerContainer, $('.chat-editing-session-toolbar-actions'));
        const button = this._chatEditsActionsDisposables.add(new Button(addFilesElement, {
            supportIcons: true,
            secondary: true
        }));
        button.enabled = remainingFileEntriesBudget > 0;
        button.label = localize('chatAddFiles', '{0} Add Files...', '$(add)');
        button.setTitle(button.enabled ? localize('addFiles.label', 'Add files to your working set') : localize('addFilesDisabled.label', 'You have reached the maximum number of files that can be added to the working set.'));
        this._chatEditsActionsDisposables.add(button.onDidClick(() => {
            this.commandService.executeCommand('workbench.action.chat.editing.attachFiles', { widget: chatWidget });
        }));
        dom.append(addFilesElement, button.element);
    }
    async renderFollowups(items, response) {
        if (!this.options.renderFollowups) {
            return;
        }
        this.followupsDisposables.clear();
        dom.clearNode(this.followupsContainer);
        if (items && items.length > 0) {
            this.followupsDisposables.add(this.instantiationService.createInstance(ChatFollowups, this.followupsContainer, items, this.location, undefined, followup => this._onDidAcceptFollowup.fire({ followup, response })));
        }
        this._onDidChangeHeight.fire();
    }
    get contentHeight() {
        const data = this.getLayoutData();
        return data.followupsHeight + data.inputPartEditorHeight + data.inputPartVerticalPadding + data.inputEditorBorder + data.attachmentsHeight + data.toolbarsHeight + data.chatEditingStateHeight;
    }
    layout(height, width) {
        this.cachedDimensions = new dom.Dimension(width, height);
        return this._layout(height, width);
    }
    _layout(height, width, allowRecurse = true) {
        const data = this.getLayoutData();
        const inputEditorHeight = Math.min(data.inputPartEditorHeight, height - data.followupsHeight - data.attachmentsHeight - data.inputPartVerticalPadding - data.toolbarsHeight);
        const followupsWidth = width - data.inputPartHorizontalPadding;
        this.followupsContainer.style.width = `${followupsWidth}px`;
        this._inputPartHeight = data.inputPartVerticalPadding + data.followupsHeight + inputEditorHeight + data.inputEditorBorder + data.attachmentsHeight + data.toolbarsHeight + data.chatEditingStateHeight;
        this._followupsHeight = data.followupsHeight;
        const initialEditorScrollWidth = this._inputEditor.getScrollWidth();
        const newEditorWidth = width - data.inputPartHorizontalPadding - data.editorBorder - data.inputPartHorizontalPaddingInside - data.toolbarsWidth - data.sideToolbarWidth;
        const newDimension = { width: newEditorWidth, height: inputEditorHeight };
        if (!this.previousInputEditorDimension || (this.previousInputEditorDimension.width !== newDimension.width || this.previousInputEditorDimension.height !== newDimension.height)) {
            // This layout call has side-effects that are hard to understand. eg if we are calling this inside a onDidChangeContent handler, this can trigger the next onDidChangeContent handler
            // to be invoked, and we have a lot of these on this editor. Only doing a layout this when the editor size has actually changed makes it much easier to follow.
            this._inputEditor.layout(newDimension);
            this.previousInputEditorDimension = newDimension;
        }
        if (allowRecurse && initialEditorScrollWidth < 10) {
            // This is probably the initial layout. Now that the editor is layed out with its correct width, it should report the correct contentHeight
            return this._layout(height, width, false);
        }
    }
    getLayoutData() {
        const executeToolbarWidth = this.cachedExecuteToolbarWidth = this.executeToolbar.getItemsWidth();
        const inputToolbarWidth = this.cachedInputToolbarWidth = this.inputActionsToolbar.getItemsWidth();
        const executeToolbarPadding = (this.executeToolbar.getItemsLength() - 1) * 4;
        const inputToolbarPadding = this.inputActionsToolbar.getItemsLength() ? (this.inputActionsToolbar.getItemsLength() - 1) * 4 : 0;
        return {
            inputEditorBorder: 2,
            followupsHeight: this.followupsContainer.offsetHeight,
            inputPartEditorHeight: Math.min(this._inputEditor.getContentHeight(), this.inputEditorMaxHeight),
            inputPartHorizontalPadding: this.options.renderStyle === 'compact' ? 16 : 32,
            inputPartVerticalPadding: this.options.renderStyle === 'compact' ? 12 : 28,
            attachmentsHeight: this.attachedContextContainer.offsetHeight,
            editorBorder: 2,
            inputPartHorizontalPaddingInside: 12,
            toolbarsWidth: this.options.renderStyle === 'compact' ? executeToolbarWidth + executeToolbarPadding + inputToolbarWidth + inputToolbarPadding : 0,
            toolbarsHeight: this.options.renderStyle === 'compact' ? 0 : 22,
            chatEditingStateHeight: this.chatEditingSessionWidgetContainer.offsetHeight,
            sideToolbarWidth: this.inputSideToolbarContainer ? dom.getTotalWidth(this.inputSideToolbarContainer) + 4 /*gap*/ : 0,
        };
    }
    getViewState() {
        return this.getInputState();
    }
    saveState() {
        this.saveCurrentValue(this.getInputState());
        const inputHistory = [...this.history];
        this.historyService.saveHistory(this.location, inputHistory);
    }
};
ChatInputPart = ChatInputPart_1 = __decorate([
    __param(3, IChatWidgetHistoryService),
    __param(4, IModelService),
    __param(5, IInstantiationService),
    __param(6, IContextKeyService),
    __param(7, IContextMenuService),
    __param(8, IConfigurationService),
    __param(9, IKeybindingService),
    __param(10, IAccessibilityService),
    __param(11, ILanguageModelsService),
    __param(12, ILogService),
    __param(13, IHoverService),
    __param(14, IFileService),
    __param(15, ICommandService),
    __param(16, IEditorService),
    __param(17, IOpenerService),
    __param(18, IChatEditingService),
    __param(19, IMenuService),
    __param(20, ILanguageService),
    __param(21, IThemeService)
], ChatInputPart);
export { ChatInputPart };
const historyKeyFn = (entry) => JSON.stringify(entry);
function getLastPosition(model) {
    return { lineNumber: model.getLineCount(), column: model.getLineLength(model.getLineCount()) + 1 };
}
// This does seems like a lot just to customize an item with dropdown. This whole class exists just because we need an
// onDidChange listener on the submenu, which is apparently not needed in other cases.
let ChatSubmitDropdownActionItem = class ChatSubmitDropdownActionItem extends DropdownWithPrimaryActionViewItem {
    constructor(action, dropdownAction, options, menuService, contextMenuService, chatAgentService, contextKeyService, keybindingService, notificationService, themeService, accessibilityService) {
        super(action, dropdownAction, [], '', {
            ...options,
            getKeyBinding: (action) => keybindingService.lookupKeybinding(action.id, contextKeyService)
        }, contextMenuService, keybindingService, notificationService, contextKeyService, themeService, accessibilityService);
        const menu = menuService.createMenu(MenuId.ChatExecuteSecondary, contextKeyService);
        const setActions = () => {
            const secondary = getFlatActionBarActions(menu.getActions({ shouldForwardArgs: true }));
            const secondaryAgent = chatAgentService.getSecondaryAgent();
            if (secondaryAgent) {
                secondary.forEach(a => {
                    if (a.id === ChatSubmitSecondaryAgentAction.ID) {
                        a.label = localize('chat.submitToSecondaryAgent', "Send to @{0}", secondaryAgent.name);
                    }
                    return a;
                });
            }
            this.update(dropdownAction, secondary);
        };
        setActions();
        this._register(menu.onDidChange(() => setActions()));
    }
};
ChatSubmitDropdownActionItem = __decorate([
    __param(3, IMenuService),
    __param(4, IContextMenuService),
    __param(5, IChatAgentService),
    __param(6, IContextKeyService),
    __param(7, IKeybindingService),
    __param(8, INotificationService),
    __param(9, IThemeService),
    __param(10, IAccessibilityService)
], ChatSubmitDropdownActionItem);
let ModelPickerActionViewItem = class ModelPickerActionViewItem extends MenuEntryActionViewItem {
    constructor(action, currentLanguageModel, delegate, options, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, _languageModelsService, _accessibilityService) {
        super(action, options, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, _accessibilityService);
        this.currentLanguageModel = currentLanguageModel;
        this.delegate = delegate;
        this._languageModelsService = _languageModelsService;
        this._register(delegate.onDidChangeModel(modelId => {
            this.currentLanguageModel = modelId;
            this.updateLabel();
        }));
    }
    async onClick(event) {
        this._openContextMenu();
    }
    render(container) {
        super.render(container);
        container.classList.add('chat-modelPicker-item');
        // TODO@roblourens this should be a DropdownMenuActionViewItem, but we can't customize how it's rendered yet.
        this._register(dom.addDisposableListener(container, dom.EventType.KEY_UP, e => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                this._openContextMenu();
            }
        }));
    }
    updateLabel() {
        if (this.label) {
            const model = this._languageModelsService.lookupLanguageModel(this.currentLanguageModel);
            if (model) {
                dom.reset(this.label, dom.$('span.chat-model-label', undefined, model.name), ...renderLabelWithIcons(`$(chevron-down)`));
            }
        }
    }
    _openContextMenu() {
        const setLanguageModelAction = (id, modelMetadata) => {
            return {
                id,
                label: modelMetadata.name,
                tooltip: '',
                class: undefined,
                enabled: true,
                checked: id === this.currentLanguageModel,
                run: () => {
                    this.currentLanguageModel = id;
                    this.updateLabel();
                    this.delegate.setModel(id);
                }
            };
        };
        const models = this._languageModelsService.getLanguageModelIds()
            .map(modelId => ({ id: modelId, model: this._languageModelsService.lookupLanguageModel(modelId) }))
            .filter(entry => entry.model?.isUserSelectable);
        models.sort((a, b) => a.model.name.localeCompare(b.model.name));
        this._contextMenuService.showContextMenu({
            getAnchor: () => this.element,
            getActions: () => models.map(entry => setLanguageModelAction(entry.id, entry.model)),
        });
    }
};
ModelPickerActionViewItem = __decorate([
    __param(4, IKeybindingService),
    __param(5, INotificationService),
    __param(6, IContextKeyService),
    __param(7, IThemeService),
    __param(8, IContextMenuService),
    __param(9, ILanguageModelsService),
    __param(10, IAccessibilityService)
], ModelPickerActionViewItem);
const chatInputEditorContainerSelector = '.interactive-input-editor';
setupSimpleEditorSelectionStyling(chatInputEditorContainerSelector);
