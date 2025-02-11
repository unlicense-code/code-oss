import { IWorkspaceEditingService } from '../common/workspaceEditing.js';
import { URI } from '../../../../base/common/uri.js';
import { IWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.js';
import { IJSONEditingService } from '../../configuration/common/jsonEditing.js';
import { IWorkspaceFolderCreationData, IWorkspacesService, IEnterWorkspaceResult } from '../../../../platform/workspaces/common/workspaces.js';
import { WorkspaceService } from '../../configuration/browser/configurationService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IFileDialogService, IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ITextFileService } from '../../textfile/common/textfiles.js';
import { IHostService } from '../../host/browser/host.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IWorkbenchConfigurationService } from '../../configuration/common/configuration.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare abstract class AbstractWorkspaceEditingService extends Disposable implements IWorkspaceEditingService {
    private readonly jsonEditingService;
    protected readonly contextService: WorkspaceService;
    protected readonly configurationService: IWorkbenchConfigurationService;
    private readonly notificationService;
    private readonly commandService;
    private readonly fileService;
    private readonly textFileService;
    protected readonly workspacesService: IWorkspacesService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    private readonly fileDialogService;
    protected readonly dialogService: IDialogService;
    protected readonly hostService: IHostService;
    protected readonly uriIdentityService: IUriIdentityService;
    private readonly workspaceTrustManagementService;
    private readonly userDataProfilesService;
    private readonly userDataProfileService;
    readonly _serviceBrand: undefined;
    constructor(jsonEditingService: IJSONEditingService, contextService: WorkspaceService, configurationService: IWorkbenchConfigurationService, notificationService: INotificationService, commandService: ICommandService, fileService: IFileService, textFileService: ITextFileService, workspacesService: IWorkspacesService, environmentService: IWorkbenchEnvironmentService, fileDialogService: IFileDialogService, dialogService: IDialogService, hostService: IHostService, uriIdentityService: IUriIdentityService, workspaceTrustManagementService: IWorkspaceTrustManagementService, userDataProfilesService: IUserDataProfilesService, userDataProfileService: IUserDataProfileService);
    pickNewWorkspacePath(): Promise<URI | undefined>;
    private getNewWorkspaceName;
    updateFolders(index: number, deleteCount?: number, foldersToAddCandidates?: IWorkspaceFolderCreationData[], donotNotifyError?: boolean): Promise<void>;
    private doUpdateFolders;
    addFolders(foldersToAddCandidates: IWorkspaceFolderCreationData[], donotNotifyError?: boolean): Promise<void>;
    private doAddFolders;
    removeFolders(foldersToRemove: URI[], donotNotifyError?: boolean): Promise<void>;
    private includesSingleFolderWorkspace;
    createAndEnterWorkspace(folders: IWorkspaceFolderCreationData[], path?: URI): Promise<void>;
    saveAndEnterWorkspace(workspaceUri: URI): Promise<void>;
    isValidTargetWorkspacePath(workspaceUri: URI): Promise<boolean>;
    protected saveWorkspaceAs(workspace: IWorkspaceIdentifier, targetConfigPathURI: URI): Promise<void>;
    protected saveWorkspace(workspace: IWorkspaceIdentifier): Promise<void>;
    private handleWorkspaceConfigurationEditingError;
    private onInvalidWorkspaceConfigurationFileError;
    private askToOpenWorkspaceConfigurationFile;
    abstract enterWorkspace(workspaceUri: URI): Promise<void>;
    protected doEnterWorkspace(workspaceUri: URI): Promise<IEnterWorkspaceResult | undefined>;
    private migrateWorkspaceSettings;
    copyWorkspaceSettings(toWorkspace: IWorkspaceIdentifier): Promise<void>;
    private doCopyWorkspaceSettings;
    private trustWorkspaceConfiguration;
    protected getCurrentWorkspaceIdentifier(): IWorkspaceIdentifier | undefined;
}
