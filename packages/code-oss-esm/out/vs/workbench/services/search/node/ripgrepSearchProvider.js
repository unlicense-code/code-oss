/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { RipgrepTextSearchEngine } from './ripgrepTextSearchEngine.js';
import { Progress } from '../../../../platform/progress/common/progress.js';
import { Schemas } from '../../../../base/common/network.js';
export class RipgrepSearchProvider {
    constructor(outputChannel, getNumThreads) {
        this.outputChannel = outputChannel;
        this.getNumThreads = getNumThreads;
        this.inProgress = new Set();
        process.once('exit', () => this.dispose());
    }
    async provideTextSearchResults(query, options, progress, token) {
        const numThreads = await this.getNumThreads();
        const engine = new RipgrepTextSearchEngine(this.outputChannel, numThreads);
        return Promise.all(options.folderOptions.map(folderOption => {
            const extendedOptions = {
                folderOptions: folderOption,
                numThreads,
                maxResults: options.maxResults,
                previewOptions: options.previewOptions,
                maxFileSize: options.maxFileSize,
                surroundingContext: options.surroundingContext
            };
            if (folderOption.folder.scheme === Schemas.vscodeUserData) {
                // Ripgrep search engine can only provide file-scheme results, but we want to use it to search some schemes that are backed by the filesystem, but with some other provider as the frontend,
                // case in point vscode-userdata. In these cases we translate the query to a file, and translate the results back to the frontend scheme.
                const translatedOptions = { ...extendedOptions, folder: folderOption.folder.with({ scheme: Schemas.file }) };
                const progressTranslator = new Progress(data => progress.report({ ...data, uri: data.uri.with({ scheme: folderOption.folder.scheme }) }));
                return this.withToken(token, token => engine.provideTextSearchResultsWithRgOptions(query, translatedOptions, progressTranslator, token));
            }
            else {
                return this.withToken(token, token => engine.provideTextSearchResultsWithRgOptions(query, extendedOptions, progress, token));
            }
        })).then((e => {
            const complete = {
                // todo: get this to actually check
                limitHit: e.some(complete => !!complete && complete.limitHit)
            };
            return complete;
        }));
    }
    async withToken(token, fn) {
        const merged = mergedTokenSource(token);
        this.inProgress.add(merged);
        const result = await fn(merged.token);
        this.inProgress.delete(merged);
        return result;
    }
    dispose() {
        this.inProgress.forEach(engine => engine.cancel());
    }
}
function mergedTokenSource(token) {
    const tokenSource = new CancellationTokenSource();
    token.onCancellationRequested(() => tokenSource.cancel());
    return tokenSource;
}
