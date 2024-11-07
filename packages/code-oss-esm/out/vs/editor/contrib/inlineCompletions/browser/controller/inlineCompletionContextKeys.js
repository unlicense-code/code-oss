/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { autorun } from '../../../../../base/common/observable.js';
import { firstNonWhitespaceIndex } from '../../../../../base/common/strings.js';
import { CursorColumns } from '../../../../common/core/cursorColumns.js';
import { RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { localize } from '../../../../../nls.js';
import { bindContextKey } from '../../../../../platform/observable/common/platformObservableUtils.js';
export class InlineCompletionContextKeys extends Disposable {
    static { this.inlineSuggestionVisible = new RawContextKey('inlineSuggestionVisible', false, localize('inlineSuggestionVisible', "Whether an inline suggestion is visible")); }
    static { this.inlineSuggestionHasIndentation = new RawContextKey('inlineSuggestionHasIndentation', false, localize('inlineSuggestionHasIndentation', "Whether the inline suggestion starts with whitespace")); }
    static { this.inlineSuggestionHasIndentationLessThanTabSize = new RawContextKey('inlineSuggestionHasIndentationLessThanTabSize', true, localize('inlineSuggestionHasIndentationLessThanTabSize', "Whether the inline suggestion starts with whitespace that is less than what would be inserted by tab")); }
    static { this.suppressSuggestions = new RawContextKey('inlineSuggestionSuppressSuggestions', undefined, localize('suppressSuggestions', "Whether suggestions should be suppressed for the current suggestion")); }
    static { this.cursorInIndentation = new RawContextKey('cursorInIndentation', false, localize('cursorInIndentation', "Whether the cursor is in indentation")); }
    static { this.hasSelection = new RawContextKey('editor.hasSelection', false, localize('editor.hasSelection', "Whether the editor has a selection")); }
    static { this.cursorAtInlineEdit = new RawContextKey('cursorAtInlineEdit', false, localize('cursorAtInlineEdit', "Whether the cursor is at an inline edit")); }
    static { this.inlineEditVisible = new RawContextKey('inlineEditIsVisible', false, localize('inlineEditVisible', "Whether an inline edit is visible")); }
    static { this.tabShouldJumpToInlineEdit = new RawContextKey('tabShouldJumpToInlineEdit', false, localize('tabShouldJumpToInlineEdit', "Whether tab should jump to an inline edit.")); }
    static { this.tabShouldAcceptInlineEdit = new RawContextKey('tabShouldAcceptInlineEdit', false, localize('tabShouldAcceptInlineEdit', "Whether tab should accept the inline edit.")); }
    constructor(contextKeyService, model) {
        super();
        this.contextKeyService = contextKeyService;
        this.model = model;
        this.inlineCompletionVisible = InlineCompletionContextKeys.inlineSuggestionVisible.bindTo(this.contextKeyService);
        this.inlineCompletionSuggestsIndentation = InlineCompletionContextKeys.inlineSuggestionHasIndentation.bindTo(this.contextKeyService);
        this.inlineCompletionSuggestsIndentationLessThanTabSize = InlineCompletionContextKeys.inlineSuggestionHasIndentationLessThanTabSize.bindTo(this.contextKeyService);
        this.suppressSuggestions = InlineCompletionContextKeys.suppressSuggestions.bindTo(this.contextKeyService);
        this._register(bindContextKey(InlineCompletionContextKeys.inlineEditVisible, this.contextKeyService, reader => this.model.read(reader)?.inlineEditState.read(reader) !== undefined));
        this._register(autorun(reader => {
            /** @description update context key: inlineCompletionVisible, suppressSuggestions */
            const model = this.model.read(reader);
            const state = model?.inlineCompletionState.read(reader);
            const isInlineCompletionVisible = !!state?.inlineCompletion && state?.primaryGhostText !== undefined && !state?.primaryGhostText.isEmpty();
            this.inlineCompletionVisible.set(isInlineCompletionVisible);
            if (state?.primaryGhostText && state?.inlineCompletion) {
                this.suppressSuggestions.set(state.inlineCompletion.inlineCompletion.source.inlineCompletions.suppressSuggestions);
            }
        }));
        this._register(autorun(reader => {
            /** @description update context key: inlineCompletionSuggestsIndentation, inlineCompletionSuggestsIndentationLessThanTabSize */
            const model = this.model.read(reader);
            let startsWithIndentation = false;
            let startsWithIndentationLessThanTabSize = true;
            const ghostText = model?.primaryGhostText.read(reader);
            if (!!model?.selectedSuggestItem && ghostText && ghostText.parts.length > 0) {
                const { column, lines } = ghostText.parts[0];
                const firstLine = lines[0];
                const indentationEndColumn = model.textModel.getLineIndentColumn(ghostText.lineNumber);
                const inIndentation = column <= indentationEndColumn;
                if (inIndentation) {
                    let firstNonWsIdx = firstNonWhitespaceIndex(firstLine);
                    if (firstNonWsIdx === -1) {
                        firstNonWsIdx = firstLine.length - 1;
                    }
                    startsWithIndentation = firstNonWsIdx > 0;
                    const tabSize = model.textModel.getOptions().tabSize;
                    const visibleColumnIndentation = CursorColumns.visibleColumnFromColumn(firstLine, firstNonWsIdx + 1, tabSize);
                    startsWithIndentationLessThanTabSize = visibleColumnIndentation < tabSize;
                }
            }
            this.inlineCompletionSuggestsIndentation.set(startsWithIndentation);
            this.inlineCompletionSuggestsIndentationLessThanTabSize.set(startsWithIndentationLessThanTabSize);
        }));
    }
}
