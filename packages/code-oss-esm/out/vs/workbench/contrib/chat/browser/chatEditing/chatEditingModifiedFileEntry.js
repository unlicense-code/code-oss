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
var ChatEditingModifiedFileEntry_1;
import { RunOnceScheduler, timeout } from '../../../../../base/common/async.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { observableValue, transaction } from '../../../../../base/common/observable.js';
import { themeColorFromId } from '../../../../../base/common/themables.js';
import { EditOperation } from '../../../../../editor/common/core/editOperation.js';
import { OffsetEdit } from '../../../../../editor/common/core/offsetEdit.js';
import { nullDocumentDiff } from '../../../../../editor/common/diff/documentDiffProvider.js';
import { TextEdit } from '../../../../../editor/common/languages.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { OverviewRulerLane } from '../../../../../editor/common/model.js';
import { SingleModelEditStackElement } from '../../../../../editor/common/model/editStack.js';
import { ModelDecorationOptions, createTextBufferFactoryFromSnapshot } from '../../../../../editor/common/model/textModel.js';
import { OffsetEdits } from '../../../../../editor/common/model/textModelOffsetEdit.js';
import { IEditorWorkerService } from '../../../../../editor/common/services/editorWorker.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { localize } from '../../../../../nls.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { editorSelectionBackground } from '../../../../../platform/theme/common/colorRegistry.js';
import { IUndoRedoService } from '../../../../../platform/undoRedo/common/undoRedo.js';
import { IChatService } from '../../common/chatService.js';
import { ChatEditingSnapshotTextModelContentProvider, ChatEditingTextModelContentProvider } from './chatEditingTextModelContentProviders.js';
let ChatEditingModifiedFileEntry = class ChatEditingModifiedFileEntry extends Disposable {
    static { ChatEditingModifiedFileEntry_1 = this; }
    static { this.scheme = 'modified-file-entry'; }
    static { this.lastEntryId = 0; }
    get onDidDelete() {
        return this._onDidDelete.event;
    }
    get originalURI() {
        return this.docSnapshot.uri;
    }
    get originalModel() {
        return this.docSnapshot;
    }
    get modifiedURI() {
        return this.modifiedModel.uri;
    }
    get modifiedModel() {
        return this.doc;
    }
    get state() {
        return this._stateObs;
    }
    get isCurrentlyBeingModified() {
        return this._isCurrentlyBeingModifiedObs;
    }
    get rewriteRatio() {
        return this._rewriteRatioObs;
    }
    get diffInfo() {
        return this._diffInfo;
    }
    static { this._editDecorationOptions = ModelDecorationOptions.register({
        isWholeLine: true,
        description: 'chat-editing',
        className: 'rangeHighlight',
        marginClassName: 'rangeHighlight',
        overviewRuler: {
            position: OverviewRulerLane.Full,
            color: themeColorFromId(editorSelectionBackground)
        },
    }); }
    get telemetryInfo() {
        return this._telemetryInfo;
    }
    get lastModifyingRequestId() {
        return this._telemetryInfo.requestId;
    }
    constructor(resourceRef, _multiDiffEntryDelegate, _telemetryInfo, kind, modelService, textModelService, languageService, _chatService, _editorWorkerService, _undoRedoService, _fileService) {
        super();
        this._multiDiffEntryDelegate = _multiDiffEntryDelegate;
        this._telemetryInfo = _telemetryInfo;
        this._chatService = _chatService;
        this._editorWorkerService = _editorWorkerService;
        this._undoRedoService = _undoRedoService;
        this._fileService = _fileService;
        this.entryId = `${ChatEditingModifiedFileEntry_1.scheme}::${++ChatEditingModifiedFileEntry_1.lastEntryId}`;
        this._allEditsAreFromUs = true;
        this._onDidDelete = this._register(new Emitter());
        this._stateObs = observableValue(this, 0 /* WorkingSetEntryState.Modified */);
        this._isCurrentlyBeingModifiedObs = observableValue(this, false);
        this._rewriteRatioObs = observableValue(this, 0);
        this._isFirstEditAfterStartOrSnapshot = true;
        this._edit = OffsetEdit.empty;
        this._isEditFromUs = false;
        this._diffOperationIds = 0;
        this._diffInfo = observableValue(this, nullDocumentDiff);
        this._editDecorationClear = this._register(new RunOnceScheduler(() => { this._editDecorations = this.doc.deltaDecorations(this._editDecorations, []); }, 3000));
        this._editDecorations = [];
        if (kind === 0 /* ChatEditKind.Created */) {
            this.createdInRequestId = this._telemetryInfo.requestId;
        }
        this.docFileEditorModel = this._register(resourceRef).object;
        this.doc = resourceRef.object.textEditorModel;
        this.originalContent = this.doc.getValue();
        const docSnapshot = this.docSnapshot = this._register(modelService.createModel(createTextBufferFactoryFromSnapshot(this.doc.createSnapshot()), languageService.createById(this.doc.getLanguageId()), ChatEditingTextModelContentProvider.getFileURI(this.entryId, this.modifiedURI.path), false));
        // Create a reference to this model to avoid it being disposed from under our nose
        (async () => {
            const reference = await textModelService.createModelReference(docSnapshot.uri);
            if (this._store.isDisposed) {
                reference.dispose();
                return;
            }
            this._register(reference);
        })();
        this._register(this.doc.onDidChangeContent(e => this._mirrorEdits(e)));
        this._register(this._fileService.watch(this.modifiedURI));
        this._register(this._fileService.onDidFilesChange(e => {
            if (e.affects(this.modifiedURI) && kind === 0 /* ChatEditKind.Created */ && e.gotDeleted()) {
                this._onDidDelete.fire();
            }
        }));
        this._register(toDisposable(() => {
            this._clearCurrentEditLineDecoration();
        }));
    }
    _clearCurrentEditLineDecoration() {
        this._editDecorations = this.doc.deltaDecorations(this._editDecorations, []);
    }
    updateTelemetryInfo(telemetryInfo) {
        this._telemetryInfo = telemetryInfo;
    }
    createSnapshot(requestId) {
        this._isFirstEditAfterStartOrSnapshot = true;
        return {
            resource: this.modifiedURI,
            languageId: this.modifiedModel.getLanguageId(),
            snapshotUri: ChatEditingSnapshotTextModelContentProvider.getSnapshotFileURI(requestId, this.modifiedURI.path),
            original: this.originalModel.getValue(),
            current: this.modifiedModel.getValue(),
            originalToCurrentEdit: this._edit,
            state: this.state.get(),
            telemetryInfo: this._telemetryInfo
        };
    }
    restoreFromSnapshot(snapshot) {
        this._stateObs.set(snapshot.state, undefined);
        this.docSnapshot.setValue(snapshot.original);
        this._setDocValue(snapshot.current);
        this._edit = snapshot.originalToCurrentEdit;
    }
    resetToInitialValue(value) {
        this._setDocValue(value);
    }
    acceptStreamingEditsStart(tx) {
        this._resetEditsState(tx);
    }
    acceptStreamingEditsEnd(tx) {
        this._resetEditsState(tx);
    }
    _resetEditsState(tx) {
        this._isCurrentlyBeingModifiedObs.set(false, tx);
        this._rewriteRatioObs.set(0, tx);
        this._clearCurrentEditLineDecoration();
    }
    _mirrorEdits(event) {
        const edit = OffsetEdits.fromContentChanges(event.changes);
        if (this._isEditFromUs) {
            const e_sum = this._edit;
            const e_ai = edit;
            this._edit = e_sum.compose(e_ai);
        }
        else {
            //           e_ai
            //   d0 ---------------> s0
            //   |                   |
            //   |                   |
            //   | e_user_r          | e_user
            //   |                   |
            //   |                   |
            //   v       e_ai_r      v
            ///  d1 ---------------> s1
            //
            // d0 - document snapshot
            // s0 - document
            // e_ai - ai edits
            // e_user - user edits
            //
            const e_ai = this._edit;
            const e_user = edit;
            const e_user_r = e_user.tryRebase(e_ai.inverse(this.docSnapshot.getValue()), true);
            if (e_user_r === undefined) {
                // user edits overlaps/conflicts with AI edits
                this._edit = e_ai.compose(e_user);
            }
            else {
                const edits = OffsetEdits.asEditOperations(e_user_r, this.docSnapshot);
                this.docSnapshot.applyEdits(edits);
                this._edit = e_ai.tryRebase(e_user_r);
            }
            this._allEditsAreFromUs = false;
        }
        if (!this.isCurrentlyBeingModified.get()) {
            const didResetToOriginalContent = this.doc.getValue() === this.originalContent;
            const currentState = this._stateObs.get();
            switch (currentState) {
                case 0 /* WorkingSetEntryState.Modified */:
                    if (didResetToOriginalContent) {
                        this._stateObs.set(2 /* WorkingSetEntryState.Rejected */, undefined);
                        break;
                    }
            }
        }
        this._updateDiffInfoSeq(!this._isEditFromUs);
    }
    acceptAgentEdits(textEdits, isLastEdits) {
        // highlight edits
        this._editDecorations = this.doc.deltaDecorations(this._editDecorations, textEdits.map(edit => {
            return {
                options: ChatEditingModifiedFileEntry_1._editDecorationOptions,
                range: edit.range
            };
        }));
        this._editDecorationClear.schedule();
        // push stack element for the first edit
        if (this._isFirstEditAfterStartOrSnapshot) {
            this._isFirstEditAfterStartOrSnapshot = false;
            const request = this._chatService.getSession(this._telemetryInfo.sessionId)?.getRequests().at(-1);
            const label = request?.message.text ? localize('chatEditing1', "Chat Edit: '{0}'", request.message.text) : localize('chatEditing2', "Chat Edit");
            this._undoRedoService.pushElement(new SingleModelEditStackElement(label, 'chat.edit', this.doc, null));
        }
        const ops = textEdits.map(TextEdit.asEditOperation);
        this._applyEdits(ops);
        transaction((tx) => {
            if (!isLastEdits) {
                this._stateObs.set(0 /* WorkingSetEntryState.Modified */, tx);
                this._isCurrentlyBeingModifiedObs.set(true, tx);
                const maxLineNumber = ops.reduce((max, op) => Math.max(max, op.range.endLineNumber), 0);
                const lineCount = this.doc.getLineCount();
                this._rewriteRatioObs.set(Math.min(1, maxLineNumber / lineCount), tx);
            }
            else {
                this._resetEditsState(tx);
                this._updateDiffInfoSeq(true);
                this._rewriteRatioObs.set(1, tx);
            }
        });
    }
    _applyEdits(edits) {
        // make the actual edit
        this._isEditFromUs = true;
        try {
            this.doc.pushEditOperations(null, edits, () => null);
        }
        finally {
            this._isEditFromUs = false;
        }
    }
    _updateDiffInfoSeq(fast) {
        const myDiffOperationId = ++this._diffOperationIds;
        Promise.resolve(this._diffOperation).then(() => {
            if (this._diffOperationIds === myDiffOperationId) {
                this._diffOperation = this._updateDiffInfo(fast);
            }
        });
    }
    async _updateDiffInfo(fast) {
        if (this.docSnapshot.isDisposed() || this.doc.isDisposed()) {
            return;
        }
        const docVersionNow = this.doc.getVersionId();
        const snapshotVersionNow = this.docSnapshot.getVersionId();
        const [diff] = await Promise.all([
            this._editorWorkerService.computeDiff(this.docSnapshot.uri, this.doc.uri, { computeMoves: true, ignoreTrimWhitespace: false, maxComputationTimeMs: 3000 }, 'advanced'),
            timeout(fast ? 50 : 800) // DON't diff too fast
        ]);
        if (this.docSnapshot.isDisposed() || this.doc.isDisposed()) {
            return;
        }
        // only update the diff if the documents didn't change in the meantime
        if (this.doc.getVersionId() === docVersionNow && this.docSnapshot.getVersionId() === snapshotVersionNow) {
            const diff2 = diff ?? nullDocumentDiff;
            this._diffInfo.set(diff2, undefined);
            this._edit = OffsetEdits.fromLineRangeMapping(this.docSnapshot, this.doc, diff2.changes);
        }
    }
    async accept(transaction) {
        if (this._stateObs.get() !== 0 /* WorkingSetEntryState.Modified */) {
            // already accepted or rejected
            return;
        }
        this.docSnapshot.setValue(this.doc.createSnapshot());
        this._edit = OffsetEdit.empty;
        this._stateObs.set(1 /* WorkingSetEntryState.Accepted */, transaction);
        await this.collapse(transaction);
        this._notifyAction('accepted');
    }
    async reject(transaction) {
        if (this._stateObs.get() !== 0 /* WorkingSetEntryState.Modified */) {
            // already accepted or rejected
            return;
        }
        this._stateObs.set(2 /* WorkingSetEntryState.Rejected */, transaction);
        this._notifyAction('rejected');
        if (this.createdInRequestId === this._telemetryInfo.requestId) {
            await this._fileService.del(this.modifiedURI);
            this._onDidDelete.fire();
        }
        else {
            this._setDocValue(this.docSnapshot.getValue());
            if (this._allEditsAreFromUs) {
                // save the file after discarding so that the dirty indicator goes away
                // and so that an intermediate saved state gets reverted
                await this.docFileEditorModel.save({ reason: 1 /* SaveReason.EXPLICIT */ });
            }
            await this.collapse(transaction);
        }
    }
    _setDocValue(value) {
        this.doc.pushStackElement();
        const edit = EditOperation.replace(this.doc.getFullModelRange(), value);
        this._applyEdits([edit]);
        this.doc.pushStackElement();
    }
    async collapse(transaction) {
        this._multiDiffEntryDelegate.collapse(transaction);
    }
    _notifyAction(outcome) {
        this._chatService.notifyUserAction({
            action: { kind: 'chatEditingSessionAction', uri: this.modifiedURI, hasRemainingEdits: false, outcome },
            agentId: this._telemetryInfo.agentId,
            command: this._telemetryInfo.command,
            sessionId: this._telemetryInfo.sessionId,
            requestId: this._telemetryInfo.requestId,
            result: this._telemetryInfo.result
        });
    }
};
ChatEditingModifiedFileEntry = ChatEditingModifiedFileEntry_1 = __decorate([
    __param(4, IModelService),
    __param(5, ITextModelService),
    __param(6, ILanguageService),
    __param(7, IChatService),
    __param(8, IEditorWorkerService),
    __param(9, IUndoRedoService),
    __param(10, IFileService)
], ChatEditingModifiedFileEntry);
export { ChatEditingModifiedFileEntry };
