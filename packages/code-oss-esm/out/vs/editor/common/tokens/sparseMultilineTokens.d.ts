import { IRange, Range } from '../core/range.js';
/**
 * Represents sparse tokens over a contiguous range of lines.
 */
export declare class SparseMultilineTokens {
    static create(startLineNumber: number, tokens: Uint32Array): SparseMultilineTokens;
    private _startLineNumber;
    private _endLineNumber;
    private readonly _tokens;
    /**
     * (Inclusive) start line number for these tokens.
     */
    get startLineNumber(): number;
    /**
     * (Inclusive) end line number for these tokens.
     */
    get endLineNumber(): number;
    private constructor();
    toString(): string;
    private _updateEndLineNumber;
    isEmpty(): boolean;
    getLineTokens(lineNumber: number): SparseLineTokens | null;
    getRange(): Range | null;
    removeTokens(range: Range): void;
    split(range: Range): [SparseMultilineTokens, SparseMultilineTokens];
    applyEdit(range: IRange, text: string): void;
    acceptEdit(range: IRange, eolCount: number, firstLineLength: number, lastLineLength: number, firstCharCode: number): void;
    private _acceptDeleteRange;
    private _acceptInsertText;
}
export declare class SparseLineTokens {
    private readonly _tokens;
    constructor(tokens: Uint32Array);
    getCount(): number;
    getStartCharacter(tokenIndex: number): number;
    getEndCharacter(tokenIndex: number): number;
    getMetadata(tokenIndex: number): number;
}
