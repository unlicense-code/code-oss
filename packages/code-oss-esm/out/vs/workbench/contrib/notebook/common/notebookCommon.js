/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { VSBuffer } from '../../../../base/common/buffer.js';
import * as glob from '../../../../base/common/glob.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { Mimes } from '../../../../base/common/mime.js';
import { Schemas } from '../../../../base/common/network.js';
import { basename } from '../../../../base/common/path.js';
import { isWindows } from '../../../../base/common/platform.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { generateMetadataUri, generate as generateUri, parseMetadataUri, parse as parseUri } from '../../../services/notebook/common/notebookDocumentService.js';
export const NOTEBOOK_EDITOR_ID = 'workbench.editor.notebook';
export const NOTEBOOK_DIFF_EDITOR_ID = 'workbench.editor.notebookTextDiffEditor';
export const NOTEBOOK_MULTI_DIFF_EDITOR_ID = 'workbench.editor.notebookMultiTextDiffEditor';
export const INTERACTIVE_WINDOW_EDITOR_ID = 'workbench.editor.interactive';
export const REPL_EDITOR_ID = 'workbench.editor.repl';
export const EXECUTE_REPL_COMMAND_ID = 'replNotebook.input.execute';
export var CellKind;
(function (CellKind) {
    CellKind[CellKind["Markup"] = 1] = "Markup";
    CellKind[CellKind["Code"] = 2] = "Code";
})(CellKind || (CellKind = {}));
export const NOTEBOOK_DISPLAY_ORDER = [
    'application/json',
    'application/javascript',
    'text/html',
    'image/svg+xml',
    Mimes.latex,
    Mimes.markdown,
    'image/png',
    'image/jpeg',
    Mimes.text
];
export const ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER = [
    Mimes.latex,
    Mimes.markdown,
    'application/json',
    'text/html',
    'image/svg+xml',
    'image/png',
    'image/jpeg',
    Mimes.text,
];
/**
 * A mapping of extension IDs who contain renderers, to notebook ids who they
 * should be treated as the same in the renderer selection logic. This is used
 * to prefer the 1st party Jupyter renderers even though they're in a separate
 * extension, for instance. See #136247.
 */
export const RENDERER_EQUIVALENT_EXTENSIONS = new Map([
    ['ms-toolsai.jupyter', new Set(['jupyter-notebook', 'interactive'])],
    ['ms-toolsai.jupyter-renderers', new Set(['jupyter-notebook', 'interactive'])],
]);
export const RENDERER_NOT_AVAILABLE = '_notAvailable';
export var NotebookRunState;
(function (NotebookRunState) {
    NotebookRunState[NotebookRunState["Running"] = 1] = "Running";
    NotebookRunState[NotebookRunState["Idle"] = 2] = "Idle";
})(NotebookRunState || (NotebookRunState = {}));
export var NotebookCellExecutionState;
(function (NotebookCellExecutionState) {
    NotebookCellExecutionState[NotebookCellExecutionState["Unconfirmed"] = 1] = "Unconfirmed";
    NotebookCellExecutionState[NotebookCellExecutionState["Pending"] = 2] = "Pending";
    NotebookCellExecutionState[NotebookCellExecutionState["Executing"] = 3] = "Executing";
})(NotebookCellExecutionState || (NotebookCellExecutionState = {}));
export var NotebookExecutionState;
(function (NotebookExecutionState) {
    NotebookExecutionState[NotebookExecutionState["Unconfirmed"] = 1] = "Unconfirmed";
    NotebookExecutionState[NotebookExecutionState["Pending"] = 2] = "Pending";
    NotebookExecutionState[NotebookExecutionState["Executing"] = 3] = "Executing";
})(NotebookExecutionState || (NotebookExecutionState = {}));
/** Note: enum values are used for sorting */
export var NotebookRendererMatch;
(function (NotebookRendererMatch) {
    /** Renderer has a hard dependency on an available kernel */
    NotebookRendererMatch[NotebookRendererMatch["WithHardKernelDependency"] = 0] = "WithHardKernelDependency";
    /** Renderer works better with an available kernel */
    NotebookRendererMatch[NotebookRendererMatch["WithOptionalKernelDependency"] = 1] = "WithOptionalKernelDependency";
    /** Renderer is kernel-agnostic */
    NotebookRendererMatch[NotebookRendererMatch["Pure"] = 2] = "Pure";
    /** Renderer is for a different mimeType or has a hard dependency which is unsatisfied */
    NotebookRendererMatch[NotebookRendererMatch["Never"] = 3] = "Never";
})(NotebookRendererMatch || (NotebookRendererMatch = {}));
/**
 * Renderer messaging requirement. While this allows for 'optional' messaging,
 * VS Code effectively treats it the same as true right now. "Partial
 * activation" of extensions is a very tricky problem, which could allow
 * solving this. But for now, optional is mostly only honored for aznb.
 */
export var RendererMessagingSpec;
(function (RendererMessagingSpec) {
    RendererMessagingSpec["Always"] = "always";
    RendererMessagingSpec["Never"] = "never";
    RendererMessagingSpec["Optional"] = "optional";
})(RendererMessagingSpec || (RendererMessagingSpec = {}));
export var NotebookCellsChangeType;
(function (NotebookCellsChangeType) {
    NotebookCellsChangeType[NotebookCellsChangeType["ModelChange"] = 1] = "ModelChange";
    NotebookCellsChangeType[NotebookCellsChangeType["Move"] = 2] = "Move";
    NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellLanguage"] = 5] = "ChangeCellLanguage";
    NotebookCellsChangeType[NotebookCellsChangeType["Initialize"] = 6] = "Initialize";
    NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellMetadata"] = 7] = "ChangeCellMetadata";
    NotebookCellsChangeType[NotebookCellsChangeType["Output"] = 8] = "Output";
    NotebookCellsChangeType[NotebookCellsChangeType["OutputItem"] = 9] = "OutputItem";
    NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellContent"] = 10] = "ChangeCellContent";
    NotebookCellsChangeType[NotebookCellsChangeType["ChangeDocumentMetadata"] = 11] = "ChangeDocumentMetadata";
    NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellInternalMetadata"] = 12] = "ChangeCellInternalMetadata";
    NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellMime"] = 13] = "ChangeCellMime";
    NotebookCellsChangeType[NotebookCellsChangeType["Unknown"] = 100] = "Unknown";
})(NotebookCellsChangeType || (NotebookCellsChangeType = {}));
export var SelectionStateType;
(function (SelectionStateType) {
    SelectionStateType[SelectionStateType["Handle"] = 0] = "Handle";
    SelectionStateType[SelectionStateType["Index"] = 1] = "Index";
})(SelectionStateType || (SelectionStateType = {}));
export var CellEditType;
(function (CellEditType) {
    CellEditType[CellEditType["Replace"] = 1] = "Replace";
    CellEditType[CellEditType["Output"] = 2] = "Output";
    CellEditType[CellEditType["Metadata"] = 3] = "Metadata";
    CellEditType[CellEditType["CellLanguage"] = 4] = "CellLanguage";
    CellEditType[CellEditType["DocumentMetadata"] = 5] = "DocumentMetadata";
    CellEditType[CellEditType["Move"] = 6] = "Move";
    CellEditType[CellEditType["OutputItems"] = 7] = "OutputItems";
    CellEditType[CellEditType["PartialMetadata"] = 8] = "PartialMetadata";
    CellEditType[CellEditType["PartialInternalMetadata"] = 9] = "PartialInternalMetadata";
})(CellEditType || (CellEditType = {}));
export var NotebookMetadataUri;
(function (NotebookMetadataUri) {
    NotebookMetadataUri.scheme = Schemas.vscodeNotebookMetadata;
    function generate(notebook) {
        return generateMetadataUri(notebook);
    }
    NotebookMetadataUri.generate = generate;
    function parse(metadata) {
        return parseMetadataUri(metadata);
    }
    NotebookMetadataUri.parse = parse;
})(NotebookMetadataUri || (NotebookMetadataUri = {}));
export var CellUri;
(function (CellUri) {
    CellUri.scheme = Schemas.vscodeNotebookCell;
    function generate(notebook, handle) {
        return generateUri(notebook, handle);
    }
    CellUri.generate = generate;
    function parse(cell) {
        return parseUri(cell);
    }
    CellUri.parse = parse;
    function generateCellOutputUri(notebook, outputId) {
        return notebook.with({
            scheme: Schemas.vscodeNotebookCellOutput,
            fragment: `op${outputId ?? ''},${notebook.scheme !== Schemas.file ? notebook.scheme : ''}`
        });
    }
    CellUri.generateCellOutputUri = generateCellOutputUri;
    function parseCellOutputUri(uri) {
        if (uri.scheme !== Schemas.vscodeNotebookCellOutput) {
            return;
        }
        const match = /^op([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?\,(.*)$/i.exec(uri.fragment);
        if (!match) {
            return undefined;
        }
        const outputId = (match[1] && match[1] !== '') ? match[1] : undefined;
        const scheme = match[2];
        return {
            outputId,
            notebook: uri.with({
                scheme: scheme || Schemas.file,
                fragment: null
            })
        };
    }
    CellUri.parseCellOutputUri = parseCellOutputUri;
    function generateCellPropertyUri(notebook, handle, scheme) {
        return CellUri.generate(notebook, handle).with({ scheme: scheme });
    }
    CellUri.generateCellPropertyUri = generateCellPropertyUri;
    function parseCellPropertyUri(uri, propertyScheme) {
        if (uri.scheme !== propertyScheme) {
            return undefined;
        }
        return CellUri.parse(uri.with({ scheme: CellUri.scheme }));
    }
    CellUri.parseCellPropertyUri = parseCellPropertyUri;
})(CellUri || (CellUri = {}));
const normalizeSlashes = (str) => isWindows ? str.replace(/\//g, '\\') : str;
export class MimeTypeDisplayOrder {
    constructor(initialValue = [], defaultOrder = NOTEBOOK_DISPLAY_ORDER) {
        this.defaultOrder = defaultOrder;
        this.order = [...new Set(initialValue)].map(pattern => ({
            pattern,
            matches: glob.parse(normalizeSlashes(pattern))
        }));
    }
    /**
     * Returns a sorted array of the input mimetypes.
     */
    sort(mimetypes) {
        const remaining = new Map(Iterable.map(mimetypes, m => [m, normalizeSlashes(m)]));
        let sorted = [];
        for (const { matches } of this.order) {
            for (const [original, normalized] of remaining) {
                if (matches(normalized)) {
                    sorted.push(original);
                    remaining.delete(original);
                    break;
                }
            }
        }
        if (remaining.size) {
            sorted = sorted.concat([...remaining.keys()].sort((a, b) => this.defaultOrder.indexOf(a) - this.defaultOrder.indexOf(b)));
        }
        return sorted;
    }
    /**
     * Records that the user selected the given mimetype over the other
     * possible mimetypes, prioritizing it for future reference.
     */
    prioritize(chosenMimetype, otherMimetypes) {
        const chosenIndex = this.findIndex(chosenMimetype);
        if (chosenIndex === -1) {
            // always first, nothing more to do
            this.order.unshift({ pattern: chosenMimetype, matches: glob.parse(normalizeSlashes(chosenMimetype)) });
            return;
        }
        // Get the other mimetypes that are before the chosenMimetype. Then, move
        // them after it, retaining order.
        const uniqueIndicies = new Set(otherMimetypes.map(m => this.findIndex(m, chosenIndex)));
        uniqueIndicies.delete(-1);
        const otherIndices = Array.from(uniqueIndicies).sort();
        this.order.splice(chosenIndex + 1, 0, ...otherIndices.map(i => this.order[i]));
        for (let oi = otherIndices.length - 1; oi >= 0; oi--) {
            this.order.splice(otherIndices[oi], 1);
        }
    }
    /**
     * Gets an array of in-order mimetype preferences.
     */
    toArray() {
        return this.order.map(o => o.pattern);
    }
    findIndex(mimeType, maxIndex = this.order.length) {
        const normalized = normalizeSlashes(mimeType);
        for (let i = 0; i < maxIndex; i++) {
            if (this.order[i].matches(normalized)) {
                return i;
            }
        }
        return -1;
    }
}
export function diff(before, after, contains, equal = (a, b) => a === b) {
    const result = [];
    function pushSplice(start, deleteCount, toInsert) {
        if (deleteCount === 0 && toInsert.length === 0) {
            return;
        }
        const latest = result[result.length - 1];
        if (latest && latest.start + latest.deleteCount === start) {
            latest.deleteCount += deleteCount;
            latest.toInsert.push(...toInsert);
        }
        else {
            result.push({ start, deleteCount, toInsert });
        }
    }
    let beforeIdx = 0;
    let afterIdx = 0;
    while (true) {
        if (beforeIdx === before.length) {
            pushSplice(beforeIdx, 0, after.slice(afterIdx));
            break;
        }
        if (afterIdx === after.length) {
            pushSplice(beforeIdx, before.length - beforeIdx, []);
            break;
        }
        const beforeElement = before[beforeIdx];
        const afterElement = after[afterIdx];
        if (equal(beforeElement, afterElement)) {
            // equal
            beforeIdx += 1;
            afterIdx += 1;
            continue;
        }
        if (contains(afterElement)) {
            // `afterElement` exists before, which means some elements before `afterElement` are deleted
            pushSplice(beforeIdx, 1, []);
            beforeIdx += 1;
        }
        else {
            // `afterElement` added
            pushSplice(beforeIdx, 0, [afterElement]);
            afterIdx += 1;
        }
    }
    return result;
}
export const NOTEBOOK_EDITOR_CURSOR_BOUNDARY = new RawContextKey('notebookEditorCursorAtBoundary', 'none');
export const NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY = new RawContextKey('notebookEditorCursorAtLineBoundary', 'none');
export var NotebookEditorPriority;
(function (NotebookEditorPriority) {
    NotebookEditorPriority["default"] = "default";
    NotebookEditorPriority["option"] = "option";
})(NotebookEditorPriority || (NotebookEditorPriority = {}));
export var NotebookFindScopeType;
(function (NotebookFindScopeType) {
    NotebookFindScopeType["Cells"] = "cells";
    NotebookFindScopeType["Text"] = "text";
    NotebookFindScopeType["None"] = "none";
})(NotebookFindScopeType || (NotebookFindScopeType = {}));
//TODO@rebornix test
export function isDocumentExcludePattern(filenamePattern) {
    const arg = filenamePattern;
    if ((typeof arg.include === 'string' || glob.isRelativePattern(arg.include))
        && (typeof arg.exclude === 'string' || glob.isRelativePattern(arg.exclude))) {
        return true;
    }
    return false;
}
export function notebookDocumentFilterMatch(filter, viewType, resource) {
    if (Array.isArray(filter.viewType) && filter.viewType.indexOf(viewType) >= 0) {
        return true;
    }
    if (filter.viewType === viewType) {
        return true;
    }
    if (filter.filenamePattern) {
        const filenamePattern = isDocumentExcludePattern(filter.filenamePattern) ? filter.filenamePattern.include : filter.filenamePattern;
        const excludeFilenamePattern = isDocumentExcludePattern(filter.filenamePattern) ? filter.filenamePattern.exclude : undefined;
        if (glob.match(filenamePattern, basename(resource.fsPath).toLowerCase())) {
            if (excludeFilenamePattern) {
                if (glob.match(excludeFilenamePattern, basename(resource.fsPath).toLowerCase())) {
                    // should exclude
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}
export const NotebookSetting = {
    displayOrder: 'notebook.displayOrder',
    cellToolbarLocation: 'notebook.cellToolbarLocation',
    cellToolbarVisibility: 'notebook.cellToolbarVisibility',
    showCellStatusBar: 'notebook.showCellStatusBar',
    textDiffEditorPreview: 'notebook.diff.enablePreview',
    diffOverviewRuler: 'notebook.diff.overviewRuler',
    experimentalInsertToolbarAlignment: 'notebook.experimental.insertToolbarAlignment',
    compactView: 'notebook.compactView',
    focusIndicator: 'notebook.cellFocusIndicator',
    insertToolbarLocation: 'notebook.insertToolbarLocation',
    globalToolbar: 'notebook.globalToolbar',
    stickyScrollEnabled: 'notebook.stickyScroll.enabled',
    stickyScrollMode: 'notebook.stickyScroll.mode',
    undoRedoPerCell: 'notebook.undoRedoPerCell',
    consolidatedOutputButton: 'notebook.consolidatedOutputButton',
    showFoldingControls: 'notebook.showFoldingControls',
    dragAndDropEnabled: 'notebook.dragAndDropEnabled',
    cellEditorOptionsCustomizations: 'notebook.editorOptionsCustomizations',
    consolidatedRunButton: 'notebook.consolidatedRunButton',
    openGettingStarted: 'notebook.experimental.openGettingStarted',
    globalToolbarShowLabel: 'notebook.globalToolbarShowLabel',
    markupFontSize: 'notebook.markup.fontSize',
    markdownLineHeight: 'notebook.markdown.lineHeight',
    interactiveWindowCollapseCodeCells: 'interactiveWindow.collapseCellInputCode',
    outputScrollingDeprecated: 'notebook.experimental.outputScrolling',
    outputScrolling: 'notebook.output.scrolling',
    textOutputLineLimit: 'notebook.output.textLineLimit',
    LinkifyOutputFilePaths: 'notebook.output.linkifyFilePaths',
    minimalErrorRendering: 'notebook.output.minimalErrorRendering',
    formatOnSave: 'notebook.formatOnSave.enabled',
    insertFinalNewline: 'notebook.insertFinalNewline',
    defaultFormatter: 'notebook.defaultFormatter',
    formatOnCellExecution: 'notebook.formatOnCellExecution',
    codeActionsOnSave: 'notebook.codeActionsOnSave',
    outputWordWrap: 'notebook.output.wordWrap',
    outputLineHeightDeprecated: 'notebook.outputLineHeight',
    outputLineHeight: 'notebook.output.lineHeight',
    outputFontSizeDeprecated: 'notebook.outputFontSize',
    outputFontSize: 'notebook.output.fontSize',
    outputFontFamilyDeprecated: 'notebook.outputFontFamily',
    outputFontFamily: 'notebook.output.fontFamily',
    findFilters: 'notebook.find.filters',
    logging: 'notebook.logging',
    confirmDeleteRunningCell: 'notebook.confirmDeleteRunningCell',
    remoteSaving: 'notebook.experimental.remoteSave',
    gotoSymbolsAllSymbols: 'notebook.gotoSymbols.showAllSymbols',
    outlineShowMarkdownHeadersOnly: 'notebook.outline.showMarkdownHeadersOnly',
    outlineShowCodeCells: 'notebook.outline.showCodeCells',
    outlineShowCodeCellSymbols: 'notebook.outline.showCodeCellSymbols',
    breadcrumbsShowCodeCells: 'notebook.breadcrumbs.showCodeCells',
    scrollToRevealCell: 'notebook.scrolling.revealNextCellOnExecute',
    cellChat: 'notebook.experimental.cellChat',
    cellGenerate: 'notebook.experimental.generate',
    notebookVariablesView: 'notebook.variablesView',
    InteractiveWindowPromptToSave: 'interactiveWindow.promptToSaveOnClose',
    cellFailureDiagnostics: 'notebook.cellFailureDiagnostics',
    outputBackupSizeLimit: 'notebook.backup.sizeLimit',
    multiCursor: 'notebook.multiCursor.enabled',
};
export var CellStatusbarAlignment;
(function (CellStatusbarAlignment) {
    CellStatusbarAlignment[CellStatusbarAlignment["Left"] = 1] = "Left";
    CellStatusbarAlignment[CellStatusbarAlignment["Right"] = 2] = "Right";
})(CellStatusbarAlignment || (CellStatusbarAlignment = {}));
export class NotebookWorkingCopyTypeIdentifier {
    static { this._prefix = 'notebook/'; }
    static create(notebookType, viewType) {
        return `${NotebookWorkingCopyTypeIdentifier._prefix}${notebookType}/${viewType ?? notebookType}`;
    }
    static parse(candidate) {
        if (candidate.startsWith(NotebookWorkingCopyTypeIdentifier._prefix)) {
            const split = candidate.substring(NotebookWorkingCopyTypeIdentifier._prefix.length).split('/');
            if (split.length === 2) {
                return { notebookType: split[0], viewType: split[1] };
            }
        }
        return undefined;
    }
}
/**
 * Whether the provided mime type is a text stream like `stdout`, `stderr`.
 */
export function isTextStreamMime(mimeType) {
    return ['application/vnd.code.notebook.stdout', 'application/vnd.code.notebook.stderr'].includes(mimeType);
}
const textDecoder = new TextDecoder();
/**
 * Given a stream of individual stdout outputs, this function will return the compressed lines, escaping some of the common terminal escape codes.
 * E.g. some terminal escape codes would result in the previous line getting cleared, such if we had 3 lines and
 * last line contained such a code, then the result string would be just the first two lines.
 * @returns a single VSBuffer with the concatenated and compressed data, and whether any compression was done.
 */
export function compressOutputItemStreams(outputs) {
    const buffers = [];
    let startAppending = false;
    // Pick the first set of outputs with the same mime type.
    for (const output of outputs) {
        if ((buffers.length === 0 || startAppending)) {
            buffers.push(output);
            startAppending = true;
        }
    }
    let didCompression = compressStreamBuffer(buffers);
    const concatenated = VSBuffer.concat(buffers.map(buffer => VSBuffer.wrap(buffer)));
    const data = formatStreamText(concatenated);
    didCompression = didCompression || data.byteLength !== concatenated.byteLength;
    return { data, didCompression };
}
export const MOVE_CURSOR_1_LINE_COMMAND = `${String.fromCharCode(27)}[A`;
const MOVE_CURSOR_1_LINE_COMMAND_BYTES = MOVE_CURSOR_1_LINE_COMMAND.split('').map(c => c.charCodeAt(0));
const LINE_FEED = 10;
function compressStreamBuffer(streams) {
    let didCompress = false;
    streams.forEach((stream, index) => {
        if (index === 0 || stream.length < MOVE_CURSOR_1_LINE_COMMAND.length) {
            return;
        }
        const previousStream = streams[index - 1];
        // Remove the previous line if required.
        const command = stream.subarray(0, MOVE_CURSOR_1_LINE_COMMAND.length);
        if (command[0] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[0] && command[1] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[1] && command[2] === MOVE_CURSOR_1_LINE_COMMAND_BYTES[2]) {
            const lastIndexOfLineFeed = previousStream.lastIndexOf(LINE_FEED);
            if (lastIndexOfLineFeed === -1) {
                return;
            }
            didCompress = true;
            streams[index - 1] = previousStream.subarray(0, lastIndexOfLineFeed);
            streams[index] = stream.subarray(MOVE_CURSOR_1_LINE_COMMAND.length);
        }
    });
    return didCompress;
}
/**
 * Took this from jupyter/notebook
 * https://github.com/jupyter/notebook/blob/b8b66332e2023e83d2ee04f83d8814f567e01a4e/notebook/static/base/js/utils.js
 * Remove characters that are overridden by backspace characters
 */
function fixBackspace(txt) {
    let tmp = txt;
    do {
        txt = tmp;
        // Cancel out anything-but-newline followed by backspace
        tmp = txt.replace(/[^\n]\x08/gm, '');
    } while (tmp.length < txt.length);
    return txt;
}
/**
 * Remove chunks that should be overridden by the effect of carriage return characters
 * From https://github.com/jupyter/notebook/blob/master/notebook/static/base/js/utils.js
 */
function fixCarriageReturn(txt) {
    txt = txt.replace(/\r+\n/gm, '\n'); // \r followed by \n --> newline
    while (txt.search(/\r[^$]/g) > -1) {
        const base = txt.match(/^(.*)\r+/m)[1];
        let insert = txt.match(/\r+(.*)$/m)[1];
        insert = insert + base.slice(insert.length, base.length);
        txt = txt.replace(/\r+.*$/m, '\r').replace(/^.*\r/m, insert);
    }
    return txt;
}
const BACKSPACE_CHARACTER = '\b'.charCodeAt(0);
const CARRIAGE_RETURN_CHARACTER = '\r'.charCodeAt(0);
function formatStreamText(buffer) {
    // We have special handling for backspace and carriage return characters.
    // Don't unnecessary decode the bytes if we don't need to perform any processing.
    if (!buffer.buffer.includes(BACKSPACE_CHARACTER) && !buffer.buffer.includes(CARRIAGE_RETURN_CHARACTER)) {
        return buffer;
    }
    // Do the same thing jupyter is doing
    return VSBuffer.fromString(fixCarriageReturn(fixBackspace(textDecoder.decode(buffer.buffer))));
}
