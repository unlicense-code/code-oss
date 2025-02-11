import { URI } from '../../../../base/common/uri.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService, OpenOptions } from '../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ITrustedDomainService } from './trustedDomainService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export declare class OpenerValidatorContributions implements IWorkbenchContribution {
    private readonly _openerService;
    private readonly _storageService;
    private readonly _dialogService;
    private readonly _productService;
    private readonly _quickInputService;
    private readonly _editorService;
    private readonly _clipboardService;
    private readonly _telemetryService;
    private readonly _instantiationService;
    private readonly _configurationService;
    private readonly _workspaceTrustService;
    private readonly _trustedDomainService;
    constructor(_openerService: IOpenerService, _storageService: IStorageService, _dialogService: IDialogService, _productService: IProductService, _quickInputService: IQuickInputService, _editorService: IEditorService, _clipboardService: IClipboardService, _telemetryService: ITelemetryService, _instantiationService: IInstantiationService, _configurationService: IConfigurationService, _workspaceTrustService: IWorkspaceTrustManagementService, _trustedDomainService: ITrustedDomainService);
    validateLink(resource: URI | string, openOptions?: OpenOptions): Promise<boolean>;
}
