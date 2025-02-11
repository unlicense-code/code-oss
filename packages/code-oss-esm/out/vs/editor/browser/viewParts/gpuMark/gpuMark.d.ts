import * as viewEvents from '../../../common/viewEvents.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import { DynamicViewOverlay } from '../../view/dynamicViewOverlay.js';
import { RenderingContext } from '../../view/renderingContext.js';
import './gpuMark.css';
/**
 * A mark on lines to make identification of GPU-rendered lines vs DOM easier.
 */
export declare class GpuMarkOverlay extends DynamicViewOverlay {
    static readonly CLASS_NAME = "gpu-mark";
    private readonly _context;
    private _renderResult;
    constructor(context: ViewContext);
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(startLineNumber: number, lineNumber: number): string;
}
