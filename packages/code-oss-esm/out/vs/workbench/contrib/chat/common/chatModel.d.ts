import { Event } from '../../../../base/common/event.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI, UriComponents, UriDto } from '../../../../base/common/uri.js';
import { IOffsetRange } from '../../../../editor/common/core/offsetRange.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { Location, TextEdit } from '../../../../editor/common/languages.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ChatAgentLocation, IChatAgentCommand, IChatAgentData, IChatAgentResult, IChatAgentService, IChatWelcomeMessageContent } from './chatAgents.js';
import { IParsedChatRequest } from './chatParserTypes.js';
import { ChatAgentVoteDirection, ChatAgentVoteDownReason, IChatAgentMarkdownContentWithVulnerability, IChatCodeCitation, IChatCommandButton, IChatConfirmation, IChatContentInlineReference, IChatContentReference, IChatFollowup, IChatLocationData, IChatMarkdownContent, IChatProgress, IChatProgressMessage, IChatResponseCodeblockUriPart, IChatResponseProgressFileTreeData, IChatTask, IChatTextEdit, IChatToolInvocation, IChatToolInvocationSerialized, IChatTreeData, IChatUsedContext, IChatWarningMessage } from './chatService.js';
import { IChatRequestVariableValue } from './chatVariables.js';
export interface IBaseChatRequestVariableEntry {
    id: string;
    fullName?: string;
    icon?: ThemeIcon;
    name: string;
    modelDescription?: string;
    range?: IOffsetRange;
    value: IChatRequestVariableValue;
    references?: IChatContentReference[];
    mimeType?: string;
    kind?: never;
    /**
     * True if the variable has a value vs being a reference to a variable
     */
    isDynamic?: boolean;
    isFile?: boolean;
    isDirectory?: boolean;
    isTool?: boolean;
    isImage?: boolean;
}
export interface IChatRequestImplicitVariableEntry extends Omit<IBaseChatRequestVariableEntry, 'kind'> {
    readonly kind: 'implicit';
    readonly isDynamic: true;
    readonly isFile: true;
    readonly value: URI | Location | undefined;
    readonly isSelection: boolean;
    enabled: boolean;
}
export interface ISymbolVariableEntry extends Omit<IBaseChatRequestVariableEntry, 'kind'> {
    readonly kind: 'symbol';
    readonly isDynamic: true;
    readonly value: Location;
}
export interface ICommandResultVariableEntry extends Omit<IBaseChatRequestVariableEntry, 'kind'> {
    readonly kind: 'command';
    readonly isDynamic: true;
}
export type IChatRequestVariableEntry = IChatRequestImplicitVariableEntry | ISymbolVariableEntry | ICommandResultVariableEntry | IBaseChatRequestVariableEntry;
export declare function isImplicitVariableEntry(obj: IChatRequestVariableEntry): obj is IChatRequestImplicitVariableEntry;
export declare function isChatRequestVariableEntry(obj: unknown): obj is IChatRequestVariableEntry;
export interface IChatRequestVariableData {
    variables: IChatRequestVariableEntry[];
}
export interface IChatRequestModel {
    readonly id: string;
    readonly username: string;
    readonly avatarIconUri?: URI;
    readonly session: IChatModel;
    readonly message: IParsedChatRequest;
    readonly attempt: number;
    readonly variableData: IChatRequestVariableData;
    readonly confirmation?: string;
    readonly locationData?: IChatLocationData;
    readonly attachedContext?: IChatRequestVariableEntry[];
    readonly workingSet?: URI[];
    readonly isCompleteAddedRequest: boolean;
    readonly response?: IChatResponseModel;
    isHidden: boolean;
}
export interface IChatTextEditGroupState {
    sha1: string;
    applied: number;
}
export interface IChatTextEditGroup {
    uri: URI;
    edits: TextEdit[][];
    state?: IChatTextEditGroupState;
    kind: 'textEditGroup';
    done: boolean | undefined;
}
/**
 * Progress kinds that are included in the history of a response.
 * Excludes "internal" types that are included in history.
 */
export type IChatProgressHistoryResponseContent = IChatMarkdownContent | IChatAgentMarkdownContentWithVulnerability | IChatResponseCodeblockUriPart | IChatTreeData | IChatContentInlineReference | IChatProgressMessage | IChatCommandButton | IChatWarningMessage | IChatTask | IChatTextEditGroup | IChatConfirmation;
/**
 * "Normal" progress kinds that are rendered as parts of the stream of content.
 */
export type IChatProgressResponseContent = IChatProgressHistoryResponseContent | IChatToolInvocation | IChatToolInvocationSerialized;
export declare function toChatHistoryContent(content: ReadonlyArray<IChatProgressResponseContent>): IChatProgressHistoryResponseContent[];
export type IChatProgressRenderableResponseContent = Exclude<IChatProgressResponseContent, IChatContentInlineReference | IChatAgentMarkdownContentWithVulnerability | IChatResponseCodeblockUriPart>;
export interface IResponse {
    readonly value: ReadonlyArray<IChatProgressResponseContent>;
    getMarkdown(): string;
    toString(): string;
}
export interface IChatResponseModel {
    readonly onDidChange: Event<void>;
    readonly id: string;
    readonly requestId: string;
    readonly username: string;
    readonly avatarIcon?: ThemeIcon | URI;
    readonly session: IChatModel;
    readonly agent?: IChatAgentData;
    readonly usedContext: IChatUsedContext | undefined;
    readonly contentReferences: ReadonlyArray<IChatContentReference>;
    readonly codeCitations: ReadonlyArray<IChatCodeCitation>;
    readonly progressMessages: ReadonlyArray<IChatProgressMessage>;
    readonly slashCommand?: IChatAgentCommand;
    readonly agentOrSlashCommandDetected: boolean;
    readonly response: IResponse;
    readonly isComplete: boolean;
    readonly isCanceled: boolean;
    readonly isHidden: boolean;
    readonly isCompleteAddedRequest: boolean;
    /** A stale response is one that has been persisted and rehydrated, so e.g. Commands that have their arguments stored in the EH are gone. */
    readonly isStale: boolean;
    readonly vote: ChatAgentVoteDirection | undefined;
    readonly voteDownReason: ChatAgentVoteDownReason | undefined;
    readonly followups?: IChatFollowup[] | undefined;
    readonly result?: IChatAgentResult;
    setVote(vote: ChatAgentVoteDirection): void;
    setVoteDownReason(reason: ChatAgentVoteDownReason | undefined): void;
    setEditApplied(edit: IChatTextEditGroup, editCount: number): boolean;
}
export declare class ChatRequestModel implements IChatRequestModel {
    private _session;
    readonly message: IParsedChatRequest;
    private _variableData;
    private _attempt;
    private _confirmation?;
    private _locationData?;
    private _attachedContext?;
    private _workingSet?;
    readonly isCompleteAddedRequest: boolean;
    private static nextId;
    response: ChatResponseModel | undefined;
    readonly id: string;
    get session(): ChatModel;
    isHidden: boolean;
    get username(): string;
    get avatarIconUri(): URI | undefined;
    get attempt(): number;
    get variableData(): IChatRequestVariableData;
    set variableData(v: IChatRequestVariableData);
    get confirmation(): string | undefined;
    get locationData(): IChatLocationData | undefined;
    get attachedContext(): IChatRequestVariableEntry[] | undefined;
    get workingSet(): URI[] | undefined;
    constructor(_session: ChatModel, message: IParsedChatRequest, _variableData: IChatRequestVariableData, _attempt?: number, _confirmation?: string | undefined, _locationData?: IChatLocationData | undefined, _attachedContext?: IChatRequestVariableEntry[] | undefined, _workingSet?: URI[] | undefined, isCompleteAddedRequest?: boolean);
    adoptTo(session: ChatModel): void;
}
export declare class Response extends Disposable implements IResponse {
    private _onDidChangeValue;
    get onDidChangeValue(): Event<void>;
    private _responseParts;
    /**
     * A stringified representation of response data which might be presented to a screenreader or used when copying a response.
     */
    private _responseRepr;
    /**
     * Just the markdown content of the response, used for determining the rendering rate of markdown
     */
    private _markdownContent;
    private _citations;
    get value(): IChatProgressResponseContent[];
    constructor(value: IMarkdownString | ReadonlyArray<IMarkdownString | IChatResponseProgressFileTreeData | IChatContentInlineReference | IChatAgentMarkdownContentWithVulnerability | IChatResponseCodeblockUriPart>);
    toString(): string;
    /**
     * _Just_ the content of markdown parts in the response
     */
    getMarkdown(): string;
    clear(): void;
    updateContent(progress: IChatProgressResponseContent | IChatTextEdit | IChatTask, quiet?: boolean): void;
    addCitation(citation: IChatCodeCitation): void;
    private _updateRepr;
}
export declare class ChatResponseModel extends Disposable implements IChatResponseModel {
    private _session;
    private _agent;
    private _slashCommand;
    readonly requestId: string;
    private _isComplete;
    private _isCanceled;
    private _vote?;
    private _voteDownReason?;
    private _result?;
    readonly isCompleteAddedRequest: boolean;
    private _isHidden;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private static nextId;
    readonly id: string;
    get session(): ChatModel;
    get isHidden(): boolean;
    get isComplete(): boolean;
    set isHidden(hidden: boolean);
    get isCanceled(): boolean;
    get vote(): ChatAgentVoteDirection | undefined;
    get voteDownReason(): ChatAgentVoteDownReason | undefined;
    get followups(): IChatFollowup[] | undefined;
    private _response;
    get response(): IResponse;
    get result(): IChatAgentResult | undefined;
    get username(): string;
    get avatarIcon(): ThemeIcon | URI | undefined;
    private _followups?;
    get agent(): IChatAgentData | undefined;
    get slashCommand(): IChatAgentCommand | undefined;
    private _agentOrSlashCommandDetected;
    get agentOrSlashCommandDetected(): boolean;
    private _usedContext;
    get usedContext(): IChatUsedContext | undefined;
    private readonly _contentReferences;
    get contentReferences(): ReadonlyArray<IChatContentReference>;
    private readonly _codeCitations;
    get codeCitations(): ReadonlyArray<IChatCodeCitation>;
    private readonly _progressMessages;
    get progressMessages(): ReadonlyArray<IChatProgressMessage>;
    private _isStale;
    get isStale(): boolean;
    constructor(_response: IMarkdownString | ReadonlyArray<IMarkdownString | IChatResponseProgressFileTreeData | IChatContentInlineReference | IChatAgentMarkdownContentWithVulnerability | IChatResponseCodeblockUriPart>, _session: ChatModel, _agent: IChatAgentData | undefined, _slashCommand: IChatAgentCommand | undefined, requestId: string, _isComplete?: boolean, _isCanceled?: boolean, _vote?: ChatAgentVoteDirection | undefined, _voteDownReason?: ChatAgentVoteDownReason | undefined, _result?: IChatAgentResult | undefined, followups?: ReadonlyArray<IChatFollowup>, isCompleteAddedRequest?: boolean, _isHidden?: boolean);
    /**
     * Apply a progress update to the actual response content.
     */
    updateContent(responsePart: IChatProgressResponseContent | IChatTextEdit, quiet?: boolean): void;
    /**
     * Apply one of the progress updates that are not part of the actual response content.
     */
    applyReference(progress: IChatUsedContext | IChatContentReference): void;
    applyCodeCitation(progress: IChatCodeCitation): void;
    setAgent(agent: IChatAgentData, slashCommand?: IChatAgentCommand): void;
    setResult(result: IChatAgentResult): void;
    complete(): void;
    cancel(): void;
    setFollowups(followups: IChatFollowup[] | undefined): void;
    setVote(vote: ChatAgentVoteDirection): void;
    setVoteDownReason(reason: ChatAgentVoteDownReason | undefined): void;
    setEditApplied(edit: IChatTextEditGroup, editCount: number): boolean;
    adoptTo(session: ChatModel): void;
}
export interface IChatModel {
    readonly onDidDispose: Event<void>;
    readonly onDidChange: Event<IChatChangeEvent>;
    readonly sessionId: string;
    readonly initState: ChatModelInitState;
    readonly initialLocation: ChatAgentLocation;
    readonly title: string;
    readonly welcomeMessage: IChatWelcomeMessageContent | undefined;
    readonly sampleQuestions: IChatFollowup[] | undefined;
    readonly requestInProgress: boolean;
    readonly inputPlaceholder?: string;
    disableRequests(requestIds: ReadonlyArray<string>): void;
    getRequests(): IChatRequestModel[];
    toExport(): IExportableChatData;
    toJSON(): ISerializableChatData;
}
export interface ISerializableChatsData {
    [sessionId: string]: ISerializableChatData;
}
export type ISerializableChatAgentData = UriDto<IChatAgentData>;
export interface ISerializableChatRequestData {
    message: string | IParsedChatRequest;
    /** Is really like "prompt data". This is the message in the format in which the agent gets it + variable values. */
    variableData: IChatRequestVariableData;
    response: ReadonlyArray<IMarkdownString | IChatResponseProgressFileTreeData | IChatContentInlineReference | IChatAgentMarkdownContentWithVulnerability> | undefined;
    agent?: ISerializableChatAgentData;
    slashCommand?: IChatAgentCommand;
    result?: IChatAgentResult;
    followups: ReadonlyArray<IChatFollowup> | undefined;
    isCanceled: boolean | undefined;
    vote: ChatAgentVoteDirection | undefined;
    voteDownReason?: ChatAgentVoteDownReason;
    /** For backward compat: should be optional */
    usedContext?: IChatUsedContext;
    contentReferences?: ReadonlyArray<IChatContentReference>;
    codeCitations?: ReadonlyArray<IChatCodeCitation>;
}
export interface IExportableChatData {
    initialLocation: ChatAgentLocation | undefined;
    requests: ISerializableChatRequestData[];
    requesterUsername: string;
    responderUsername: string;
    requesterAvatarIconUri: UriComponents | undefined;
    responderAvatarIconUri: ThemeIcon | UriComponents | undefined;
}
export interface ISerializableChatData1 extends IExportableChatData {
    sessionId: string;
    creationDate: number;
    isImported: boolean;
    /** Indicates that this session was created in this window. Is cleared after the chat has been written to storage once. Needed to sync chat creations/deletions between empty windows. */
    isNew?: boolean;
}
export interface ISerializableChatData2 extends ISerializableChatData1 {
    version: 2;
    lastMessageDate: number;
    computedTitle: string | undefined;
}
export interface ISerializableChatData3 extends Omit<ISerializableChatData2, 'version' | 'computedTitle'> {
    version: 3;
    customTitle: string | undefined;
}
/**
 * Chat data that has been parsed and normalized to the current format.
 */
export type ISerializableChatData = ISerializableChatData3;
/**
 * Chat data that has been loaded but not normalized, and could be any format
 */
export type ISerializableChatDataIn = ISerializableChatData1 | ISerializableChatData2 | ISerializableChatData3;
/**
 * Normalize chat data from storage to the current format.
 * TODO- ChatModel#_deserialize and reviveSerializedAgent also still do some normalization and maybe that should be done in here too.
 */
export declare function normalizeSerializableChatData(raw: ISerializableChatDataIn): ISerializableChatData;
export declare function isExportableSessionData(obj: unknown): obj is IExportableChatData;
export declare function isSerializableSessionData(obj: unknown): obj is ISerializableChatData;
export type IChatChangeEvent = IChatInitEvent | IChatAddRequestEvent | IChatChangedRequestEvent | IChatRemoveRequestEvent | IChatAddResponseEvent | IChatSetAgentEvent | IChatMoveEvent | IChatSetHiddenEvent;
export interface IChatAddRequestEvent {
    kind: 'addRequest';
    request: IChatRequestModel;
}
export interface IChatChangedRequestEvent {
    kind: 'changedRequest';
    request: IChatRequestModel;
}
export interface IChatAddResponseEvent {
    kind: 'addResponse';
    response: IChatResponseModel;
}
export declare const enum ChatRequestRemovalReason {
    /**
     * "Normal" remove
     */
    Removal = 0,
    /**
     * Removed because the request will be resent
     */
    Resend = 1,
    /**
     * Remove because the request is moving to another model
     */
    Adoption = 2
}
export interface IChatRemoveRequestEvent {
    kind: 'removeRequest';
    requestId: string;
    responseId?: string;
    reason: ChatRequestRemovalReason;
}
export interface IChatSetHiddenEvent {
    kind: 'setHidden';
    hiddenRequestIds: Set<string>;
}
export interface IChatMoveEvent {
    kind: 'move';
    target: URI;
    range: IRange;
}
export interface IChatSetAgentEvent {
    kind: 'setAgent';
    agent: IChatAgentData;
    command?: IChatAgentCommand;
}
export interface IChatInitEvent {
    kind: 'initialize';
}
export declare enum ChatModelInitState {
    Created = 0,
    Initializing = 1,
    Initialized = 2
}
export declare class ChatModel extends Disposable implements IChatModel {
    private readonly initialData;
    private readonly _initialLocation;
    private readonly logService;
    private readonly chatAgentService;
    static getDefaultTitle(requests: (ISerializableChatRequestData | IChatRequestModel)[]): string;
    private readonly _onDidDispose;
    readonly onDidDispose: Event<void>;
    private readonly _onDidChange;
    readonly onDidChange: Event<IChatChangeEvent>;
    private _requests;
    private _initState;
    private _isInitializedDeferred;
    private _welcomeMessage;
    get welcomeMessage(): IChatWelcomeMessageContent | undefined;
    private _sampleQuestions;
    get sampleQuestions(): IChatFollowup[] | undefined;
    private _sessionId;
    get sessionId(): string;
    get requestInProgress(): boolean;
    get hasRequests(): boolean;
    get lastRequest(): ChatRequestModel | undefined;
    private _creationDate;
    get creationDate(): number;
    private _lastMessageDate;
    get lastMessageDate(): number;
    private get _defaultAgent();
    get requesterUsername(): string;
    get responderUsername(): string;
    private readonly _initialRequesterAvatarIconUri;
    get requesterAvatarIconUri(): URI | undefined;
    private readonly _initialResponderAvatarIconUri;
    get responderAvatarIcon(): ThemeIcon | URI | undefined;
    get initState(): ChatModelInitState;
    private _isImported;
    get isImported(): boolean;
    private _customTitle;
    get customTitle(): string | undefined;
    get title(): string;
    get initialLocation(): ChatAgentLocation;
    constructor(initialData: ISerializableChatData | IExportableChatData | undefined, _initialLocation: ChatAgentLocation, logService: ILogService, chatAgentService: IChatAgentService);
    private _deserialize;
    private reviveVariableData;
    private getParsedRequestFromString;
    startInitialize(): void;
    deinitialize(): void;
    initialize(welcomeMessage?: IChatWelcomeMessageContent, sampleQuestions?: IChatFollowup[]): void;
    setInitializationError(error: Error): void;
    waitForInitialization(): Promise<void>;
    getRequests(): ChatRequestModel[];
    private _checkpoint;
    get checkpoint(): ChatRequestModel | undefined;
    disableRequests(requestIds: ReadonlyArray<string>): void;
    addRequest(message: IParsedChatRequest, variableData: IChatRequestVariableData, attempt: number, chatAgent?: IChatAgentData, slashCommand?: IChatAgentCommand, confirmation?: string, locationData?: IChatLocationData, attachments?: IChatRequestVariableEntry[], workingSet?: URI[], isCompleteAddedRequest?: boolean): ChatRequestModel;
    setCustomTitle(title: string): void;
    updateRequest(request: ChatRequestModel, variableData: IChatRequestVariableData): void;
    adoptRequest(request: ChatRequestModel): void;
    acceptResponseProgress(request: ChatRequestModel, progress: IChatProgress, quiet?: boolean): void;
    removeRequest(id: string, reason?: ChatRequestRemovalReason): void;
    cancelRequest(request: ChatRequestModel): void;
    setResponse(request: ChatRequestModel, result: IChatAgentResult): void;
    completeResponse(request: ChatRequestModel): void;
    setFollowups(request: ChatRequestModel, followups: IChatFollowup[] | undefined): void;
    setResponseModel(request: ChatRequestModel, response: ChatResponseModel): void;
    toExport(): IExportableChatData;
    toJSON(): ISerializableChatData;
    dispose(): void;
}
export declare function updateRanges(variableData: IChatRequestVariableData, diff: number): IChatRequestVariableData;
export declare function canMergeMarkdownStrings(md1: IMarkdownString, md2: IMarkdownString): boolean;
export declare function appendMarkdownString(md1: IMarkdownString, md2: IMarkdownString | string): IMarkdownString;
export declare function getCodeCitationsMessage(citations: ReadonlyArray<IChatCodeCitation>): string;
