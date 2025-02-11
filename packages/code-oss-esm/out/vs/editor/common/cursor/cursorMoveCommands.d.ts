import { CursorState, PartialCursorState } from '../cursorCommon.js';
import { IPosition } from '../core/position.js';
import { Range } from '../core/range.js';
import { ICommandMetadata } from '../../../platform/commands/common/commands.js';
import { IViewModel } from '../viewModel.js';
export declare class CursorMoveCommands {
    static addCursorDown(viewModel: IViewModel, cursors: CursorState[], useLogicalLine: boolean): PartialCursorState[];
    static addCursorUp(viewModel: IViewModel, cursors: CursorState[], useLogicalLine: boolean): PartialCursorState[];
    static moveToBeginningOfLine(viewModel: IViewModel, cursors: CursorState[], inSelectionMode: boolean): PartialCursorState[];
    private static _moveToLineStart;
    private static _moveToLineStartByView;
    private static _moveToLineStartByModel;
    static moveToEndOfLine(viewModel: IViewModel, cursors: CursorState[], inSelectionMode: boolean, sticky: boolean): PartialCursorState[];
    private static _moveToLineEnd;
    private static _moveToLineEndByView;
    private static _moveToLineEndByModel;
    static expandLineSelection(viewModel: IViewModel, cursors: CursorState[]): PartialCursorState[];
    static moveToBeginningOfBuffer(viewModel: IViewModel, cursors: CursorState[], inSelectionMode: boolean): PartialCursorState[];
    static moveToEndOfBuffer(viewModel: IViewModel, cursors: CursorState[], inSelectionMode: boolean): PartialCursorState[];
    static selectAll(viewModel: IViewModel, cursor: CursorState): PartialCursorState;
    static line(viewModel: IViewModel, cursor: CursorState, inSelectionMode: boolean, _position: IPosition, _viewPosition: IPosition | undefined): PartialCursorState;
    static word(viewModel: IViewModel, cursor: CursorState, inSelectionMode: boolean, _position: IPosition): PartialCursorState;
    static cancelSelection(viewModel: IViewModel, cursor: CursorState): PartialCursorState;
    static moveTo(viewModel: IViewModel, cursor: CursorState, inSelectionMode: boolean, _position: IPosition, _viewPosition: IPosition | undefined): PartialCursorState;
    static simpleMove(viewModel: IViewModel, cursors: CursorState[], direction: CursorMove.SimpleMoveDirection, inSelectionMode: boolean, value: number, unit: CursorMove.Unit): PartialCursorState[] | null;
    static viewportMove(viewModel: IViewModel, cursors: CursorState[], direction: CursorMove.ViewportDirection, inSelectionMode: boolean, value: number): PartialCursorState[] | null;
    static findPositionInViewportIfOutside(viewModel: IViewModel, cursor: CursorState, visibleViewRange: Range, inSelectionMode: boolean): PartialCursorState;
    /**
     * Find the nth line start included in the range (from the start).
     */
    private static _firstLineNumberInRange;
    /**
     * Find the nth line start included in the range (from the end).
     */
    private static _lastLineNumberInRange;
    private static _moveLeft;
    private static _moveHalfLineLeft;
    private static _moveRight;
    private static _moveHalfLineRight;
    private static _moveDownByViewLines;
    private static _moveDownByModelLines;
    private static _moveUpByViewLines;
    private static _moveUpByModelLines;
    private static _moveToViewPosition;
    private static _moveToModelPosition;
    private static _moveToViewMinColumn;
    private static _moveToViewFirstNonWhitespaceColumn;
    private static _moveToViewCenterColumn;
    private static _moveToViewMaxColumn;
    private static _moveToViewLastNonWhitespaceColumn;
}
export declare namespace CursorMove {
    const metadata: ICommandMetadata;
    /**
     * Positions in the view for cursor move command.
     */
    const RawDirection: {
        Left: string;
        Right: string;
        Up: string;
        Down: string;
        PrevBlankLine: string;
        NextBlankLine: string;
        WrappedLineStart: string;
        WrappedLineFirstNonWhitespaceCharacter: string;
        WrappedLineColumnCenter: string;
        WrappedLineEnd: string;
        WrappedLineLastNonWhitespaceCharacter: string;
        ViewPortTop: string;
        ViewPortCenter: string;
        ViewPortBottom: string;
        ViewPortIfOutside: string;
    };
    /**
     * Units for Cursor move 'by' argument
     */
    const RawUnit: {
        Line: string;
        WrappedLine: string;
        Character: string;
        HalfLine: string;
    };
    /**
     * Arguments for Cursor move command
     */
    interface RawArguments {
        to: string;
        select?: boolean;
        by?: string;
        value?: number;
    }
    function parse(args: Partial<RawArguments>): ParsedArguments | null;
    interface ParsedArguments {
        direction: Direction;
        unit: Unit;
        select: boolean;
        value: number;
    }
    interface SimpleMoveArguments {
        direction: SimpleMoveDirection;
        unit: Unit;
        select: boolean;
        value: number;
    }
    const enum Direction {
        Left = 0,
        Right = 1,
        Up = 2,
        Down = 3,
        PrevBlankLine = 4,
        NextBlankLine = 5,
        WrappedLineStart = 6,
        WrappedLineFirstNonWhitespaceCharacter = 7,
        WrappedLineColumnCenter = 8,
        WrappedLineEnd = 9,
        WrappedLineLastNonWhitespaceCharacter = 10,
        ViewPortTop = 11,
        ViewPortCenter = 12,
        ViewPortBottom = 13,
        ViewPortIfOutside = 14
    }
    type SimpleMoveDirection = (Direction.Left | Direction.Right | Direction.Up | Direction.Down | Direction.PrevBlankLine | Direction.NextBlankLine | Direction.WrappedLineStart | Direction.WrappedLineFirstNonWhitespaceCharacter | Direction.WrappedLineColumnCenter | Direction.WrappedLineEnd | Direction.WrappedLineLastNonWhitespaceCharacter);
    type ViewportDirection = (Direction.ViewPortTop | Direction.ViewPortCenter | Direction.ViewPortBottom | Direction.ViewPortIfOutside);
    const enum Unit {
        None = 0,
        Line = 1,
        WrappedLine = 2,
        Character = 3,
        HalfLine = 4
    }
}
