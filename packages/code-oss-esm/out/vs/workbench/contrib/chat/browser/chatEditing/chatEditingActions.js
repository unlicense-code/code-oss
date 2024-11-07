/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Codicon } from '../../../../../base/common/codicons.js';
import { ResourceSet } from '../../../../../base/common/map.js';
import { basename } from '../../../../../base/common/resources.js';
import { URI } from '../../../../../base/common/uri.js';
import { isCodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { localize, localize2 } from '../../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { EditorActivation } from '../../../../../platform/editor/common/editor.js';
import { IListService } from '../../../../../platform/list/browser/listService.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { ChatAgentLocation } from '../../common/chatAgents.js';
import { ChatContextKeys } from '../../common/chatContextKeys.js';
import { applyingChatEditsFailedContextKey, CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME, chatEditingResourceContextKey, chatEditingWidgetFileStateContextKey, decidedChatEditingResourceContextKey, hasAppliedChatEditsContextKey, hasUndecidedChatEditingResourceContextKey, IChatEditingService } from '../../common/chatEditingService.js';
import { IChatService } from '../../common/chatService.js';
import { isRequestVM, isResponseVM } from '../../common/chatViewModel.js';
import { CHAT_CATEGORY } from '../actions/chatActions.js';
import { IChatWidgetService } from '../chat.js';
class WorkingSetAction extends Action2 {
    run(accessor, ...args) {
        const chatEditingService = accessor.get(IChatEditingService);
        const currentEditingSession = chatEditingService.currentEditingSession;
        if (!currentEditingSession) {
            return;
        }
        const chatWidget = accessor.get(IChatWidgetService).lastFocusedWidget;
        if (chatWidget?.location !== ChatAgentLocation.EditingSession) {
            return;
        }
        const uris = [];
        if (URI.isUri(args[0])) {
            uris.push(args[0]);
        }
        else if (chatWidget) {
            uris.push(...chatWidget.input.selectedElements);
        }
        if (!uris.length) {
            return;
        }
        return this.runWorkingSetAction(accessor, currentEditingSession, chatWidget, ...uris);
    }
}
registerAction2(class AddFileToWorkingSet extends WorkingSetAction {
    constructor() {
        super({
            id: 'chatEditing.addFileToWorkingSet',
            title: localize2('addFileToWorkingSet', 'Add File'),
            icon: Codicon.plus,
            menu: [{
                    id: MenuId.ChatEditingWidgetModifiedFilesToolbar,
                    when: ContextKeyExpr.equals(chatEditingWidgetFileStateContextKey.key, 3 /* WorkingSetEntryState.Transient */),
                    order: 0,
                    group: 'navigation'
                }],
        });
    }
    async runWorkingSetAction(_accessor, currentEditingSession, _chatWidget, ...uris) {
        for (const uri of uris) {
            currentEditingSession.addFileToWorkingSet(uri);
        }
    }
});
registerAction2(class RemoveFileFromWorkingSet extends WorkingSetAction {
    constructor() {
        super({
            id: 'chatEditing.removeFileFromWorkingSet',
            title: localize2('removeFileFromWorkingSet', 'Remove File'),
            icon: Codicon.close,
            menu: [{
                    id: MenuId.ChatEditingWidgetModifiedFilesToolbar,
                    when: ContextKeyExpr.or(ContextKeyExpr.equals(chatEditingWidgetFileStateContextKey.key, 4 /* WorkingSetEntryState.Attached */), ContextKeyExpr.equals(chatEditingWidgetFileStateContextKey.key, 3 /* WorkingSetEntryState.Transient */)),
                    order: 0,
                    group: 'navigation'
                }],
        });
    }
    async runWorkingSetAction(accessor, currentEditingSession, chatWidget, ...uris) {
        // Remove from working set
        currentEditingSession.remove(...uris);
        // Remove from chat input part
        const resourceSet = new ResourceSet(uris);
        const newContext = [];
        for (const context of chatWidget.input.attachmentModel.attachments) {
            if (!URI.isUri(context.value) || !context.isFile || !resourceSet.has(context.value)) {
                newContext.push(context);
            }
        }
        chatWidget.attachmentModel.clearAndSetContext(...newContext);
    }
});
registerAction2(class OpenFileInDiffAction extends WorkingSetAction {
    constructor() {
        super({
            id: 'chatEditing.openFileInDiff',
            title: localize2('open.fileInDiff', 'Open Changes in Diff Editor'),
            icon: Codicon.diffSingle,
            menu: [{
                    id: MenuId.ChatEditingWidgetModifiedFilesToolbar,
                    when: ContextKeyExpr.equals(chatEditingWidgetFileStateContextKey.key, 0 /* WorkingSetEntryState.Modified */),
                    order: 2,
                    group: 'navigation'
                }],
        });
    }
    async runWorkingSetAction(accessor, currentEditingSession, _chatWidget, ...uris) {
        const editorService = accessor.get(IEditorService);
        for (const uri of uris) {
            const editedFile = currentEditingSession.entries.get().find((e) => e.modifiedURI.toString() === uri.toString());
            if (editedFile?.state.get() === 0 /* WorkingSetEntryState.Modified */) {
                await editorService.openEditor({
                    original: { resource: URI.from(editedFile.originalURI, true) },
                    modified: { resource: URI.from(editedFile.modifiedURI, true) },
                });
            }
            else {
                await editorService.openEditor({ resource: uri });
            }
        }
    }
});
registerAction2(class AcceptAction extends WorkingSetAction {
    constructor() {
        super({
            id: 'chatEditing.acceptFile',
            title: localize2('accept.file', 'Accept'),
            icon: Codicon.check,
            menu: [{
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('resourceScheme', CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME), ContextKeyExpr.notIn(chatEditingResourceContextKey.key, decidedChatEditingResourceContextKey.key)),
                    id: MenuId.MultiDiffEditorFileToolbar,
                    order: 0,
                    group: 'navigation',
                }, {
                    id: MenuId.ChatEditingWidgetModifiedFilesToolbar,
                    when: ContextKeyExpr.equals(chatEditingWidgetFileStateContextKey.key, 0 /* WorkingSetEntryState.Modified */),
                    order: 0,
                    group: 'navigation'
                }],
        });
    }
    async runWorkingSetAction(accessor, currentEditingSession, chatWidget, ...uris) {
        await currentEditingSession.accept(...uris);
    }
});
registerAction2(class DiscardAction extends WorkingSetAction {
    constructor() {
        super({
            id: 'chatEditing.discardFile',
            title: localize2('discard.file', 'Discard'),
            icon: Codicon.discard,
            menu: [{
                    when: ContextKeyExpr.and(ContextKeyExpr.equals('resourceScheme', CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME), ContextKeyExpr.notIn(chatEditingResourceContextKey.key, decidedChatEditingResourceContextKey.key)),
                    id: MenuId.MultiDiffEditorFileToolbar,
                    order: 2,
                    group: 'navigation',
                }, {
                    id: MenuId.ChatEditingWidgetModifiedFilesToolbar,
                    when: ContextKeyExpr.equals(chatEditingWidgetFileStateContextKey.key, 0 /* WorkingSetEntryState.Modified */),
                    order: 1,
                    group: 'navigation'
                }],
        });
    }
    async runWorkingSetAction(accessor, currentEditingSession, chatWidget, ...uris) {
        await currentEditingSession.reject(...uris);
    }
});
export class ChatEditingAcceptAllAction extends Action2 {
    constructor() {
        super({
            id: 'chatEditing.acceptAllFiles',
            title: localize('accept', 'Accept'),
            icon: Codicon.check,
            tooltip: localize('acceptAllEdits', 'Accept All Edits'),
            precondition: ContextKeyExpr.and(ChatContextKeys.requestInProgress.negate(), hasUndecidedChatEditingResourceContextKey),
            keybinding: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                when: ContextKeyExpr.and(ChatContextKeys.requestInProgress.negate(), hasUndecidedChatEditingResourceContextKey, ChatContextKeys.location.isEqualTo(ChatAgentLocation.EditingSession), ChatContextKeys.inChatInput),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            },
            menu: [
                {
                    when: ContextKeyExpr.equals('resourceScheme', CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME),
                    id: MenuId.EditorTitle,
                    order: 0,
                    group: 'navigation',
                },
                {
                    id: MenuId.ChatEditingWidgetToolbar,
                    group: 'navigation',
                    order: 0,
                    when: ContextKeyExpr.and(applyingChatEditsFailedContextKey.negate(), ContextKeyExpr.or(hasAppliedChatEditsContextKey.negate(), ContextKeyExpr.and(hasUndecidedChatEditingResourceContextKey, ContextKeyExpr.and(ChatContextKeys.location.isEqualTo(ChatAgentLocation.EditingSession)))))
                }
            ]
        });
    }
    async run(accessor, ...args) {
        const chatEditingService = accessor.get(IChatEditingService);
        const currentEditingSession = chatEditingService.currentEditingSession;
        if (!currentEditingSession) {
            return;
        }
        await currentEditingSession.accept();
    }
}
registerAction2(ChatEditingAcceptAllAction);
export class ChatEditingDiscardAllAction extends Action2 {
    constructor() {
        super({
            id: 'chatEditing.discardAllFiles',
            title: localize('discard', 'Discard'),
            icon: Codicon.discard,
            tooltip: localize('discardAllEdits', 'Discard All Edits'),
            precondition: ContextKeyExpr.and(ChatContextKeys.requestInProgress.negate(), hasUndecidedChatEditingResourceContextKey),
            menu: [
                {
                    when: ContextKeyExpr.equals('resourceScheme', CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME),
                    id: MenuId.EditorTitle,
                    order: 1,
                    group: 'navigation',
                },
                {
                    id: MenuId.ChatEditingWidgetToolbar,
                    group: 'navigation',
                    order: 1,
                    when: ContextKeyExpr.and(applyingChatEditsFailedContextKey.negate(), ContextKeyExpr.or(hasAppliedChatEditsContextKey.negate(), ContextKeyExpr.and(ChatContextKeys.location.isEqualTo(ChatAgentLocation.EditingSession), hasUndecidedChatEditingResourceContextKey)))
                }
            ],
            keybinding: {
                when: ContextKeyExpr.and(ChatContextKeys.requestInProgress.negate(), hasUndecidedChatEditingResourceContextKey, ChatContextKeys.location.isEqualTo(ChatAgentLocation.EditingSession), ChatContextKeys.inChatInput, ChatContextKeys.inputHasText.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
            },
        });
    }
    async run(accessor, ...args) {
        const chatEditingService = accessor.get(IChatEditingService);
        const currentEditingSession = chatEditingService.currentEditingSession;
        if (!currentEditingSession) {
            return;
        }
        await currentEditingSession.reject();
    }
}
registerAction2(ChatEditingDiscardAllAction);
export class ChatEditingShowChangesAction extends Action2 {
    static { this.ID = 'chatEditing.viewChanges'; }
    static { this.LABEL = localize('chatEditing.viewChanges', 'View All Edits'); }
    constructor() {
        super({
            id: ChatEditingShowChangesAction.ID,
            title: ChatEditingShowChangesAction.LABEL,
            tooltip: ChatEditingShowChangesAction.LABEL,
            f1: false,
            icon: Codicon.diffMultiple,
            precondition: hasUndecidedChatEditingResourceContextKey,
            menu: [
                {
                    id: MenuId.ChatEditingWidgetToolbar,
                    group: 'navigation',
                    order: 4,
                    when: ContextKeyExpr.and(applyingChatEditsFailedContextKey.negate(), ContextKeyExpr.or(hasAppliedChatEditsContextKey.negate(), ContextKeyExpr.and(hasAppliedChatEditsContextKey, hasUndecidedChatEditingResourceContextKey, ChatContextKeys.location.isEqualTo(ChatAgentLocation.EditingSession))))
                }
            ],
        });
    }
    async run(accessor, ...args) {
        const chatEditingService = accessor.get(IChatEditingService);
        const currentEditingSession = chatEditingService.currentEditingSession;
        if (!currentEditingSession) {
            return;
        }
        await currentEditingSession.show();
    }
}
registerAction2(ChatEditingShowChangesAction);
registerAction2(class AddFilesToWorkingSetAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.chat.addSelectedFilesToWorkingSet',
            title: localize2('workbench.action.chat.addSelectedFilesToWorkingSet.label', "Add Selected Files to Working Set"),
            icon: Codicon.attach,
            category: CHAT_CATEGORY,
            precondition: ChatContextKeys.location.isEqualTo(ChatAgentLocation.EditingSession),
            f1: true
        });
    }
    async run(accessor, ...args) {
        const listService = accessor.get(IListService);
        const chatEditingService = accessor.get(IChatEditingService);
        const editorGroupService = accessor.get(IEditorGroupsService);
        const uris = [];
        for (const group of editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
            for (const selection of group.selectedEditors) {
                if (selection.resource) {
                    uris.push(selection.resource);
                }
            }
        }
        if (uris.length === 0) {
            const selection = listService.lastFocusedList?.getSelection();
            if (selection?.length) {
                for (const file of selection) {
                    if (!!file && typeof file === 'object' && 'resource' in file && URI.isUri(file.resource)) {
                        uris.push(file.resource);
                    }
                }
            }
        }
        for (const file of uris) {
            chatEditingService?.currentEditingSessionObs.get()?.addFileToWorkingSet(file);
        }
    }
});
registerAction2(class RemoveAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.chat.undoEdits',
            title: localize2('chat.undoEdits.label', "Undo Edits"),
            f1: false,
            category: CHAT_CATEGORY,
            icon: Codicon.x,
            keybinding: {
                primary: 20 /* KeyCode.Delete */,
                mac: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                },
                when: ContextKeyExpr.and(ChatContextKeys.location.isEqualTo(ChatAgentLocation.EditingSession), ChatContextKeys.inChatSession, ChatContextKeys.inChatInput.negate()),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            },
            menu: [
                {
                    id: MenuId.ChatMessageTitle,
                    group: 'navigation',
                    order: 2,
                    when: ContextKeyExpr.and(ChatContextKeys.location.isEqualTo(ChatAgentLocation.EditingSession), ChatContextKeys.isRequest)
                }
            ]
        });
    }
    async run(accessor, ...args) {
        let item = args[0];
        if (!isResponseVM(item) && !isRequestVM(item)) {
            const chatWidgetService = accessor.get(IChatWidgetService);
            const widget = chatWidgetService.lastFocusedWidget;
            item = widget?.getFocus();
        }
        if (!item) {
            return;
        }
        const chatService = accessor.get(IChatService);
        const chatModel = chatService.getSession(item.sessionId);
        if (chatModel?.initialLocation !== ChatAgentLocation.EditingSession) {
            return;
        }
        const requestId = isRequestVM(item) ? item.id :
            isResponseVM(item) ? item.requestId : undefined;
        if (requestId) {
            const configurationService = accessor.get(IConfigurationService);
            const dialogService = accessor.get(IDialogService);
            const chatEditingService = accessor.get(IChatEditingService);
            const chatRequests = chatModel.getRequests();
            const itemIndex = chatRequests.findIndex(request => request.id === requestId);
            const editsToUndo = chatRequests.length - itemIndex;
            const requestsToRemove = chatRequests.slice(itemIndex);
            const requestIdsToRemove = new Set(requestsToRemove.map(request => request.id));
            const entriesModifiedInRequestsToRemove = chatEditingService.currentEditingSessionObs.get()?.entries.get().filter((entry) => requestIdsToRemove.has(entry.lastModifyingRequestId)) ?? [];
            const shouldPrompt = entriesModifiedInRequestsToRemove.length > 0 && configurationService.getValue('chat.editing.confirmEditRequestRemoval') === true;
            let message;
            if (editsToUndo === 1) {
                if (entriesModifiedInRequestsToRemove.length === 1) {
                    message = localize('chat.removeLast.confirmation.message2', "This will remove your last request and undo the edits made to {0}. Do you want to proceed?", basename(entriesModifiedInRequestsToRemove[0].modifiedURI));
                }
                else {
                    message = localize('chat.removeLast.confirmation.multipleEdits.message', "This will remove your last request and undo edits made to {0} files in your working set. Do you want to proceed?", entriesModifiedInRequestsToRemove.length);
                }
            }
            else {
                if (entriesModifiedInRequestsToRemove.length === 1) {
                    message = localize('chat.remove.confirmation.message2', "This will remove all subsequent requests and undo edits made to {0}. Do you want to proceed?", basename(entriesModifiedInRequestsToRemove[0].modifiedURI));
                }
                else {
                    message = localize('chat.remove.confirmation.multipleEdits.message', "This will remove all subsequent requests and undo edits made to {0} files in your working set. Do you want to proceed?", entriesModifiedInRequestsToRemove.length);
                }
            }
            const confirmation = shouldPrompt
                ? await dialogService.confirm({
                    title: editsToUndo === 1
                        ? localize('chat.removeLast.confirmation.title', "Do you want to undo your last edit?")
                        : localize('chat.remove.confirmation.title', "Do you want to undo {0} edits?", editsToUndo),
                    message: message,
                    primaryButton: localize('chat.remove.confirmation.primaryButton', "Yes"),
                    checkbox: { label: localize('chat.remove.confirmation.checkbox', "Don't ask again"), checked: false },
                    type: 'info'
                })
                : { confirmed: true };
            if (!confirmation.confirmed) {
                return;
            }
            if (confirmation.checkboxChecked) {
                await configurationService.updateValue('chat.editing.confirmEditRequestRemoval', false);
            }
            // Restore the snapshot to what it was before the request(s) that we deleted
            const snapshotRequestId = chatRequests[itemIndex].id;
            await chatEditingService.restoreSnapshot(snapshotRequestId);
            // Remove the request and all that come after it
            for (const request of requestsToRemove) {
                await chatService.removeRequest(item.sessionId, request.id);
            }
        }
    }
});
registerAction2(class OpenWorkingSetHistoryAction extends Action2 {
    static { this.id = 'chat.openFileSnapshot'; }
    constructor() {
        super({
            id: OpenWorkingSetHistoryAction.id,
            title: localize('chat.openSnapshot.label', "Open File Snapshot"),
            menu: [{
                    id: MenuId.ChatEditingCodeBlockContext,
                    group: 'navigation',
                    order: 0,
                    when: ContextKeyExpr.notIn(ChatContextKeys.itemId.key, ChatContextKeys.lastItemId.key),
                },]
        });
    }
    async run(accessor, ...args) {
        const context = args[0];
        if (!context?.sessionId) {
            return;
        }
        const chatService = accessor.get(IChatService);
        const chatEditingService = accessor.get(IChatEditingService);
        const editorService = accessor.get(IEditorService);
        const chatModel = chatService.getSession(context.sessionId);
        const requests = chatModel?.getRequests();
        if (!requests) {
            return;
        }
        const snapshotRequestIndex = requests?.findIndex((v, i) => i > 0 && requests[i - 1]?.id === context.requestId);
        if (snapshotRequestIndex < 1) {
            return;
        }
        const snapshotRequestId = requests[snapshotRequestIndex]?.id;
        if (snapshotRequestId) {
            const snapshot = chatEditingService.getSnapshotUri(snapshotRequestId, context.uri);
            if (snapshot) {
                const editor = await editorService.openEditor({ resource: snapshot, label: localize('chatEditing.snapshot', '{0} (Snapshot {1})', basename(context.uri), snapshotRequestIndex - 1), options: { transient: true, activation: EditorActivation.ACTIVATE } });
                if (isCodeEditor(editor)) {
                    editor.updateOptions({ readOnly: true });
                }
            }
        }
    }
});
