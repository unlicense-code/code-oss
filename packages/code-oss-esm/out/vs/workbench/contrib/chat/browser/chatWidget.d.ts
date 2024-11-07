import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ChatAgentLocation, IChatAgentCommand, IChatAgentData, IChatAgentService } from '../common/chatAgents.js';
import { IChatEditingService } from '../common/chatEditingService.js';
import { IChatModel, IChatResponseModel } from '../common/chatModel.js';
import { IParsedChatRequest } from '../common/chatParserTypes.js';
import { IChatLocationData, IChatService } from '../common/chatService.js';
import { IChatSlashCommandService } from '../common/chatSlashCommands.js';
import { ChatViewModel, IChatResponseViewModel } from '../common/chatViewModel.js';
import { IChatInputState } from '../common/chatWidgetHistoryService.js';
import { ChatTreeItem, IChatAcceptInputOptions, IChatAccessibilityService, IChatCodeBlockInfo, IChatFileTreeInfo, IChatWidget, IChatWidgetService, IChatWidgetViewContext, IChatWidgetViewOptions } from './chat.js';
import { ChatAttachmentModel } from './chatAttachmentModel.js';
import { ChatInputPart } from './chatInputPart.js';
import './media/chat.css';
import './media/chatAgentHover.css';
import './media/chatViewWelcome.css';
export interface IChatViewState {
    inputValue?: string;
    inputState?: IChatInputState;
    selectedLanguageModelId?: string;
}
export interface IChatWidgetStyles {
    listForeground: string;
    listBackground: string;
    overlayBackground: string;
    inputEditorBackground: string;
    resultEditorBackground: string;
}
export interface IChatWidgetContrib extends IDisposable {
    readonly id: string;
    /**
     * A piece of state which is related to the input editor of the chat widget
     */
    getInputState?(): any;
    /**
     * Called with the result of getInputState when navigating input history.
     */
    setInputState?(s: any): void;
}
export interface IChatWidgetLocationOptions {
    location: ChatAgentLocation;
    resolveData?(): IChatLocationData | undefined;
}
export declare function isQuickChat(widget: IChatWidget): boolean;
export declare class ChatWidget extends Disposable implements IChatWidget {
    private readonly viewOptions;
    private readonly styles;
    private readonly contextKeyService;
    private readonly instantiationService;
    private readonly chatService;
    private readonly chatAgentService;
    private readonly chatWidgetService;
    private readonly contextMenuService;
    private readonly chatAccessibilityService;
    private readonly logService;
    private readonly themeService;
    private readonly chatSlashCommandService;
    private readonly chatEditingService;
    private readonly storageService;
    private readonly telemetryService;
    static readonly CONTRIBS: {
        new (...args: [IChatWidget, ...any]): IChatWidgetContrib;
    }[];
    private readonly _onDidSubmitAgent;
    readonly onDidSubmitAgent: Event<{
        agent: IChatAgentData;
        slashCommand?: IChatAgentCommand;
    }>;
    private _onDidChangeAgent;
    readonly onDidChangeAgent: Event<{
        agent: IChatAgentData;
        slashCommand?: IChatAgentCommand;
    }>;
    private _onDidFocus;
    readonly onDidFocus: Event<void>;
    private _onDidChangeViewModel;
    readonly onDidChangeViewModel: Event<void>;
    private _onDidScroll;
    readonly onDidScroll: Event<void>;
    private _onDidClear;
    readonly onDidClear: Event<void>;
    private _onDidAcceptInput;
    readonly onDidAcceptInput: Event<void>;
    private _onDidHide;
    readonly onDidHide: Event<void>;
    private _onDidChangeParsedInput;
    readonly onDidChangeParsedInput: Event<void>;
    private readonly _onWillMaybeChangeHeight;
    readonly onWillMaybeChangeHeight: Event<void>;
    private _onDidChangeHeight;
    readonly onDidChangeHeight: Event<number>;
    private readonly _onDidChangeContentHeight;
    readonly onDidChangeContentHeight: Event<void>;
    private contribs;
    private tree;
    private renderer;
    private readonly _codeBlockModelCollection;
    private inputPart;
    private editorOptions;
    private listContainer;
    private container;
    private welcomeMessageContainer;
    private persistedWelcomeMessage;
    private bodyDimension;
    private visibleChangeCount;
    private requestInProgress;
    private agentInInput;
    private _visible;
    get visible(): boolean;
    private previousTreeScrollHeight;
    /**
     * Whether the list is scroll-locked to the bottom. Initialize to true so that we can scroll to the bottom on first render.
     * The initial render leads to a lot of `onDidChangeTreeContentHeight` as the renderer works out the real heights of rows.
     */
    private scrollLock;
    private readonly viewModelDisposables;
    private _viewModel;
    private set viewModel(value);
    get viewModel(): ChatViewModel | undefined;
    private parsedChatRequest;
    get parsedInput(): IParsedChatRequest;
    get scopedContextKeyService(): IContextKeyService;
    private readonly _location;
    get location(): ChatAgentLocation;
    readonly viewContext: IChatWidgetViewContext;
    constructor(location: ChatAgentLocation | IChatWidgetLocationOptions, _viewContext: IChatWidgetViewContext | undefined, viewOptions: IChatWidgetViewOptions, styles: IChatWidgetStyles, codeEditorService: ICodeEditorService, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, chatService: IChatService, chatAgentService: IChatAgentService, chatWidgetService: IChatWidgetService, contextMenuService: IContextMenuService, chatAccessibilityService: IChatAccessibilityService, logService: ILogService, themeService: IThemeService, chatSlashCommandService: IChatSlashCommandService, chatEditingService: IChatEditingService, storageService: IStorageService, telemetryService: ITelemetryService);
    private _lastSelectedAgent;
    set lastSelectedAgent(agent: IChatAgentData | undefined);
    get lastSelectedAgent(): IChatAgentData | undefined;
    get supportsFileReferences(): boolean;
    get input(): ChatInputPart;
    get inputEditor(): ICodeEditor;
    get inputUri(): URI;
    get contentHeight(): number;
    get attachmentModel(): ChatAttachmentModel;
    render(parent: HTMLElement): void;
    getContrib<T extends IChatWidgetContrib>(id: string): T | undefined;
    focusInput(): void;
    hasInputFocus(): boolean;
    refreshParsedInput(): void;
    getSibling(item: ChatTreeItem, type: 'next' | 'previous'): ChatTreeItem | undefined;
    clear(): void;
    private onDidChangeItems;
    private renderWelcomeViewContentIfNeeded;
    private renderChatEditingSessionState;
    private renderFollowups;
    setVisible(visible: boolean): void;
    private createList;
    private onContextMenu;
    private onDidChangeTreeContentHeight;
    private createInput;
    private onDidStyleChange;
    setModel(model: IChatModel, viewState: IChatViewState): void;
    getFocus(): ChatTreeItem | undefined;
    reveal(item: ChatTreeItem, relativeTop?: number): void;
    focus(item: ChatTreeItem): void;
    refilter(): void;
    setInputPlaceholder(placeholder: string): void;
    resetInputPlaceholder(): void;
    setInput(value?: string): void;
    getInput(): string;
    logInputHistory(): void;
    acceptInput(query?: string, options?: IChatAcceptInputOptions): Promise<IChatResponseModel | undefined>;
    acceptInputWithPrefix(prefix: string): Promise<void>;
    private collectInputState;
    private _acceptInput;
    getCodeBlockInfosForResponse(response: IChatResponseViewModel): IChatCodeBlockInfo[];
    getCodeBlockInfoForEditor(uri: URI): IChatCodeBlockInfo | undefined;
    getFileTreeInfosForResponse(response: IChatResponseViewModel): IChatFileTreeInfo[];
    getLastFocusedFileTreeForResponse(response: IChatResponseViewModel): IChatFileTreeInfo | undefined;
    focusLastMessage(): void;
    layout(height: number, width: number): void;
    private _dynamicMessageLayoutData?;
    setDynamicChatTreeItemLayout(numOfChatTreeItems: number, maxHeight: number): void;
    updateDynamicChatTreeItemLayout(numOfChatTreeItems: number, maxHeight: number): void;
    get isDynamicChatTreeItemLayoutEnabled(): boolean;
    set isDynamicChatTreeItemLayoutEnabled(value: boolean);
    layoutDynamicChatTreeItemMode(): void;
    saveState(): void;
    getViewState(): IChatViewState;
    private updateChatInputContext;
}
export declare class ChatWidgetService extends Disposable implements IChatWidgetService {
    readonly _serviceBrand: undefined;
    private _widgets;
    private _lastFocusedWidget;
    private readonly _onDidAddWidget;
    readonly onDidAddWidget: Event<IChatWidget>;
    get lastFocusedWidget(): IChatWidget | undefined;
    getAllWidgets(location: ChatAgentLocation): ReadonlyArray<IChatWidget>;
    getWidgetByInputUri(uri: URI): ChatWidget | undefined;
    getWidgetByLocation(location: ChatAgentLocation): ChatWidget[];
    getWidgetBySessionId(sessionId: string): ChatWidget | undefined;
    private setLastFocusedWidget;
    register(newWidget: ChatWidget): IDisposable;
}
