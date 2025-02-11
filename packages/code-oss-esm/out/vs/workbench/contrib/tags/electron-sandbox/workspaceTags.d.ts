import { IFileService } from '../../../../platform/files/common/files.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IWorkspaceTagsService } from '../common/workspaceTags.js';
import { IDiagnosticsService } from '../../../../platform/diagnostics/common/diagnostics.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export declare function getHashedRemotesFromConfig(text: string, stripEndingDotGit?: boolean): Promise<string[]>;
export declare class WorkspaceTags implements IWorkbenchContribution {
    private readonly fileService;
    private readonly contextService;
    private readonly telemetryService;
    private readonly requestService;
    private readonly textFileService;
    private readonly workspaceTagsService;
    private readonly diagnosticsService;
    private readonly productService;
    private readonly nativeHostService;
    constructor(fileService: IFileService, contextService: IWorkspaceContextService, telemetryService: ITelemetryService, requestService: IRequestService, textFileService: ITextFileService, workspaceTagsService: IWorkspaceTagsService, diagnosticsService: IDiagnosticsService, productService: IProductService, nativeHostService: INativeHostService);
    private report;
    private reportWindowsEdition;
    private getWorkspaceInformation;
    private reportWorkspaceTags;
    private reportRemoteDomains;
    private reportRemotes;
    private reportAzureNode;
    private static searchArray;
    private reportAzureJava;
    private reportAzure;
    private reportCloudStats;
    private reportProxyStats;
}
