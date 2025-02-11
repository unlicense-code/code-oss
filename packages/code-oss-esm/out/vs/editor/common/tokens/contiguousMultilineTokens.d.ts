import { IRange } from '../core/range.js';
import { LineRange } from '../core/lineRange.js';
/**
 * Represents contiguous tokens over a contiguous range of lines.
 */
export declare class ContiguousMultilineTokens {
    static deserialize(buff: Uint8Array, offset: number, result: ContiguousMultilineTokens[]): number;
    /**
     * The start line number for this block of tokens.
     */
    private _startLineNumber;
    /**
     * The tokens are stored in a binary format. There is an element for each line,
     * so `tokens[index]` contains all tokens on line `startLineNumber + index`.
     *
     * On a specific line, each token occupies two array indices. For token i:
     *  - at offset 2*i => endOffset
     *  - at offset 2*i + 1 => metadata
     *
     */
    private _tokens;
    /**
     * (Inclusive) start line number for these tokens.
     */
    get startLineNumber(): number;
    /**
     * (Inclusive) end line number for these tokens.
     */
    get endLineNumber(): number;
    constructor(startLineNumber: number, tokens: Uint32Array[]);
    getLineRange(): LineRange;
    /**
     * @see {@link _tokens}
     */
    getLineTokens(lineNumber: number): Uint32Array | ArrayBuffer | null;
    appendLineTokens(lineTokens: Uint32Array): void;
    serializeSize(): number;
    serialize(destination: Uint8Array, offset: number): number;
    applyEdit(range: IRange, text: string): void;
    private _acceptDeleteRange;
    private _acceptInsertText;
    private _insertLines;
}
