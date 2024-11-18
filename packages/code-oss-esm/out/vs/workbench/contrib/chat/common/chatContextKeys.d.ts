import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ChatAgentLocation } from './chatAgents.js';
export declare namespace ChatContextKeys {
    const responseVote: RawContextKey<string>;
    const responseDetectedAgentCommand: RawContextKey<boolean>;
    const responseSupportsIssueReporting: RawContextKey<boolean>;
    const responseIsFiltered: RawContextKey<boolean>;
    const responseHasError: RawContextKey<boolean>;
    const requestInProgress: RawContextKey<boolean>;
    const isResponse: RawContextKey<boolean>;
    const isRequest: RawContextKey<boolean>;
    const itemId: RawContextKey<string>;
    const lastItemId: RawContextKey<string[]>;
    const editApplied: RawContextKey<boolean>;
    const inputHasText: RawContextKey<boolean>;
    const inputHasFocus: RawContextKey<boolean>;
    const inChatInput: RawContextKey<boolean>;
    const inChatSession: RawContextKey<boolean>;
    const enabled: RawContextKey<boolean>;
    const panelParticipantRegistered: RawContextKey<boolean>;
    const editingParticipantRegistered: RawContextKey<boolean>;
    const chatEditingCanUndo: RawContextKey<boolean>;
    const chatEditingCanRedo: RawContextKey<boolean>;
    const extensionInvalid: RawContextKey<boolean>;
    const inputCursorAtTop: RawContextKey<boolean>;
    const inputHasAgent: RawContextKey<boolean>;
    const location: RawContextKey<ChatAgentLocation>;
    const inQuickChat: RawContextKey<boolean>;
    const hasFileAttachments: RawContextKey<boolean>;
    const languageModelsAreUserSelectable: RawContextKey<boolean>;
    const ChatSetup: {
        signedIn: RawContextKey<boolean>;
        entitled: RawContextKey<boolean>;
        triggering: RawContextKey<boolean>;
        installing: RawContextKey<boolean>;
        signingIn: RawContextKey<boolean>;
    };
    const setupRunning: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
}
