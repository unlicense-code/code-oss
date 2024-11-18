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
var ChatEditorController_1, DiffHunkWidget_1;
import './media/chatEditorController.css';
import { getTotalWidth } from '../../../../base/browser/dom.js';
import { binarySearch, coalesceInPlace } from '../../../../base/common/arrays.js';
import { Disposable, DisposableStore, dispose, toDisposable } from '../../../../base/common/lifecycle.js';
import { autorun, derived, observableFromEvent } from '../../../../base/common/observable.js';
import { isEqual } from '../../../../base/common/resources.js';
import { themeColorFromId } from '../../../../base/common/themables.js';
import { LineSource, renderLines, RenderOptions } from '../../../../editor/browser/widget/diffEditor/components/diffEditorViewZones/renderLines.js';
import { diffAddDecoration, diffDeleteDecoration, diffWholeLineAddDecoration } from '../../../../editor/browser/widget/diffEditor/registrations.contribution.js';
import { EditOperation } from '../../../../editor/common/core/editOperation.js';
import { Range } from '../../../../editor/common/core/range.js';
import { OverviewRulerLane } from '../../../../editor/common/model.js';
import { ModelDecorationOptions } from '../../../../editor/common/model/textModel.js';
import { InlineDecoration } from '../../../../editor/common/viewModel.js';
import { localize } from '../../../../nls.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { minimapGutterAddedBackground, minimapGutterDeletedBackground, minimapGutterModifiedBackground, overviewRulerAddedForeground, overviewRulerDeletedForeground, overviewRulerModifiedForeground } from '../../scm/browser/dirtydiffDecorator.js';
import { IChatEditingService } from '../common/chatEditingService.js';
import { Event } from '../../../../base/common/event.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { Position } from '../../../../editor/common/core/position.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import { MenuWorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
export const ctxHasEditorModification = new RawContextKey('chat.hasEditorModifications', undefined, localize('chat.hasEditorModifications', "The current editor contains chat modifications"));
let ChatEditorController = class ChatEditorController extends Disposable {
    static { ChatEditorController_1 = this; }
    static { this.ID = 'editor.contrib.chatEditorController'; }
    static get(editor) {
        const controller = editor.getContribution(ChatEditorController_1.ID);
        return controller;
    }
    constructor(_editor, _instantiationService, _chatEditingService, _editorService, contextKeyService) {
        super();
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this._chatEditingService = _chatEditingService;
        this._editorService = _editorService;
        this._decorations = this._editor.createDecorationsCollection();
        this._diffHunksRenderStore = this._register(new DisposableStore());
        this._diffHunkWidgets = [];
        this._viewZones = [];
        this._ctxHasEditorModification = ctxHasEditorModification.bindTo(contextKeyService);
        const configSignal = observableFromEvent(Event.filter(this._editor.onDidChangeConfiguration, e => e.hasChanged(52 /* EditorOption.fontInfo */) || e.hasChanged(68 /* EditorOption.lineHeight */)), _ => undefined);
        const modelObs = observableFromEvent(this._editor.onDidChangeModel, _ => this._editor.getModel());
        this._register(autorun(r => {
            if (this._editor.getOption(63 /* EditorOption.inDiffEditor */)) {
                this._clearRendering();
                return;
            }
            configSignal.read(r);
            const model = modelObs.read(r);
            const session = this._chatEditingService.currentEditingSessionObs.read(r);
            const entry = session?.entries.read(r).find(e => isEqual(e.modifiedURI, model?.uri));
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
    _clearRendering() {
        this._editor.changeViewZones((viewZoneChangeAccessor) => {
            for (const id of this._viewZones) {
                viewZoneChangeAccessor.removeZone(id);
            }
        });
        this._viewZones = [];
        this._diffHunksRenderStore.clear();
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
        this._diffHunksRenderStore.clear();
        this._diffHunkWidgets.length = 0;
        const diffHunkDecorations = [];
        this._editor.changeViewZones((viewZoneChangeAccessor) => {
            for (const id of this._viewZones) {
                viewZoneChangeAccessor.removeZone(id);
            }
            this._viewZones = [];
            const modifiedDecorations = [];
            const mightContainNonBasicASCII = originalModel.mightContainNonBasicASCII();
            const mightContainRTL = originalModel.mightContainRTL();
            const renderOptions = RenderOptions.fromEditor(this._editor);
            const editorLineCount = this._editor.getModel()?.getLineCount();
            for (const diffEntry of diff.changes) {
                const originalRange = diffEntry.original;
                originalModel.tokenization.forceTokenization(Math.max(1, originalRange.endLineNumberExclusive - 1));
                const source = new LineSource(originalRange.mapToLineArray(l => originalModel.tokenization.getLineTokens(l)), [], mightContainNonBasicASCII, mightContainRTL);
                const decorations = [];
                for (const i of diffEntry.innerChanges || []) {
                    decorations.push(new InlineDecoration(i.originalRange.delta(-(diffEntry.original.startLineNumber - 1)), diffDeleteDecoration.className, 0 /* InlineDecorationType.Regular */));
                    // If the original range is empty, the start line number is 1 and the new range spans the entire file, don't draw an Added decoration
                    if (!(i.originalRange.isEmpty() && i.originalRange.startLineNumber === 1 && i.modifiedRange.endLineNumber === editorLineCount) && !i.modifiedRange.isEmpty()) {
                        modifiedDecorations.push({
                            range: i.modifiedRange, options: chatDiffAddDecoration
                        });
                    }
                }
                // Render an added decoration but don't also render a deleted decoration for newly inserted content at the start of the file
                // Note, this is a workaround for the `LineRange.isEmpty()` in diffEntry.original being `false` for newly inserted content
                const isCreatedContent = decorations.length === 1 && decorations[0].range.isEmpty() && diffEntry.original.startLineNumber === 1;
                if (!diffEntry.modified.isEmpty && !(isCreatedContent && (diffEntry.modified.endLineNumberExclusive - 1) === editorLineCount)) {
                    modifiedDecorations.push({
                        range: diffEntry.modified.toInclusiveRange(),
                        options: chatDiffWholeLineAddDecoration
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
                if (!isCreatedContent) {
                    const viewZoneData = {
                        afterLineNumber: diffEntry.modified.startLineNumber - 1,
                        heightInLines: result.heightInLines,
                        domNode,
                        ordinal: 50000 + 2 // more than https://github.com/microsoft/vscode/blob/bf52a5cfb2c75a7327c9adeaefbddc06d529dcad/src/vs/workbench/contrib/inlineChat/browser/inlineChatZoneWidget.ts#L42
                    };
                    this._viewZones.push(viewZoneChangeAccessor.addZone(viewZoneData));
                }
                // Add content widget for each diff change
                const undoEdits = [];
                for (const c of diffEntry.innerChanges ?? []) {
                    const oldText = originalModel.getValueInRange(c.originalRange);
                    undoEdits.push(EditOperation.replace(c.modifiedRange, oldText));
                }
                const widget = this._instantiationService.createInstance(DiffHunkWidget, entry, undoEdits, this._editor.getModel().getVersionId(), this._editor, isCreatedContent ? 0 : result.heightInLines);
                widget.layout(diffEntry.modified.startLineNumber);
                this._diffHunkWidgets.push(widget);
                diffHunkDecorations.push({
                    range: diffEntry.modified.toInclusiveRange() ?? new Range(diffEntry.modified.startLineNumber, 1, diffEntry.modified.startLineNumber, Number.MAX_SAFE_INTEGER),
                    options: {
                        description: 'diff-hunk-widget',
                        stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */
                    }
                });
            }
            this._decorations.set(modifiedDecorations);
        });
        const diffHunkDecoCollection = this._editor.createDecorationsCollection(diffHunkDecorations);
        this._diffHunksRenderStore.add(toDisposable(() => {
            dispose(this._diffHunkWidgets);
            this._diffHunkWidgets.length = 0;
            diffHunkDecoCollection.clear();
        }));
        const positionObs = observableFromEvent(this._editor.onDidChangeCursorPosition, _ => this._editor.getPosition());
        const activeWidgetIdx = derived(r => {
            const position = positionObs.read(r);
            if (!position) {
                return -1;
            }
            const idx = diffHunkDecoCollection.getRanges().findIndex(r => r.containsPosition(position));
            return idx;
        });
        const toggleWidget = (activeWidget) => {
            const positionIdx = activeWidgetIdx.get();
            for (let i = 0; i < this._diffHunkWidgets.length; i++) {
                const widget = this._diffHunkWidgets[i];
                widget.toggle(widget === activeWidget || i === positionIdx);
            }
        };
        this._diffHunksRenderStore.add(autorun(r => {
            // reveal when cursor inside
            const idx = activeWidgetIdx.read(r);
            const widget = this._diffHunkWidgets[idx];
            toggleWidget(widget);
        }));
        this._diffHunksRenderStore.add(this._editor.onMouseMove(e => {
            // reveal when hovering over
            if (e.target.type === 12 /* MouseTargetType.OVERLAY_WIDGET */) {
                const id = e.target.detail;
                const widget = this._diffHunkWidgets.find(w => w.getId() === id);
                toggleWidget(widget);
            }
            else if (e.target.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */) {
                const zone = e.target.detail;
                const idx = this._viewZones.findIndex(id => id === zone.viewZoneId);
                toggleWidget(this._diffHunkWidgets[idx]);
            }
            else if (e.target.position) {
                const { position } = e.target;
                const idx = diffHunkDecoCollection.getRanges().findIndex(r => r.containsPosition(position));
                toggleWidget(this._diffHunkWidgets[idx]);
            }
            else {
                toggleWidget(undefined);
            }
        }));
        this._diffHunksRenderStore.add(Event.any(this._editor.onDidScrollChange, this._editor.onDidLayoutChange)(() => {
            for (let i = 0; i < this._diffHunkWidgets.length; i++) {
                const widget = this._diffHunkWidgets[i];
                const range = diffHunkDecoCollection.getRange(i);
                if (range) {
                    widget.layout(range?.startLineNumber);
                }
                else {
                    widget.dispose();
                }
            }
        }));
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
    undoNearestChange(closestWidget) {
        if (!this._editor.hasModel()) {
            return;
        }
        const lineRelativeTop = this._editor.getTopForLineNumber(this._editor.getPosition().lineNumber) - this._editor.getScrollTop();
        let closestDistance = Number.MAX_VALUE;
        if (!(closestWidget instanceof DiffHunkWidget)) {
            for (const widget of this._diffHunkWidgets) {
                const widgetTop = widget.getPosition()?.preference?.top;
                if (widgetTop !== undefined) {
                    const distance = Math.abs(widgetTop - lineRelativeTop);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestWidget = widget;
                    }
                }
            }
        }
        if (closestWidget instanceof DiffHunkWidget) {
            closestWidget.undo();
        }
    }
    async openDiff(widget) {
        if (!this._editor.hasModel()) {
            return;
        }
        const lineRelativeTop = this._editor.getTopForLineNumber(this._editor.getPosition().lineNumber) - this._editor.getScrollTop();
        let closestDistance = Number.MAX_VALUE;
        if (!(widget instanceof DiffHunkWidget)) {
            for (const candidate of this._diffHunkWidgets) {
                const widgetTop = candidate.getPosition()?.preference?.top;
                if (widgetTop !== undefined) {
                    const distance = Math.abs(widgetTop - lineRelativeTop);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        widget = candidate;
                    }
                }
            }
        }
        if (widget instanceof DiffHunkWidget) {
            const lineNumber = widget.getStartLineNumber();
            const position = lineNumber ? new Position(lineNumber, 1) : undefined;
            let selection = this._editor.getSelection();
            if (position && !selection.containsPosition(position)) {
                selection = Selection.fromPositions(position);
            }
            const diffEditor = await this._editorService.openEditor({
                original: { resource: widget.entry.originalURI, options: { selection: undefined } },
                modified: { resource: widget.entry.modifiedURI, options: { selection } },
            });
            // this is needed, passing the selection doesn't seem to work
            diffEditor?.getControl()?.setSelection(selection);
        }
    }
};
ChatEditorController = ChatEditorController_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IChatEditingService),
    __param(3, IEditorService),
    __param(4, IContextKeyService)
], ChatEditorController);
export { ChatEditorController };
let DiffHunkWidget = class DiffHunkWidget {
    static { DiffHunkWidget_1 = this; }
    static { this._idPool = 0; }
    constructor(entry, _undoEdits, _versionId, _editor, _lineDelta, instaService) {
        this.entry = entry;
        this._undoEdits = _undoEdits;
        this._versionId = _versionId;
        this._editor = _editor;
        this._lineDelta = _lineDelta;
        this._id = `diff-change-widget-${DiffHunkWidget_1._idPool++}`;
        this._store = new DisposableStore();
        this._domNode = document.createElement('div');
        this._domNode.className = 'chat-diff-change-content-widget';
        const toolbar = instaService.createInstance(MenuWorkbenchToolBar, this._domNode, MenuId.ChatEditingEditorHunk, {
            telemetrySource: 'chatEditingEditorHunk',
            hiddenItemStrategy: -1 /* HiddenItemStrategy.NoHide */,
            toolbarOptions: { primaryGroup: () => true, },
            menuOptions: {
                renderShortTitle: true,
                arg: this,
            },
        });
        this._store.add(toolbar);
        this._editor.addOverlayWidget(this);
    }
    dispose() {
        this._store.dispose();
        this._editor.removeOverlayWidget(this);
    }
    getId() {
        return this._id;
    }
    layout(startLineNumber) {
        const lineHeight = this._editor.getOption(68 /* EditorOption.lineHeight */);
        const { contentLeft, contentWidth, verticalScrollbarWidth } = this._editor.getLayoutInfo();
        const scrollTop = this._editor.getScrollTop();
        this._position = {
            stackOridinal: 1,
            preference: {
                top: this._editor.getTopForLineNumber(startLineNumber) - scrollTop - (lineHeight * this._lineDelta),
                left: contentLeft + contentWidth - (2 * verticalScrollbarWidth + getTotalWidth(this._domNode))
            }
        };
        this._editor.layoutOverlayWidget(this);
        this._lastStartLineNumber = startLineNumber;
    }
    toggle(show) {
        this._domNode.classList.toggle('hover', show);
        if (this._lastStartLineNumber) {
            this.layout(this._lastStartLineNumber);
        }
    }
    getDomNode() {
        return this._domNode;
    }
    getPosition() {
        return this._position ?? null;
    }
    getStartLineNumber() {
        return this._lastStartLineNumber;
    }
    // ---
    undo() {
        if (this._versionId === this._editor.getModel()?.getVersionId()) {
            this._editor.executeEdits('chatEdits.undo', this._undoEdits);
        }
    }
};
DiffHunkWidget = DiffHunkWidget_1 = __decorate([
    __param(5, IInstantiationService)
], DiffHunkWidget);
