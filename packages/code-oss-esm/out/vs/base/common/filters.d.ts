export interface IFilter {
    (word: string, wordToMatchAgainst: string): IMatch[] | null;
}
export interface IMatch {
    start: number;
    end: number;
}
/**
 * @returns A filter which combines the provided set
 * of filters with an or. The *first* filters that
 * matches defined the return value of the returned
 * filter.
 */
export declare function or(...filter: IFilter[]): IFilter;
export declare const matchesStrictPrefix: IFilter;
export declare const matchesPrefix: IFilter;
export declare function matchesContiguousSubString(word: string, wordToMatchAgainst: string): IMatch[] | null;
export declare function matchesSubString(word: string, wordToMatchAgainst: string): IMatch[] | null;
export declare function isUpper(code: number): boolean;
export declare function matchesCamelCase(word: string, camelCaseWord: string): IMatch[] | null;
export declare function matchesWords(word: string, target: string, contiguous?: boolean): IMatch[] | null;
export declare function matchesFuzzy(word: string, wordToMatchAgainst: string, enableSeparateSubstringMatching?: boolean): IMatch[] | null;
/**
 * Match pattern against word in a fuzzy way. As in IntelliSense and faster and more
 * powerful than `matchesFuzzy`
 */
export declare function matchesFuzzy2(pattern: string, word: string): IMatch[] | null;
export declare function anyScore(pattern: string, lowPattern: string, patternPos: number, word: string, lowWord: string, wordPos: number): FuzzyScore;
export declare function createMatches(score: undefined | FuzzyScore): IMatch[];
export declare function isPatternInWord(patternLow: string, patternPos: number, patternLen: number, wordLow: string, wordPos: number, wordLen: number, fillMinWordPosArr?: boolean): boolean;
/**
 * An array representing a fuzzy match.
 *
 * 0. the score
 * 1. the offset at which matching started
 * 2. `<match_pos_N>`
 * 3. `<match_pos_1>`
 * 4. `<match_pos_0>` etc
 */
export type FuzzyScore = [score: number, wordStart: number, ...matches: number[]];
export declare namespace FuzzyScore {
    /**
     * No matches and value `-100`
     */
    const Default: FuzzyScore;
    function isDefault(score?: FuzzyScore): score is [-100, 0];
}
export declare abstract class FuzzyScoreOptions {
    readonly firstMatchCanBeWeak: boolean;
    readonly boostFullMatch: boolean;
    static default: {
        boostFullMatch: boolean;
        firstMatchCanBeWeak: boolean;
    };
    constructor(firstMatchCanBeWeak: boolean, boostFullMatch: boolean);
}
export interface FuzzyScorer {
    (pattern: string, lowPattern: string, patternPos: number, word: string, lowWord: string, wordPos: number, options?: FuzzyScoreOptions): FuzzyScore | undefined;
}
export declare function fuzzyScore(pattern: string, patternLow: string, patternStart: number, word: string, wordLow: string, wordStart: number, options?: FuzzyScoreOptions): FuzzyScore | undefined;
export declare function fuzzyScoreGracefulAggressive(pattern: string, lowPattern: string, patternPos: number, word: string, lowWord: string, wordPos: number, options?: FuzzyScoreOptions): FuzzyScore | undefined;
export declare function fuzzyScoreGraceful(pattern: string, lowPattern: string, patternPos: number, word: string, lowWord: string, wordPos: number, options?: FuzzyScoreOptions): FuzzyScore | undefined;
