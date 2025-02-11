export interface IRelativePattern {
    /**
     * A base file path to which this pattern will be matched against relatively.
     */
    readonly base: string;
    /**
     * A file glob pattern like `*.{ts,js}` that will be matched on file paths
     * relative to the base path.
     *
     * Example: Given a base of `/home/work/folder` and a file path of `/home/work/folder/index.js`,
     * the file glob pattern will match on `index.js`.
     */
    readonly pattern: string;
}
export interface IExpression {
    [pattern: string]: boolean | SiblingClause;
}
export declare function getEmptyExpression(): IExpression;
interface SiblingClause {
    when: string;
}
export declare const GLOBSTAR = "**";
export declare const GLOB_SPLIT = "/";
export declare function splitGlobAware(pattern: string, splitChar: string): string[];
export type ParsedPattern = (path: string, basename?: string) => boolean;
export type ParsedExpression = (path: string, basename?: string, hasSibling?: (name: string) => boolean | Promise<boolean>) => string | null | Promise<string | null>;
interface IGlobOptions {
    /**
     * Simplify patterns for use as exclusion filters during
     * tree traversal to skip entire subtrees. Cannot be used
     * outside of a tree traversal.
     */
    trimForExclusions?: boolean;
}
/**
 * Simplified glob matching. Supports a subset of glob patterns:
 * * `*` to match zero or more characters in a path segment
 * * `?` to match on one character in a path segment
 * * `**` to match any number of path segments, including none
 * * `{}` to group conditions (e.g. *.{ts,js} matches all TypeScript and JavaScript files)
 * * `[]` to declare a range of characters to match in a path segment (e.g., `example.[0-9]` to match on `example.0`, `example.1`, …)
 * * `[!...]` to negate a range of characters to match in a path segment (e.g., `example.[!0-9]` to match on `example.a`, `example.b`, but not `example.0`)
 */
export declare function match(pattern: string | IRelativePattern, path: string): boolean;
export declare function match(expression: IExpression, path: string, hasSibling?: (name: string) => boolean): string;
/**
 * Simplified glob matching. Supports a subset of glob patterns:
 * * `*` to match zero or more characters in a path segment
 * * `?` to match on one character in a path segment
 * * `**` to match any number of path segments, including none
 * * `{}` to group conditions (e.g. *.{ts,js} matches all TypeScript and JavaScript files)
 * * `[]` to declare a range of characters to match in a path segment (e.g., `example.[0-9]` to match on `example.0`, `example.1`, …)
 * * `[!...]` to negate a range of characters to match in a path segment (e.g., `example.[!0-9]` to match on `example.a`, `example.b`, but not `example.0`)
 */
export declare function parse(pattern: string | IRelativePattern, options?: IGlobOptions): ParsedPattern;
export declare function parse(expression: IExpression, options?: IGlobOptions): ParsedExpression;
export declare function parse(arg1: string | IExpression | IRelativePattern, options?: IGlobOptions): ParsedPattern | ParsedExpression;
export declare function isRelativePattern(obj: unknown): obj is IRelativePattern;
export declare function getBasenameTerms(patternOrExpression: ParsedPattern | ParsedExpression): string[];
export declare function getPathTerms(patternOrExpression: ParsedPattern | ParsedExpression): string[];
export declare function patternsEquals(patternsA: Array<string | IRelativePattern> | undefined, patternsB: Array<string | IRelativePattern> | undefined): boolean;
export {};
