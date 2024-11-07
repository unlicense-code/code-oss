/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { asArray, coalesce } from '../../../../base/common/arrays.js';
import { DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS } from './search.js';
import { TextSearchContext2, TextSearchMatch2 } from './searchExtTypes.js';
/**
 * Checks if the given object is of type TextSearchMatch.
 * @param object The object to check.
 * @returns True if the object is a TextSearchMatch, false otherwise.
 */
function isTextSearchMatch(object) {
    return 'uri' in object && 'ranges' in object && 'preview' in object;
}
function newToOldFileProviderOptions(options) {
    return options.folderOptions.map(folderOption => ({
        folder: folderOption.folder,
        excludes: folderOption.excludes.map(e => typeof (e) === 'string' ? e : e.pattern),
        includes: folderOption.includes,
        useGlobalIgnoreFiles: folderOption.useIgnoreFiles.global,
        useIgnoreFiles: folderOption.useIgnoreFiles.local,
        useParentIgnoreFiles: folderOption.useIgnoreFiles.parent,
        followSymlinks: folderOption.followSymlinks,
        maxResults: options.maxResults,
        session: options.session // TODO: make sure that we actually use a cancellation token here.
    }));
}
export class OldFileSearchProviderConverter {
    constructor(provider) {
        this.provider = provider;
    }
    provideFileSearchResults(pattern, options, token) {
        const getResult = async () => {
            const newOpts = newToOldFileProviderOptions(options);
            return Promise.all(newOpts.map(o => this.provider.provideFileSearchResults({ pattern }, o, token)));
        };
        return getResult().then(e => coalesce(e).flat());
    }
}
function newToOldTextProviderOptions(options) {
    return options.folderOptions.map(folderOption => ({
        folder: folderOption.folder,
        excludes: folderOption.excludes.map(e => typeof (e) === 'string' ? e : e.pattern),
        includes: folderOption.includes,
        useGlobalIgnoreFiles: folderOption.useIgnoreFiles.global,
        useIgnoreFiles: folderOption.useIgnoreFiles.local,
        useParentIgnoreFiles: folderOption.useIgnoreFiles.parent,
        followSymlinks: folderOption.followSymlinks,
        maxResults: options.maxResults,
        previewOptions: newToOldPreviewOptions(options.previewOptions),
        maxFileSize: options.maxFileSize,
        encoding: folderOption.encoding,
        afterContext: options.surroundingContext,
        beforeContext: options.surroundingContext
    }));
}
export function newToOldPreviewOptions(options) {
    return {
        matchLines: options?.matchLines ?? DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS.matchLines,
        charsPerLine: options?.charsPerLine ?? DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS.charsPerLine
    };
}
export function oldToNewTextSearchResult(result) {
    if (isTextSearchMatch(result)) {
        const ranges = asArray(result.ranges).map((r, i) => {
            const previewArr = asArray(result.preview.matches);
            const matchingPreviewRange = previewArr[i];
            return { sourceRange: r, previewRange: matchingPreviewRange };
        });
        return new TextSearchMatch2(result.uri, ranges, result.preview.text);
    }
    else {
        return new TextSearchContext2(result.uri, result.text, result.lineNumber);
    }
}
export class OldTextSearchProviderConverter {
    constructor(provider) {
        this.provider = provider;
    }
    provideTextSearchResults(query, options, progress, token) {
        const progressShim = (oldResult) => {
            if (!validateProviderResult(oldResult)) {
                return;
            }
            progress.report(oldToNewTextSearchResult(oldResult));
        };
        const getResult = async () => {
            return coalesce(await Promise.all(newToOldTextProviderOptions(options).map(o => this.provider.provideTextSearchResults(query, o, { report: (e) => progressShim(e) }, token))))
                .reduce((prev, cur) => ({ limitHit: prev.limitHit || cur.limitHit }), { limitHit: false });
        };
        const oldResult = getResult();
        return oldResult.then((e) => {
            return {
                limitHit: e.limitHit,
                message: coalesce(asArray(e.message))
            };
        });
    }
}
function validateProviderResult(result) {
    if (extensionResultIsMatch(result)) {
        if (Array.isArray(result.ranges)) {
            if (!Array.isArray(result.preview.matches)) {
                console.warn('INVALID - A text search provider match\'s`ranges` and`matches` properties must have the same type.');
                return false;
            }
            if (result.preview.matches.length !== result.ranges.length) {
                console.warn('INVALID - A text search provider match\'s`ranges` and`matches` properties must have the same length.');
                return false;
            }
        }
        else {
            if (Array.isArray(result.preview.matches)) {
                console.warn('INVALID - A text search provider match\'s`ranges` and`matches` properties must have the same length.');
                return false;
            }
        }
    }
    return true;
}
export function extensionResultIsMatch(data) {
    return !!data.preview;
}
