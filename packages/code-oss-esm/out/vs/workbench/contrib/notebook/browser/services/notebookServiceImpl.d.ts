import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
import { ConfigurationTarget, IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { NotebookCellTextModel } from '../../common/model/notebookCellTextModel.js';
import { NotebookTextModel } from '../../common/model/notebookTextModel.js';
import { INotebookContributionData, INotebookRendererInfo, IOrderedMimeType, IOutputDto, NotebookExtensionDescription, INotebookStaticPreloadInfo } from '../../common/notebookCommon.js';
import { INotebookEditorModelResolverService } from '../../common/notebookEditorModelResolverService.js';
import { NotebookOutputRendererInfo } from '../../common/notebookOutputRenderer.js';
import { NotebookProviderInfo } from '../../common/notebookProvider.js';
import { INotebookSerializer, INotebookService, SimpleNotebookProviderInfo } from '../../common/notebookService.js';
import { IEditorResolverService, IEditorType } from '../../../../services/editor/common/editorResolverService.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.js';
import { INotebookDocumentService } from '../../../../services/notebook/common/notebookDocumentService.js';
import { VSBufferReadableStream } from '../../../../../base/common/buffer.js';
export declare class NotebookProviderInfoStore extends Disposable {
    private readonly _editorResolverService;
    private readonly _configurationService;
    private readonly _accessibilityService;
    private readonly _instantiationService;
    private readonly _fileService;
    private readonly _notebookEditorModelResolverService;
    private readonly uriIdentService;
    private static readonly CUSTOM_EDITORS_STORAGE_ID;
    private static readonly CUSTOM_EDITORS_ENTRY_ID;
    private readonly _memento;
    private _handled;
    private readonly _contributedEditors;
    private readonly _contributedEditorDisposables;
    constructor(storageService: IStorageService, extensionService: IExtensionService, _editorResolverService: IEditorResolverService, _configurationService: IConfigurationService, _accessibilityService: IAccessibilityService, _instantiationService: IInstantiationService, _fileService: IFileService, _notebookEditorModelResolverService: INotebookEditorModelResolverService, uriIdentService: IUriIdentityService);
    dispose(): void;
    private _setupHandler;
    clearEditorCache(): void;
    private _convertPriority;
    private _registerContributionPoint;
    private _clear;
    get(viewType: string): NotebookProviderInfo | undefined;
    add(info: NotebookProviderInfo, saveMemento?: boolean): IDisposable;
    getContributedNotebook(resource: URI): readonly NotebookProviderInfo[];
    [Symbol.iterator](): Iterator<NotebookProviderInfo>;
}
export declare class NotebookOutputRendererInfoStore {
    private readonly contributedRenderers;
    private readonly preferredMimetypeMemento;
    private readonly preferredMimetype;
    constructor(storageService: IStorageService);
    clear(): void;
    get(rendererId: string): NotebookOutputRendererInfo | undefined;
    getAll(): NotebookOutputRendererInfo[];
    add(info: NotebookOutputRendererInfo): void;
    /** Update and remember the preferred renderer for the given mimetype in this workspace */
    setPreferred(notebookProviderInfo: NotebookProviderInfo, mimeType: string, rendererId: string): void;
    findBestRenderers(notebookProviderInfo: NotebookProviderInfo | undefined, mimeType: string, kernelProvides: readonly string[] | undefined): IOrderedMimeType[];
}
export declare class NotebookService extends Disposable implements INotebookService {
    private readonly _extensionService;
    private readonly _configurationService;
    private readonly _accessibilityService;
    private readonly _instantiationService;
    private readonly _storageService;
    private readonly _notebookDocumentService;
    readonly _serviceBrand: undefined;
    private static _storageNotebookViewTypeProvider;
    private readonly _memento;
    private readonly _viewTypeCache;
    private readonly _notebookProviders;
    private _notebookProviderInfoStore;
    private get notebookProviderInfoStore();
    private readonly _notebookRenderersInfoStore;
    private readonly _onDidChangeOutputRenderers;
    readonly onDidChangeOutputRenderers: Event<void>;
    private readonly _notebookStaticPreloadInfoStore;
    private readonly _models;
    private readonly _onWillAddNotebookDocument;
    private readonly _onDidAddNotebookDocument;
    private readonly _onWillRemoveNotebookDocument;
    private readonly _onDidRemoveNotebookDocument;
    readonly onWillAddNotebookDocument: Event<NotebookTextModel>;
    readonly onDidAddNotebookDocument: Event<NotebookTextModel>;
    readonly onDidRemoveNotebookDocument: Event<NotebookTextModel>;
    readonly onWillRemoveNotebookDocument: Event<NotebookTextModel>;
    private readonly _onAddViewType;
    readonly onAddViewType: Event<string>;
    private readonly _onWillRemoveViewType;
    readonly onWillRemoveViewType: Event<string>;
    private readonly _onDidChangeEditorTypes;
    onDidChangeEditorTypes: Event<void>;
    private _cutItems;
    private _lastClipboardIsCopy;
    private _displayOrder;
    constructor(_extensionService: IExtensionService, _configurationService: IConfigurationService, _accessibilityService: IAccessibilityService, _instantiationService: IInstantiationService, _storageService: IStorageService, _notebookDocumentService: INotebookDocumentService);
    getEditorTypes(): IEditorType[];
    clearEditorCache(): void;
    private _postDocumentOpenActivation;
    canResolve(viewType: string): Promise<boolean>;
    registerContributedNotebookType(viewType: string, data: INotebookContributionData): IDisposable;
    private _registerProviderData;
    registerNotebookSerializer(viewType: string, extensionData: NotebookExtensionDescription, serializer: INotebookSerializer): IDisposable;
    withNotebookDataProvider(viewType: string): Promise<SimpleNotebookProviderInfo>;
    tryGetDataProviderSync(viewType: string): SimpleNotebookProviderInfo | undefined;
    private _persistMementos;
    getViewTypeProvider(viewType: string): string | undefined;
    getRendererInfo(rendererId: string): INotebookRendererInfo | undefined;
    updateMimePreferredRenderer(viewType: string, mimeType: string, rendererId: string, otherMimetypes: readonly string[]): void;
    saveMimeDisplayOrder(target: ConfigurationTarget): void;
    getRenderers(): INotebookRendererInfo[];
    getStaticPreloads(viewType: string): Iterable<INotebookStaticPreloadInfo>;
    createNotebookTextModel(viewType: string, uri: URI, stream?: VSBufferReadableStream): Promise<NotebookTextModel>;
    getNotebookTextModel(uri: URI): NotebookTextModel | undefined;
    getNotebookTextModels(): Iterable<NotebookTextModel>;
    listNotebookDocuments(): NotebookTextModel[];
    private _onWillDisposeDocument;
    getOutputMimeTypeInfo(textModel: NotebookTextModel, kernelProvides: readonly string[] | undefined, output: IOutputDto): readonly IOrderedMimeType[];
    getContributedNotebookTypes(resource?: URI): readonly NotebookProviderInfo[];
    getContributedNotebookType(viewType: string): NotebookProviderInfo | undefined;
    getNotebookProviderResourceRoots(): URI[];
    setToCopy(items: NotebookCellTextModel[], isCopy: boolean): void;
    getToCopy(): {
        items: NotebookCellTextModel[];
        isCopy: boolean;
    } | undefined;
}
