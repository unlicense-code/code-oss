import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
import { IChatWidget } from '../chat.js';
export interface IVoiceChatExecuteActionContext {
    readonly disableTimeout?: boolean;
}
export interface IChatExecuteActionContext {
    widget?: IChatWidget;
    inputValue?: string;
    voice?: IVoiceChatExecuteActionContext;
}
declare abstract class SubmitAction extends Action2 {
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare class ChatSubmitAction extends SubmitAction {
    static readonly ID = "workbench.action.chat.submit";
    constructor();
}
export declare class ChatEditingSessionSubmitAction extends SubmitAction {
    static readonly ID = "workbench.action.edits.submit";
    constructor();
}
export declare const ChatModelPickerActionId = "workbench.action.chat.pickModel";
export declare class ChatSubmitSecondaryAgentAction extends Action2 {
    static readonly ID = "workbench.action.chat.submitSecondaryAgent";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare class CancelAction extends Action2 {
    static readonly ID = "workbench.action.chat.cancel";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare function registerChatExecuteActions(): void;
export {};
