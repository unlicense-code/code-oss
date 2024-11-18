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
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ResourceSet } from '../../../../../base/common/map.js';
import { localize } from '../../../../../nls.js';
import { IChatEditingService } from '../../common/chatEditingService.js';
import { IChatWidgetService } from '../chat.js';
let ChatRelatedFilesContribution = class ChatRelatedFilesContribution extends Disposable {
    static { this.ID = 'chat.relatedFilesWorkingSet'; }
    constructor(chatEditingService, chatWidgetService) {
        super();
        this.chatEditingService = chatEditingService;
        this.chatWidgetService = chatWidgetService;
        this.chatEditingSessionDisposables = new DisposableStore();
        this._handleNewEditingSession();
        this._register(this.chatEditingService.onDidCreateEditingSession(() => {
            this.chatEditingSessionDisposables.clear();
            this._handleNewEditingSession();
        }));
    }
    _updateRelatedFileSuggestions() {
        if (this._currentRelatedFilesRetrievalOperation) {
            return;
        }
        const currentEditingSession = this.chatEditingService.currentEditingSessionObs.get();
        if (currentEditingSession) {
            const workingSetEntries = currentEditingSession.entries.get();
            if (workingSetEntries.length > 0) {
                // Do this only for the initial working set state
                return;
            }
            const widget = this.chatWidgetService.getWidgetBySessionId(currentEditingSession.chatSessionId);
            if (!widget) {
                return;
            }
            this._currentRelatedFilesRetrievalOperation = this.chatEditingService.getRelatedFiles(currentEditingSession.chatSessionId, widget.getInput(), CancellationToken.None)
                .then((files) => {
                if (!files?.length) {
                    return;
                }
                const currentEditingSession = this.chatEditingService.currentEditingSessionObs.get();
                if (!currentEditingSession || currentEditingSession.chatSessionId !== widget.viewModel?.sessionId || currentEditingSession.entries.get()) {
                    return; // Might have disposed while we were calculating
                }
                // Pick up to 2 related files, or however many we can still fit in the working set
                const maximumRelatedFiles = Math.min(2, this.chatEditingService.editingSessionFileLimit - widget.input.chatEditWorkingSetFiles.length);
                const newSuggestions = new ResourceSet();
                for (const group of files) {
                    for (const file of group.files) {
                        if (newSuggestions.size >= maximumRelatedFiles) {
                            break;
                        }
                        newSuggestions.add(file.uri);
                    }
                }
                // Remove the existing related file suggestions from the working set
                const existingSuggestedEntriesToRemove = [];
                for (const entry of currentEditingSession.workingSet) {
                    if (entry[1].state === 6 /* WorkingSetEntryState.Suggested */ && !newSuggestions.has(entry[0])) {
                        existingSuggestedEntriesToRemove.push(entry[0]);
                    }
                }
                currentEditingSession?.remove(...existingSuggestedEntriesToRemove);
                // Add the new related file suggestions to the working set
                for (const file of newSuggestions) {
                    currentEditingSession.addFileToWorkingSet(file, localize('relatedFile', "Suggested File"), 6 /* WorkingSetEntryState.Suggested */);
                }
            })
                .finally(() => {
                this._currentRelatedFilesRetrievalOperation = undefined;
            });
        }
    }
    _handleNewEditingSession() {
        const currentEditingSession = this.chatEditingService.currentEditingSessionObs.get();
        if (!currentEditingSession) {
            return;
        }
        const widget = this.chatWidgetService.getWidgetBySessionId(currentEditingSession.chatSessionId);
        if (!widget || widget.viewModel?.sessionId !== currentEditingSession.chatSessionId) {
            return;
        }
        this.chatEditingSessionDisposables.add(currentEditingSession.onDidDispose(() => {
            this.chatEditingSessionDisposables.clear();
        }));
        this._updateRelatedFileSuggestions();
        const onDebouncedType = Event.debounce(widget.inputEditor.onDidChangeModelContent, () => null, 3000);
        this.chatEditingSessionDisposables.add(onDebouncedType(() => {
            this._updateRelatedFileSuggestions();
        }));
        this.chatEditingSessionDisposables.add(currentEditingSession.onDidChange((e) => {
            if (e === 0 /* ChatEditingSessionChangeType.WorkingSet */) {
                this._updateRelatedFileSuggestions();
            }
        }));
    }
    dispose() {
        this.chatEditingSessionDisposables.dispose();
        super.dispose();
    }
};
ChatRelatedFilesContribution = __decorate([
    __param(0, IChatEditingService),
    __param(1, IChatWidgetService)
], ChatRelatedFilesContribution);
export { ChatRelatedFilesContribution };
