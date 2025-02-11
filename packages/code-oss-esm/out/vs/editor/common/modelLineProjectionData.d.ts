import { WrappingIndent } from './config/editorOptions.js';
import { FontInfo } from './config/fontInfo.js';
import { Position } from './core/position.js';
import { InjectedTextOptions, PositionAffinity } from './model.js';
import { LineInjectedText } from './textModelEvents.js';
/**
 * *input*:
 * ```
 * xxxxxxxxxxxxxxxxxxxxxxxxxxx
 * ```
 *
 * -> Applying injections `[i...i]`, *inputWithInjections*:
 * ```
 * xxxxxx[iiiiiiiiii]xxxxxxxxxxxxxxxxx[ii]xxxx
 * ```
 *
 * -> breaking at offsets `|` in `xxxxxx[iiiiiii|iii]xxxxxxxxxxx|xxxxxx[ii]xxxx|`:
 * ```
 * xxxxxx[iiiiiii
 * iii]xxxxxxxxxxx
 * xxxxxx[ii]xxxx
 * ```
 *
 * -> applying wrappedTextIndentLength, *output*:
 * ```
 * xxxxxx[iiiiiii
 *    iii]xxxxxxxxxxx
 *    xxxxxx[ii]xxxx
 * ```
 */
export declare class ModelLineProjectionData {
    injectionOffsets: number[] | null;
    /**
     * `injectionOptions.length` must equal `injectionOffsets.length`
     */
    injectionOptions: InjectedTextOptions[] | null;
    /**
     * Refers to offsets after applying injections to the source.
     * The last break offset indicates the length of the source after applying injections.
     */
    breakOffsets: number[];
    /**
     * Refers to offsets after applying injections
     */
    breakOffsetsVisibleColumn: number[];
    wrappedTextIndentLength: number;
    constructor(injectionOffsets: number[] | null, 
    /**
     * `injectionOptions.length` must equal `injectionOffsets.length`
     */
    injectionOptions: InjectedTextOptions[] | null, 
    /**
     * Refers to offsets after applying injections to the source.
     * The last break offset indicates the length of the source after applying injections.
     */
    breakOffsets: number[], 
    /**
     * Refers to offsets after applying injections
     */
    breakOffsetsVisibleColumn: number[], wrappedTextIndentLength: number);
    getOutputLineCount(): number;
    getMinOutputOffset(outputLineIndex: number): number;
    getLineLength(outputLineIndex: number): number;
    getMaxOutputOffset(outputLineIndex: number): number;
    translateToInputOffset(outputLineIndex: number, outputOffset: number): number;
    translateToOutputPosition(inputOffset: number, affinity?: PositionAffinity): OutputPosition;
    private offsetInInputWithInjectionsToOutputPosition;
    normalizeOutputPosition(outputLineIndex: number, outputOffset: number, affinity: PositionAffinity): OutputPosition;
    private outputPositionToOffsetInInputWithInjections;
    private normalizeOffsetInInputWithInjectionsAroundInjections;
    getInjectedText(outputLineIndex: number, outputOffset: number): InjectedText | null;
    private getInjectedTextAtOffset;
}
export declare class InjectedText {
    readonly options: InjectedTextOptions;
    constructor(options: InjectedTextOptions);
}
export declare class OutputPosition {
    outputLineIndex: number;
    outputOffset: number;
    constructor(outputLineIndex: number, outputOffset: number);
    toString(): string;
    toPosition(baseLineNumber: number): Position;
}
export interface ILineBreaksComputerFactory {
    createLineBreaksComputer(fontInfo: FontInfo, tabSize: number, wrappingColumn: number, wrappingIndent: WrappingIndent, wordBreak: 'normal' | 'keepAll'): ILineBreaksComputer;
}
export interface ILineBreaksComputer {
    /**
     * Pass in `previousLineBreakData` if the only difference is in breaking columns!!!
     */
    addRequest(lineText: string, injectedText: LineInjectedText[] | null, previousLineBreakData: ModelLineProjectionData | null): void;
    finalize(): (ModelLineProjectionData | null)[];
}
