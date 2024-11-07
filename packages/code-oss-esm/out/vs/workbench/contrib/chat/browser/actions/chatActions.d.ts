import { IActionViewItemService } from '../../../../../platform/actions/browser/actionViewItemService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IChatAgentService } from '../../common/chatAgents.js';
import { IChatRequestViewModel, IChatResponseViewModel } from '../../common/chatViewModel.js';
export declare const CHAT_CATEGORY: import("../../../../../nls.js").ILocalizedString;
export declare const CHAT_OPEN_ACTION_ID = "workbench.action.chat.open";
export interface IChatViewOpenOptions {
    /**
     * The query for quick chat.
     */
    query: string;
    /**
     * Whether the query is partial and will await more input from the user.
     */
    isPartialQuery?: boolean;
    /**
     * A list of simple variables that will be resolved and attached if they exist.
     */
    variableIds?: string[];
    /**
     * Any previous chat requests and responses that should be shown in the chat view.
     */
    previousRequests?: IChatViewOpenRequestEntry[];
    /**
     * Whether a screenshot of the focused window should be taken and attached
     */
    attachScreenshot?: boolean;
}
export interface IChatViewOpenRequestEntry {
    request: string;
    response: string;
}
export declare function registerChatActions(): void;
export declare function stringifyItem(item: IChatRequestViewModel | IChatResponseViewModel, includeName?: boolean): string;
export declare class ChatCommandCenterRendering implements IWorkbenchContribution {
    static readonly ID = "chat.commandCenterRendering";
    private readonly _store;
    private _dropdown;
    constructor(actionViewItemService: IActionViewItemService, agentService: IChatAgentService, instantiationService: IInstantiationService);
    dispose(): void;
}
