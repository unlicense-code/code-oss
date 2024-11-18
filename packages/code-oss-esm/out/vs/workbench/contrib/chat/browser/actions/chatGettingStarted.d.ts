import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { IExtensionManagementService } from '../../../../../platform/extensionManagement/common/extensionManagement.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
export declare class ChatGettingStartedContribution extends Disposable implements IWorkbenchContribution {
    private readonly productService;
    private readonly extensionService;
    private readonly commandService;
    private readonly extensionManagementService;
    private readonly storageService;
    static readonly ID = "workbench.contrib.chatGettingStarted";
    private recentlyInstalled;
    private static readonly hideWelcomeView;
    constructor(productService: IProductService, extensionService: IExtensionService, commandService: ICommandService, extensionManagementService: IExtensionManagementService, storageService: IStorageService);
    private registerListeners;
}
