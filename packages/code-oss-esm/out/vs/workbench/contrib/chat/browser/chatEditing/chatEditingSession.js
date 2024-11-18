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
import { Sequencer } from '../../../../../base/common/async.js';
import { BugIndicatingError } from '../../../../../base/common/errors.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ResourceMap, ResourceSet } from '../../../../../base/common/map.js';
import { autorun, derived, observableValue, transaction } from '../../../../../base/common/observable.js';
import { isCodeEditor, isDiffEditor } from '../../../../../editor/browser/editorBrowser.js';
import { IBulkEditService } from '../../../../../editor/browser/services/bulkEditService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { localize } from '../../../../../nls.js';
import { IFileDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { EditorActivation } from '../../../../../platform/editor/common/editor.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { DiffEditorInput } from '../../../../common/editor/diffEditorInput.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { MultiDiffEditorInput } from '../../../multiDiffEditor/browser/multiDiffEditorInput.js';
import { ChatAgentLocation, IChatAgentService } from '../../common/chatAgents.js';
import { IChatWidgetService } from '../chat.js';
import { ChatEditingMultiDiffSourceResolver } from './chatEditingService.js';
import { ChatEditingModifiedFileEntry } from './chatEditingModifiedFileEntry.js';
import { ChatEditingTextModelContentProvider } from './chatEditingTextModelContentProviders.js';
import { Schemas } from '../../../../../base/common/network.js';
import { isEqual } from '../../../../../base/common/resources.js';
let ChatEditingSession = class ChatEditingSession extends Disposable {
    get entries() {
        this._assertNotDisposed();
        return this._entriesObs;
    }
    get workingSet() {
        this._assertNotDisposed();
        // Return here a reunion between the AI modified entries and the user built working set
        const result = new ResourceMap(this._workingSet);
        for (const entry of this._entriesObs.get()) {
            result.set(entry.modifiedURI, { state: entry.state.get() });
        }
        return result;
    }
    get state() {
        return this._state;
    }
    get onDidChange() {
        this._assertNotDisposed();
        return this._onDidChange.event;
    }
    get onDidDispose() {
        this._assertNotDisposed();
        return this._onDidDispose.event;
    }
    get isVisible() {
        this._assertNotDisposed();
        return Boolean(this.editorPane && this.editorPane.isVisible());
    }
    constructor(chatSessionId, editorPane, editingSessionFileLimitPromise, _instantiationService, _modelService, _languageService, _textModelService, _bulkEditService, _editorGroupsService, _editorService, chatWidgetService, _workspaceContextService, _fileService, _dialogService, _chatAgentService) {
        super();
        this.chatSessionId = chatSessionId;
        this.editorPane = editorPane;
        this.editingSessionFileLimitPromise = editingSessionFileLimitPromise;
        this._instantiationService = _instantiationService;
        this._modelService = _modelService;
        this._languageService = _languageService;
        this._textModelService = _textModelService;
        this._bulkEditService = _bulkEditService;
        this._editorGroupsService = _editorGroupsService;
        this._editorService = _editorService;
        this._workspaceContextService = _workspaceContextService;
        this._fileService = _fileService;
        this._dialogService = _dialogService;
        this._chatAgentService = _chatAgentService;
        this._state = observableValue(this, 0 /* ChatEditingSessionState.Initial */);
        this._linearHistory = observableValue(this, []);
        this._linearHistoryIndex = observableValue(this, 0);
        /**
         * Contains the contents of a file when the AI first began doing edits to it.
         */
        this._initialFileContents = new ResourceMap();
        this._snapshots = new Map();
        this._filesToSkipCreating = new ResourceSet();
        this._entriesObs = observableValue(this, []);
        this._sequencer = new Sequencer();
        this._workingSet = new ResourceMap();
        this._removedTransientEntries = new ResourceSet();
        this.canUndo = derived((r) => {
            if (this.state.read(r) !== 2 /* ChatEditingSessionState.Idle */) {
                return false;
            }
            const linearHistoryIndex = this._linearHistoryIndex.read(r);
            return linearHistoryIndex > 0;
        });
        this.canRedo = derived((r) => {
            if (this.state.read(r) !== 2 /* ChatEditingSessionState.Idle */) {
                return false;
            }
            const linearHistory = this._linearHistory.read(r);
            const linearHistoryIndex = this._linearHistoryIndex.read(r);
            return linearHistoryIndex < linearHistory.length;
        });
        this.hiddenRequestIds = derived((r) => {
            const linearHistory = this._linearHistory.read(r);
            const linearHistoryIndex = this._linearHistoryIndex.read(r);
            return linearHistory.slice(linearHistoryIndex).map(s => s.requestId).filter((r) => !!r);
        });
        this._onDidChange = new Emitter();
        this._onDidDispose = new Emitter();
        const widget = chatWidgetService.getWidgetBySessionId(chatSessionId);
        if (!widget) {
            return; // Shouldn't happen
        }
        // Add the currently active editors to the working set
        this._trackCurrentEditorsInWorkingSet();
        this._register(this._editorService.onDidActiveEditorChange(() => {
            this._trackCurrentEditorsInWorkingSet();
        }));
        this._register(this._editorService.onDidCloseEditor((e) => {
            this._trackCurrentEditorsInWorkingSet(e);
        }));
        this._register(autorun(reader => {
            const entries = this.entries.read(reader);
            entries.forEach(entry => {
                entry.state.read(reader);
            });
            this._onDidChange.fire(0 /* ChatEditingSessionChangeType.WorkingSet */);
        }));
    }
    _trackCurrentEditorsInWorkingSet(e) {
        const closedEditor = e?.editor.resource?.toString();
        const existingTransientEntries = new ResourceSet();
        for (const file of this._workingSet.keys()) {
            if (this._workingSet.get(file)?.state === 3 /* WorkingSetEntryState.Transient */) {
                existingTransientEntries.add(file);
            }
        }
        const activeEditors = new ResourceSet();
        this._editorGroupsService.groups.forEach((group) => {
            if (!group.activeEditorPane) {
                return;
            }
            let activeEditorControl = group.activeEditorPane.getControl();
            if (isDiffEditor(activeEditorControl)) {
                activeEditorControl = activeEditorControl.getOriginalEditor().hasTextFocus() ? activeEditorControl.getOriginalEditor() : activeEditorControl.getModifiedEditor();
            }
            if (isCodeEditor(activeEditorControl) && activeEditorControl.hasModel()) {
                const uri = activeEditorControl.getModel().uri;
                if (closedEditor === uri.toString()) {
                    // The editor group service sees recently closed editors?
                    // Continue, since we want this to be deleted from the working set
                }
                else if (existingTransientEntries.has(uri)) {
                    existingTransientEntries.delete(uri);
                }
                else if (!this._workingSet.has(uri) && !this._removedTransientEntries.has(uri)) {
                    // Don't add as a transient entry if it's already part of the working set
                    // or if the user has intentionally removed it from the working set
                    activeEditors.add(uri);
                }
            }
        });
        let didChange = false;
        for (const entry of existingTransientEntries) {
            didChange = this._workingSet.delete(entry) || didChange;
        }
        for (const entry of activeEditors) {
            this._workingSet.set(entry, { state: 3 /* WorkingSetEntryState.Transient */, description: localize('chatEditing.transient', "Open Editor") });
            didChange = true;
        }
        if (didChange) {
            this._onDidChange.fire(0 /* ChatEditingSessionChangeType.WorkingSet */);
        }
    }
    createSnapshot(requestId) {
        const snapshot = this._createSnapshot(requestId);
        if (requestId) {
            this._snapshots.set(requestId, snapshot);
            for (const workingSetItem of this._workingSet.keys()) {
                this._workingSet.set(workingSetItem, { state: 5 /* WorkingSetEntryState.Sent */ });
            }
            const linearHistory = this._linearHistory.get();
            const linearHistoryIndex = this._linearHistoryIndex.get();
            const newLinearHistory = linearHistory.slice(0, linearHistoryIndex);
            newLinearHistory.push(snapshot);
            transaction((tx) => {
                this._linearHistory.set(newLinearHistory, tx);
                this._linearHistoryIndex.set(newLinearHistory.length, tx);
            });
        }
        else {
            this._pendingSnapshot = snapshot;
        }
    }
    _createSnapshot(requestId) {
        const workingSet = new ResourceMap();
        for (const [file, state] of this._workingSet) {
            workingSet.set(file, state);
        }
        const entries = new ResourceMap();
        for (const entry of this._entriesObs.get()) {
            entries.set(entry.modifiedURI, entry.createSnapshot(requestId));
        }
        return {
            requestId,
            workingSet,
            entries
        };
    }
    async getSnapshotModel(requestId, snapshotUri) {
        const entries = this._snapshots.get(requestId)?.entries;
        if (!entries) {
            return null;
        }
        const snapshotEntry = [...entries.values()].find((e) => isEqual(e.snapshotUri, snapshotUri));
        if (!snapshotEntry) {
            return null;
        }
        return this._modelService.createModel(snapshotEntry.current, this._languageService.createById(snapshotEntry.languageId), snapshotUri, false);
    }
    getSnapshot(requestId, uri) {
        const snapshot = this._snapshots.get(requestId);
        const snapshotEntries = snapshot?.entries;
        return snapshotEntries?.get(uri);
    }
    async restoreSnapshot(requestId) {
        if (requestId !== undefined) {
            const snapshot = this._snapshots.get(requestId);
            if (snapshot) {
                await this._restoreSnapshot(snapshot);
            }
        }
        else {
            await this._restoreSnapshot(undefined);
        }
    }
    async _restoreSnapshot(snapshot) {
        if (!snapshot) {
            if (!this._pendingSnapshot) {
                return; // We don't have a pending snapshot that we can restore
            }
            // Restore pending snapshot
            snapshot = this._pendingSnapshot;
            this._pendingSnapshot = undefined;
        }
        else if (!this._pendingSnapshot) {
            // Create and save a pending snapshot
            this.createSnapshot(undefined);
        }
        this._workingSet = new ResourceMap();
        snapshot.workingSet.forEach((state, uri) => this._workingSet.set(uri, state));
        // Reset all the files which are modified in this session state
        // but which are not found in the snapshot
        for (const entry of this._entriesObs.get()) {
            const snapshotEntry = snapshot.entries.get(entry.modifiedURI);
            if (!snapshotEntry) {
                const initialContents = this._initialFileContents.get(entry.modifiedURI);
                if (typeof initialContents === 'string') {
                    entry.resetToInitialValue(initialContents);
                }
                entry.dispose();
            }
        }
        const entriesArr = [];
        // Restore all entries from the snapshot
        for (const snapshotEntry of snapshot.entries.values()) {
            const entry = await this._getOrCreateModifiedFileEntry(snapshotEntry.resource, snapshotEntry.telemetryInfo);
            entry.restoreFromSnapshot(snapshotEntry);
            entriesArr.push(entry);
        }
        this._entriesObs.set(entriesArr, undefined);
    }
    remove(...uris) {
        this._assertNotDisposed();
        let didRemoveUris = false;
        for (const uri of uris) {
            const state = this._workingSet.get(uri);
            if (state === undefined) {
                continue;
            }
            didRemoveUris = this._workingSet.delete(uri) || didRemoveUris;
            if (state.state === 3 /* WorkingSetEntryState.Transient */ || state.state === 6 /* WorkingSetEntryState.Suggested */) {
                this._removedTransientEntries.add(uri);
            }
        }
        if (!didRemoveUris) {
            return; // noop
        }
        this._onDidChange.fire(0 /* ChatEditingSessionChangeType.WorkingSet */);
    }
    _assertNotDisposed() {
        if (this._state.get() === 3 /* ChatEditingSessionState.Disposed */) {
            throw new BugIndicatingError(`Cannot access a disposed editing session`);
        }
    }
    async accept(...uris) {
        this._assertNotDisposed();
        if (uris.length === 0) {
            await Promise.all(this._entriesObs.get().map(entry => entry.accept(undefined)));
        }
        for (const uri of uris) {
            const entry = this._entriesObs.get().find(e => isEqual(e.modifiedURI, uri));
            if (entry) {
                await entry.accept(undefined);
            }
        }
        this._onDidChange.fire(1 /* ChatEditingSessionChangeType.Other */);
    }
    async reject(...uris) {
        this._assertNotDisposed();
        if (uris.length === 0) {
            await Promise.all(this._entriesObs.get().map(entry => entry.reject(undefined)));
        }
        for (const uri of uris) {
            const entry = this._entriesObs.get().find(e => isEqual(e.modifiedURI, uri));
            if (entry) {
                await entry.reject(undefined);
            }
        }
        this._onDidChange.fire(1 /* ChatEditingSessionChangeType.Other */);
    }
    async show() {
        this._assertNotDisposed();
        if (this.editorPane?.isVisible()) {
            return;
        }
        else if (this.editorPane?.input) {
            await this._editorGroupsService.activeGroup.openEditor(this.editorPane.input, { pinned: true, activation: EditorActivation.ACTIVATE });
            return;
        }
        const input = MultiDiffEditorInput.fromResourceMultiDiffEditorInput({
            multiDiffSource: ChatEditingMultiDiffSourceResolver.getMultiDiffSourceUri(),
            label: localize('multiDiffEditorInput.name', "Suggested Edits")
        }, this._instantiationService);
        const editorPane = await this._editorGroupsService.activeGroup.openEditor(input, { pinned: true, activation: EditorActivation.ACTIVATE });
        this.editorPane = editorPane;
    }
    async stop() {
        this._assertNotDisposed();
        // Close out all open files
        await Promise.allSettled(this._editorGroupsService.groups.map(async (g) => {
            return Promise.allSettled(g.editors.map(async (e) => {
                if (e instanceof MultiDiffEditorInput || e instanceof DiffEditorInput && (e.original.resource?.scheme === ChatEditingModifiedFileEntry.scheme || e.original.resource?.scheme === ChatEditingTextModelContentProvider.scheme)) {
                    await g.closeEditor(e);
                }
            }));
        }));
        if (this._state.get() !== 3 /* ChatEditingSessionState.Disposed */) {
            // session got disposed while we were closing editors
            this.dispose();
        }
    }
    dispose() {
        this._assertNotDisposed();
        for (const entry of this._entriesObs.get()) {
            entry.dispose();
        }
        super.dispose();
        this._state.set(3 /* ChatEditingSessionState.Disposed */, undefined);
        this._onDidDispose.fire();
    }
    getVirtualModel(documentId) {
        this._assertNotDisposed();
        const entry = this._entriesObs.get().find(e => e.entryId === documentId);
        return entry?.originalModel ?? null;
    }
    acceptStreamingEditsStart() {
        if (this._state.get() === 3 /* ChatEditingSessionState.Disposed */) {
            // we don't throw in this case because there could be a builder still connected to a disposed session
            return;
        }
        // ensure that the edits are processed sequentially
        this._sequencer.queue(() => this._acceptStreamingEditsStart());
    }
    acceptTextEdits(resource, textEdits, isLastEdits, responseModel) {
        if (this._state.get() === 3 /* ChatEditingSessionState.Disposed */) {
            // we don't throw in this case because there could be a builder still connected to a disposed session
            return;
        }
        // ensure that the edits are processed sequentially
        this._sequencer.queue(() => this._acceptTextEdits(resource, textEdits, isLastEdits, responseModel));
    }
    resolve() {
        if (this._state.get() === 3 /* ChatEditingSessionState.Disposed */) {
            // we don't throw in this case because there could be a builder still connected to a disposed session
            return;
        }
        // ensure that the edits are processed sequentially
        this._sequencer.queue(() => this._resolve());
    }
    addFileToWorkingSet(resource, description, proposedState) {
        const state = this._workingSet.get(resource);
        if (!state && proposedState === 6 /* WorkingSetEntryState.Suggested */) {
            if (this._removedTransientEntries.has(resource)) {
                return;
            }
            this._workingSet.set(resource, { description, state: 6 /* WorkingSetEntryState.Suggested */ });
            this._onDidChange.fire(0 /* ChatEditingSessionChangeType.WorkingSet */);
        }
        else if (state === undefined || state.state === 3 /* WorkingSetEntryState.Transient */) {
            this._workingSet.set(resource, { description, state: 4 /* WorkingSetEntryState.Attached */ });
            this._onDidChange.fire(0 /* ChatEditingSessionChangeType.WorkingSet */);
        }
    }
    async undoInteraction() {
        const linearHistory = this._linearHistory.get();
        const linearHistoryIndex = this._linearHistoryIndex.get();
        if (linearHistoryIndex <= 0) {
            return;
        }
        const previousSnapshot = linearHistory[linearHistoryIndex - 1];
        await this.restoreSnapshot(previousSnapshot.requestId);
        this._linearHistoryIndex.set(linearHistoryIndex - 1, undefined);
    }
    async redoInteraction() {
        const linearHistory = this._linearHistory.get();
        const linearHistoryIndex = this._linearHistoryIndex.get();
        if (linearHistoryIndex >= linearHistory.length) {
            return;
        }
        const nextSnapshot = (linearHistoryIndex + 1 < linearHistory.length ? linearHistory[linearHistoryIndex + 1] : this._pendingSnapshot);
        if (!nextSnapshot) {
            return;
        }
        await this.restoreSnapshot(nextSnapshot.requestId);
        this._linearHistoryIndex.set(linearHistoryIndex + 1, undefined);
    }
    async _acceptStreamingEditsStart() {
        transaction((tx) => {
            this._state.set(1 /* ChatEditingSessionState.StreamingEdits */, tx);
            for (const entry of this._entriesObs.get()) {
                entry.acceptStreamingEditsStart(tx);
            }
        });
    }
    async _acceptTextEdits(resource, textEdits, isLastEdits, responseModel) {
        if (this._filesToSkipCreating.has(resource)) {
            return;
        }
        if (!this._entriesObs.get().find(e => isEqual(e.modifiedURI, resource)) && this._entriesObs.get().length >= (await this.editingSessionFileLimitPromise)) {
            // Do not create files in a single editing session that would be in excess of our limit
            return;
        }
        if (resource.scheme !== Schemas.untitled && !this._workspaceContextService.getWorkspaceFolder(resource) && !(await this._fileService.exists(resource))) {
            // if the file doesn't exist yet and is outside the workspace, prompt the user for a location to save it to
            const saveLocation = await this._dialogService.showSaveDialog({ title: localize('chatEditing.fileSave', '{0} wants to create a file. Choose where it should be saved.', this._chatAgentService.getDefaultAgent(ChatAgentLocation.EditingSession)?.fullName ?? 'Chat') });
            if (!saveLocation) {
                // don't ask the user to create the file again when the next text edit for this same resource streams in
                this._filesToSkipCreating.add(resource);
                return;
            }
            resource = saveLocation;
        }
        // Make these getters because the response result is not available when the file first starts to be edited
        const telemetryInfo = new class {
            get agentId() { return responseModel.agent?.id; }
            get command() { return responseModel.slashCommand?.name; }
            get sessionId() { return responseModel.session.sessionId; }
            get requestId() { return responseModel.requestId; }
            get result() { return responseModel.result; }
        };
        const entry = await this._getOrCreateModifiedFileEntry(resource, telemetryInfo);
        entry.acceptAgentEdits(textEdits, isLastEdits);
        // await this._editorService.openEditor({ resource: entry.modifiedURI, options: { inactive: true } });
    }
    async _resolve() {
        transaction((tx) => {
            for (const entry of this._entriesObs.get()) {
                entry.acceptStreamingEditsEnd(tx);
            }
            this._state.set(2 /* ChatEditingSessionState.Idle */, tx);
        });
        this._onDidChange.fire(1 /* ChatEditingSessionChangeType.Other */);
    }
    async _getOrCreateModifiedFileEntry(resource, responseModel) {
        const existingEntry = this._entriesObs.get().find(e => isEqual(e.modifiedURI, resource));
        if (existingEntry) {
            if (responseModel.requestId !== existingEntry.telemetryInfo.requestId) {
                existingEntry.updateTelemetryInfo(responseModel);
            }
            return existingEntry;
        }
        // This gets manually disposed in .dispose() or in .restoreSnapshot()
        const entry = await this._createModifiedFileEntry(resource, responseModel);
        if (!this._initialFileContents.has(resource)) {
            this._initialFileContents.set(resource, entry.modifiedModel.getValue());
        }
        // If an entry is deleted e.g. reverting a created file,
        // remove it from the entries and don't show it in the working set anymore
        // so that it can be recreated e.g. through retry
        this._register(entry.onDidDelete(() => {
            const newEntries = this._entriesObs.get().filter(e => !isEqual(e.modifiedURI, entry.modifiedURI));
            this._entriesObs.set(newEntries, undefined);
            this._workingSet.delete(entry.modifiedURI);
            entry.dispose();
            this._onDidChange.fire(0 /* ChatEditingSessionChangeType.WorkingSet */);
        }));
        const entriesArr = [...this._entriesObs.get(), entry];
        this._entriesObs.set(entriesArr, undefined);
        this._onDidChange.fire(0 /* ChatEditingSessionChangeType.WorkingSet */);
        return entry;
    }
    async _createModifiedFileEntry(resource, responseModel, mustExist = false) {
        try {
            const ref = await this._textModelService.createModelReference(resource);
            return this._instantiationService.createInstance(ChatEditingModifiedFileEntry, ref, { collapse: (transaction) => this._collapse(resource, transaction) }, responseModel, mustExist ? 0 /* ChatEditKind.Created */ : 1 /* ChatEditKind.Modified */);
        }
        catch (err) {
            if (mustExist) {
                throw err;
            }
            // this file does not exist yet, create it and try again
            await this._bulkEditService.apply({ edits: [{ newResource: resource }] });
            this._editorService.openEditor({ resource, options: { inactive: true, preserveFocus: true, pinned: true } });
            return this._createModifiedFileEntry(resource, responseModel, true);
        }
    }
    _collapse(resource, transaction) {
        const multiDiffItem = this.editorPane?.findDocumentDiffItem(resource);
        if (multiDiffItem) {
            this.editorPane?.viewModel?.items.get().find((documentDiffItem) => isEqual(documentDiffItem.originalUri, multiDiffItem.originalUri) &&
                isEqual(documentDiffItem.modifiedUri, multiDiffItem.modifiedUri))
                ?.collapsed.set(true, transaction);
        }
    }
};
ChatEditingSession = __decorate([
    __param(3, IInstantiationService),
    __param(4, IModelService),
    __param(5, ILanguageService),
    __param(6, ITextModelService),
    __param(7, IBulkEditService),
    __param(8, IEditorGroupsService),
    __param(9, IEditorService),
    __param(10, IChatWidgetService),
    __param(11, IWorkspaceContextService),
    __param(12, IFileService),
    __param(13, IFileDialogService),
    __param(14, IChatAgentService)
], ChatEditingSession);
export { ChatEditingSession };
