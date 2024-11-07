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
var ChatEditorController_1;
import { binarySearch, coalesceInPlace } from '../../../../base/common/arrays.js';
import { Disposable, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { autorun, derived } from '../../../../base/common/observable.js';
import { isEqual } from '../../../../base/common/resources.js';
import { themeColorFromId } from '../../../../base/common/themables.js';
import { LineSource, renderLines, RenderOptions } from '../../../../editor/browser/widget/diffEditor/components/diffEditorViewZones/renderLines.js';
import { diffAddDecoration, diffDeleteDecoration, diffWholeLineAddDecoration } from '../../../../editor/browser/widget/diffEditor/registrations.contribution.js';
import { Range } from '../../../../editor/common/core/range.js';
import { OverviewRulerLane } from '../../../../editor/common/model.js';
import { ModelDecorationOptions } from '../../../../editor/common/model/textModel.js';
import { InlineDecoration } from '../../../../editor/common/viewModel.js';
import { localize } from '../../../../nls.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { minimapGutterAddedBackground, minimapGutterDeletedBackground, minimapGutterModifiedBackground, overviewRulerAddedForeground, overviewRulerDeletedForeground, overviewRulerModifiedForeground } from '../../scm/browser/dirtydiffDecorator.js';
import { IChatEditingService } from '../common/chatEditingService.js';
export const ctxHasEditorModification = new RawContextKey('chat.hasEditorModifications', undefined, localize('chat.hasEditorModifications', "The current editor contains chat modifications"));
let ChatEditorController = class ChatEditorController extends Disposable {
    static { ChatEditorController_1 = this; }
    static { this.ID = 'editor.contrib.chatEditorController'; }
    static get(editor) {
        const controller = editor.getContribution(ChatEditorController_1.ID);
        return controller;
    }
    constructor(_editor, _chatEditingService, contextKeyService) {
        super();
        this._editor = _editor;
        this._chatEditingService = _chatEditingService;
        this._sessionStore = this._register(new DisposableStore());
        this._decorations = this._editor.createDecorationsCollection();
        this._viewZones = [];
        this._register(this._editor.onDidChangeModel(() => this._update()));
        this._register(this._editor.onDidChangeConfiguration((e) => {
            if (e.hasChanged(52 /* EditorOption.fontInfo */) || e.hasChanged(68 /* EditorOption.lineHeight */)) {
                this._update();
            }
        }));
        this._register(this._chatEditingService.onDidChangeEditingSession(() => this._updateSessionDecorations()));
        this._register(toDisposable(() => this._clearRendering()));
        this._ctxHasEditorModification = ctxHasEditorModification.bindTo(contextKeyService);
        this._register(autorun(r => {
            if (this._editor.getOption(63 /* EditorOption.inDiffEditor */)) {
                return;
            }
            const session = this._chatEditingService.currentEditingSessionObs.read(r);
            const entry = session?.entries.read(r).find(e => isEqual(e.modifiedURI, this._editor.getModel()?.uri));
            if (!entry || entry.state.read(r) !== 0 /* WorkingSetEntryState.Modified */) {
                this._clearRendering();
                return;
            }
            const diff = entry?.diffInfo.read(r);
            this._updateWithDiff(entry, diff);
        }));
        const shouldBeReadOnly = derived(this, r => {
            const value = this._chatEditingService.currentEditingSessionObs.read(r);
            if (!value || value.state.read(r) !== 1 /* ChatEditingSessionState.StreamingEdits */) {
                return false;
            }
            return value.entries.read(r).some(e => isEqual(e.modifiedURI, this._editor.getModel()?.uri));
        });
        let actualReadonly;
        let actualDeco;
        this._register(autorun(r => {
            const value = shouldBeReadOnly.read(r);
            if (value) {
                actualReadonly ??= this._editor.getOption(94 /* EditorOption.readOnly */);
                actualDeco ??= this._editor.getOption(101 /* EditorOption.renderValidationDecorations */);
                this._editor.updateOptions({
                    readOnly: true,
                    renderValidationDecorations: 'off'
                });
            }
            else {
                if (actualReadonly !== undefined && actualDeco !== undefined) {
                    this._editor.updateOptions({
                        readOnly: actualReadonly,
                        renderValidationDecorations: actualDeco
                    });
                    actualReadonly = undefined;
                    actualDeco = undefined;
                }
            }
        }));
    }
    dispose() {
        this._clearRendering();
        super.dispose();
    }
    _update() {
        this._sessionStore.clear();
        if (!this._editor.hasModel()) {
            return;
        }
        if (this._editor.getOption(63 /* EditorOption.inDiffEditor */)) {
            return;
        }
        if (this._editor.getOption(63 /* EditorOption.inDiffEditor */)) {
            this._clearRendering();
            return;
        }
        this._updateSessionDecorations();
    }
    _updateSessionDecorations() {
        if (!this._editor.hasModel()) {
            this._clearRendering();
            return;
        }
        const model = this._editor.getModel();
        const editingSession = this._chatEditingService.getEditingSession(model.uri);
        const entry = this._getEntry(editingSession, model);
        if (!entry || entry.state.get() !== 0 /* WorkingSetEntryState.Modified */) {
            this._clearRendering();
            return;
        }
        const diff = entry.diffInfo.get();
        this._updateWithDiff(entry, diff);
    }
    _getEntry(editingSession, model) {
        if (!editingSession) {
            return null;
        }
        return editingSession.entries.get().find(e => e.modifiedURI.toString() === model.uri.toString()) || null;
    }
    _clearRendering() {
        this._editor.changeViewZones((viewZoneChangeAccessor) => {
            for (const id of this._viewZones) {
                viewZoneChangeAccessor.removeZone(id);
            }
        });
        this._viewZones = [];
        this._decorations.clear();
        this._ctxHasEditorModification.reset();
    }
    _updateWithDiff(entry, diff) {
        if (!diff) {
            this._clearRendering();
            return;
        }
        this._ctxHasEditorModification.set(true);
        const originalModel = entry.originalModel;
        const chatDiffAddDecoration = ModelDecorationOptions.createDynamic({
            ...diffAddDecoration,
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
        });
        const chatDiffWholeLineAddDecoration = ModelDecorationOptions.createDynamic({
            ...diffWholeLineAddDecoration,
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        });
        const createOverviewDecoration = (overviewRulerColor, minimapColor) => {
            return ModelDecorationOptions.createDynamic({
                description: 'chat-editing-decoration',
                overviewRuler: { color: themeColorFromId(overviewRulerColor), position: OverviewRulerLane.Left },
                minimap: { color: themeColorFromId(minimapColor), position: 2 /* MinimapPosition.Gutter */ },
            });
        };
        const modifiedDecoration = createOverviewDecoration(overviewRulerModifiedForeground, minimapGutterModifiedBackground);
        const addedDecoration = createOverviewDecoration(overviewRulerAddedForeground, minimapGutterAddedBackground);
        const deletedDecoration = createOverviewDecoration(overviewRulerDeletedForeground, minimapGutterDeletedBackground);
        this._editor.changeViewZones((viewZoneChangeAccessor) => {
            for (const id of this._viewZones) {
                viewZoneChangeAccessor.removeZone(id);
            }
            this._viewZones = [];
            const modifiedDecorations = [];
            const mightContainNonBasicASCII = originalModel.mightContainNonBasicASCII();
            const mightContainRTL = originalModel.mightContainRTL();
            const renderOptions = RenderOptions.fromEditor(this._editor);
            for (const diffEntry of diff.changes) {
                const originalRange = diffEntry.original;
                originalModel.tokenization.forceTokenization(Math.max(1, originalRange.endLineNumberExclusive - 1));
                const source = new LineSource(originalRange.mapToLineArray(l => originalModel.tokenization.getLineTokens(l)), [], mightContainNonBasicASCII, mightContainRTL);
                const decorations = [];
                for (const i of diffEntry.innerChanges || []) {
                    decorations.push(new InlineDecoration(i.originalRange.delta(-(diffEntry.original.startLineNumber - 1)), diffDeleteDecoration.className, 0 /* InlineDecorationType.Regular */));
                    modifiedDecorations.push({
                        range: i.modifiedRange, options: chatDiffAddDecoration
                    });
                }
                if (!diffEntry.modified.isEmpty) {
                    modifiedDecorations.push({
                        range: diffEntry.modified.toInclusiveRange(), options: chatDiffWholeLineAddDecoration
                    });
                }
                if (diffEntry.original.isEmpty) {
                    // insertion
                    modifiedDecorations.push({
                        range: diffEntry.modified.toInclusiveRange(),
                        options: addedDecoration
                    });
                }
                else if (diffEntry.modified.isEmpty) {
                    // deletion
                    modifiedDecorations.push({
                        range: new Range(diffEntry.modified.startLineNumber - 1, 1, diffEntry.modified.startLineNumber, 1),
                        options: deletedDecoration
                    });
                }
                else {
                    // modification
                    modifiedDecorations.push({
                        range: diffEntry.modified.toInclusiveRange(),
                        options: modifiedDecoration
                    });
                }
                const domNode = document.createElement('div');
                domNode.className = 'chat-editing-original-zone view-lines line-delete monaco-mouse-cursor-text';
                const result = renderLines(source, renderOptions, decorations, domNode);
                const isCreatedContent = decorations.length === 1 && decorations[0].range.isEmpty() && decorations[0].range.startLineNumber === 1;
                if (!isCreatedContent) {
                    const viewZoneData = {
                        afterLineNumber: diffEntry.modified.startLineNumber - 1,
                        heightInLines: result.heightInLines,
                        domNode,
                        ordinal: 50000 + 2 // more than https://github.com/microsoft/vscode/blob/bf52a5cfb2c75a7327c9adeaefbddc06d529dcad/src/vs/workbench/contrib/inlineChat/browser/inlineChatZoneWidget.ts#L42
                    };
                    this._viewZones.push(viewZoneChangeAccessor.addZone(viewZoneData));
                }
            }
            this._decorations.set(modifiedDecorations);
        });
    }
    revealNext(strict = false) {
        return this._reveal(true, strict);
    }
    revealPrevious(strict = false) {
        return this._reveal(false, strict);
    }
    _reveal(next, strict) {
        const position = this._editor.getPosition();
        if (!position) {
            return false;
        }
        const decorations = this._decorations
            .getRanges()
            .sort((a, b) => Range.compareRangesUsingStarts(a, b));
        // TODO@jrieken this is slow and should be done smarter, e.g being able to read
        // only whole range decorations because the goal is to go from change to change, skipping
        // over word level changes
        for (let i = 0; i < decorations.length; i++) {
            const decoration = decorations[i];
            for (let j = 0; j < decorations.length; j++) {
                if (i !== j && decoration && decorations[j]?.containsRange(decoration)) {
                    decorations[i] = undefined;
                    break;
                }
            }
        }
        coalesceInPlace(decorations);
        if (decorations.length === 0) {
            return false;
        }
        let idx = binarySearch(decorations, Range.fromPositions(position), Range.compareRangesUsingStarts);
        if (idx < 0) {
            idx = ~idx;
        }
        let target;
        if (decorations[idx]?.containsPosition(position)) {
            target = idx + (next ? 1 : -1);
        }
        else {
            target = next ? idx : idx - 1;
        }
        if (strict && (target < 0 || target >= decorations.length)) {
            return false;
        }
        target = (target + decorations.length) % decorations.length;
        const targetPosition = decorations[target].getStartPosition();
        this._editor.setPosition(targetPosition);
        this._editor.revealPositionInCenter(targetPosition, 0 /* ScrollType.Smooth */);
        this._editor.focus();
        return true;
    }
};
ChatEditorController = ChatEditorController_1 = __decorate([
    __param(1, IChatEditingService),
    __param(2, IContextKeyService)
], ChatEditorController);
export { ChatEditorController };
