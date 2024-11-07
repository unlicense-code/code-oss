import { ISandboxConfiguration } from '../../../base/parts/sandbox/common/sandboxTypes.js';
import { PerformanceInfo, SystemInfo } from '../../diagnostics/common/diagnostics.js';
export interface WindowStyles {
    backgroundColor?: string;
    color?: string;
}
export interface WindowData {
    styles: WindowStyles;
    zoomLevel: number;
}
export declare enum IssueSource {
    VSCode = "vscode",
    Extension = "extension",
    Marketplace = "marketplace"
}
export interface ISettingSearchResult {
    extensionId: string;
    key: string;
    score: number;
}
export interface ProcessExplorerStyles extends WindowStyles {
    listHoverBackground?: string;
    listHoverForeground?: string;
    listFocusBackground?: string;
    listFocusForeground?: string;
    listFocusOutline?: string;
    listActiveSelectionBackground?: string;
    listActiveSelectionForeground?: string;
    listHoverOutline?: string;
    scrollbarShadowColor?: string;
    scrollbarSliderBackgroundColor?: string;
    scrollbarSliderHoverBackgroundColor?: string;
    scrollbarSliderActiveBackgroundColor?: string;
}
export interface ProcessExplorerData extends WindowData {
    pid: number;
    styles: ProcessExplorerStyles;
    platform: string;
    applicationName: string;
}
export interface ProcessExplorerWindowConfiguration extends ISandboxConfiguration {
    data: ProcessExplorerData;
}
export declare const IProcessMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IProcessMainService>;
export interface IProcessMainService {
    readonly _serviceBrand: undefined;
    getSystemStatus(): Promise<string>;
    stopTracing(): Promise<void>;
    openProcessExplorer(data: ProcessExplorerData): Promise<void>;
    $getSystemInfo(): Promise<SystemInfo>;
    $getPerformanceInfo(): Promise<PerformanceInfo>;
}
