import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IChatEditingService } from '../../common/chatEditingService.js';
import { IChatWidgetService } from '../chat.js';
export declare class ChatRelatedFilesContribution extends Disposable implements IWorkbenchContribution {
    private readonly chatEditingService;
    private readonly chatWidgetService;
    static readonly ID = "chat.relatedFilesWorkingSet";
    private readonly chatEditingSessionDisposables;
    private _currentRelatedFilesRetrievalOperation;
    constructor(chatEditingService: IChatEditingService, chatWidgetService: IChatWidgetService);
    private _updateRelatedFileSuggestions;
    private _handleNewEditingSession;
    dispose(): void;
}
