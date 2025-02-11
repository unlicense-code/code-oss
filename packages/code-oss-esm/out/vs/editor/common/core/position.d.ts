/**
 * A position in the editor. This interface is suitable for serialization.
 */
export interface IPosition {
    /**
     * line number (starts at 1)
     */
    readonly lineNumber: number;
    /**
     * column (the first character in a line is between column 1 and column 2)
     */
    readonly column: number;
}
/**
 * A position in the editor.
 */
export declare class Position {
    /**
     * line number (starts at 1)
     */
    readonly lineNumber: number;
    /**
     * column (the first character in a line is between column 1 and column 2)
     */
    readonly column: number;
    constructor(lineNumber: number, column: number);
    /**
     * Create a new position from this position.
     *
     * @param newLineNumber new line number
     * @param newColumn new column
     */
    with(newLineNumber?: number, newColumn?: number): Position;
    /**
     * Derive a new position from this position.
     *
     * @param deltaLineNumber line number delta
     * @param deltaColumn column delta
     */
    delta(deltaLineNumber?: number, deltaColumn?: number): Position;
    /**
     * Test if this position equals other position
     */
    equals(other: IPosition): boolean;
    /**
     * Test if position `a` equals position `b`
     */
    static equals(a: IPosition | null, b: IPosition | null): boolean;
    /**
     * Test if this position is before other position.
     * If the two positions are equal, the result will be false.
     */
    isBefore(other: IPosition): boolean;
    /**
     * Test if position `a` is before position `b`.
     * If the two positions are equal, the result will be false.
     */
    static isBefore(a: IPosition, b: IPosition): boolean;
    /**
     * Test if this position is before other position.
     * If the two positions are equal, the result will be true.
     */
    isBeforeOrEqual(other: IPosition): boolean;
    /**
     * Test if position `a` is before position `b`.
     * If the two positions are equal, the result will be true.
     */
    static isBeforeOrEqual(a: IPosition, b: IPosition): boolean;
    /**
     * A function that compares positions, useful for sorting
     */
    static compare(a: IPosition, b: IPosition): number;
    /**
     * Clone this position.
     */
    clone(): Position;
    /**
     * Convert to a human-readable representation.
     */
    toString(): string;
    /**
     * Create a `Position` from an `IPosition`.
     */
    static lift(pos: IPosition): Position;
    /**
     * Test if `obj` is an `IPosition`.
     */
    static isIPosition(obj: any): obj is IPosition;
    toJSON(): IPosition;
}
