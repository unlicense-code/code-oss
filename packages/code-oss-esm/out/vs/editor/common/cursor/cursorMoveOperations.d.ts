import { Position } from '../core/position.js';
import { CursorConfiguration, ICursorSimpleModel, SingleCursorState } from '../cursorCommon.js';
import { PositionAffinity } from '../model.js';
export declare class CursorPosition {
    _cursorPositionBrand: void;
    readonly lineNumber: number;
    readonly column: number;
    readonly leftoverVisibleColumns: number;
    constructor(lineNumber: number, column: number, leftoverVisibleColumns: number);
}
export declare class MoveOperations {
    static leftPosition(model: ICursorSimpleModel, position: Position): Position;
    private static leftPositionAtomicSoftTabs;
    private static left;
    /**
     * @param noOfColumns Must be either `1`
     * or `Math.round(viewModel.getLineContent(viewLineNumber).length / 2)` (for half lines).
    */
    static moveLeft(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState, inSelectionMode: boolean, noOfColumns: number): SingleCursorState;
    /**
     * Adjusts the column so that it is within min/max of the line.
    */
    private static clipPositionColumn;
    private static clipRange;
    static rightPosition(model: ICursorSimpleModel, lineNumber: number, column: number): Position;
    static rightPositionAtomicSoftTabs(model: ICursorSimpleModel, lineNumber: number, column: number, tabSize: number, indentSize: number): Position;
    static right(config: CursorConfiguration, model: ICursorSimpleModel, position: Position): CursorPosition;
    static moveRight(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState, inSelectionMode: boolean, noOfColumns: number): SingleCursorState;
    static vertical(config: CursorConfiguration, model: ICursorSimpleModel, lineNumber: number, column: number, leftoverVisibleColumns: number, newLineNumber: number, allowMoveOnEdgeLine: boolean, normalizationAffinity?: PositionAffinity): CursorPosition;
    static down(config: CursorConfiguration, model: ICursorSimpleModel, lineNumber: number, column: number, leftoverVisibleColumns: number, count: number, allowMoveOnLastLine: boolean): CursorPosition;
    static moveDown(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState, inSelectionMode: boolean, linesCount: number): SingleCursorState;
    static translateDown(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState): SingleCursorState;
    static up(config: CursorConfiguration, model: ICursorSimpleModel, lineNumber: number, column: number, leftoverVisibleColumns: number, count: number, allowMoveOnFirstLine: boolean): CursorPosition;
    static moveUp(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState, inSelectionMode: boolean, linesCount: number): SingleCursorState;
    static translateUp(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState): SingleCursorState;
    private static _isBlankLine;
    static moveToPrevBlankLine(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState, inSelectionMode: boolean): SingleCursorState;
    static moveToNextBlankLine(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState, inSelectionMode: boolean): SingleCursorState;
    static moveToBeginningOfLine(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState, inSelectionMode: boolean): SingleCursorState;
    static moveToEndOfLine(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState, inSelectionMode: boolean, sticky: boolean): SingleCursorState;
    static moveToBeginningOfBuffer(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState, inSelectionMode: boolean): SingleCursorState;
    static moveToEndOfBuffer(config: CursorConfiguration, model: ICursorSimpleModel, cursor: SingleCursorState, inSelectionMode: boolean): SingleCursorState;
}
