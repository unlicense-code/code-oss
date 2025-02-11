/** Compares filenames without distinguishing the name from the extension. Disambiguates by unicode comparison. */
export declare function compareFileNames(one: string | null, other: string | null, caseSensitive?: boolean): number;
/** Compares full filenames without grouping by case. */
export declare function compareFileNamesDefault(one: string | null, other: string | null): number;
/** Compares full filenames grouping uppercase names before lowercase. */
export declare function compareFileNamesUpper(one: string | null, other: string | null): number;
/** Compares full filenames grouping lowercase names before uppercase. */
export declare function compareFileNamesLower(one: string | null, other: string | null): number;
/** Compares full filenames by unicode value. */
export declare function compareFileNamesUnicode(one: string | null, other: string | null): 0 | 1 | -1;
/** Compares filenames by extension, then by name. Disambiguates by unicode comparison. */
export declare function compareFileExtensions(one: string | null, other: string | null): number;
/** Compares filenames by extension, then by full filename. Mixes uppercase and lowercase names together. */
export declare function compareFileExtensionsDefault(one: string | null, other: string | null): number;
/** Compares filenames by extension, then case, then full filename. Groups uppercase names before lowercase. */
export declare function compareFileExtensionsUpper(one: string | null, other: string | null): number;
/** Compares filenames by extension, then case, then full filename. Groups lowercase names before uppercase. */
export declare function compareFileExtensionsLower(one: string | null, other: string | null): number;
/** Compares filenames by case-insensitive extension unicode value, then by full filename unicode value. */
export declare function compareFileExtensionsUnicode(one: string | null, other: string | null): 0 | 1 | -1;
export declare function comparePaths(one: string, other: string, caseSensitive?: boolean): number;
export declare function compareAnything(one: string, other: string, lookFor: string): number;
export declare function compareByPrefix(one: string, other: string, lookFor: string): number;
