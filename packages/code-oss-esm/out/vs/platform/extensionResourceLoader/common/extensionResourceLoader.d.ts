import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { IProductService } from '../../product/common/productService.js';
import { IStorageService } from '../../storage/common/storage.js';
import { TargetPlatform } from '../../extensions/common/extensions.js';
export declare const IExtensionResourceLoaderService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionResourceLoaderService>;
/**
 * A service useful for reading resources from within extensions.
 */
export interface IExtensionResourceLoaderService {
    readonly _serviceBrand: undefined;
    /**
     * Read a certain resource within an extension.
     */
    readExtensionResource(uri: URI): Promise<string>;
    /**
     * Returns whether the gallery provides extension resources.
     */
    readonly supportsExtensionGalleryResources: boolean;
    /**
     * Return true if the given URI is a extension gallery resource.
     */
    isExtensionGalleryResource(uri: URI): boolean;
    /**
     * Computes the URL of a extension gallery resource. Returns `undefined` if gallery does not provide extension resources.
     */
    getExtensionGalleryResourceURL(galleryExtension: {
        publisher: string;
        name: string;
        version: string;
        targetPlatform?: TargetPlatform;
    }, path?: string): URI | undefined;
}
export declare function migratePlatformSpecificExtensionGalleryResourceURL(resource: URI, targetPlatform: TargetPlatform): URI | undefined;
export declare abstract class AbstractExtensionResourceLoaderService implements IExtensionResourceLoaderService {
    protected readonly _fileService: IFileService;
    private readonly _storageService;
    private readonly _productService;
    private readonly _environmentService;
    private readonly _configurationService;
    readonly _serviceBrand: undefined;
    private readonly _extensionGalleryResourceUrlTemplate;
    private readonly _extensionGalleryAuthority;
    constructor(_fileService: IFileService, _storageService: IStorageService, _productService: IProductService, _environmentService: IEnvironmentService, _configurationService: IConfigurationService);
    get supportsExtensionGalleryResources(): boolean;
    getExtensionGalleryResourceURL({ publisher, name, version, targetPlatform }: {
        publisher: string;
        name: string;
        version: string;
        targetPlatform?: TargetPlatform;
    }, path?: string): URI | undefined;
    abstract readExtensionResource(uri: URI): Promise<string>;
    isExtensionGalleryResource(uri: URI): boolean;
    protected getExtensionGalleryRequestHeaders(): Promise<Record<string, string>>;
    private _serviceMachineIdPromise;
    private _getServiceMachineId;
    private _getExtensionGalleryAuthority;
    protected _isWebExtensionResourceEndPoint(uri: URI): boolean;
}
