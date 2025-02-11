import { IMatch } from './filters.js';
export type FuzzyScore = [number, number[]];
export type FuzzyScorerCache = {
    [key: string]: IItemScore;
};
export declare function scoreFuzzy(target: string, query: string, queryLower: string, allowNonContiguousMatches: boolean): FuzzyScore;
export type FuzzyScore2 = [number | undefined, IMatch[]];
export declare function scoreFuzzy2(target: string, query: IPreparedQuery | IPreparedQueryPiece, patternStart?: number, wordStart?: number): FuzzyScore2;
/**
 * Scoring on structural items that have a label and optional description.
 */
export interface IItemScore {
    /**
     * Overall score.
     */
    score: number;
    /**
     * Matches within the label.
     */
    labelMatch?: IMatch[];
    /**
     * Matches within the description.
     */
    descriptionMatch?: IMatch[];
}
export interface IItemAccessor<T> {
    /**
     * Just the label of the item to score on.
     */
    getItemLabel(item: T): string | undefined;
    /**
     * The optional description of the item to score on.
     */
    getItemDescription(item: T): string | undefined;
    /**
     * If the item is a file, the path of the file to score on.
     */
    getItemPath(file: T): string | undefined;
}
export declare function scoreItemFuzzy<T>(item: T, query: IPreparedQuery, allowNonContiguousMatches: boolean, accessor: IItemAccessor<T>, cache: FuzzyScorerCache): IItemScore;
export declare function compareItemsByFuzzyScore<T>(itemA: T, itemB: T, query: IPreparedQuery, allowNonContiguousMatches: boolean, accessor: IItemAccessor<T>, cache: FuzzyScorerCache): number;
export interface IPreparedQueryPiece {
    /**
     * The original query as provided as input.
     */
    original: string;
    originalLowercase: string;
    /**
     * Original normalized to platform separators:
     * - Windows: \
     * - Posix: /
     */
    pathNormalized: string;
    /**
     * In addition to the normalized path, will have
     * whitespace and wildcards removed.
     */
    normalized: string;
    normalizedLowercase: string;
    /**
     * The query is wrapped in quotes which means
     * this query must be a substring of the input.
     * In other words, no fuzzy matching is used.
     */
    expectContiguousMatch: boolean;
}
export interface IPreparedQuery extends IPreparedQueryPiece {
    /**
     * Query split by spaces into pieces.
     */
    values: IPreparedQueryPiece[] | undefined;
    /**
     * Whether the query contains path separator(s) or not.
     */
    containsPathSeparator: boolean;
}
export declare function prepareQuery(original: string): IPreparedQuery;
export declare function pieceToQuery(piece: IPreparedQueryPiece): IPreparedQuery;
export declare function pieceToQuery(pieces: IPreparedQueryPiece[]): IPreparedQuery;
