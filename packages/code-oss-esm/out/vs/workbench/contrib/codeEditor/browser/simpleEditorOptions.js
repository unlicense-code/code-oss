/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ContextMenuController } from '../../../../editor/contrib/contextmenu/browser/contextmenu.js';
import { SnippetController2 } from '../../../../editor/contrib/snippet/browser/snippetController2.js';
import { SuggestController } from '../../../../editor/contrib/suggest/browser/suggestController.js';
import { MenuPreventer } from './menuPreventer.js';
import { SelectionClipboardContributionID } from './selectionClipboard.js';
import { TabCompletionController } from '../../snippets/browser/tabCompletion.js';
import { EditorExtensionsRegistry } from '../../../../editor/browser/editorExtensions.js';
import { registerThemingParticipant } from '../../../../platform/theme/common/themeService.js';
import { selectionBackground, inputBackground, inputForeground, editorSelectionBackground } from '../../../../platform/theme/common/colorRegistry.js';
export function getSimpleEditorOptions(configurationService) {
    return {
        wordWrap: 'on',
        overviewRulerLanes: 0,
        glyphMargin: false,
        lineNumbers: 'off',
        folding: false,
        selectOnLineNumbers: false,
        hideCursorInOverviewRuler: true,
        selectionHighlight: false,
        scrollbar: {
            horizontal: 'hidden',
            alwaysConsumeMouseWheel: false
        },
        lineDecorationsWidth: 0,
        overviewRulerBorder: false,
        scrollBeyondLastLine: false,
        renderLineHighlight: 'none',
        fixedOverflowWidgets: true,
        acceptSuggestionOnEnter: 'smart',
        dragAndDrop: false,
        revealHorizontalRightPadding: 5,
        minimap: {
            enabled: false
        },
        guides: {
            indentation: false
        },
        accessibilitySupport: configurationService.getValue('editor.accessibilitySupport'),
        cursorBlinking: configurationService.getValue('editor.cursorBlinking'),
        experimentalEditContextEnabled: configurationService.getValue('editor.experimentalEditContextEnabled'),
    };
}
export function getSimpleCodeEditorWidgetOptions() {
    return {
        isSimpleWidget: true,
        contributions: EditorExtensionsRegistry.getSomeEditorContributions([
            MenuPreventer.ID,
            SelectionClipboardContributionID,
            ContextMenuController.ID,
            SuggestController.ID,
            SnippetController2.ID,
            TabCompletionController.ID,
        ])
    };
}
/**
 * Should be called to set the styling on editors that are appearing as just input boxes
 * @param editorContainerSelector An element selector that will match the container of the editor
 */
export function setupSimpleEditorSelectionStyling(editorContainerSelector) {
    // Override styles in selections.ts
    return registerThemingParticipant((theme, collector) => {
        const selectionBackgroundColor = theme.getColor(selectionBackground);
        if (selectionBackgroundColor) {
            // Override inactive selection bg
            const inputBackgroundColor = theme.getColor(inputBackground);
            if (inputBackgroundColor) {
                collector.addRule(`${editorContainerSelector} .monaco-editor-background { background-color: ${inputBackgroundColor}; } `);
                collector.addRule(`${editorContainerSelector} .monaco-editor .selected-text { background-color: ${inputBackgroundColor.transparent(0.4)}; }`);
            }
            // Override selected fg
            const inputForegroundColor = theme.getColor(inputForeground);
            if (inputForegroundColor) {
                collector.addRule(`${editorContainerSelector} .monaco-editor .view-line span.inline-selected-text { color: ${inputForegroundColor}; }`);
            }
            collector.addRule(`${editorContainerSelector} .monaco-editor .focused .selected-text { background-color: ${selectionBackgroundColor}; }`);
        }
        else {
            // Use editor selection color if theme has not set a selection background color
            collector.addRule(`${editorContainerSelector} .monaco-editor .focused .selected-text { background-color: ${theme.getColor(editorSelectionBackground)}; }`);
        }
    });
}
