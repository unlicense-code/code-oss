import { CancellationToken, CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { IObservable, ITransaction } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IDocumentDiff } from '../../../../editor/common/diff/documentDiffProvider.js';
import { TextEdit } from '../../../../editor/common/languages.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IChatResponseModel } from './chatModel.js';
export declare const IChatEditingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatEditingService>;
export interface IChatEditingService {
    _serviceBrand: undefined;
    readonly onDidCreateEditingSession: Event<IChatEditingSession>;
    /**
     * emitted when a session is created, changed or disposed
     */
    readonly onDidChangeEditingSession: Event<void>;
    readonly currentEditingSessionObs: IObservable<IChatEditingSession | null>;
    readonly currentEditingSession: IChatEditingSession | null;
    readonly currentAutoApplyOperation: CancellationTokenSource | null;
    readonly editingSessionFileLimit: number;
    startOrContinueEditingSession(chatSessionId: string, options?: {
        silent: boolean;
    }): Promise<IChatEditingSession>;
    getEditingSession(resource: URI): IChatEditingSession | null;
    createSnapshot(requestId: string): void;
    getSnapshotUri(requestId: string, uri: URI): URI | undefined;
    restoreSnapshot(requestId: string | undefined): Promise<void>;
    hasRelatedFilesProviders(): boolean;
    registerRelatedFilesProvider(handle: number, provider: IChatRelatedFilesProvider): IDisposable;
    getRelatedFiles(chatSessionId: string, prompt: string, token: CancellationToken): Promise<{
        group: string;
        files: IChatRelatedFile[];
    }[] | undefined>;
}
export interface IChatRequestDraft {
    readonly prompt: string;
    readonly files: readonly URI[];
}
export interface IChatRelatedFileProviderMetadata {
    readonly description: string;
}
export interface IChatRelatedFile {
    readonly uri: URI;
    readonly description: string;
}
export interface IChatRelatedFilesProvider {
    readonly description: string;
    provideRelatedFiles(chatRequest: IChatRequestDraft, token: CancellationToken): Promise<IChatRelatedFile[] | undefined>;
}
export interface WorkingSetDisplayMetadata {
    state: WorkingSetEntryState;
    description?: string;
}
export interface IChatEditingSession {
    readonly chatSessionId: string;
    readonly onDidChange: Event<ChatEditingSessionChangeType>;
    readonly onDidDispose: Event<void>;
    readonly state: IObservable<ChatEditingSessionState>;
    readonly entries: IObservable<readonly IModifiedFileEntry[]>;
    readonly hiddenRequestIds: IObservable<readonly string[]>;
    readonly workingSet: ResourceMap<WorkingSetDisplayMetadata>;
    readonly isVisible: boolean;
    addFileToWorkingSet(uri: URI, description?: string, kind?: WorkingSetEntryState.Transient | WorkingSetEntryState.Suggested): void;
    show(): Promise<void>;
    remove(...uris: URI[]): void;
    accept(...uris: URI[]): Promise<void>;
    reject(...uris: URI[]): Promise<void>;
    /**
     * Will lead to this object getting disposed
     */
    stop(): Promise<void>;
    undoInteraction(): Promise<void>;
    redoInteraction(): Promise<void>;
}
export declare const enum WorkingSetEntryState {
    Modified = 0,
    Accepted = 1,
    Rejected = 2,
    Transient = 3,
    Attached = 4,
    Sent = 5,// TODO@joyceerhl remove this
    Suggested = 6
}
export declare const enum ChatEditingSessionChangeType {
    WorkingSet = 0,
    Other = 1
}
export interface IModifiedFileEntry {
    readonly originalURI: URI;
    readonly originalModel: ITextModel;
    readonly modifiedURI: URI;
    readonly state: IObservable<WorkingSetEntryState>;
    readonly isCurrentlyBeingModified: IObservable<boolean>;
    readonly rewriteRatio: IObservable<number>;
    readonly diffInfo: IObservable<IDocumentDiff>;
    readonly lastModifyingRequestId: string;
    accept(transaction: ITransaction | undefined): Promise<void>;
    reject(transaction: ITransaction | undefined): Promise<void>;
}
export interface IChatEditingSessionStream {
    textEdits(resource: URI, textEdits: TextEdit[], isLastEdits: boolean, responseModel: IChatResponseModel): void;
}
export declare const enum ChatEditingSessionState {
    Initial = 0,
    StreamingEdits = 1,
    Idle = 2,
    Disposed = 3
}
export declare const CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME = "chat-editing-multi-diff-source";
export declare const chatEditingWidgetFileStateContextKey: RawContextKey<WorkingSetEntryState>;
export declare const decidedChatEditingResourceContextKey: RawContextKey<string[]>;
export declare const chatEditingResourceContextKey: RawContextKey<string | undefined>;
export declare const inChatEditingSessionContextKey: RawContextKey<boolean | undefined>;
export declare const applyingChatEditsContextKey: RawContextKey<boolean | undefined>;
export declare const hasUndecidedChatEditingResourceContextKey: RawContextKey<boolean | undefined>;
export declare const hasAppliedChatEditsContextKey: RawContextKey<boolean | undefined>;
export declare const applyingChatEditsFailedContextKey: RawContextKey<boolean | undefined>;
export declare const chatEditingMaxFileAssignmentName = "chatEditingSessionFileLimit";
export declare const defaultChatEditingMaxFileLimit = 10;
export declare const enum ChatEditKind {
    Created = 0,
    Modified = 1
}
export interface IChatEditingActionContext {
    sessionId: string;
}
export declare function isChatEditingActionContext(thing: unknown): thing is IChatEditingActionContext;
