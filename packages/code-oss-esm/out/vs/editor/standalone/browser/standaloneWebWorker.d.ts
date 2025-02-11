import { URI } from '../../../base/common/uri.js';
import { IModelService } from '../../common/services/model.js';
/**
 * Create a new web worker that has model syncing capabilities built in.
 * Specify an AMD module to load that will `create` an object that will be proxied.
 */
export declare function createWebWorker<T extends object>(modelService: IModelService, opts: IWebWorkerOptions): MonacoWebWorker<T>;
/**
 * A web worker that can provide a proxy to an arbitrary file.
 */
export interface MonacoWebWorker<T> {
    /**
     * Terminate the web worker, thus invalidating the returned proxy.
     */
    dispose(): void;
    /**
     * Get a proxy to the arbitrary loaded code.
     */
    getProxy(): Promise<T>;
    /**
     * Synchronize (send) the models at `resources` to the web worker,
     * making them available in the monaco.worker.getMirrorModels().
     */
    withSyncedResources(resources: URI[]): Promise<T>;
}
export interface IWebWorkerOptions {
    /**
     * The AMD moduleId to load.
     * It should export a function `create` that should return the exported proxy.
     */
    moduleId: string;
    /**
     * The data to send over when calling create on the module.
     */
    createData?: any;
    /**
     * A label to be used to identify the web worker for debugging purposes.
     */
    label?: string;
    /**
     * An object that can be used by the web worker to make calls back to the main thread.
     */
    host?: any;
    /**
     * Keep idle models.
     * Defaults to false, which means that idle models will stop syncing after a while.
     */
    keepIdleModels?: boolean;
}
