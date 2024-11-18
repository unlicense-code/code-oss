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
var ChatEditorSaving_1;
import { DeferredPromise, RunOnceScheduler } from '../../../../base/common/async.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { CancellationError } from '../../../../base/common/errors.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { ResourceSet } from '../../../../base/common/map.js';
import { autorunWithStore } from '../../../../base/common/observable.js';
import { isEqual } from '../../../../base/common/resources.js';
import { assertType } from '../../../../base/common/types.js';
import { localize } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { ChatAgentLocation, IChatAgentService } from '../common/chatAgents.js';
import { ChatContextKeys } from '../common/chatContextKeys.js';
import { applyingChatEditsFailedContextKey, CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME, hasAppliedChatEditsContextKey, hasUndecidedChatEditingResourceContextKey, IChatEditingService } from '../common/chatEditingService.js';
import { IChatService } from '../common/chatService.js';
import { ChatEditingModifiedFileEntry } from './chatEditing/chatEditingModifiedFileEntry.js';
let ChatEditorSaving = class ChatEditorSaving extends Disposable {
    static { ChatEditorSaving_1 = this; }
    static { this.ID = 'workbench.chat.editorSaving'; }
    static { this._config = 'chat.editing.alwaysSaveWithGeneratedChanges'; }
    constructor(configService, chatEditingService, chatAgentService, textFileService, labelService, dialogService, _chatService, _fileConfigService) {
        super();
        this._chatService = _chatService;
        this._fileConfigService = _fileConfigService;
        this._sessionStore = this._store.add(new DisposableMap());
        // --- report that save happened
        this._store.add(autorunWithStore((r, store) => {
            const session = chatEditingService.currentEditingSessionObs.read(r);
            if (!session) {
                return;
            }
            const chatSession = this._chatService.getSession(session.chatSessionId);
            if (!chatSession) {
                return;
            }
            const entries = session.entries.read(r);
            store.add(textFileService.files.onDidSave(e => {
                const entry = entries.find(entry => isEqual(entry.modifiedURI, e.model.resource));
                if (entry && entry.state.get() === 0 /* WorkingSetEntryState.Modified */) {
                    this._reportSavedWhenReady(chatSession, entry);
                }
            }));
        }));
        const store = this._store.add(new DisposableStore());
        const update = () => {
            store.clear();
            const alwaysSave = configService.getValue(ChatEditorSaving_1._config);
            if (alwaysSave) {
                return;
            }
            if (chatEditingService.currentEditingSession) {
                this._handleNewEditingSession(chatEditingService.currentEditingSession, store);
            }
            const saveJobs = new class {
                constructor() {
                    this._soon = new RunOnceScheduler(() => this._prompt(), 0);
                    this._uris = new ResourceSet();
                }
                add(uri) {
                    this._uris.add(uri);
                    this._soon.schedule();
                    this._deferred ??= new DeferredPromise();
                    return this._deferred.p;
                }
                async _prompt() {
                    // this might have changed in the meantime and there is checked again and acted upon
                    const alwaysSave = configService.getValue(ChatEditorSaving_1._config);
                    if (alwaysSave) {
                        return;
                    }
                    const uri = Iterable.first(this._uris);
                    if (!uri) {
                        // bogous?
                        return;
                    }
                    const agentName = chatAgentService.getDefaultAgent(ChatAgentLocation.EditingSession)?.fullName ?? localize('chat', "chat");
                    const filelabel = labelService.getUriBasenameLabel(uri);
                    const message = this._uris.size === 1
                        ? localize('message.1', "Do you want to save the changes {0} made in {1}?", agentName, filelabel)
                        : localize('message.2', "Do you want to save the changes {0} made to {1} files?", agentName, this._uris.size);
                    const result = await dialogService.confirm({
                        message,
                        detail: localize('detail2', "AI-generated changes may be incorrect and should be reviewed before saving.", agentName),
                        primaryButton: localize('save', "Save"),
                        cancelButton: localize('discard', "Cancel"),
                        checkbox: {
                            label: localize('config', "Always save with AI-generated changes without asking"),
                            checked: false
                        }
                    });
                    this._uris.clear();
                    if (result.confirmed && result.checkboxChecked) {
                        // remember choice
                        await configService.updateValue(ChatEditorSaving_1._config, true);
                    }
                    if (!result.confirmed) {
                        // cancel the save
                        this._deferred?.error(new CancellationError());
                    }
                    else {
                        this._deferred?.complete();
                    }
                    this._deferred = undefined;
                }
            };
            store.add(chatEditingService.onDidCreateEditingSession(e => this._handleNewEditingSession(e, store)));
            store.add(textFileService.files.addSaveParticipant({
                participate: async (workingCopy, context, progress, token) => {
                    if (context.reason !== 1 /* SaveReason.EXPLICIT */) {
                        // all saves that we are concerned about are explicit
                        // because we have disabled auto-save for them
                        return;
                    }
                    const session = chatEditingService.getEditingSession(workingCopy.resource);
                    if (!session) {
                        return;
                    }
                    if (!session.entries.get().find(e => e.state.get() === 0 /* WorkingSetEntryState.Modified */ && e.modifiedURI.toString() === workingCopy.resource.toString())) {
                        return;
                    }
                    return saveJobs.add(workingCopy.resource);
                }
            }));
        };
        configService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(ChatEditorSaving_1._config)) {
                update();
            }
        });
        update();
    }
    _reportSaved(entry) {
        assertType(entry instanceof ChatEditingModifiedFileEntry);
        this._chatService.notifyUserAction({
            action: { kind: 'chatEditingSessionAction', uri: entry.modifiedURI, hasRemainingEdits: false, outcome: 'saved' },
            agentId: entry.telemetryInfo.agentId,
            command: entry.telemetryInfo.command,
            sessionId: entry.telemetryInfo.sessionId,
            requestId: entry.telemetryInfo.requestId,
            result: entry.telemetryInfo.result
        });
    }
    _reportSavedWhenReady(session, entry) {
        if (!session.requestInProgress) {
            this._reportSaved(entry);
            return;
        }
        // wait until no more request is pending
        const d = session.onDidChange(e => {
            if (!session.requestInProgress) {
                this._reportSaved(entry);
                this._store.delete(d);
                d.dispose();
            }
        });
        this._store.add(d);
    }
    _handleNewEditingSession(session, container) {
        const store = new DisposableStore();
        container.add(store);
        // disable auto save for those files involved in editing
        const saveConfig = store.add(new MutableDisposable());
        const update = () => {
            const store = new DisposableStore();
            const entries = session.entries.get();
            for (const entry of entries) {
                if (entry.state.get() === 0 /* WorkingSetEntryState.Modified */) {
                    store.add(this._fileConfigService.disableAutoSave(entry.modifiedURI));
                }
            }
            saveConfig.value = store;
        };
        update();
        this._sessionStore.set(session, store);
        store.add(session.onDidChange(() => {
            update();
        }));
        store.add(session.onDidDispose(() => {
            store.dispose();
            container.delete(store);
        }));
    }
};
ChatEditorSaving = ChatEditorSaving_1 = __decorate([
    __param(0, IConfigurationService),
    __param(1, IChatEditingService),
    __param(2, IChatAgentService),
    __param(3, ITextFileService),
    __param(4, ILabelService),
    __param(5, IDialogService),
    __param(6, IChatService),
    __param(7, IFilesConfigurationService)
], ChatEditorSaving);
export { ChatEditorSaving };
export class ChatEditingSaveAllAction extends Action2 {
    static { this.ID = 'chatEditing.saveAllFiles'; }
    static { this.LABEL = localize('save.allFiles', 'Save All'); }
    constructor() {
        super({
            id: ChatEditingSaveAllAction.ID,
            title: ChatEditingSaveAllAction.LABEL,
            tooltip: ChatEditingSaveAllAction.LABEL,
            precondition: ContextKeyExpr.and(ChatContextKeys.requestInProgress.negate(), hasUndecidedChatEditingResourceContextKey),
            icon: Codicon.saveAll,
            menu: [
                {
                    when: ContextKeyExpr.equals('resourceScheme', CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME),
                    id: MenuId.EditorTitle,
                    order: 2,
                    group: 'navigation',
                },
                {
                    id: MenuId.ChatEditingWidgetToolbar,
                    group: 'navigation',
                    order: 2,
                    // Show the option to save without accepting if the user hasn't configured the setting to always save with generated changes
                    when: ContextKeyExpr.and(applyingChatEditsFailedContextKey.negate(), ContextKeyExpr.or(hasUndecidedChatEditingResourceContextKey, hasAppliedChatEditsContextKey.negate()), ContextKeyExpr.equals(`config.${ChatEditorSaving._config}`, false), ChatContextKeys.location.isEqualTo(ChatAgentLocation.EditingSession))
                }
            ],
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 49 /* KeyCode.KeyS */,
                when: ContextKeyExpr.and(ChatContextKeys.requestInProgress.negate(), hasUndecidedChatEditingResourceContextKey, ChatContextKeys.location.isEqualTo(ChatAgentLocation.EditingSession), ChatContextKeys.inChatInput),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            },
        });
    }
    async run(accessor, ...args) {
        const chatEditingService = accessor.get(IChatEditingService);
        const editorService = accessor.get(IEditorService);
        const configService = accessor.get(IConfigurationService);
        const chatAgentService = accessor.get(IChatAgentService);
        const dialogService = accessor.get(IDialogService);
        const labelService = accessor.get(ILabelService);
        const currentEditingSession = chatEditingService.currentEditingSession;
        if (!currentEditingSession) {
            return;
        }
        const editors = [];
        for (const modifiedFileEntry of currentEditingSession.entries.get()) {
            if (modifiedFileEntry.state.get() === 0 /* WorkingSetEntryState.Modified */) {
                const modifiedFile = modifiedFileEntry.modifiedURI;
                const matchingEditors = editorService.findEditors(modifiedFile);
                if (matchingEditors.length === 0) {
                    continue;
                }
                const matchingEditor = matchingEditors[0];
                if (matchingEditor.editor.isDirty()) {
                    editors.push(matchingEditor);
                }
            }
        }
        if (editors.length === 0) {
            return;
        }
        const alwaysSave = configService.getValue(ChatEditorSaving._config);
        if (!alwaysSave) {
            const agentName = chatAgentService.getDefaultAgent(ChatAgentLocation.EditingSession)?.fullName;
            let message;
            if (editors.length === 1) {
                const resource = editors[0].editor.resource;
                if (resource) {
                    const filelabel = labelService.getUriBasenameLabel(resource);
                    message = agentName
                        ? localize('message.batched.oneFile.1', "Do you want to save the changes {0} made in {1}?", agentName, filelabel)
                        : localize('message.batched.oneFile.2', "Do you want to save the changes chat made in {0}?", filelabel);
                }
                else {
                    message = agentName
                        ? localize('message.batched.oneFile.3', "Do you want to save the changes {0} made in 1 file?", agentName)
                        : localize('message.batched.oneFile.4', "Do you want to save the changes chat made in 1 file?");
                }
            }
            else {
                message = agentName
                    ? localize('message.batched.multiFile.1', "Do you want to save the changes {0} made in {1} files?", agentName, editors.length)
                    : localize('message.batched.multiFile.2', "Do you want to save the changes chat made in {0} files?", editors.length);
            }
            const result = await dialogService.confirm({
                message,
                detail: localize('detail2', "AI-generated changes may be incorrect and should be reviewed before saving.", agentName),
                primaryButton: localize('save all', "Save All"),
                cancelButton: localize('discard', "Cancel"),
                checkbox: {
                    label: localize('config', "Always save with AI-generated changes without asking"),
                    checked: false
                }
            });
            if (!result.confirmed) {
                return;
            }
            if (result.checkboxChecked) {
                await configService.updateValue(ChatEditorSaving._config, true);
            }
        }
        // Skip our own chat editing save blocking participant, since we already showed our own batched dialog
        await editorService.save(editors, { reason: 1 /* SaveReason.EXPLICIT */, skipSaveParticipants: true });
    }
}
registerAction2(ChatEditingSaveAllAction);
