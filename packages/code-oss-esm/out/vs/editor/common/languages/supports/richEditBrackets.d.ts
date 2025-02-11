import * as strings from '../../../../base/common/strings.js';
import { Range } from '../../core/range.js';
import { CharacterPair } from '../languageConfiguration.js';
/**
 * Represents a grouping of colliding bracket pairs.
 *
 * Most of the times this contains a single bracket pair,
 * but sometimes this contains multiple bracket pairs in cases
 * where the same string appears as a closing bracket for multiple
 * bracket pairs, or the same string appears an opening bracket for
 * multiple bracket pairs.
 *
 * e.g. of a group containing a single pair:
 *   open: ['{'], close: ['}']
 *
 * e.g. of a group containing multiple pairs:
 *   open: ['if', 'for'], close: ['end', 'end']
 */
export declare class RichEditBracket {
    _richEditBracketBrand: void;
    readonly languageId: string;
    /**
     * A 0-based consecutive unique identifier for this bracket pair.
     * If a language has 5 bracket pairs, out of which 2 are grouped together,
     * it is expected that the `index` goes from 0 to 4.
     */
    readonly index: number;
    /**
     * The open sequence for each bracket pair contained in this group.
     *
     * The open sequence at a specific index corresponds to the
     * closing sequence at the same index.
     *
     * [ open[i], closed[i] ] represent a bracket pair.
     */
    readonly open: string[];
    /**
     * The close sequence for each bracket pair contained in this group.
     *
     * The close sequence at a specific index corresponds to the
     * opening sequence at the same index.
     *
     * [ open[i], closed[i] ] represent a bracket pair.
     */
    readonly close: string[];
    /**
     * A regular expression that is useful to search for this bracket pair group in a string.
     *
     * This regular expression is built in a way that it is aware of the other bracket
     * pairs defined for the language, so it might match brackets from other groups.
     *
     * See the fine details in `getRegexForBracketPair`.
     */
    readonly forwardRegex: RegExp;
    /**
     * A regular expression that is useful to search for this bracket pair group in a string backwards.
     *
     * This regular expression is built in a way that it is aware of the other bracket
     * pairs defined for the language, so it might match brackets from other groups.
     *
     * See the fine defails in `getReversedRegexForBracketPair`.
     */
    readonly reversedRegex: RegExp;
    private readonly _openSet;
    private readonly _closeSet;
    constructor(languageId: string, index: number, open: string[], close: string[], forwardRegex: RegExp, reversedRegex: RegExp);
    /**
     * Check if the provided `text` is an open bracket in this group.
     */
    isOpen(text: string): boolean;
    /**
     * Check if the provided `text` is a close bracket in this group.
     */
    isClose(text: string): boolean;
    private static _toSet;
}
export declare class RichEditBrackets {
    _richEditBracketsBrand: void;
    /**
     * All groups of brackets defined for this language.
     */
    readonly brackets: RichEditBracket[];
    /**
     * A regular expression that is useful to search for all bracket pairs in a string.
     *
     * See the fine details in `getRegexForBrackets`.
     */
    readonly forwardRegex: RegExp;
    /**
     * A regular expression that is useful to search for all bracket pairs in a string backwards.
     *
     * See the fine details in `getReversedRegexForBrackets`.
     */
    readonly reversedRegex: RegExp;
    /**
     * The length (i.e. str.length) for the longest bracket pair.
     */
    readonly maxBracketLength: number;
    /**
     * A map useful for decoding a regex match and finding which bracket group was matched.
     */
    readonly textIsBracket: {
        [text: string]: RichEditBracket;
    };
    /**
     * A set useful for decoding if a regex match is the open bracket of a bracket pair.
     */
    readonly textIsOpenBracket: {
        [text: string]: boolean;
    };
    constructor(languageId: string, _brackets: readonly CharacterPair[]);
}
export declare function createBracketOrRegExp(pieces: string[], options?: strings.RegExpOptions): RegExp;
export declare class BracketsUtils {
    private static _findPrevBracketInText;
    static findPrevBracketInRange(reversedBracketRegex: RegExp, lineNumber: number, lineText: string, startOffset: number, endOffset: number): Range | null;
    static findNextBracketInText(bracketRegex: RegExp, lineNumber: number, text: string, offset: number): Range | null;
    static findNextBracketInRange(bracketRegex: RegExp, lineNumber: number, lineText: string, startOffset: number, endOffset: number): Range | null;
}
