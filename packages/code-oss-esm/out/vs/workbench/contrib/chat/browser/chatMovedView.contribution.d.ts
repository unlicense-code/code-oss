import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
export declare class MovedChatViewPane extends ViewPane {
    shouldShowWelcome(): boolean;
}
export declare class MoveChatViewContribution extends Disposable implements IWorkbenchContribution {
    private readonly contextKeyService;
    private readonly viewDescriptorService;
    private readonly extensionManagementService;
    private readonly productService;
    private readonly viewsService;
    private readonly paneCompositePartService;
    private readonly storageService;
    private readonly configurationService;
    private readonly keybindingService;
    static readonly ID = "workbench.contrib.chatMovedViewWelcomeView";
    private static readonly hideMovedChatWelcomeViewStorageKey;
    private readonly showWelcomeViewCtx;
    constructor(contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, extensionManagementService: IExtensionManagementService, productService: IProductService, viewsService: IViewsService, paneCompositePartService: IPaneCompositePartService, storageService: IStorageService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    private initialize;
    private markViewToHide;
    private hideViewIfCopilotIsNotInstalled;
    private hideViewIfOldViewIsMovedFromDefaultLocation;
    private updateContextKey;
    private registerListeners;
    private registerKeybindings;
    private registerCommands;
    private registerMovedChatWelcomeView;
    private hasCommandCenterChat;
}
