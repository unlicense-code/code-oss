import { Disposable } from '../../../../base/common/lifecycle.js';
import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IChatAgentService } from '../common/chatAgents.js';
import { IChatEditingService } from '../common/chatEditingService.js';
import { IChatService } from '../common/chatService.js';
export declare class ChatEditorSaving extends Disposable implements IWorkbenchContribution {
    private readonly _chatService;
    private readonly _fileConfigService;
    static readonly ID: string;
    static readonly _config = "chat.editing.alwaysSaveWithGeneratedChanges";
    private readonly _sessionStore;
    constructor(configService: IConfigurationService, chatEditingService: IChatEditingService, chatAgentService: IChatAgentService, textFileService: ITextFileService, labelService: ILabelService, dialogService: IDialogService, _chatService: IChatService, _fileConfigService: IFilesConfigurationService);
    private _reportSaved;
    private _reportSavedWhenReady;
    private _handleNewEditingSession;
}
export declare class ChatEditingSaveAllAction extends Action2 {
    static readonly ID = "chatEditing.saveAllFiles";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
}
