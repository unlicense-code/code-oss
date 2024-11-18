import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../../base/common/map.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IBulkEditService } from '../../../../../editor/browser/services/bulkEditService.js';
import { TextEdit } from '../../../../../editor/common/languages.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IFileDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { MultiDiffEditor } from '../../../multiDiffEditor/browser/multiDiffEditor.js';
import { IChatAgentService } from '../../common/chatAgents.js';
import { ChatEditingSessionChangeType, ChatEditingSessionState, IChatEditingSession, WorkingSetDisplayMetadata, WorkingSetEntryState } from '../../common/chatEditingService.js';
import { IChatResponseModel } from '../../common/chatModel.js';
import { IChatWidgetService } from '../chat.js';
import { ChatEditingModifiedFileEntry, ISnapshotEntry } from './chatEditingModifiedFileEntry.js';
export declare class ChatEditingSession extends Disposable implements IChatEditingSession {
    readonly chatSessionId: string;
    private editorPane;
    private editingSessionFileLimitPromise;
    private readonly _instantiationService;
    private readonly _modelService;
    private readonly _languageService;
    private readonly _textModelService;
    readonly _bulkEditService: IBulkEditService;
    private readonly _editorGroupsService;
    private readonly _editorService;
    private readonly _workspaceContextService;
    private readonly _fileService;
    private readonly _dialogService;
    private readonly _chatAgentService;
    private readonly _state;
    private readonly _linearHistory;
    private readonly _linearHistoryIndex;
    /**
     * Contains the contents of a file when the AI first began doing edits to it.
     */
    private readonly _initialFileContents;
    private readonly _snapshots;
    private readonly _filesToSkipCreating;
    private readonly _entriesObs;
    get entries(): IObservable<readonly ChatEditingModifiedFileEntry[]>;
    private readonly _sequencer;
    private _workingSet;
    get workingSet(): ResourceMap<WorkingSetDisplayMetadata>;
    private _removedTransientEntries;
    get state(): IObservable<ChatEditingSessionState>;
    readonly canUndo: IObservable<boolean, unknown>;
    readonly canRedo: IObservable<boolean, unknown>;
    hiddenRequestIds: IObservable<string[], unknown>;
    private readonly _onDidChange;
    get onDidChange(): import("../../../../../base/common/event.js").Event<ChatEditingSessionChangeType>;
    private readonly _onDidDispose;
    get onDidDispose(): import("../../../../../base/common/event.js").Event<void>;
    get isVisible(): boolean;
    constructor(chatSessionId: string, editorPane: MultiDiffEditor | undefined, editingSessionFileLimitPromise: Promise<number>, _instantiationService: IInstantiationService, _modelService: IModelService, _languageService: ILanguageService, _textModelService: ITextModelService, _bulkEditService: IBulkEditService, _editorGroupsService: IEditorGroupsService, _editorService: IEditorService, chatWidgetService: IChatWidgetService, _workspaceContextService: IWorkspaceContextService, _fileService: IFileService, _dialogService: IFileDialogService, _chatAgentService: IChatAgentService);
    private _trackCurrentEditorsInWorkingSet;
    createSnapshot(requestId: string | undefined): void;
    private _createSnapshot;
    getSnapshotModel(requestId: string, snapshotUri: URI): Promise<ITextModel | null>;
    getSnapshot(requestId: string, uri: URI): ISnapshotEntry | undefined;
    restoreSnapshot(requestId: string | undefined): Promise<void>;
    /**
     * A snapshot representing the state of the working set before a new request has been sent
     */
    private _pendingSnapshot;
    private _restoreSnapshot;
    remove(...uris: URI[]): void;
    private _assertNotDisposed;
    accept(...uris: URI[]): Promise<void>;
    reject(...uris: URI[]): Promise<void>;
    show(): Promise<void>;
    stop(): Promise<void>;
    dispose(): void;
    getVirtualModel(documentId: string): ITextModel | null;
    acceptStreamingEditsStart(): void;
    acceptTextEdits(resource: URI, textEdits: TextEdit[], isLastEdits: boolean, responseModel: IChatResponseModel): void;
    resolve(): void;
    addFileToWorkingSet(resource: URI, description?: string, proposedState?: WorkingSetEntryState.Suggested): void;
    undoInteraction(): Promise<void>;
    redoInteraction(): Promise<void>;
    private _acceptStreamingEditsStart;
    private _acceptTextEdits;
    private _resolve;
    private _getOrCreateModifiedFileEntry;
    private _createModifiedFileEntry;
    private _collapse;
}
export interface IChatEditingSessionSnapshot {
    requestId: string | undefined;
    workingSet: ResourceMap<WorkingSetDisplayMetadata>;
    entries: ResourceMap<ISnapshotEntry>;
}
