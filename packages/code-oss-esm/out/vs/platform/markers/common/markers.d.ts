import { Event } from '../../../base/common/event.js';
import Severity from '../../../base/common/severity.js';
import { URI } from '../../../base/common/uri.js';
export interface IMarkerService {
    readonly _serviceBrand: undefined;
    getStatistics(): MarkerStatistics;
    changeOne(owner: string, resource: URI, markers: IMarkerData[]): void;
    changeAll(owner: string, data: IResourceMarker[]): void;
    remove(owner: string, resources: URI[]): void;
    read(filter?: {
        owner?: string;
        resource?: URI;
        severities?: number;
        take?: number;
    }): IMarker[];
    readonly onMarkerChanged: Event<readonly URI[]>;
}
/**
 *
 */
export interface IRelatedInformation {
    resource: URI;
    message: string;
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
}
export declare const enum MarkerTag {
    Unnecessary = 1,
    Deprecated = 2
}
export declare enum MarkerSeverity {
    Hint = 1,
    Info = 2,
    Warning = 4,
    Error = 8
}
export declare namespace MarkerSeverity {
    function compare(a: MarkerSeverity, b: MarkerSeverity): number;
    function toString(a: MarkerSeverity): string;
    function fromSeverity(severity: Severity): MarkerSeverity;
    function toSeverity(severity: MarkerSeverity): Severity;
}
/**
 * A structure defining a problem/warning/etc.
 */
export interface IMarkerData {
    code?: string | {
        value: string;
        target: URI;
    };
    severity: MarkerSeverity;
    message: string;
    source?: string;
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    modelVersionId?: number;
    relatedInformation?: IRelatedInformation[];
    tags?: MarkerTag[];
}
export interface IResourceMarker {
    resource: URI;
    marker: IMarkerData;
}
export interface IMarker {
    owner: string;
    resource: URI;
    severity: MarkerSeverity;
    code?: string | {
        value: string;
        target: URI;
    };
    message: string;
    source?: string;
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    modelVersionId?: number;
    relatedInformation?: IRelatedInformation[];
    tags?: MarkerTag[];
}
export interface MarkerStatistics {
    errors: number;
    warnings: number;
    infos: number;
    unknowns: number;
}
export declare namespace IMarkerData {
    function makeKey(markerData: IMarkerData): string;
    function makeKeyOptionalMessage(markerData: IMarkerData, useMessage: boolean): string;
}
export declare const IMarkerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMarkerService>;
