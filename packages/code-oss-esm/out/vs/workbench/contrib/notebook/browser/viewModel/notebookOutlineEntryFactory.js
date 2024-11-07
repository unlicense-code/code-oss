/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { renderMarkdownAsPlaintext } from '../../../../../base/browser/markdownRenderer.js';
import { IOutlineModelService } from '../../../../../editor/contrib/documentSymbols/browser/outlineModel.js';
import { localize } from '../../../../../nls.js';
import { getMarkdownHeadersInCell } from './foldingModel.js';
import { OutlineEntry } from './OutlineEntry.js';
import { CellKind } from '../../common/notebookCommon.js';
import { INotebookExecutionStateService } from '../../common/notebookExecutionStateService.js';
import { createDecorator } from '../../../../../platform/instantiation/common/instantiation.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
export var NotebookOutlineConstants;
(function (NotebookOutlineConstants) {
    NotebookOutlineConstants[NotebookOutlineConstants["NonHeaderOutlineLevel"] = 7] = "NonHeaderOutlineLevel";
})(NotebookOutlineConstants || (NotebookOutlineConstants = {}));
function getMarkdownHeadersInCellFallbackToHtmlTags(fullContent) {
    const headers = Array.from(getMarkdownHeadersInCell(fullContent));
    if (headers.length) {
        return headers;
    }
    // no markdown syntax headers, try to find html tags
    const match = fullContent.match(/<h([1-6]).*>(.*)<\/h\1>/i);
    if (match) {
        const level = parseInt(match[1]);
        const text = match[2].trim();
        headers.push({ depth: level, text });
    }
    return headers;
}
export const INotebookOutlineEntryFactory = createDecorator('INotebookOutlineEntryFactory');
let NotebookOutlineEntryFactory = class NotebookOutlineEntryFactory {
    constructor(executionStateService, outlineModelService, textModelService) {
        this.executionStateService = executionStateService;
        this.outlineModelService = outlineModelService;
        this.textModelService = textModelService;
        this.cellOutlineEntryCache = {};
        this.cachedMarkdownOutlineEntries = new WeakMap();
    }
    getOutlineEntries(cell, index) {
        const entries = [];
        const isMarkdown = cell.cellKind === CellKind.Markup;
        // cap the amount of characters that we look at and use the following logic
        // - for MD prefer headings (each header is an entry)
        // - otherwise use the first none-empty line of the cell (MD or code)
        let content = getCellFirstNonEmptyLine(cell);
        let hasHeader = false;
        if (isMarkdown) {
            const fullContent = cell.getText().substring(0, 10000);
            const cache = this.cachedMarkdownOutlineEntries.get(cell);
            const headers = cache?.alternativeId === cell.getAlternativeId() ? cache.headers : Array.from(getMarkdownHeadersInCellFallbackToHtmlTags(fullContent));
            this.cachedMarkdownOutlineEntries.set(cell, { alternativeId: cell.getAlternativeId(), headers });
            for (const { depth, text } of headers) {
                hasHeader = true;
                entries.push(new OutlineEntry(index++, depth, cell, text, false, false));
            }
            if (!hasHeader) {
                content = renderMarkdownAsPlaintext({ value: content });
            }
        }
        if (!hasHeader) {
            const exeState = !isMarkdown && this.executionStateService.getCellExecution(cell.uri);
            let preview = content.trim();
            if (!isMarkdown) {
                const cached = this.cellOutlineEntryCache[cell.id];
                // Gathering symbols from the model is an async operation, but this provider is syncronous.
                // So symbols need to be precached before this function is called to get the full list.
                if (cached) {
                    // push code cell entry that is a parent of cached symbols, always necessary. filtering for quickpick done in that provider.
                    entries.push(new OutlineEntry(index++, 7 /* NotebookOutlineConstants.NonHeaderOutlineLevel */, cell, preview, !!exeState, exeState ? exeState.isPaused : false));
                    cached.forEach((entry) => {
                        entries.push(new OutlineEntry(index++, entry.level, cell, entry.name, false, false, entry.range, entry.kind));
                    });
                }
            }
            if (entries.length === 0) { // if there are no cached entries, use the first line of the cell as a code cell
                if (preview.length === 0) {
                    // empty or just whitespace
                    preview = localize('empty', "empty cell");
                }
                entries.push(new OutlineEntry(index++, 7 /* NotebookOutlineConstants.NonHeaderOutlineLevel */, cell, preview, !!exeState, exeState ? exeState.isPaused : false));
            }
        }
        return entries;
    }
    async cacheSymbols(cell, cancelToken) {
        if (cell.cellKind === CellKind.Markup) {
            return;
        }
        const ref = await this.textModelService.createModelReference(cell.uri);
        try {
            const textModel = ref.object.textEditorModel;
            const outlineModel = await this.outlineModelService.getOrCreate(textModel, cancelToken);
            const entries = createOutlineEntries(outlineModel.getTopLevelSymbols(), 8);
            this.cellOutlineEntryCache[cell.id] = entries;
        }
        finally {
            ref.dispose();
        }
    }
};
NotebookOutlineEntryFactory = __decorate([
    __param(0, INotebookExecutionStateService),
    __param(1, IOutlineModelService),
    __param(2, ITextModelService)
], NotebookOutlineEntryFactory);
export { NotebookOutlineEntryFactory };
function createOutlineEntries(symbols, level) {
    const entries = [];
    symbols.forEach(symbol => {
        entries.push({ name: symbol.name, range: symbol.range, level, kind: symbol.kind });
        if (symbol.children) {
            entries.push(...createOutlineEntries(symbol.children, level + 1));
        }
    });
    return entries;
}
function getCellFirstNonEmptyLine(cell) {
    const textBuffer = cell.textBuffer;
    for (let i = 0; i < textBuffer.getLineCount(); i++) {
        const firstNonWhitespace = textBuffer.getLineFirstNonWhitespaceColumn(i + 1);
        const lineLength = textBuffer.getLineLength(i + 1);
        if (firstNonWhitespace < lineLength) {
            return textBuffer.getLineContent(i + 1);
        }
    }
    return cell.getText().substring(0, 100);
}
