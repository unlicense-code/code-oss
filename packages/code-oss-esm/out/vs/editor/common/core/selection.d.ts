import { IPosition, Position } from './position.js';
import { Range } from './range.js';
/**
 * A selection in the editor.
 * The selection is a range that has an orientation.
 */
export interface ISelection {
    /**
     * The line number on which the selection has started.
     */
    readonly selectionStartLineNumber: number;
    /**
     * The column on `selectionStartLineNumber` where the selection has started.
     */
    readonly selectionStartColumn: number;
    /**
     * The line number on which the selection has ended.
     */
    readonly positionLineNumber: number;
    /**
     * The column on `positionLineNumber` where the selection has ended.
     */
    readonly positionColumn: number;
}
/**
 * The direction of a selection.
 */
export declare const enum SelectionDirection {
    /**
     * The selection starts above where it ends.
     */
    LTR = 0,
    /**
     * The selection starts below where it ends.
     */
    RTL = 1
}
/**
 * A selection in the editor.
 * The selection is a range that has an orientation.
 */
export declare class Selection extends Range {
    /**
     * The line number on which the selection has started.
     */
    readonly selectionStartLineNumber: number;
    /**
     * The column on `selectionStartLineNumber` where the selection has started.
     */
    readonly selectionStartColumn: number;
    /**
     * The line number on which the selection has ended.
     */
    readonly positionLineNumber: number;
    /**
     * The column on `positionLineNumber` where the selection has ended.
     */
    readonly positionColumn: number;
    constructor(selectionStartLineNumber: number, selectionStartColumn: number, positionLineNumber: number, positionColumn: number);
    /**
     * Transform to a human-readable representation.
     */
    toString(): string;
    /**
     * Test if equals other selection.
     */
    equalsSelection(other: ISelection): boolean;
    /**
     * Test if the two selections are equal.
     */
    static selectionsEqual(a: ISelection, b: ISelection): boolean;
    /**
     * Get directions (LTR or RTL).
     */
    getDirection(): SelectionDirection;
    /**
     * Create a new selection with a different `positionLineNumber` and `positionColumn`.
     */
    setEndPosition(endLineNumber: number, endColumn: number): Selection;
    /**
     * Get the position at `positionLineNumber` and `positionColumn`.
     */
    getPosition(): Position;
    /**
     * Get the position at the start of the selection.
    */
    getSelectionStart(): Position;
    /**
     * Create a new selection with a different `selectionStartLineNumber` and `selectionStartColumn`.
     */
    setStartPosition(startLineNumber: number, startColumn: number): Selection;
    /**
     * Create a `Selection` from one or two positions
     */
    static fromPositions(start: IPosition, end?: IPosition): Selection;
    /**
     * Creates a `Selection` from a range, given a direction.
     */
    static fromRange(range: Range, direction: SelectionDirection): Selection;
    /**
     * Create a `Selection` from an `ISelection`.
     */
    static liftSelection(sel: ISelection): Selection;
    /**
     * `a` equals `b`.
     */
    static selectionsArrEqual(a: ISelection[], b: ISelection[]): boolean;
    /**
     * Test if `obj` is an `ISelection`.
     */
    static isISelection(obj: any): obj is ISelection;
    /**
     * Create with a direction.
     */
    static createWithDirection(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number, direction: SelectionDirection): Selection;
}
