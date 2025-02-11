export declare function isFalsyOrWhitespace(str: string | undefined): boolean;
/**
 * Helper to produce a string with a variable number of arguments. Insert variable segments
 * into the string using the {n} notation where N is the index of the argument following the string.
 * @param value string to which formatting is applied
 * @param args replacements for {n}-entries
 */
export declare function format(value: string, ...args: any[]): string;
/**
 * Helper to create a string from a template and a string record.
 * Similar to `format` but with objects instead of positional arguments.
 */
export declare function format2(template: string, values: Record<string, unknown>): string;
/**
 * Encodes the given value so that it can be used as literal value in html attributes.
 *
 * In other words, computes `$val`, such that `attr` in `<div attr="$val" />` has the runtime value `value`.
 * This prevents XSS injection.
 */
export declare function htmlAttributeEncodeValue(value: string): string;
/**
 * Converts HTML characters inside the string to use entities instead. Makes the string safe from
 * being used e.g. in HTMLElement.innerHTML.
 */
export declare function escape(html: string): string;
/**
 * Escapes regular expression characters in a given string
 */
export declare function escapeRegExpCharacters(value: string): string;
/**
 * Counts how often `substr` occurs inside `value`.
 */
export declare function count(value: string, substr: string): number;
export declare function truncate(value: string, maxLength: number, suffix?: string): string;
export declare function truncateMiddle(value: string, maxLength: number, suffix?: string): string;
/**
 * Removes all occurrences of needle from the beginning and end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim (default is a blank)
 */
export declare function trim(haystack: string, needle?: string): string;
/**
 * Removes all occurrences of needle from the beginning of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export declare function ltrim(haystack: string, needle: string): string;
/**
 * Removes all occurrences of needle from the end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export declare function rtrim(haystack: string, needle: string): string;
export declare function convertSimple2RegExpPattern(pattern: string): string;
export declare function stripWildcards(pattern: string): string;
export interface RegExpOptions {
    matchCase?: boolean;
    wholeWord?: boolean;
    multiline?: boolean;
    global?: boolean;
    unicode?: boolean;
}
export declare function createRegExp(searchString: string, isRegex: boolean, options?: RegExpOptions): RegExp;
export declare function regExpLeadsToEndlessLoop(regexp: RegExp): boolean;
export declare function joinStrings(items: (string | undefined | null | false)[], separator: string): string;
export declare function splitLines(str: string): string[];
export declare function splitLinesIncludeSeparators(str: string): string[];
/**
 * Returns first index of the string that is not whitespace.
 * If string is empty or contains only whitespaces, returns -1
 */
export declare function firstNonWhitespaceIndex(str: string): number;
/**
 * Returns the leading whitespace of the string.
 * If the string contains only whitespaces, returns entire string
 */
export declare function getLeadingWhitespace(str: string, start?: number, end?: number): string;
/**
 * Returns last index of the string that is not whitespace.
 * If string is empty or contains only whitespaces, returns -1
 */
export declare function lastNonWhitespaceIndex(str: string, startIndex?: number): number;
export declare function getIndentationLength(str: string): number;
/**
 * Function that works identically to String.prototype.replace, except, the
 * replace function is allowed to be async and return a Promise.
 */
export declare function replaceAsync(str: string, search: RegExp, replacer: (match: string, ...args: any[]) => Promise<string>): Promise<string>;
export declare function compare(a: string, b: string): number;
export declare function compareSubstring(a: string, b: string, aStart?: number, aEnd?: number, bStart?: number, bEnd?: number): number;
export declare function compareIgnoreCase(a: string, b: string): number;
export declare function compareSubstringIgnoreCase(a: string, b: string, aStart?: number, aEnd?: number, bStart?: number, bEnd?: number): number;
export declare function isAsciiDigit(code: number): boolean;
export declare function isLowerAsciiLetter(code: number): boolean;
export declare function isUpperAsciiLetter(code: number): boolean;
export declare function equalsIgnoreCase(a: string, b: string): boolean;
export declare function startsWithIgnoreCase(str: string, candidate: string): boolean;
/**
 * @returns the length of the common prefix of the two strings.
 */
export declare function commonPrefixLength(a: string, b: string): number;
/**
 * @returns the length of the common suffix of the two strings.
 */
export declare function commonSuffixLength(a: string, b: string): number;
/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
export declare function isHighSurrogate(charCode: number): boolean;
/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
export declare function isLowSurrogate(charCode: number): boolean;
/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
export declare function computeCodePoint(highSurrogate: number, lowSurrogate: number): number;
/**
 * get the code point that begins at offset `offset`
 */
export declare function getNextCodePoint(str: string, len: number, offset: number): number;
export declare class CodePointIterator {
    private readonly _str;
    private readonly _len;
    private _offset;
    get offset(): number;
    constructor(str: string, offset?: number);
    setOffset(offset: number): void;
    prevCodePoint(): number;
    nextCodePoint(): number;
    eol(): boolean;
}
export declare class GraphemeIterator {
    private readonly _iterator;
    get offset(): number;
    constructor(str: string, offset?: number);
    nextGraphemeLength(): number;
    prevGraphemeLength(): number;
    eol(): boolean;
}
export declare function nextCharLength(str: string, initialOffset: number): number;
export declare function prevCharLength(str: string, initialOffset: number): number;
export declare function getCharContainingOffset(str: string, offset: number): [number, number];
export declare function charCount(str: string): number;
/**
 * Returns true if `str` contains any Unicode character that is classified as "R" or "AL".
 */
export declare function containsRTL(str: string): boolean;
/**
 * Returns true if `str` contains only basic ASCII characters in the range 32 - 126 (including 32 and 126) or \n, \r, \t
 */
export declare function isBasicASCII(str: string): boolean;
export declare const UNUSUAL_LINE_TERMINATORS: RegExp;
/**
 * Returns true if `str` contains unusual line terminators, like LS or PS
 */
export declare function containsUnusualLineTerminators(str: string): boolean;
export declare function isFullWidthCharacter(charCode: number): boolean;
/**
 * A fast function (therefore imprecise) to check if code points are emojis.
 * Generated using https://github.com/alexdima/unicode-utils/blob/main/emoji-test.js
 */
export declare function isEmojiImprecise(x: number): boolean;
/**
 * Given a string and a max length returns a shorted version. Shorting
 * happens at favorable positions - such as whitespace or punctuation characters.
 * The return value can be longer than the given value of `n`. Leading whitespace is always trimmed.
 */
export declare function lcut(text: string, n: number, prefix?: string): string;
/** Iterates over parts of a string with CSI sequences */
export declare function forAnsiStringParts(str: string): Generator<{
    isCode: boolean;
    str: string;
}, void, unknown>;
/**
 * Strips ANSI escape sequences from a string.
 * @param str The dastringa stringo strip the ANSI escape sequences from.
 *
 * @example
 * removeAnsiEscapeCodes('\u001b[31mHello, World!\u001b[0m');
 * // 'Hello, World!'
 */
export declare function removeAnsiEscapeCodes(str: string): string;
/**
 * Strips ANSI escape sequences from a UNIX-style prompt string (eg. `$PS1`).
 * @param str The string to strip the ANSI escape sequences from.
 *
 * @example
 * removeAnsiEscapeCodesFromPrompt('\n\\[\u001b[01;34m\\]\\w\\[\u001b[00m\\]\n\\[\u001b[1;32m\\]> \\[\u001b[0m\\]');
 * // '\n\\w\n> '
 */
export declare function removeAnsiEscapeCodesFromPrompt(str: string): string;
export declare const UTF8_BOM_CHARACTER: string;
export declare function startsWithUTF8BOM(str: string): boolean;
export declare function stripUTF8BOM(str: string): string;
/**
 * Checks if the characters of the provided query string are included in the
 * target string. The characters do not have to be contiguous within the string.
 */
export declare function fuzzyContains(target: string, query: string): boolean;
export declare function containsUppercaseCharacter(target: string, ignoreEscapedChars?: boolean): boolean;
export declare function uppercaseFirstLetter(str: string): string;
export declare function getNLines(str: string, n?: number): string;
/**
 * Produces 'a'-'z', followed by 'A'-'Z'... followed by 'a'-'z', etc.
 */
export declare function singleLetterHash(n: number): string;
export declare function getGraphemeBreakType(codePoint: number): GraphemeBreakType;
export declare const enum GraphemeBreakType {
    Other = 0,
    Prepend = 1,
    CR = 2,
    LF = 3,
    Control = 4,
    Extend = 5,
    Regional_Indicator = 6,
    SpacingMark = 7,
    L = 8,
    V = 9,
    T = 10,
    LV = 11,
    LVT = 12,
    ZWJ = 13,
    Extended_Pictographic = 14
}
/**
 * Computes the offset after performing a left delete on the given string,
 * while considering unicode grapheme/emoji rules.
*/
export declare function getLeftDeleteOffset(offset: number, str: string): number;
export declare const noBreakWhitespace = "\u00A0";
export declare class AmbiguousCharacters {
    private readonly confusableDictionary;
    private static readonly ambiguousCharacterData;
    private static readonly cache;
    static getInstance(locales: Set<string>): AmbiguousCharacters;
    private static _locales;
    static getLocales(): string[];
    private constructor();
    isAmbiguous(codePoint: number): boolean;
    containsAmbiguousCharacter(str: string): boolean;
    /**
     * Returns the non basic ASCII code point that the given code point can be confused,
     * or undefined if such code point does note exist.
     */
    getPrimaryConfusable(codePoint: number): number | undefined;
    getConfusableCodePoints(): ReadonlySet<number>;
}
export declare class InvisibleCharacters {
    private static getRawData;
    private static _data;
    private static getData;
    static isInvisibleCharacter(codePoint: number): boolean;
    static containsInvisibleCharacter(str: string): boolean;
    static get codePoints(): ReadonlySet<number>;
}
