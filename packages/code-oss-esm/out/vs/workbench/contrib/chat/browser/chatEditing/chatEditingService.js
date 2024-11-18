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
var ChatEditingMultiDiffSourceResolver_1;
import { coalesce, compareBy, delta } from '../../../../../base/common/arrays.js';
import { AsyncIterableSource } from '../../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { BugIndicatingError } from '../../../../../base/common/errors.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Disposable, DisposableStore, toDisposable } from '../../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../../base/common/map.js';
import { derived, observableValue, runOnChange, ValueWithChangeEventFromObservable } from '../../../../../base/common/observable.js';
import { compare } from '../../../../../base/common/strings.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { URI } from '../../../../../base/common/uri.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { localize, localize2 } from '../../../../../nls.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { EditorActivation } from '../../../../../platform/editor/common/editor.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { bindContextKey } from '../../../../../platform/observable/common/platformObservableUtils.js';
import { IProgressService } from '../../../../../platform/progress/common/progress.js';
import { IWorkbenchAssignmentService } from '../../../../services/assignment/common/assignmentService.js';
import { IDecorationsService } from '../../../../services/decorations/common/decorations.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { MultiDiffEditorInput } from '../../../multiDiffEditor/browser/multiDiffEditorInput.js';
import { IMultiDiffSourceResolverService, MultiDiffEditorItem } from '../../../multiDiffEditor/browser/multiDiffSourceResolverService.js';
import { ChatAgentLocation, IChatAgentService } from '../../common/chatAgents.js';
import { ChatContextKeys } from '../../common/chatContextKeys.js';
import { applyingChatEditsContextKey, applyingChatEditsFailedContextKey, CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME, chatEditingMaxFileAssignmentName, chatEditingResourceContextKey, decidedChatEditingResourceContextKey, defaultChatEditingMaxFileLimit, hasAppliedChatEditsContextKey, hasUndecidedChatEditingResourceContextKey, inChatEditingSessionContextKey } from '../../common/chatEditingService.js';
import { IChatService } from '../../common/chatService.js';
import { ChatEditingSession } from './chatEditingSession.js';
import { ChatEditingSnapshotTextModelContentProvider, ChatEditingTextModelContentProvider } from './chatEditingTextModelContentProviders.js';
let ChatEditingService = class ChatEditingService extends Disposable {
    get currentAutoApplyOperation() {
        return this._currentAutoApplyOperationObs.get();
    }
    get currentEditingSession() {
        return this._currentSessionObs.get();
    }
    get currentEditingSessionObs() {
        return this._currentSessionObs;
    }
    get onDidCreateEditingSession() {
        return this._onDidCreateEditingSession.event;
    }
    get editingSessionFileLimit() {
        return this._editingSessionFileLimit ?? defaultChatEditingMaxFileLimit;
    }
    constructor(_editorGroupsService, _instantiationService, multiDiffSourceResolverService, textModelService, contextKeyService, _chatService, _progressService, _editorService, decorationsService, _fileService, _workbenchAssignmentService) {
        super();
        this._editorGroupsService = _editorGroupsService;
        this._instantiationService = _instantiationService;
        this._chatService = _chatService;
        this._progressService = _progressService;
        this._editorService = _editorService;
        this._fileService = _fileService;
        this._workbenchAssignmentService = _workbenchAssignmentService;
        this._currentSessionObs = observableValue(this, null);
        this._currentSessionDisposables = this._register(new DisposableStore());
        this._currentAutoApplyOperationObs = observableValue(this, null);
        this._onDidCreateEditingSession = this._register(new Emitter());
        this._onDidChangeEditingSession = this._register(new Emitter());
        this.onDidChangeEditingSession = this._onDidChangeEditingSession.event;
        this._chatRelatedFilesProviders = new Map();
        this._applyingChatEditsFailedContextKey = applyingChatEditsFailedContextKey.bindTo(contextKeyService);
        this._applyingChatEditsFailedContextKey.set(false);
        this._register(decorationsService.registerDecorationsProvider(_instantiationService.createInstance(ChatDecorationsProvider, this._currentSessionObs)));
        this._register(multiDiffSourceResolverService.registerResolver(_instantiationService.createInstance(ChatEditingMultiDiffSourceResolver, this._currentSessionObs)));
        textModelService.registerTextModelContentProvider(ChatEditingTextModelContentProvider.scheme, _instantiationService.createInstance(ChatEditingTextModelContentProvider, this._currentSessionObs));
        textModelService.registerTextModelContentProvider(ChatEditingSnapshotTextModelContentProvider.scheme, _instantiationService.createInstance(ChatEditingSnapshotTextModelContentProvider, this._currentSessionObs));
        this._register(bindContextKey(decidedChatEditingResourceContextKey, contextKeyService, (reader) => {
            const currentSession = this._currentSessionObs.read(reader);
            if (!currentSession) {
                return;
            }
            const entries = currentSession.entries.read(reader);
            const decidedEntries = entries.filter(entry => entry.state.read(reader) !== 0 /* WorkingSetEntryState.Modified */);
            return decidedEntries.map(entry => entry.entryId);
        }));
        this._register(bindContextKey(hasUndecidedChatEditingResourceContextKey, contextKeyService, (reader) => {
            const currentSession = this._currentSessionObs.read(reader);
            if (!currentSession) {
                return;
            }
            const entries = currentSession.entries.read(reader);
            const decidedEntries = entries.filter(entry => entry.state.read(reader) === 0 /* WorkingSetEntryState.Modified */);
            return decidedEntries.length > 0;
        }));
        this._register(bindContextKey(hasAppliedChatEditsContextKey, contextKeyService, (reader) => {
            const currentSession = this._currentSessionObs.read(reader);
            if (!currentSession) {
                return false;
            }
            const entries = currentSession.entries.read(reader);
            return entries.length > 0;
        }));
        this._register(bindContextKey(inChatEditingSessionContextKey, contextKeyService, (reader) => {
            return this._currentSessionObs.read(reader) !== null;
        }));
        this._register(bindContextKey(applyingChatEditsContextKey, contextKeyService, (reader) => {
            return this._currentAutoApplyOperationObs.read(reader) !== null;
        }));
        this._register(bindContextKey(ChatContextKeys.chatEditingCanUndo, contextKeyService, (r) => {
            return this._currentSessionObs.read(r)?.canUndo.read(r) || false;
        }));
        this._register(bindContextKey(ChatContextKeys.chatEditingCanRedo, contextKeyService, (r) => {
            return this._currentSessionObs.read(r)?.canRedo.read(r) || false;
        }));
        this._register(this._chatService.onDidDisposeSession((e) => {
            if (e.reason === 'cleared' && this._currentSessionObs.get()?.chatSessionId === e.sessionId) {
                this._applyingChatEditsFailedContextKey.set(false);
                void this._currentSessionObs.get()?.stop();
            }
        }));
        this._editingSessionFileLimitPromise = this._workbenchAssignmentService.getTreatment(chatEditingMaxFileAssignmentName).then(value => {
            this._editingSessionFileLimit = value ?? defaultChatEditingMaxFileLimit;
            return this._editingSessionFileLimit;
        });
        void this._editingSessionFileLimitPromise;
    }
    getSnapshotUri(id, uri) {
        const session = this._currentSessionObs.get();
        if (!session) {
            return undefined;
        }
        return session.getSnapshot(id, uri)?.snapshotUri;
    }
    getEditingSession(resource) {
        const session = this.currentEditingSession;
        if (!session) {
            return null;
        }
        const entries = session.entries.get();
        for (const entry of entries) {
            if (entry.modifiedURI.toString() === resource.toString()) {
                return session;
            }
        }
        return null;
    }
    dispose() {
        this._currentSessionObs.get()?.dispose();
        super.dispose();
    }
    async startOrContinueEditingSession(chatSessionId, options) {
        const session = this._currentSessionObs.get();
        if (session) {
            if (session.chatSessionId !== chatSessionId) {
                throw new BugIndicatingError('Cannot start new session while another session is active');
            }
        }
        return this._createEditingSession(chatSessionId, options);
    }
    async _createEditingSession(chatSessionId, options) {
        if (this._currentSessionObs.get()) {
            throw new BugIndicatingError('Cannot have more than one active editing session');
        }
        this._currentSessionDisposables.clear();
        // listen for completed responses, run the code mapper and apply the edits to this edit session
        this._currentSessionDisposables.add(this.installAutoApplyObserver(chatSessionId));
        const input = MultiDiffEditorInput.fromResourceMultiDiffEditorInput({
            multiDiffSource: ChatEditingMultiDiffSourceResolver.getMultiDiffSourceUri(),
            label: localize('multiDiffEditorInput.name', "Suggested Edits")
        }, this._instantiationService);
        const editorPane = options?.silent ? undefined : await this._editorGroupsService.activeGroup.openEditor(input, { pinned: true, activation: EditorActivation.ACTIVATE });
        const session = this._instantiationService.createInstance(ChatEditingSession, chatSessionId, editorPane, this._editingSessionFileLimitPromise);
        this._currentSessionDisposables.add(session.onDidDispose(() => {
            this._currentSessionDisposables.clear();
            this._currentSessionObs.set(null, undefined);
            this._onDidChangeEditingSession.fire();
        }));
        this._currentSessionDisposables.add(session.onDidChange(() => {
            this._onDidChangeEditingSession.fire();
        }));
        this._currentSessionObs.set(session, undefined);
        this._onDidCreateEditingSession.fire(session);
        this._onDidChangeEditingSession.fire();
        return session;
    }
    createSnapshot(requestId) {
        this._currentSessionObs.get()?.createSnapshot(requestId);
    }
    async restoreSnapshot(requestId) {
        await this._currentSessionObs.get()?.restoreSnapshot(requestId);
    }
    installAutoApplyObserver(sessionId) {
        const chatModel = this._chatService.getSession(sessionId);
        if (!chatModel) {
            throw new Error(`Edit session was created for a non-existing chat session: ${sessionId}`);
        }
        const observerDisposables = new DisposableStore();
        let editsSource;
        let editsPromise;
        const editsSeen = new ResourceMap();
        const editedFilesExist = new ResourceMap();
        const onResponseComplete = (responseModel) => {
            if (responseModel.result?.errorDetails && !responseModel.result.errorDetails.responseIsIncomplete) {
                // Roll back everything
                this.restoreSnapshot(responseModel.requestId);
                this._applyingChatEditsFailedContextKey.set(true);
            }
            editsSource?.resolve();
            editsSource = undefined;
            editsSeen.clear();
            editedFilesExist.clear();
        };
        const handleResponseParts = async (responseModel) => {
            for (const part of responseModel.response.value) {
                if (part.kind === 'codeblockUri' || part.kind === 'textEditGroup') {
                    // ensure editor is open asap
                    if (!editedFilesExist.get(part.uri)) {
                        editedFilesExist.set(part.uri, this._fileService.exists(part.uri).then((e) => {
                            if (e) {
                                this._editorService.openEditor({ resource: part.uri, options: { inactive: true, preserveFocus: true, pinned: true } });
                            }
                            return e;
                        }));
                    }
                    // get new edits and start editing session
                    const first = editsSeen.size === 0;
                    let entry = editsSeen.get(part.uri);
                    if (!entry) {
                        entry = { seen: 0 };
                        editsSeen.set(part.uri, entry);
                    }
                    const allEdits = part.kind === 'textEditGroup' ? part.edits : [];
                    const newEdits = allEdits.slice(entry.seen);
                    entry.seen += newEdits.length;
                    editsSource ??= new AsyncIterableSource();
                    editsSource.emitOne({ uri: part.uri, edits: newEdits, kind: 'textEditGroup', done: part.kind === 'textEditGroup' && part.done });
                    if (first) {
                        await editsPromise;
                        editsPromise = this._continueEditingSession(async (builder, token) => {
                            for await (const item of editsSource.asyncIterable) {
                                if (token.isCancellationRequested) {
                                    break;
                                }
                                for (let i = 0; i < item.edits.length; i++) {
                                    const group = item.edits[i];
                                    const isLastGroup = i === item.edits.length - 1;
                                    builder.textEdits(item.uri, group, isLastGroup && (item.done ?? false), responseModel);
                                }
                            }
                        }, { silent: true }).finally(() => {
                            editsPromise = undefined;
                        });
                    }
                }
            }
        };
        observerDisposables.add(chatModel.onDidChange(async (e) => {
            if (e.kind === 'addRequest') {
                this._applyingChatEditsFailedContextKey.set(false);
                const responseModel = e.request.response;
                if (responseModel) {
                    if (responseModel.isComplete) {
                        await handleResponseParts(responseModel);
                        onResponseComplete(responseModel);
                    }
                    else {
                        const disposable = responseModel.onDidChange(async () => {
                            await handleResponseParts(responseModel);
                            if (responseModel.isComplete) {
                                onResponseComplete(responseModel);
                                disposable.dispose();
                            }
                            else if (responseModel.isCanceled || responseModel.isStale) {
                                disposable.dispose();
                            }
                        });
                    }
                }
            }
        }));
        observerDisposables.add(chatModel.onDidDispose(() => observerDisposables.dispose()));
        return observerDisposables;
    }
    async _continueEditingSession(builder, options) {
        const session = this._currentSessionObs.get();
        if (!session) {
            throw new BugIndicatingError('Cannot continue missing session');
        }
        if (session.state.get() === 1 /* ChatEditingSessionState.StreamingEdits */) {
            throw new BugIndicatingError('Cannot continue session that is still streaming');
        }
        let editorPane;
        if (!options?.silent && session.isVisible) {
            const groupedEditors = this._findGroupedEditors();
            if (groupedEditors.length !== 1) {
                throw new Error(`Unexpected number of editors: ${groupedEditors.length}`);
            }
            const [group, editor] = groupedEditors[0];
            editorPane = await group.openEditor(editor, { pinned: true, activation: EditorActivation.ACTIVATE });
        }
        const stream = {
            textEdits: (resource, textEdits, isDone, responseModel) => {
                session.acceptTextEdits(resource, textEdits, isDone, responseModel);
            }
        };
        session.acceptStreamingEditsStart();
        const cancellationTokenSource = new CancellationTokenSource();
        this._currentAutoApplyOperationObs.set(cancellationTokenSource, undefined);
        try {
            if (editorPane) {
                await editorPane?.showWhile(builder(stream, cancellationTokenSource.token));
            }
            else {
                await this._progressService.withProgress({
                    location: 10 /* ProgressLocation.Window */,
                    title: localize2('chatEditing.startingSession', 'Generating edits...').value,
                }, async () => {
                    await builder(stream, cancellationTokenSource.token);
                }, () => cancellationTokenSource.cancel());
            }
        }
        finally {
            cancellationTokenSource.dispose();
            this._currentAutoApplyOperationObs.set(null, undefined);
            session.resolve();
        }
    }
    _findGroupedEditors() {
        const editors = [];
        for (const group of this._editorGroupsService.groups) {
            for (const editor of group.editors) {
                if (editor.resource?.scheme === ChatEditingMultiDiffSourceResolver.scheme) {
                    editors.push([group, editor]);
                }
            }
        }
        return editors;
    }
    hasRelatedFilesProviders() {
        return this._chatRelatedFilesProviders.size > 0;
    }
    registerRelatedFilesProvider(handle, provider) {
        this._chatRelatedFilesProviders.set(handle, provider);
        return toDisposable(() => {
            this._chatRelatedFilesProviders.delete(handle);
        });
    }
    async getRelatedFiles(chatSessionId, prompt, token) {
        const currentSession = this._currentSessionObs.get();
        if (!currentSession || chatSessionId !== currentSession.chatSessionId) {
            return undefined;
        }
        const userAddedWorkingSetEntries = [];
        for (const entry of currentSession.workingSet) {
            // Don't incorporate suggested files into the related files request
            // but do consider transient entries like open editors
            if (entry[1].state !== 6 /* WorkingSetEntryState.Suggested */) {
                userAddedWorkingSetEntries.push(entry[0]);
            }
        }
        const providers = Array.from(this._chatRelatedFilesProviders.values());
        const result = await Promise.all(providers.map(async (provider) => {
            try {
                const relatedFiles = await provider.provideRelatedFiles({ prompt, files: userAddedWorkingSetEntries }, token);
                if (relatedFiles?.length) {
                    return { group: provider.description, files: relatedFiles };
                }
                return undefined;
            }
            catch (e) {
                return undefined;
            }
        }));
        return coalesce(result);
    }
};
ChatEditingService = __decorate([
    __param(0, IEditorGroupsService),
    __param(1, IInstantiationService),
    __param(2, IMultiDiffSourceResolverService),
    __param(3, ITextModelService),
    __param(4, IContextKeyService),
    __param(5, IChatService),
    __param(6, IProgressService),
    __param(7, IEditorService),
    __param(8, IDecorationsService),
    __param(9, IFileService),
    __param(10, IWorkbenchAssignmentService)
], ChatEditingService);
export { ChatEditingService };
/**
 * Emits an event containing the added or removed elements of the observable.
 */
function observeArrayChanges(obs, compare, store) {
    const emitter = store.add(new Emitter());
    store.add(runOnChange(obs, (newArr, oldArr) => {
        const change = delta(oldArr || [], newArr, compare);
        const changedElements = [].concat(change.added).concat(change.removed);
        emitter.fire(changedElements);
    }));
    return emitter.event;
}
let ChatDecorationsProvider = class ChatDecorationsProvider extends Disposable {
    constructor(_session, _chatAgentService) {
        super();
        this._session = _session;
        this._chatAgentService = _chatAgentService;
        this.label = localize('chat', "Chat Editing");
        this._currentEntries = derived(this, (r) => {
            const session = this._session.read(r);
            if (!session) {
                return [];
            }
            const state = session.state.read(r);
            if (state === 3 /* ChatEditingSessionState.Disposed */) {
                return [];
            }
            return session.entries.read(r);
        });
        this._currentlyEditingUris = derived(this, (r) => {
            const uri = this._currentEntries.read(r);
            return uri.filter(entry => entry.isCurrentlyBeingModified.read(r)).map(entry => entry.modifiedURI);
        });
        this._modifiedUris = derived(this, (r) => {
            const uri = this._currentEntries.read(r);
            return uri.filter(entry => !entry.isCurrentlyBeingModified.read(r) && entry.state.read(r) === 0 /* WorkingSetEntryState.Modified */).map(entry => entry.modifiedURI);
        });
        this.onDidChange = Event.any(observeArrayChanges(this._currentlyEditingUris, compareBy(uri => uri.toString(), compare), this._store), observeArrayChanges(this._modifiedUris, compareBy(uri => uri.toString(), compare), this._store));
    }
    provideDecorations(uri, _token) {
        const isCurrentlyBeingModified = this._currentlyEditingUris.get().some(e => e.toString() === uri.toString());
        if (isCurrentlyBeingModified) {
            return {
                weight: 1000,
                letter: ThemeIcon.modify(Codicon.loading, 'spin'),
                bubble: false
            };
        }
        const isModified = this._modifiedUris.get().some(e => e.toString() === uri.toString());
        if (isModified) {
            const defaultAgentName = this._chatAgentService.getDefaultAgent(ChatAgentLocation.EditingSession)?.fullName;
            return {
                weight: 1000,
                letter: Codicon.diffModified,
                tooltip: defaultAgentName ? localize('chatEditing.modified', "Pending changes from {0}", defaultAgentName) : localize('chatEditing.modified2', "Pending changes from chat"),
                bubble: true
            };
        }
        return undefined;
    }
};
ChatDecorationsProvider = __decorate([
    __param(1, IChatAgentService)
], ChatDecorationsProvider);
let ChatEditingMultiDiffSourceResolver = class ChatEditingMultiDiffSourceResolver {
    static { ChatEditingMultiDiffSourceResolver_1 = this; }
    static { this.scheme = CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME; }
    static getMultiDiffSourceUri() {
        return URI.from({
            scheme: ChatEditingMultiDiffSourceResolver_1.scheme,
            path: '',
        });
    }
    constructor(_currentSession, _instantiationService) {
        this._currentSession = _currentSession;
        this._instantiationService = _instantiationService;
    }
    canHandleUri(uri) {
        return uri.scheme === ChatEditingMultiDiffSourceResolver_1.scheme;
    }
    async resolveDiffSource(uri) {
        return this._instantiationService.createInstance(ChatEditingMultiDiffSource, this._currentSession);
    }
};
ChatEditingMultiDiffSourceResolver = ChatEditingMultiDiffSourceResolver_1 = __decorate([
    __param(1, IInstantiationService)
], ChatEditingMultiDiffSourceResolver);
export { ChatEditingMultiDiffSourceResolver };
class ChatEditingMultiDiffSource {
    constructor(_currentSession) {
        this._currentSession = _currentSession;
        this._resources = derived(this, (reader) => {
            const currentSession = this._currentSession.read(reader);
            if (!currentSession) {
                return [];
            }
            const entries = currentSession.entries.read(reader);
            return entries.map((entry) => {
                return new MultiDiffEditorItem(entry.originalURI, entry.modifiedURI, undefined, {
                    [chatEditingResourceContextKey.key]: entry.entryId,
                    // [inChatEditingSessionContextKey.key]: true
                });
            });
        });
        this.resources = new ValueWithChangeEventFromObservable(this._resources);
        this.contextKeys = {
            [inChatEditingSessionContextKey.key]: true
        };
    }
}
