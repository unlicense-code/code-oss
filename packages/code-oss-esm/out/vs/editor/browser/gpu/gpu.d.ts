import type { ViewConfigurationChangedEvent, ViewLinesChangedEvent, ViewLinesDeletedEvent, ViewLinesInsertedEvent, ViewScrollChangedEvent, ViewTokensChangedEvent } from '../../common/viewEvents.js';
import type { ViewportData } from '../../common/viewLayout/viewLinesViewportData.js';
import type { ViewLineOptions } from '../viewParts/viewLines/viewLineOptions.js';
export declare const enum BindingId {
    GlyphInfo0 = 0,
    GlyphInfo1 = 1,
    Cells = 2,
    TextureSampler = 3,
    Texture = 4,
    LayoutInfoUniform = 5,
    AtlasDimensionsUniform = 6,
    ScrollOffset = 7
}
export interface IGpuRenderStrategy {
    readonly wgsl: string;
    readonly bindGroupEntries: GPUBindGroupEntry[];
    onLinesDeleted(e: ViewLinesDeletedEvent): boolean;
    onConfigurationChanged(e: ViewConfigurationChangedEvent): boolean;
    onTokensChanged(e: ViewTokensChangedEvent): boolean;
    onLinesInserted(e: ViewLinesInsertedEvent): boolean;
    onLinesChanged(e: ViewLinesChangedEvent): boolean;
    onScrollChanged(e?: ViewScrollChangedEvent): boolean;
    /**
     * Resets the render strategy, clearing all data and setting up for a new frame.
     */
    reset(): void;
    update(viewportData: ViewportData, viewLineOptions: ViewLineOptions): number;
    draw?(pass: GPURenderPassEncoder, viewportData: ViewportData): void;
}
