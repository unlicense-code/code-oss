import { WordCharacterClassifier } from '../core/wordCharacterClassifier.js';
import { Position } from '../core/position.js';
import { Range } from '../core/range.js';
import { FindMatch, SearchData } from '../model.js';
import { TextModel } from './textModel.js';
export declare class SearchParams {
    readonly searchString: string;
    readonly isRegex: boolean;
    readonly matchCase: boolean;
    readonly wordSeparators: string | null;
    constructor(searchString: string, isRegex: boolean, matchCase: boolean, wordSeparators: string | null);
    parseSearchRequest(): SearchData | null;
}
export declare function isMultilineRegexSource(searchString: string): boolean;
export declare function createFindMatch(range: Range, rawMatches: RegExpExecArray, captureMatches: boolean): FindMatch;
export declare class TextModelSearch {
    static findMatches(model: TextModel, searchParams: SearchParams, searchRange: Range, captureMatches: boolean, limitResultCount: number): FindMatch[];
    /**
     * Multiline search always executes on the lines concatenated with \n.
     * We must therefore compensate for the count of \n in case the model is CRLF
     */
    private static _getMultilineMatchRange;
    private static _doFindMatchesMultiline;
    private static _doFindMatchesLineByLine;
    private static _findMatchesInLine;
    static findNextMatch(model: TextModel, searchParams: SearchParams, searchStart: Position, captureMatches: boolean): FindMatch | null;
    private static _doFindNextMatchMultiline;
    private static _doFindNextMatchLineByLine;
    private static _findFirstMatchInLine;
    static findPreviousMatch(model: TextModel, searchParams: SearchParams, searchStart: Position, captureMatches: boolean): FindMatch | null;
    private static _doFindPreviousMatchMultiline;
    private static _doFindPreviousMatchLineByLine;
    private static _findLastMatchInLine;
}
export declare function isValidMatch(wordSeparators: WordCharacterClassifier, text: string, textLength: number, matchStartIndex: number, matchLength: number): boolean;
export declare class Searcher {
    readonly _wordSeparators: WordCharacterClassifier | null;
    private readonly _searchRegex;
    private _prevMatchStartIndex;
    private _prevMatchLength;
    constructor(wordSeparators: WordCharacterClassifier | null, searchRegex: RegExp);
    reset(lastIndex: number): void;
    next(text: string): RegExpExecArray | null;
}
