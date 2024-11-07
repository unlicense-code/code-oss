/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from '../../../../nls.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export var ChatContextKeys;
(function (ChatContextKeys) {
    ChatContextKeys.responseVote = new RawContextKey('chatSessionResponseVote', '', { type: 'string', description: localize('interactiveSessionResponseVote', "When the response has been voted up, is set to 'up'. When voted down, is set to 'down'. Otherwise an empty string.") });
    ChatContextKeys.responseDetectedAgentCommand = new RawContextKey('chatSessionResponseDetectedAgentOrCommand', false, { type: 'boolean', description: localize('chatSessionResponseDetectedAgentOrCommand', "When the agent or command was automatically detected") });
    ChatContextKeys.responseSupportsIssueReporting = new RawContextKey('chatResponseSupportsIssueReporting', false, { type: 'boolean', description: localize('chatResponseSupportsIssueReporting', "True when the current chat response supports issue reporting.") });
    ChatContextKeys.responseIsFiltered = new RawContextKey('chatSessionResponseFiltered', false, { type: 'boolean', description: localize('chatResponseFiltered', "True when the chat response was filtered out by the server.") });
    ChatContextKeys.responseHasError = new RawContextKey('chatSessionResponseError', false, { type: 'boolean', description: localize('chatResponseErrored', "True when the chat response resulted in an error.") });
    ChatContextKeys.requestInProgress = new RawContextKey('chatSessionRequestInProgress', false, { type: 'boolean', description: localize('interactiveSessionRequestInProgress', "True when the current request is still in progress.") });
    ChatContextKeys.isResponse = new RawContextKey('chatResponse', false, { type: 'boolean', description: localize('chatResponse', "The chat item is a response.") });
    ChatContextKeys.isRequest = new RawContextKey('chatRequest', false, { type: 'boolean', description: localize('chatRequest', "The chat item is a request") });
    ChatContextKeys.itemId = new RawContextKey('chatItemId', '', { type: 'string', description: localize('chatItemId', "The id of the chat item.") });
    ChatContextKeys.lastItemId = new RawContextKey('chatLastItemId', [], { type: 'string', description: localize('chatLastItemId', "The id of the last chat item.") });
    ChatContextKeys.editApplied = new RawContextKey('chatEditApplied', false, { type: 'boolean', description: localize('chatEditApplied', "True when the chat text edits have been applied.") });
    ChatContextKeys.inputHasText = new RawContextKey('chatInputHasText', false, { type: 'boolean', description: localize('interactiveInputHasText', "True when the chat input has text.") });
    ChatContextKeys.inputHasFocus = new RawContextKey('chatInputHasFocus', false, { type: 'boolean', description: localize('interactiveInputHasFocus', "True when the chat input has focus.") });
    ChatContextKeys.inChatInput = new RawContextKey('inChatInput', false, { type: 'boolean', description: localize('inInteractiveInput', "True when focus is in the chat input, false otherwise.") });
    ChatContextKeys.inChatSession = new RawContextKey('inChat', false, { type: 'boolean', description: localize('inChat', "True when focus is in the chat widget, false otherwise.") });
    ChatContextKeys.enabled = new RawContextKey('chatIsEnabled', false, { type: 'boolean', description: localize('chatIsEnabled', "True when chat is enabled because a default chat participant is activated with an implementation.") });
    ChatContextKeys.panelParticipantRegistered = new RawContextKey('chatPanelParticipantRegistered', false, { type: 'boolean', description: localize('chatParticipantRegistered', "True when a default chat participant is registered for the panel.") });
    ChatContextKeys.editingParticipantRegistered = new RawContextKey('chatEditingParticipantRegistered', false, { type: 'boolean', description: localize('chatEditingParticipantRegistered', "True when a default chat participant is registered for editing.") });
    ChatContextKeys.chatEditingCanUndo = new RawContextKey('chatEditingCanUndo', false, { type: 'boolean', description: localize('chatEditingCanUndo', "True when it is possible to undo an interaction in the editing panel.") });
    ChatContextKeys.chatEditingCanRedo = new RawContextKey('chatEditingCanRedo', false, { type: 'boolean', description: localize('chatEditingCanRedo', "True when it is possible to redo an interaction in the editing panel.") });
    ChatContextKeys.extensionInvalid = new RawContextKey('chatExtensionInvalid', false, { type: 'boolean', description: localize('chatExtensionInvalid', "True when the installed chat extension is invalid and needs to be updated.") });
    ChatContextKeys.inputCursorAtTop = new RawContextKey('chatCursorAtTop', false);
    ChatContextKeys.inputHasAgent = new RawContextKey('chatInputHasAgent', false);
    ChatContextKeys.location = new RawContextKey('chatLocation', undefined);
    ChatContextKeys.inQuickChat = new RawContextKey('quickChatHasFocus', false, { type: 'boolean', description: localize('inQuickChat', "True when the quick chat UI has focus, false otherwise.") });
    ChatContextKeys.hasFileAttachments = new RawContextKey('chatHasFileAttachments', false, { type: 'boolean', description: localize('chatHasFileAttachments', "True when the chat has file attachments.") });
    ChatContextKeys.languageModelsAreUserSelectable = new RawContextKey('chatModelsAreUserSelectable', false, { type: 'boolean', description: localize('chatModelsAreUserSelectable', "True when the chat model can be selected manually by the user.") });
    ChatContextKeys.ChatSetup = {
        entitled: new RawContextKey('chatSetupEntitled', false, { type: 'boolean', description: localize('chatSetupEntitled', "True when chat setup is offered for a signed-in, entitled user.") }),
        signedIn: new RawContextKey('chatSetupSignedIn', false, { type: 'boolean', description: localize('chatSetupSignedIn', "True when chat setup is offered for a signed-in user.") }),
        running: new RawContextKey('chatSetupRunning', false, { type: 'boolean', description: localize('chatSetupRunning', "True when chat setup is running.") })
    };
    ChatContextKeys.shouldShowMovedViewWelcome = new RawContextKey('chatShouldShowMovedViewWelcome', false, { type: 'boolean', description: localize('chatShouldShowMovedViewWelcome', "True when the user should be shown the moved view welcome view.") });
})(ChatContextKeys || (ChatContextKeys = {}));
