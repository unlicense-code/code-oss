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
import { Queue } from '../../../../base/common/async.js';
import { DisposableStore, MutableDisposable, combinedDisposable, dispose } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInlineChatSessionService } from './inlineChatSessionService.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { Schemas } from '../../../../base/common/network.js';
import { CellUri } from '../../notebook/common/notebookCommon.js';
import { IWorkingCopyFileService } from '../../../services/workingCopy/common/workingCopyFileService.js';
import { Event } from '../../../../base/common/event.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { CancellationError } from '../../../../base/common/errors.js';
// TODO@jrieken this duplicates a config key
const key = 'chat.editing.alwaysSaveWithGeneratedChanges';
let InlineChatSavingServiceImpl = class InlineChatSavingServiceImpl {
    constructor(_fileConfigService, _editorGroupService, _textFileService, _inlineChatSessionService, _configService, _workingCopyFileService, _dialogService, _labelService) {
        this._fileConfigService = _fileConfigService;
        this._editorGroupService = _editorGroupService;
        this._textFileService = _textFileService;
        this._configService = _configService;
        this._workingCopyFileService = _workingCopyFileService;
        this._dialogService = _dialogService;
        this._labelService = _labelService;
        this._store = new DisposableStore();
        this._saveParticipant = this._store.add(new MutableDisposable());
        this._sessionData = new Map();
        this._store.add(Event.any(_inlineChatSessionService.onDidEndSession, _inlineChatSessionService.onDidStashSession)(e => {
            this._sessionData.get(e.session)?.dispose();
        }));
        this._store.add(_configService.onDidChangeConfiguration(e => {
            if (!e.affectsConfiguration(key) && !e.affectsConfiguration("inlineChat.acceptedOrDiscardBeforeSave" /* InlineChatConfigKeys.AcceptedOrDiscardBeforeSave */)) {
                return;
            }
            if (this._isDisabled()) {
                dispose(this._sessionData.values());
                this._sessionData.clear();
            }
        }));
    }
    dispose() {
        this._store.dispose();
        dispose(this._sessionData.values());
    }
    markChanged(session) {
        if (this._isDisabled()) {
            return;
        }
        if (!this._sessionData.has(session)) {
            let uri = session.targetUri;
            // notebooks: use the notebook-uri because saving happens on the notebook-level
            if (uri.scheme === Schemas.vscodeNotebookCell) {
                const data = CellUri.parse(uri);
                if (!data) {
                    return;
                }
                uri = data?.notebook;
            }
            if (this._sessionData.size === 0) {
                this._installSaveParticpant();
            }
            const saveConfigOverride = this._fileConfigService.disableAutoSave(uri);
            this._sessionData.set(session, {
                resourceUri: uri,
                groupCandidate: this._editorGroupService.activeGroup,
                session,
                dispose: () => {
                    saveConfigOverride.dispose();
                    this._sessionData.delete(session);
                    if (this._sessionData.size === 0) {
                        this._saveParticipant.clear();
                    }
                }
            });
        }
    }
    _installSaveParticpant() {
        const queue = new Queue();
        const d1 = this._textFileService.files.addSaveParticipant({
            participate: (model, ctx, progress, token) => {
                return queue.queue(() => this._participate(ctx.savedFrom ?? model.textEditorModel?.uri, ctx.reason, progress, token));
            }
        });
        const d2 = this._workingCopyFileService.addSaveParticipant({
            participate: (workingCopy, ctx, progress, token) => {
                return queue.queue(() => this._participate(ctx.savedFrom ?? workingCopy.resource, ctx.reason, progress, token));
            }
        });
        this._saveParticipant.value = combinedDisposable(d1, d2, queue);
    }
    async _participate(uri, reason, progress, token) {
        if (reason !== 1 /* SaveReason.EXPLICIT */) {
            // all saves that we are concerned about are explicit
            // because we have disabled auto-save for them
            return;
        }
        if (this._isDisabled()) {
            // disabled
            return;
        }
        const sessions = new Map();
        for (const [session, data] of this._sessionData) {
            if (uri?.toString() === data.resourceUri.toString()) {
                sessions.set(session, data);
            }
        }
        if (sessions.size === 0) {
            return;
        }
        let message;
        if (sessions.size === 1) {
            const session = Iterable.first(sessions.values()).session;
            const agentName = session.agent.fullName;
            const filelabel = this._labelService.getUriBasenameLabel(session.textModelN.uri);
            message = localize('message.1', "Do you want to save the changes {0} made in {1}?", agentName, filelabel);
        }
        else {
            const labels = Array.from(Iterable.map(sessions.values(), i => this._labelService.getUriBasenameLabel(i.session.textModelN.uri)));
            message = localize('message.2', "Do you want to save the changes inline chat made in {0}?", labels.join(', '));
        }
        const result = await this._dialogService.confirm({
            message,
            detail: localize('detail', "AI-generated changes may be incorrect and should be reviewed before saving."),
            primaryButton: localize('save', "Save"),
            cancelButton: localize('discard', "Cancel"),
            checkbox: {
                label: localize('config', "Always save with AI-generated changes without asking"),
                checked: false
            }
        });
        if (!result.confirmed) {
            // cancel the save
            throw new CancellationError();
        }
        if (result.checkboxChecked) {
            // remember choice
            this._configService.updateValue(key, true);
        }
    }
    _isDisabled() {
        return this._configService.getValue("inlineChat.acceptedOrDiscardBeforeSave" /* InlineChatConfigKeys.AcceptedOrDiscardBeforeSave */) === true || this._configService.getValue(key);
    }
};
InlineChatSavingServiceImpl = __decorate([
    __param(0, IFilesConfigurationService),
    __param(1, IEditorGroupsService),
    __param(2, ITextFileService),
    __param(3, IInlineChatSessionService),
    __param(4, IConfigurationService),
    __param(5, IWorkingCopyFileService),
    __param(6, IDialogService),
    __param(7, ILabelService)
], InlineChatSavingServiceImpl);
export { InlineChatSavingServiceImpl };
