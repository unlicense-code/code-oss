import { IEditorWhitespace, IPartialViewLinesViewportData, IViewWhitespaceViewportData, IWhitespaceChangeAccessor } from '../viewModel.js';
interface IPendingChange {
    id: string;
    newAfterLineNumber: number;
    newHeight: number;
}
interface IPendingRemove {
    id: string;
}
export declare class EditorWhitespace implements IEditorWhitespace {
    id: string;
    afterLineNumber: number;
    ordinal: number;
    height: number;
    minWidth: number;
    prefixSum: number;
    constructor(id: string, afterLineNumber: number, ordinal: number, height: number, minWidth: number);
}
/**
 * Layouting of objects that take vertical space (by having a height) and push down other objects.
 *
 * These objects are basically either text (lines) or spaces between those lines (whitespaces).
 * This provides commodity operations for working with lines that contain whitespace that pushes lines lower (vertically).
 */
export declare class LinesLayout {
    private static INSTANCE_COUNT;
    private readonly _instanceId;
    private readonly _pendingChanges;
    private _lastWhitespaceId;
    private _arr;
    private _prefixSumValidIndex;
    private _minWidth;
    private _lineCount;
    private _lineHeight;
    private _paddingTop;
    private _paddingBottom;
    constructor(lineCount: number, lineHeight: number, paddingTop: number, paddingBottom: number);
    /**
     * Find the insertion index for a new value inside a sorted array of values.
     * If the value is already present in the sorted array, the insertion index will be after the already existing value.
     */
    static findInsertionIndex(arr: EditorWhitespace[], afterLineNumber: number, ordinal: number): number;
    /**
     * Change the height of a line in pixels.
     */
    setLineHeight(lineHeight: number): void;
    /**
     * Changes the padding used to calculate vertical offsets.
     */
    setPadding(paddingTop: number, paddingBottom: number): void;
    /**
     * Set the number of lines.
     *
     * @param lineCount New number of lines.
     */
    onFlushed(lineCount: number): void;
    changeWhitespace(callback: (accessor: IWhitespaceChangeAccessor) => void): boolean;
    _commitPendingChanges(inserts: EditorWhitespace[], changes: IPendingChange[], removes: IPendingRemove[]): void;
    private _checkPendingChanges;
    private _insertWhitespace;
    private _findWhitespaceIndex;
    private _changeOneWhitespace;
    private _removeWhitespace;
    /**
     * Notify the layouter that lines have been deleted (a continuous zone of lines).
     *
     * @param fromLineNumber The line number at which the deletion started, inclusive
     * @param toLineNumber The line number at which the deletion ended, inclusive
     */
    onLinesDeleted(fromLineNumber: number, toLineNumber: number): void;
    /**
     * Notify the layouter that lines have been inserted (a continuous zone of lines).
     *
     * @param fromLineNumber The line number at which the insertion started, inclusive
     * @param toLineNumber The line number at which the insertion ended, inclusive.
     */
    onLinesInserted(fromLineNumber: number, toLineNumber: number): void;
    /**
     * Get the sum of all the whitespaces.
     */
    getWhitespacesTotalHeight(): number;
    /**
     * Return the sum of the heights of the whitespaces at [0..index].
     * This includes the whitespace at `index`.
     *
     * @param index The index of the whitespace.
     * @return The sum of the heights of all whitespaces before the one at `index`, including the one at `index`.
     */
    getWhitespacesAccumulatedHeight(index: number): number;
    /**
     * Get the sum of heights for all objects.
     *
     * @return The sum of heights for all objects.
     */
    getLinesTotalHeight(): number;
    /**
     * Returns the accumulated height of whitespaces before the given line number.
     *
     * @param lineNumber The line number
     */
    getWhitespaceAccumulatedHeightBeforeLineNumber(lineNumber: number): number;
    private _findLastWhitespaceBeforeLineNumber;
    private _findFirstWhitespaceAfterLineNumber;
    /**
     * Find the index of the first whitespace which has `afterLineNumber` >= `lineNumber`.
     * @return The index of the first whitespace with `afterLineNumber` >= `lineNumber` or -1 if no whitespace is found.
     */
    getFirstWhitespaceIndexAfterLineNumber(lineNumber: number): number;
    /**
     * Get the vertical offset (the sum of heights for all objects above) a certain line number.
     *
     * @param lineNumber The line number
     * @return The sum of heights for all objects above `lineNumber`.
     */
    getVerticalOffsetForLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    /**
     * Get the vertical offset (the sum of heights for all objects above) a certain line number.
     *
     * @param lineNumber The line number
     * @return The sum of heights for all objects above `lineNumber`.
     */
    getVerticalOffsetAfterLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    /**
     * Returns if there is any whitespace in the document.
     */
    hasWhitespace(): boolean;
    /**
     * The maximum min width for all whitespaces.
     */
    getWhitespaceMinWidth(): number;
    /**
     * Check if `verticalOffset` is below all lines.
     */
    isAfterLines(verticalOffset: number): boolean;
    isInTopPadding(verticalOffset: number): boolean;
    isInBottomPadding(verticalOffset: number): boolean;
    /**
     * Find the first line number that is at or after vertical offset `verticalOffset`.
     * i.e. if getVerticalOffsetForLine(line) is x and getVerticalOffsetForLine(line + 1) is y, then
     * getLineNumberAtOrAfterVerticalOffset(i) = line, x <= i < y.
     *
     * @param verticalOffset The vertical offset to search at.
     * @return The line number at or after vertical offset `verticalOffset`.
     */
    getLineNumberAtOrAfterVerticalOffset(verticalOffset: number): number;
    /**
     * Get all the lines and their relative vertical offsets that are positioned between `verticalOffset1` and `verticalOffset2`.
     *
     * @param verticalOffset1 The beginning of the viewport.
     * @param verticalOffset2 The end of the viewport.
     * @return A structure describing the lines positioned between `verticalOffset1` and `verticalOffset2`.
     */
    getLinesViewportData(verticalOffset1: number, verticalOffset2: number): IPartialViewLinesViewportData;
    getVerticalOffsetForWhitespaceIndex(whitespaceIndex: number): number;
    getWhitespaceIndexAtOrAfterVerticallOffset(verticalOffset: number): number;
    /**
     * Get exactly the whitespace that is layouted at `verticalOffset`.
     *
     * @param verticalOffset The vertical offset.
     * @return Precisely the whitespace that is layouted at `verticaloffset` or null.
     */
    getWhitespaceAtVerticalOffset(verticalOffset: number): IViewWhitespaceViewportData | null;
    /**
     * Get a list of whitespaces that are positioned between `verticalOffset1` and `verticalOffset2`.
     *
     * @param verticalOffset1 The beginning of the viewport.
     * @param verticalOffset2 The end of the viewport.
     * @return An array with all the whitespaces in the viewport. If no whitespace is in viewport, the array is empty.
     */
    getWhitespaceViewportData(verticalOffset1: number, verticalOffset2: number): IViewWhitespaceViewportData[];
    /**
     * Get all whitespaces.
     */
    getWhitespaces(): IEditorWhitespace[];
    /**
     * The number of whitespaces.
     */
    getWhitespacesCount(): number;
    /**
     * Get the `id` for whitespace at index `index`.
     *
     * @param index The index of the whitespace.
     * @return `id` of whitespace at `index`.
     */
    getIdForWhitespaceIndex(index: number): string;
    /**
     * Get the `afterLineNumber` for whitespace at index `index`.
     *
     * @param index The index of the whitespace.
     * @return `afterLineNumber` of whitespace at `index`.
     */
    getAfterLineNumberForWhitespaceIndex(index: number): number;
    /**
     * Get the `height` for whitespace at index `index`.
     *
     * @param index The index of the whitespace.
     * @return `height` of whitespace at `index`.
     */
    getHeightForWhitespaceIndex(index: number): number;
}
export {};
