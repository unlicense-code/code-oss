import { InlineDecoration, InlineDecorationType } from '../viewModel.js';
export declare class LineDecoration {
    readonly startColumn: number;
    readonly endColumn: number;
    readonly className: string;
    readonly type: InlineDecorationType;
    _lineDecorationBrand: void;
    constructor(startColumn: number, endColumn: number, className: string, type: InlineDecorationType);
    private static _equals;
    static equalsArr(a: LineDecoration[], b: LineDecoration[]): boolean;
    static extractWrapped(arr: LineDecoration[], startOffset: number, endOffset: number): LineDecoration[];
    static filter(lineDecorations: InlineDecoration[], lineNumber: number, minLineColumn: number, maxLineColumn: number): LineDecoration[];
    private static _typeCompare;
    static compare(a: LineDecoration, b: LineDecoration): number;
}
export declare class DecorationSegment {
    startOffset: number;
    endOffset: number;
    className: string;
    metadata: number;
    constructor(startOffset: number, endOffset: number, className: string, metadata: number);
}
export declare class LineDecorationsNormalizer {
    /**
     * Normalize line decorations. Overlapping decorations will generate multiple segments
     */
    static normalize(lineContent: string, lineDecorations: LineDecoration[]): DecorationSegment[];
}
