import { Event } from '../../../../base/common/event.js';
import { Position } from '../../core/position.js';
import { Range } from '../../core/range.js';
import { ApplyEditsResult, EndOfLinePreference, FindMatch, ISingleEditOperationIdentifier, ITextBuffer, ITextSnapshot, ValidAnnotatedEditOperation, SearchData } from '../../model.js';
import { PieceTreeBase, StringBuffer } from './pieceTreeBase.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export interface IValidatedEditOperation {
    sortIndex: number;
    identifier: ISingleEditOperationIdentifier | null;
    range: Range;
    rangeOffset: number;
    rangeLength: number;
    text: string;
    eolCount: number;
    firstLineLength: number;
    lastLineLength: number;
    forceMoveMarkers: boolean;
    isAutoWhitespaceEdit: boolean;
}
export declare class PieceTreeTextBuffer extends Disposable implements ITextBuffer {
    private _pieceTree;
    private readonly _BOM;
    private _mightContainRTL;
    private _mightContainUnusualLineTerminators;
    private _mightContainNonBasicASCII;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    constructor(chunks: StringBuffer[], BOM: string, eol: '\r\n' | '\n', containsRTL: boolean, containsUnusualLineTerminators: boolean, isBasicASCII: boolean, eolNormalized: boolean);
    equals(other: ITextBuffer): boolean;
    mightContainRTL(): boolean;
    mightContainUnusualLineTerminators(): boolean;
    resetMightContainUnusualLineTerminators(): void;
    mightContainNonBasicASCII(): boolean;
    getBOM(): string;
    getEOL(): '\r\n' | '\n';
    createSnapshot(preserveBOM: boolean): ITextSnapshot;
    getOffsetAt(lineNumber: number, column: number): number;
    getPositionAt(offset: number): Position;
    getRangeAt(start: number, length: number): Range;
    getValueInRange(range: Range, eol?: EndOfLinePreference): string;
    getValueLengthInRange(range: Range, eol?: EndOfLinePreference): number;
    getCharacterCountInRange(range: Range, eol?: EndOfLinePreference): number;
    getNearestChunk(offset: number): string;
    getLength(): number;
    getLineCount(): number;
    getLinesContent(): string[];
    getLineContent(lineNumber: number): string;
    getLineCharCode(lineNumber: number, index: number): number;
    getCharCode(offset: number): number;
    getLineLength(lineNumber: number): number;
    getLineMinColumn(lineNumber: number): number;
    getLineMaxColumn(lineNumber: number): number;
    getLineFirstNonWhitespaceColumn(lineNumber: number): number;
    getLineLastNonWhitespaceColumn(lineNumber: number): number;
    private _getEndOfLine;
    setEOL(newEOL: '\r\n' | '\n'): void;
    applyEdits(rawOperations: ValidAnnotatedEditOperation[], recordTrimAutoWhitespace: boolean, computeUndoEdits: boolean): ApplyEditsResult;
    /**
     * Transform operations such that they represent the same logic edit,
     * but that they also do not cause OOM crashes.
     */
    private _reduceOperations;
    _toSingleEditOperation(operations: IValidatedEditOperation[]): IValidatedEditOperation;
    private _doApplyEdits;
    findMatchesLineByLine(searchRange: Range, searchData: SearchData, captureMatches: boolean, limitResultCount: number): FindMatch[];
    getPieceTree(): PieceTreeBase;
    static _getInverseEditRange(range: Range, text: string): Range;
    /**
     * Assumes `operations` are validated and sorted ascending
     */
    static _getInverseEditRanges(operations: IValidatedEditOperation[]): Range[];
    private static _sortOpsAscending;
    private static _sortOpsDescending;
}
