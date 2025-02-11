import { Range } from '../core/range.js';
import { Selection } from '../core/selection.js';
import { IPartialViewLinesViewportData, IViewModel, IViewWhitespaceViewportData, ViewLineRenderingData, ViewModelDecoration } from '../viewModel.js';
/**
 * Contains all data needed to render at a specific viewport.
 */
export declare class ViewportData {
    readonly selections: Selection[];
    /**
     * The line number at which to start rendering (inclusive).
     */
    readonly startLineNumber: number;
    /**
     * The line number at which to end rendering (inclusive).
     */
    readonly endLineNumber: number;
    /**
     * relativeVerticalOffset[i] is the `top` position for line at `i` + `startLineNumber`.
     */
    readonly relativeVerticalOffset: number[];
    /**
     * The viewport as a range (startLineNumber,1) -> (endLineNumber,maxColumn(endLineNumber)).
     */
    readonly visibleRange: Range;
    /**
     * Value to be substracted from `scrollTop` (in order to vertical offset numbers < 1MM)
     */
    readonly bigNumbersDelta: number;
    /**
     * Positioning information about gaps whitespace.
     */
    readonly whitespaceViewportData: IViewWhitespaceViewportData[];
    private readonly _model;
    readonly lineHeight: number;
    constructor(selections: Selection[], partialData: IPartialViewLinesViewportData, whitespaceViewportData: IViewWhitespaceViewportData[], model: IViewModel);
    getViewLineRenderingData(lineNumber: number): ViewLineRenderingData;
    getDecorationsInViewport(): ViewModelDecoration[];
}
