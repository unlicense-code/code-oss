import { IChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { ILocalExtension, IGalleryExtension, IExtensionGalleryService, InstallOptions } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { URI } from '../../../../base/common/uri.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IExtensionManagementServer } from '../common/extensionManagement.js';
import { IExtensionManifestPropertiesService } from '../../extensions/common/extensionManifestPropertiesService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { RemoteExtensionManagementService } from '../common/remoteExtensionManagementService.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { IRemoteUserDataProfilesService } from '../../userDataProfile/common/remoteUserDataProfiles.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
export declare class NativeRemoteExtensionManagementService extends RemoteExtensionManagementService {
    private readonly localExtensionManagementServer;
    private readonly logService;
    private readonly galleryService;
    private readonly configurationService;
    private readonly productService;
    private readonly fileService;
    private readonly extensionManifestPropertiesService;
    constructor(channel: IChannel, localExtensionManagementServer: IExtensionManagementServer, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, remoteUserDataProfilesService: IRemoteUserDataProfilesService, uriIdentityService: IUriIdentityService, logService: ILogService, galleryService: IExtensionGalleryService, configurationService: IConfigurationService, productService: IProductService, fileService: IFileService, extensionManifestPropertiesService: IExtensionManifestPropertiesService);
    install(vsix: URI, options?: InstallOptions): Promise<ILocalExtension>;
    installFromGallery(extension: IGalleryExtension, installOptions?: InstallOptions): Promise<ILocalExtension>;
    private doInstallFromGallery;
    private downloadAndInstall;
    private downloadCompatibleAndInstall;
    private checkAndGetCompatible;
    private installUIDependenciesAndPackedExtensions;
    private getAllUIDependenciesAndPackedExtensions;
    private getAllWorkspaceDependenciesAndPackedExtensions;
    private getDependenciesAndPackedExtensionsRecursively;
}
