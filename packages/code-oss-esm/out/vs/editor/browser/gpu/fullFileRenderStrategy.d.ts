import { ViewEventHandler } from '../../common/viewEventHandler.js';
import type { ViewConfigurationChangedEvent, ViewLinesChangedEvent, ViewLinesDeletedEvent, ViewLinesInsertedEvent, ViewScrollChangedEvent, ViewTokensChangedEvent } from '../../common/viewEvents.js';
import type { ViewportData } from '../../common/viewLayout/viewLinesViewportData.js';
import type { ViewContext } from '../../common/viewModel/viewContext.js';
import type { ViewLineOptions } from '../viewParts/viewLines/viewLineOptions.js';
import { type IGpuRenderStrategy } from './gpu.js';
import { ViewGpuContext } from './viewGpuContext.js';
export declare class FullFileRenderStrategy extends ViewEventHandler implements IGpuRenderStrategy {
    private readonly _context;
    private readonly _viewGpuContext;
    private readonly _device;
    readonly wgsl: string;
    private readonly _glyphRasterizer;
    private _cellBindBuffer;
    /**
     * The cell value buffers, these hold the cells and their glyphs. It's double buffers such that
     * the thread doesn't block when one is being uploaded to the GPU.
     */
    private _cellValueBuffers;
    private _activeDoubleBufferIndex;
    private readonly _upToDateLines;
    private _visibleObjectCount;
    private _finalRenderedLine;
    private _scrollOffsetBindBuffer;
    private _scrollOffsetValueBuffer;
    private _scrollInitialized;
    private readonly _queuedBufferUpdates;
    get bindGroupEntries(): GPUBindGroupEntry[];
    constructor(_context: ViewContext, _viewGpuContext: ViewGpuContext, _device: GPUDevice);
    onConfigurationChanged(e: ViewConfigurationChangedEvent): boolean;
    onTokensChanged(e: ViewTokensChangedEvent): boolean;
    onLinesDeleted(e: ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: ViewLinesInsertedEvent): boolean;
    onLinesChanged(e: ViewLinesChangedEvent): boolean;
    onScrollChanged(e?: ViewScrollChangedEvent): boolean;
    reset(): void;
    update(viewportData: ViewportData, viewLineOptions: ViewLineOptions): number;
    draw(pass: GPURenderPassEncoder, viewportData: ViewportData): void;
    private _queueBufferUpdate;
}
