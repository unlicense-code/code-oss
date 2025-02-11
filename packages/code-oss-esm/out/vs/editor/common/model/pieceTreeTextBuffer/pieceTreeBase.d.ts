import { Position } from '../../core/position.js';
import { Range } from '../../core/range.js';
import { FindMatch, ITextSnapshot, SearchData } from '../../model.js';
import { TreeNode } from './rbTreeBase.js';
import { Searcher } from '../textModelSearch.js';
declare class LineStarts {
    readonly lineStarts: Uint32Array | Uint16Array | number[];
    readonly cr: number;
    readonly lf: number;
    readonly crlf: number;
    readonly isBasicASCII: boolean;
    constructor(lineStarts: Uint32Array | Uint16Array | number[], cr: number, lf: number, crlf: number, isBasicASCII: boolean);
}
export declare function createLineStartsFast(str: string, readonly?: boolean): Uint32Array | Uint16Array | number[];
export declare function createLineStarts(r: number[], str: string): LineStarts;
interface NodePosition {
    /**
     * Piece Index
     */
    node: TreeNode;
    /**
     * remainder in current piece.
    */
    remainder: number;
    /**
     * node start offset in document.
     */
    nodeStartOffset: number;
}
interface BufferCursor {
    /**
     * Line number in current buffer
     */
    line: number;
    /**
     * Column number in current buffer
     */
    column: number;
}
export declare class Piece {
    readonly bufferIndex: number;
    readonly start: BufferCursor;
    readonly end: BufferCursor;
    readonly length: number;
    readonly lineFeedCnt: number;
    constructor(bufferIndex: number, start: BufferCursor, end: BufferCursor, lineFeedCnt: number, length: number);
}
export declare class StringBuffer {
    buffer: string;
    lineStarts: Uint32Array | Uint16Array | number[];
    constructor(buffer: string, lineStarts: Uint32Array | Uint16Array | number[]);
}
export declare class PieceTreeBase {
    root: TreeNode;
    protected _buffers: StringBuffer[];
    protected _lineCnt: number;
    protected _length: number;
    protected _EOL: '\r\n' | '\n';
    protected _EOLLength: number;
    protected _EOLNormalized: boolean;
    private _lastChangeBufferPos;
    private _searchCache;
    private _lastVisitedLine;
    constructor(chunks: StringBuffer[], eol: '\r\n' | '\n', eolNormalized: boolean);
    create(chunks: StringBuffer[], eol: '\r\n' | '\n', eolNormalized: boolean): void;
    normalizeEOL(eol: '\r\n' | '\n'): void;
    getEOL(): '\r\n' | '\n';
    setEOL(newEOL: '\r\n' | '\n'): void;
    createSnapshot(BOM: string): ITextSnapshot;
    equal(other: PieceTreeBase): boolean;
    getOffsetAt(lineNumber: number, column: number): number;
    getPositionAt(offset: number): Position;
    getValueInRange(range: Range, eol?: string): string;
    getValueInRange2(startPosition: NodePosition, endPosition: NodePosition): string;
    getLinesContent(): string[];
    getLength(): number;
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
    private _getCharCode;
    getLineCharCode(lineNumber: number, index: number): number;
    getLineLength(lineNumber: number): number;
    getCharCode(offset: number): number;
    getNearestChunk(offset: number): string;
    findMatchesInNode(node: TreeNode, searcher: Searcher, startLineNumber: number, startColumn: number, startCursor: BufferCursor, endCursor: BufferCursor, searchData: SearchData, captureMatches: boolean, limitResultCount: number, resultLen: number, result: FindMatch[]): number;
    findMatchesLineByLine(searchRange: Range, searchData: SearchData, captureMatches: boolean, limitResultCount: number): FindMatch[];
    private _findMatchesInLine;
    insert(offset: number, value: string, eolNormalized?: boolean): void;
    delete(offset: number, cnt: number): void;
    private insertContentToNodeLeft;
    private insertContentToNodeRight;
    private positionInBuffer;
    private getLineFeedCnt;
    private offsetInBuffer;
    private deleteNodes;
    private createNewPieces;
    getLinesRawContent(): string;
    getLineRawContent(lineNumber: number, endOffset?: number): string;
    private computeBufferMetadata;
    private getIndexOf;
    private getAccumulatedValue;
    private deleteNodeTail;
    private deleteNodeHead;
    private shrinkNode;
    private appendToNode;
    private nodeAt;
    private nodeAt2;
    private nodeCharCodeAt;
    private offsetOfNode;
    private shouldCheckCRLF;
    private startWithLF;
    private endWithCR;
    private validateCRLFWithPrevNode;
    private validateCRLFWithNextNode;
    private fixCRLF;
    private adjustCarriageReturnFromNext;
    iterate(node: TreeNode, callback: (node: TreeNode) => boolean): boolean;
    private getNodeContent;
    getPieceContent(piece: Piece): string;
    /**
     *      node              node
     *     /  \              /  \
     *    a   b    <----   a    b
     *                         /
     *                        z
     */
    private rbInsertRight;
    /**
     *      node              node
     *     /  \              /  \
     *    a   b     ---->   a    b
     *                       \
     *                        z
     */
    private rbInsertLeft;
    private getContentOfSubTree;
}
export {};
