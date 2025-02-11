import { type FastDomNode } from '../../../base/browser/fastDomNode.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import type { ViewportData } from '../../common/viewLayout/viewLinesViewportData.js';
import type { ViewLineOptions } from '../viewParts/viewLines/viewLineOptions.js';
import { type IObservable } from '../../../base/common/observable.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { TextureAtlas } from './atlas/textureAtlas.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { RectangleRenderer } from './rectangleRenderer.js';
import type { ViewContext } from '../../common/viewModel/viewContext.js';
declare const enum GpuRenderLimits {
    maxGpuLines = 3000,
    maxGpuCols = 200
}
export declare class ViewGpuContext extends Disposable {
    private readonly _instantiationService;
    private readonly _notificationService;
    private readonly configurationService;
    /**
     * The temporary hard cap for lines rendered by the GPU renderer. This can be removed once more
     * dynamic allocation is implemented in https://github.com/microsoft/vscode/issues/227091
     */
    readonly maxGpuLines = GpuRenderLimits.maxGpuLines;
    /**
     * The temporary hard cap for line columns rendered by the GPU renderer. This can be removed
     * once more dynamic allocation is implemented in https://github.com/microsoft/vscode/issues/227108
     */
    readonly maxGpuCols = GpuRenderLimits.maxGpuCols;
    readonly canvas: FastDomNode<HTMLCanvasElement>;
    readonly ctx: GPUCanvasContext;
    readonly device: Promise<GPUDevice>;
    readonly rectangleRenderer: RectangleRenderer;
    private static _atlas;
    /**
     * The shared texture atlas to use across all views.
     *
     * @throws if called before the GPU device is resolved
     */
    static get atlas(): TextureAtlas;
    /**
     * The shared texture atlas to use across all views. This is a convenience alias for
     * {@link ViewGpuContext.atlas}.
     *
     * @throws if called before the GPU device is resolved
     */
    get atlas(): TextureAtlas;
    readonly canvasDevicePixelDimensions: IObservable<{
        width: number;
        height: number;
    }>;
    readonly devicePixelRatio: IObservable<number>;
    constructor(context: ViewContext, _instantiationService: IInstantiationService, _notificationService: INotificationService, configurationService: IConfigurationService);
    /**
     * This method determines which lines can be and are allowed to be rendered using the GPU
     * renderer. Eventually this should trend all lines, except maybe exceptional cases like
     * decorations that use class names.
     */
    static canRender(options: ViewLineOptions, viewportData: ViewportData, lineNumber: number): boolean;
    /**
     * Like {@link canRender} but returned detailed information about why the line cannot be rendered.
     */
    static canRenderDetailed(options: ViewLineOptions, viewportData: ViewportData, lineNumber: number): string[];
}
export {};
