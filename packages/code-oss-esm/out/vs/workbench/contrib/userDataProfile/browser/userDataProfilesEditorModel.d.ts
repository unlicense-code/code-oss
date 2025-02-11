import { Action, IAction } from '../../../../base/common/actions.js';
import { Emitter } from '../../../../base/common/event.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IUserDataProfile, IUserDataProfilesService, ProfileResourceType, ProfileResourceTypeFlags, UseDefaultProfileFlags } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IProfileResourceChildTreeItem, IProfileTemplateInfo, IUserDataProfileImportExportService, IUserDataProfileManagementService, IUserDataProfileService, IUserDataProfileTemplate } from '../../../services/userDataProfile/common/userDataProfile.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { EditorModel } from '../../../common/editor/editorModel.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ITreeItemCheckboxState } from '../../../common/views.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkbenchExtensionManagementService } from '../../../services/extensionManagement/common/extensionManagement.js';
export type ChangeEvent = {
    readonly name?: boolean;
    readonly icon?: boolean;
    readonly flags?: boolean;
    readonly workspaces?: boolean;
    readonly active?: boolean;
    readonly message?: boolean;
    readonly copyFrom?: boolean;
    readonly copyFromInfo?: boolean;
    readonly copyFlags?: boolean;
    readonly preview?: boolean;
    readonly profile?: boolean;
    readonly extensions?: boolean;
    readonly snippets?: boolean;
    readonly disabled?: boolean;
    readonly newWindowProfile?: boolean;
};
export interface IProfileChildElement {
    readonly handle: string;
    readonly openAction?: IAction;
    readonly actions?: {
        readonly primary?: IAction[];
        readonly contextMenu?: IAction[];
    };
    readonly checkbox?: ITreeItemCheckboxState;
}
export interface IProfileResourceTypeElement extends IProfileChildElement {
    readonly resourceType: ProfileResourceType;
}
export interface IProfileResourceTypeChildElement extends IProfileChildElement {
    readonly label: string;
    readonly description?: string;
    readonly resource?: URI;
    readonly icon?: ThemeIcon;
}
export declare function isProfileResourceTypeElement(element: IProfileChildElement): element is IProfileResourceTypeElement;
export declare function isProfileResourceChildElement(element: IProfileChildElement): element is IProfileResourceTypeChildElement;
export declare abstract class AbstractUserDataProfileElement extends Disposable {
    protected readonly userDataProfileManagementService: IUserDataProfileManagementService;
    protected readonly userDataProfilesService: IUserDataProfilesService;
    protected readonly commandService: ICommandService;
    protected readonly workspaceContextService: IWorkspaceContextService;
    protected readonly hostService: IHostService;
    protected readonly uriIdentityService: IUriIdentityService;
    protected readonly fileService: IFileService;
    protected readonly extensionManagementService: IWorkbenchExtensionManagementService;
    protected readonly instantiationService: IInstantiationService;
    protected readonly _onDidChange: Emitter<ChangeEvent>;
    readonly onDidChange: import("../../../../base/common/event.js").Event<ChangeEvent>;
    private readonly saveScheduler;
    constructor(name: string, icon: string | undefined, flags: UseDefaultProfileFlags | undefined, workspaces: readonly URI[] | undefined, isActive: boolean, userDataProfileManagementService: IUserDataProfileManagementService, userDataProfilesService: IUserDataProfilesService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, hostService: IHostService, uriIdentityService: IUriIdentityService, fileService: IFileService, extensionManagementService: IWorkbenchExtensionManagementService, instantiationService: IInstantiationService);
    private _name;
    get name(): string;
    set name(name: string);
    private _icon;
    get icon(): string | undefined;
    set icon(icon: string | undefined);
    private _workspaces;
    get workspaces(): readonly URI[] | undefined;
    set workspaces(workspaces: readonly URI[] | undefined);
    private _flags;
    get flags(): UseDefaultProfileFlags | undefined;
    set flags(flags: UseDefaultProfileFlags | undefined);
    private _active;
    get active(): boolean;
    set active(active: boolean);
    private _message;
    get message(): string | undefined;
    set message(message: string | undefined);
    private _disabled;
    get disabled(): boolean;
    set disabled(saving: boolean);
    getFlag(key: ProfileResourceType): boolean;
    setFlag(key: ProfileResourceType, value: boolean): void;
    validate(): void;
    getChildren(resourceType?: ProfileResourceType): Promise<IProfileChildElement[]>;
    protected getChildrenForResourceType(resourceType: ProfileResourceType): Promise<IProfileChildElement[]>;
    protected getChildrenFromProfile(profile: IUserDataProfile, resourceType: ProfileResourceType): Promise<IProfileResourceTypeChildElement[]>;
    protected toUserDataProfileResourceChildElement(child: IProfileResourceChildTreeItem, primaryActions?: IAction[], contextMenuActions?: IAction[]): IProfileResourceTypeChildElement;
    getInitialName(): string;
    shouldValidateName(): boolean;
    getCurrentWorkspace(): URI | undefined;
    openWorkspace(workspace: URI): void;
    save(): void;
    private hasUnsavedChanges;
    protected saveProfile(profile: IUserDataProfile): Promise<IUserDataProfile | undefined>;
    abstract readonly titleButtons: [Action[], Action[]];
    abstract readonly actions: [IAction[], IAction[]];
    protected abstract doSave(): Promise<void>;
    protected abstract getProfileToWatch(): IUserDataProfile | undefined;
}
export declare class UserDataProfileElement extends AbstractUserDataProfileElement {
    private _profile;
    readonly titleButtons: [Action[], Action[]];
    readonly actions: [IAction[], IAction[]];
    private readonly userDataProfileService;
    private readonly configurationService;
    get profile(): IUserDataProfile;
    constructor(_profile: IUserDataProfile, titleButtons: [Action[], Action[]], actions: [IAction[], IAction[]], userDataProfileService: IUserDataProfileService, configurationService: IConfigurationService, userDataProfileManagementService: IUserDataProfileManagementService, userDataProfilesService: IUserDataProfilesService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, hostService: IHostService, uriIdentityService: IUriIdentityService, fileService: IFileService, extensionManagementService: IWorkbenchExtensionManagementService, instantiationService: IInstantiationService);
    protected getProfileToWatch(): IUserDataProfile | undefined;
    reset(): void;
    updateWorkspaces(toAdd: URI[], toRemove: URI[]): void;
    toggleNewWindowProfile(): Promise<void>;
    private _isNewWindowProfile;
    get isNewWindowProfile(): boolean;
    set isNewWindowProfile(isNewWindowProfile: boolean);
    toggleCurrentWindowProfile(): Promise<void>;
    protected doSave(): Promise<void>;
    protected getChildrenForResourceType(resourceType: ProfileResourceType): Promise<IProfileChildElement[]>;
    getInitialName(): string;
}
export declare class NewProfileElement extends AbstractUserDataProfileElement {
    readonly titleButtons: [Action[], Action[]];
    readonly actions: [IAction[], IAction[]];
    private readonly userDataProfileImportExportService;
    private _copyFromTemplates;
    get copyFromTemplates(): ResourceMap<string>;
    private templatePromise;
    private template;
    private defaultName;
    private defaultIcon;
    constructor(name: string, copyFrom: URI | IUserDataProfile | undefined, titleButtons: [Action[], Action[]], actions: [IAction[], IAction[]], userDataProfileImportExportService: IUserDataProfileImportExportService, userDataProfileManagementService: IUserDataProfileManagementService, userDataProfilesService: IUserDataProfilesService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, hostService: IHostService, uriIdentityService: IUriIdentityService, fileService: IFileService, extensionManagementService: IWorkbenchExtensionManagementService, instantiationService: IInstantiationService);
    private _copyFrom;
    get copyFrom(): IUserDataProfile | URI | undefined;
    set copyFrom(copyFrom: IUserDataProfile | URI | undefined);
    private _copyFlags;
    get copyFlags(): ProfileResourceTypeFlags | undefined;
    set copyFlags(flags: ProfileResourceTypeFlags | undefined);
    private readonly previewProfileWatchDisposables;
    private _previewProfile;
    get previewProfile(): IUserDataProfile | undefined;
    set previewProfile(profile: IUserDataProfile | undefined);
    protected getProfileToWatch(): IUserDataProfile | undefined;
    private getCopyFlagsFrom;
    private initialize;
    resolveTemplate(uri: URI): Promise<IUserDataProfileTemplate | null>;
    hasResource(resourceType: ProfileResourceType): boolean;
    getCopyFlag(key: ProfileResourceType): boolean;
    setCopyFlag(key: ProfileResourceType, value: boolean): void;
    getCopyFromName(): string | undefined;
    protected getChildrenForResourceType(resourceType: ProfileResourceType): Promise<IProfileChildElement[]>;
    private getChildrenFromProfileTemplate;
    shouldValidateName(): boolean;
    getInitialName(): string;
    protected doSave(): Promise<void>;
}
export declare class UserDataProfilesEditorModel extends EditorModel {
    private readonly userDataProfileService;
    private readonly userDataProfilesService;
    private readonly userDataProfileManagementService;
    private readonly userDataProfileImportExportService;
    private readonly dialogService;
    private readonly telemetryService;
    private readonly hostService;
    private readonly productService;
    private readonly openerService;
    private readonly instantiationService;
    private static INSTANCE;
    static getInstance(instantiationService: IInstantiationService): UserDataProfilesEditorModel;
    private _profiles;
    get profiles(): AbstractUserDataProfileElement[];
    private newProfileElement;
    private _onDidChange;
    readonly onDidChange: import("../../../../base/common/event.js").Event<AbstractUserDataProfileElement | undefined>;
    private templates;
    constructor(userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, userDataProfileManagementService: IUserDataProfileManagementService, userDataProfileImportExportService: IUserDataProfileImportExportService, dialogService: IDialogService, telemetryService: ITelemetryService, hostService: IHostService, productService: IProductService, openerService: IOpenerService, instantiationService: IInstantiationService);
    private onDidChangeProfiles;
    getTemplates(): Promise<readonly IProfileTemplateInfo[]>;
    private createProfileElement;
    createNewProfile(copyFrom?: URI | IUserDataProfile): Promise<AbstractUserDataProfileElement | undefined>;
    revert(): void;
    private removeNewProfile;
    private previewNewProfile;
    private exportNewProfile;
    saveNewProfile(transient?: boolean, token?: CancellationToken): Promise<IUserDataProfile | undefined>;
    private discardNewProfile;
    private removeProfile;
    private openWindow;
}
