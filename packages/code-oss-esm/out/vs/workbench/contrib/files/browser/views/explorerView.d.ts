import { URI } from '../../../../../base/common/uri.js';
import { IWorkbenchLayoutService } from '../../../../services/layout/browser/layoutService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IProgressService } from '../../../../../platform/progress/common/progress.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IDecorationsService } from '../../../../services/decorations/common/decorations.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IViewPaneOptions, ViewPane } from '../../../../browser/parts/views/viewPane.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { ICompressedNavigationController } from './explorerViewer.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IWorkbenchThemeService } from '../../../../services/themes/common/workbenchThemeService.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { ExplorerItem } from '../../common/explorerModel.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { IViewDescriptorService } from '../../../../common/views.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.js';
import { IExplorerService, IExplorerView } from '../files.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IEditorResolverService } from '../../../../services/editor/common/editorResolverService.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
export declare function getContext(focus: ExplorerItem[], selection: ExplorerItem[], respectMultiSelection: boolean, compressedNavigationControllerProvider: {
    getCompressedNavigationController(stat: ExplorerItem): ICompressedNavigationController[] | undefined;
}): ExplorerItem[];
export interface IExplorerViewContainerDelegate {
    willOpenElement(event?: UIEvent): void;
    didOpenElement(event?: UIEvent): void;
}
export interface IExplorerViewPaneOptions extends IViewPaneOptions {
    delegate: IExplorerViewContainerDelegate;
}
export declare class ExplorerView extends ViewPane implements IExplorerView {
    private readonly contextService;
    private readonly progressService;
    private readonly editorService;
    private readonly editorResolverService;
    private readonly layoutService;
    private readonly decorationService;
    private readonly labelService;
    private readonly explorerService;
    private readonly storageService;
    private clipboardService;
    private readonly fileService;
    private readonly uriIdentityService;
    private readonly commandService;
    static readonly TREE_VIEW_STATE_STORAGE_KEY: string;
    private tree;
    private filter;
    private findProvider;
    private resourceContext;
    private folderContext;
    private parentReadonlyContext;
    private readonlyContext;
    private availableEditorIdsContext;
    private rootContext;
    private resourceMoveableToTrash;
    private renderer;
    private treeContainer;
    private container;
    private compressedFocusContext;
    private compressedFocusFirstContext;
    private compressedFocusLastContext;
    private viewHasSomeCollapsibleRootItem;
    private viewVisibleContextKey;
    private setTreeInputPromise;
    private horizontalScrolling;
    private dragHandler;
    private _autoReveal;
    private decorationsProvider;
    private readonly delegate;
    constructor(options: IExplorerViewPaneOptions, contextMenuService: IContextMenuService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, contextService: IWorkspaceContextService, progressService: IProgressService, editorService: IEditorService, editorResolverService: IEditorResolverService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, decorationService: IDecorationsService, labelService: ILabelService, themeService: IWorkbenchThemeService, telemetryService: ITelemetryService, hoverService: IHoverService, explorerService: IExplorerService, storageService: IStorageService, clipboardService: IClipboardService, fileService: IFileService, uriIdentityService: IUriIdentityService, commandService: ICommandService, openerService: IOpenerService);
    get autoReveal(): boolean | 'force' | 'focusNoScroll';
    set autoReveal(autoReveal: boolean | 'force' | 'focusNoScroll');
    get name(): string;
    get title(): string;
    set title(_: string);
    setVisible(visible: boolean): void;
    private get fileCopiedContextKey();
    private get resourceCutContextKey();
    protected renderHeader(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    protected renderBody(container: HTMLElement): void;
    focus(): void;
    hasFocus(): boolean;
    getFocus(): ExplorerItem[];
    focusNext(): void;
    focusLast(): void;
    getContext(respectMultiSelection: boolean): ExplorerItem[];
    isItemVisible(item: ExplorerItem): boolean;
    isItemCollapsed(item: ExplorerItem): boolean;
    setEditable(stat: ExplorerItem, isEditing: boolean): Promise<void>;
    private selectActiveFile;
    private createTree;
    private onConfigurationUpdated;
    private storeTreeViewState;
    private setContextKeys;
    private onContextMenu;
    private onFocusChanged;
    /**
     * Refresh the contents of the explorer to get up to date data from the disk about the file structure.
     * If the item is passed we refresh only that level of the tree, otherwise we do a full refresh.
     */
    refresh(recursive: boolean, item?: ExplorerItem, cancelEditing?: boolean): Promise<void>;
    getOptimalWidth(): number;
    setTreeInput(): Promise<void>;
    selectResource(resource: URI | undefined, reveal?: boolean | "force" | "focusNoScroll", retry?: number): Promise<void>;
    itemsCopied(stats: ExplorerItem[], cut: boolean, previousCut: ExplorerItem[] | undefined): void;
    expandAll(): void;
    collapseAll(): void;
    previousCompressedStat(): void;
    nextCompressedStat(): void;
    firstCompressedStat(): void;
    lastCompressedStat(): void;
    private updateCompressedNavigationContextKeys;
    private updateAnyCollapsedContext;
    hasPhantomElements(): boolean;
    dispose(): void;
}
export declare function createFileIconThemableTreeContainerScope(container: HTMLElement, themeService: IThemeService): IDisposable;
