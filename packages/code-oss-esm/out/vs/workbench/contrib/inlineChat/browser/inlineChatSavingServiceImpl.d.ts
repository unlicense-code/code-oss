import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Session } from './inlineChatSession.js';
import { IInlineChatSessionService } from './inlineChatSessionService.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IInlineChatSavingService } from './inlineChatSavingService.js';
import { IWorkingCopyFileService } from '../../../services/workingCopy/common/workingCopyFileService.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
export declare class InlineChatSavingServiceImpl implements IInlineChatSavingService {
    private readonly _fileConfigService;
    private readonly _editorGroupService;
    private readonly _textFileService;
    private readonly _configService;
    private readonly _workingCopyFileService;
    private readonly _dialogService;
    private readonly _labelService;
    readonly _serviceBrand: undefined;
    private readonly _store;
    private readonly _saveParticipant;
    private readonly _sessionData;
    constructor(_fileConfigService: IFilesConfigurationService, _editorGroupService: IEditorGroupsService, _textFileService: ITextFileService, _inlineChatSessionService: IInlineChatSessionService, _configService: IConfigurationService, _workingCopyFileService: IWorkingCopyFileService, _dialogService: IDialogService, _labelService: ILabelService);
    dispose(): void;
    markChanged(session: Session): void;
    private _installSaveParticpant;
    private _participate;
    private _isDisabled;
}
