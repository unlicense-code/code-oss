import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import type { Position } from '../../../common/core/position.js';
import type { Range } from '../../../common/core/range.js';
import type { ViewLinesChangedEvent, ViewScrollChangedEvent } from '../../../common/viewEvents.js';
import type { ViewportData } from '../../../common/viewLayout/viewLinesViewportData.js';
import type { ViewContext } from '../../../common/viewModel/viewContext.js';
import { ViewGpuContext } from '../../gpu/viewGpuContext.js';
import { HorizontalPosition, IViewLines, LineVisibleRanges, RenderingContext, RestrictedRenderingContext } from '../../view/renderingContext.js';
import { ViewPart } from '../../view/viewPart.js';
import { ViewLineOptions } from '../viewLines/viewLineOptions.js';
/**
 * The GPU implementation of the ViewLines part.
 */
export declare class ViewLinesGpu extends ViewPart implements IViewLines {
    private readonly _viewGpuContext;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly canvas;
    private _initViewportData?;
    private _lastViewportData?;
    private _lastViewLineOptions?;
    private _device;
    private _renderPassDescriptor;
    private _renderPassColorAttachment;
    private _bindGroup;
    private _pipeline;
    private _vertexBuffer;
    private readonly _glyphStorageBuffer;
    private _atlasGpuTexture;
    private readonly _atlasGpuTextureVersions;
    private _initialized;
    private _renderStrategy;
    constructor(context: ViewContext, _viewGpuContext: ViewGpuContext, _instantiationService: IInstantiationService, _logService: ILogService);
    initWebgpu(): Promise<void>;
    private _updateAtlasStorageBufferAndTexture;
    static canRender(options: ViewLineOptions, viewportData: ViewportData, lineNumber: number): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
    onLinesChanged(e: ViewLinesChangedEvent): boolean;
    onScrollChanged(e: ViewScrollChangedEvent): boolean;
    renderText(viewportData: ViewportData): void;
    private _renderText;
    linesVisibleRangesForRange(range: Range, includeNewLines: boolean): LineVisibleRanges[] | null;
    private _visibleRangesForLineRange;
    visibleRangeForPosition(position: Position): HorizontalPosition | null;
}
