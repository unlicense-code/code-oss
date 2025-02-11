import { Button } from '../../../../base/browser/ui/button/button.js';
import { Delayer } from '../../../../base/common/async.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IProductConfiguration } from '../../../../base/common/product.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IssueReporterModel } from './issueReporterModel.js';
import { IIssueFormService, IssueReporterData, IssueReporterExtensionData } from '../common/issue.js';
export declare class BaseIssueReporterService extends Disposable {
    disableExtensions: boolean;
    data: IssueReporterData;
    os: {
        type: string;
        arch: string;
        release: string;
    };
    product: IProductConfiguration;
    readonly window: Window;
    readonly isWeb: boolean;
    readonly issueFormService: IIssueFormService;
    readonly themeService: IThemeService;
    issueReporterModel: IssueReporterModel;
    receivedSystemInfo: boolean;
    numberOfSearchResultsDisplayed: number;
    receivedPerformanceInfo: boolean;
    shouldQueueSearch: boolean;
    hasBeenSubmitted: boolean;
    openReporter: boolean;
    loadingExtensionData: boolean;
    selectedExtension: string;
    delayedSubmit: Delayer<void>;
    previewButton: Button;
    nonGitHubIssueUrl: boolean;
    constructor(disableExtensions: boolean, data: IssueReporterData, os: {
        type: string;
        arch: string;
        release: string;
    }, product: IProductConfiguration, window: Window, isWeb: boolean, issueFormService: IIssueFormService, themeService: IThemeService);
    render(): void;
    setInitialFocus(): void;
    private applyStyles;
    private updateIssueReporterUri;
    private handleExtensionData;
    private updateExtensionSelector;
    private sendReporterMenu;
    setEventHandlers(): void;
    updatePerformanceInfo(info: Partial<IssueReporterData>): void;
    updatePreviewButtonState(): void;
    private isPreviewEnabled;
    private getExtensionRepositoryUrl;
    getExtensionBugsUrl(): string | undefined;
    searchVSCodeIssues(title: string, issueDescription?: string): void;
    searchIssues(title: string, fileOnExtension: boolean | undefined, fileOnMarketplace: boolean | undefined): void;
    private searchExtensionIssues;
    private searchMarketplaceIssues;
    close(): Promise<void>;
    clearSearchResults(): void;
    private searchGitHub;
    private searchDuplicates;
    private displaySearchResults;
    private setUpTypes;
    makeOption(value: string, description: string, disabled: boolean): HTMLOptionElement;
    setSourceOptions(): void;
    renderBlocks(): void;
    validateInput(inputId: string): boolean;
    validateInputs(): boolean;
    submitToGitHub(issueTitle: string, issueBody: string, gitHubDetails: {
        owner: string;
        repositoryName: string;
    }): Promise<boolean>;
    createIssue(): Promise<boolean>;
    writeToClipboard(baseUrl: string, issueBody: string): Promise<string>;
    getIssueUrl(): string;
    parseGitHubUrl(url: string): undefined | {
        repositoryName: string;
        owner: string;
    };
    private getExtensionGitHubUrl;
    getIssueUrlWithTitle(issueTitle: string, repositoryUrl: string): string;
    clearExtensionData(): void;
    updateExtensionStatus(extension: IssueReporterExtensionData): Promise<void>;
    validateSelectedExtension(): void;
    setLoading(element: HTMLElement): void;
    removeLoading(element: HTMLElement, fromReporter?: boolean): void;
    private setExtensionValidationMessage;
    private updateProcessInfo;
    private updateWorkspaceInfo;
    updateExtensionTable(extensions: IssueReporterExtensionData[], numThemeExtensions: number): void;
    private getExtensionTableHtml;
    private openLink;
    getElementById<T extends HTMLElement = HTMLElement>(elementId: string): T | undefined;
    addEventListener(elementId: string, eventType: string, handler: (event: Event) => void): void;
}
export declare function hide(el: Element | undefined | null): void;
export declare function show(el: Element | undefined | null): void;
