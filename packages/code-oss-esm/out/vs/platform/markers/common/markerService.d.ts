import { URI } from '../../../base/common/uri.js';
import { IMarker, IMarkerData, IMarkerService, IResourceMarker, MarkerStatistics } from './markers.js';
export declare const unsupportedSchemas: Set<string>;
export declare class MarkerService implements IMarkerService {
    readonly _serviceBrand: undefined;
    private readonly _onMarkerChanged;
    readonly onMarkerChanged: import("../../../base/common/event.js").Event<readonly URI[]>;
    private readonly _data;
    private readonly _stats;
    dispose(): void;
    getStatistics(): MarkerStatistics;
    remove(owner: string, resources: URI[]): void;
    changeOne(owner: string, resource: URI, markerData: IMarkerData[]): void;
    private static _toMarker;
    changeAll(owner: string, data: IResourceMarker[]): void;
    read(filter?: {
        owner?: string;
        resource?: URI;
        severities?: number;
        take?: number;
    }): IMarker[];
    private static _accept;
    private static _merge;
}
