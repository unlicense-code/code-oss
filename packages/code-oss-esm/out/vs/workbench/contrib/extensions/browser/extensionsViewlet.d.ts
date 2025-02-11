import './media/extensionsViewlet.css';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IExtensionsWorkbenchService, IExtensionsViewPaneContainer } from '../common/extensions.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IWorkbenchExtensionEnablementService, IExtensionManagementServerService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IActivityService } from '../../../services/activity/common/activity.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IViewDescriptorService, IAddedViewDescriptorRef } from '../../../common/views.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
export declare const DefaultViewsContext: RawContextKey<boolean>;
export declare const ExtensionsSortByContext: RawContextKey<string>;
export declare const SearchMarketplaceExtensionsContext: RawContextKey<boolean>;
export declare const SearchHasTextContext: RawContextKey<boolean>;
export declare const BuiltInExtensionsContext: RawContextKey<boolean>;
export declare const RecommendedExtensionsContext: RawContextKey<boolean>;
export declare class ExtensionsViewletViewsContribution extends Disposable implements IWorkbenchContribution {
    private readonly extensionManagementServerService;
    private readonly labelService;
    private readonly contextKeyService;
    private readonly container;
    constructor(extensionManagementServerService: IExtensionManagementServerService, labelService: ILabelService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService);
    private registerViews;
    private createDefaultExtensionsViewDescriptors;
    private createSearchExtensionsViewDescriptors;
    private createRecommendedExtensionsViewDescriptors;
    private createBuiltinExtensionsViewDescriptors;
    private createUnsupportedWorkspaceExtensionsViewDescriptors;
    private createOtherLocalFilteredExtensionsViewDescriptors;
}
export declare class ExtensionsViewPaneContainer extends ViewPaneContainer implements IExtensionsViewPaneContainer {
    private readonly progressService;
    private readonly editorGroupService;
    private readonly extensionsWorkbenchService;
    private readonly extensionManagementServerService;
    private readonly notificationService;
    private readonly paneCompositeService;
    private readonly contextKeyService;
    private readonly preferencesService;
    private readonly commandService;
    private defaultViewsContextKey;
    private sortByContextKey;
    private searchMarketplaceExtensionsContextKey;
    private searchHasTextContextKey;
    private sortByUpdateDateContextKey;
    private installedExtensionsContextKey;
    private searchInstalledExtensionsContextKey;
    private searchRecentlyUpdatedExtensionsContextKey;
    private searchExtensionUpdatesContextKey;
    private searchOutdatedExtensionsContextKey;
    private searchEnabledExtensionsContextKey;
    private searchDisabledExtensionsContextKey;
    private hasInstalledExtensionsContextKey;
    private builtInExtensionsContextKey;
    private searchBuiltInExtensionsContextKey;
    private searchWorkspaceUnsupportedExtensionsContextKey;
    private searchDeprecatedExtensionsContextKey;
    private recommendedExtensionsContextKey;
    private searchDelayer;
    private root;
    private header;
    private searchBox;
    private notificationContainer;
    private readonly searchViewletState;
    constructor(layoutService: IWorkbenchLayoutService, telemetryService: ITelemetryService, progressService: IProgressService, instantiationService: IInstantiationService, editorGroupService: IEditorGroupsService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementServerService: IExtensionManagementServerService, notificationService: INotificationService, paneCompositeService: IPaneCompositePartService, themeService: IThemeService, configurationService: IConfigurationService, storageService: IStorageService, contextService: IWorkspaceContextService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, extensionService: IExtensionService, viewDescriptorService: IViewDescriptorService, preferencesService: IPreferencesService, commandService: ICommandService);
    get searchValue(): string | undefined;
    create(parent: HTMLElement): void;
    focus(): void;
    private _dimension;
    layout(dimension: Dimension): void;
    getOptimalWidth(): number;
    search(value: string): void;
    refresh(): Promise<void>;
    private readonly notificationDisposables;
    private renderNotificaiton;
    private updateInstalledExtensionsContexts;
    private triggerSearch;
    private normalizedQuery;
    protected saveState(): void;
    private doSearch;
    protected onDidAddViewDescriptors(added: IAddedViewDescriptorRef[]): ViewPane[];
    private alertSearchResult;
    private getFirstExpandedPane;
    private focusListView;
    private onViewletOpen;
    private progress;
    private onError;
    private isSupportedDragElement;
}
export declare class StatusUpdater extends Disposable implements IWorkbenchContribution {
    private readonly activityService;
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    private readonly configurationService;
    private readonly badgeHandle;
    constructor(activityService: IActivityService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService, configurationService: IConfigurationService);
    private onServiceChange;
}
export declare class MaliciousExtensionChecker implements IWorkbenchContribution {
    private readonly extensionsManagementService;
    private readonly hostService;
    private readonly logService;
    private readonly notificationService;
    private readonly environmentService;
    constructor(extensionsManagementService: IExtensionManagementService, hostService: IHostService, logService: ILogService, notificationService: INotificationService, environmentService: IWorkbenchEnvironmentService);
    private loopCheckForMaliciousExtensions;
    private checkForMaliciousExtensions;
}
