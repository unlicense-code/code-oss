import './media/userDataProfileView.css';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IUserDataProfileImportExportService, IUserDataProfileContentHandler, IUserDataProfileService, IUserDataProfileManagementService, IProfileImportOptions, IUserDataProfileCreateOptions } from '../common/userDataProfile.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { URI } from '../../../../base/common/uri.js';
import { IUserDataProfile, IUserDataProfilesService, ProfileResourceTypeFlags } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
interface IUserDataProfileTemplate {
    readonly name: string;
    readonly icon?: string;
    readonly settings?: string;
    readonly keybindings?: string;
    readonly tasks?: string;
    readonly snippets?: string;
    readonly globalState?: string;
    readonly extensions?: string;
}
export declare class UserDataProfileImportExportService extends Disposable implements IUserDataProfileImportExportService {
    private readonly instantiationService;
    private readonly userDataProfileService;
    private readonly userDataProfileManagementService;
    private readonly userDataProfilesService;
    private readonly extensionService;
    private readonly quickInputService;
    private readonly progressService;
    private readonly dialogService;
    private readonly clipboardService;
    private readonly openerService;
    private readonly requestService;
    private readonly productService;
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    private profileContentHandlers;
    private readonly fileUserDataProfileContentHandler;
    constructor(instantiationService: IInstantiationService, userDataProfileService: IUserDataProfileService, userDataProfileManagementService: IUserDataProfileManagementService, userDataProfilesService: IUserDataProfilesService, extensionService: IExtensionService, quickInputService: IQuickInputService, progressService: IProgressService, dialogService: IDialogService, clipboardService: IClipboardService, openerService: IOpenerService, requestService: IRequestService, productService: IProductService, uriIdentityService: IUriIdentityService);
    registerProfileContentHandler(id: string, profileContentHandler: IUserDataProfileContentHandler): IDisposable;
    unregisterProfileContentHandler(id: string): void;
    createFromProfile(from: IUserDataProfile, options: IUserDataProfileCreateOptions, token: CancellationToken): Promise<IUserDataProfile | undefined>;
    createProfileFromTemplate(profileTemplate: IUserDataProfileTemplate, options: IUserDataProfileCreateOptions, token: CancellationToken): Promise<IUserDataProfile | undefined>;
    private applyProfileTemplate;
    exportProfile(profile: IUserDataProfile, exportFlags?: ProfileResourceTypeFlags): Promise<void>;
    createTroubleshootProfile(): Promise<void>;
    private doExportProfile;
    resolveProfileTemplate(uri: URI, options?: IProfileImportOptions): Promise<IUserDataProfileTemplate | null>;
    private doCreateProfile;
    private resolveProfileContent;
    private pickProfileContentHandler;
    private getProfileToImport;
    private getProfileNameIndex;
}
export {};
