import { CharCode } from './charCode.js';
export declare function isPathSeparator(code: number): code is CharCode.Slash | CharCode.Backslash;
/**
 * Takes a Windows OS path and changes backward slashes to forward slashes.
 * This should only be done for OS paths from Windows (or user provided paths potentially from Windows).
 * Using it on a Linux or MaxOS path might change it.
 */
export declare function toSlashes(osPath: string): string;
/**
 * Takes a Windows OS path (using backward or forward slashes) and turns it into a posix path:
 * - turns backward slashes into forward slashes
 * - makes it absolute if it starts with a drive letter
 * This should only be done for OS paths from Windows (or user provided paths potentially from Windows).
 * Using it on a Linux or MaxOS path might change it.
 */
export declare function toPosixPath(osPath: string): string;
/**
 * Computes the _root_ this path, like `getRoot('c:\files') === c:\`,
 * `getRoot('files:///files/path') === files:///`,
 * or `getRoot('\\server\shares\path') === \\server\shares\`
 */
export declare function getRoot(path: string, sep?: string): string;
/**
 * Check if the path follows this pattern: `\\hostname\sharename`.
 *
 * @see https://msdn.microsoft.com/en-us/library/gg465305.aspx
 * @return A boolean indication if the path is a UNC path, on none-windows
 * always false.
 */
export declare function isUNC(path: string): boolean;
export declare function isValidBasename(name: string | null | undefined, isWindowsOS?: boolean): boolean;
/**
 * @deprecated please use `IUriIdentityService.extUri.isEqual` instead. If you are
 * in a context without services, consider to pass down the `extUri` from the outside
 * or use `extUriBiasedIgnorePathCase` if you know what you are doing.
 */
export declare function isEqual(pathA: string, pathB: string, ignoreCase?: boolean): boolean;
/**
 * @deprecated please use `IUriIdentityService.extUri.isEqualOrParent` instead. If
 * you are in a context without services, consider to pass down the `extUri` from the
 * outside, or use `extUriBiasedIgnorePathCase` if you know what you are doing.
 */
export declare function isEqualOrParent(base: string, parentCandidate: string, ignoreCase?: boolean, separator?: "/" | "\\"): boolean;
export declare function isWindowsDriveLetter(char0: number): boolean;
export declare function sanitizeFilePath(candidate: string, cwd: string): string;
export declare function removeTrailingPathSeparator(candidate: string): string;
export declare function isRootOrDriveLetter(path: string): boolean;
export declare function hasDriveLetter(path: string, isWindowsOS?: boolean): boolean;
export declare function getDriveLetter(path: string, isWindowsOS?: boolean): string | undefined;
export declare function indexOfPath(path: string, candidate: string, ignoreCase?: boolean): number;
export interface IPathWithLineAndColumn {
    path: string;
    line?: number;
    column?: number;
}
export declare function parseLineAndColumnAware(rawPath: string): IPathWithLineAndColumn;
export declare function randomPath(parent?: string, prefix?: string, randomLength?: number): string;
