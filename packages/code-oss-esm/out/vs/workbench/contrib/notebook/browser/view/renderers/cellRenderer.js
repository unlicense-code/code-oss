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
var MarkupCellRenderer_1, CodeCellRenderer_1;
import { PixelRatio } from '../../../../../../base/browser/pixelRatio.js';
import * as DOM from '../../../../../../base/browser/dom.js';
import { FastDomNode } from '../../../../../../base/browser/fastDomNode.js';
import { Disposable, DisposableStore } from '../../../../../../base/common/lifecycle.js';
import { CodeEditorWidget } from '../../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { BareFontInfo } from '../../../../../../editor/common/config/fontInfo.js';
import { EditorContextKeys } from '../../../../../../editor/common/editorContextKeys.js';
import { PLAINTEXT_LANGUAGE_ID } from '../../../../../../editor/common/languages/modesRegistry.js';
import { localize } from '../../../../../../nls.js';
import { IMenuService } from '../../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../../../platform/instantiation/common/serviceCollection.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { INotificationService } from '../../../../../../platform/notification/common/notification.js';
import { CellPartsCollection } from '../cellPart.js';
import { CellChatPart } from '../cellParts/chat/cellChatPart.js';
import { CellComments } from '../cellParts/cellComments.js';
import { CellContextKeyPart } from '../cellParts/cellContextKeys.js';
import { CellDecorations } from '../cellParts/cellDecorations.js';
import { CellDragAndDropPart } from '../cellParts/cellDnd.js';
import { CodeCellDragImageRenderer } from '../cellParts/cellDragRenderer.js';
import { CellEditorOptions } from '../cellParts/cellEditorOptions.js';
import { CellExecutionPart } from '../cellParts/cellExecution.js';
import { CellFocusPart } from '../cellParts/cellFocus.js';
import { CellFocusIndicator } from '../cellParts/cellFocusIndicator.js';
import { CellProgressBar } from '../cellParts/cellProgressBar.js';
import { CellEditorStatusBar } from '../cellParts/cellStatusPart.js';
import { BetweenCellToolbar, CellTitleToolbarPart } from '../cellParts/cellToolbars.js';
import { CodeCell } from '../cellParts/codeCell.js';
import { RunToolbar } from '../cellParts/codeCellRunToolbar.js';
import { CollapsedCellInput } from '../cellParts/collapsedCellInput.js';
import { CollapsedCellOutput } from '../cellParts/collapsedCellOutput.js';
import { FoldedCellHint } from '../cellParts/foldedCellHint.js';
import { MarkupCell } from '../cellParts/markupCell.js';
import { CellKind } from '../../../common/notebookCommon.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
const $ = DOM.$;
let NotebookCellListDelegate = class NotebookCellListDelegate extends Disposable {
    constructor(targetWindow, configurationService) {
        super();
        this.configurationService = configurationService;
        const editorOptions = this.configurationService.getValue('editor');
        this.lineHeight = BareFontInfo.createFromRawSettings(editorOptions, PixelRatio.getInstance(targetWindow).value).lineHeight;
    }
    getHeight(element) {
        return element.getHeight(this.lineHeight);
    }
    getDynamicHeight(element) {
        return element.getDynamicHeight();
    }
    getTemplateId(element) {
        if (element.cellKind === CellKind.Markup) {
            return MarkupCellRenderer.TEMPLATE_ID;
        }
        else {
            return CodeCellRenderer.TEMPLATE_ID;
        }
    }
};
NotebookCellListDelegate = __decorate([
    __param(1, IConfigurationService)
], NotebookCellListDelegate);
export { NotebookCellListDelegate };
class AbstractCellRenderer {
    constructor(instantiationService, notebookEditor, contextMenuService, menuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, language, dndController) {
        this.instantiationService = instantiationService;
        this.notebookEditor = notebookEditor;
        this.contextMenuService = contextMenuService;
        this.menuService = menuService;
        this.keybindingService = keybindingService;
        this.notificationService = notificationService;
        this.contextKeyServiceProvider = contextKeyServiceProvider;
        this.dndController = dndController;
        this.editorOptions = new CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(language), this.notebookEditor.notebookOptions, configurationService);
    }
    dispose() {
        this.editorOptions.dispose();
        this.dndController = undefined;
    }
}
let MarkupCellRenderer = class MarkupCellRenderer extends AbstractCellRenderer {
    static { MarkupCellRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'markdown_cell'; }
    constructor(notebookEditor, dndController, renderedEditors, contextKeyServiceProvider, configurationService, instantiationService, contextMenuService, menuService, keybindingService, notificationService, notebookExecutionStateService) {
        super(instantiationService, notebookEditor, contextMenuService, menuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, 'markdown', dndController);
        this.renderedEditors = renderedEditors;
        this._notebookExecutionStateService = notebookExecutionStateService;
    }
    get templateId() {
        return MarkupCellRenderer_1.TEMPLATE_ID;
    }
    renderTemplate(rootContainer) {
        rootContainer.classList.add('markdown-cell-row');
        const container = DOM.append(rootContainer, DOM.$('.cell-inner-container'));
        const templateDisposables = new DisposableStore();
        const contextKeyService = templateDisposables.add(this.contextKeyServiceProvider(container));
        const decorationContainer = DOM.append(rootContainer, $('.cell-decoration'));
        const titleToolbarContainer = DOM.append(container, $('.cell-title-toolbar'));
        const focusIndicatorTop = new FastDomNode(DOM.append(container, $('.cell-focus-indicator.cell-focus-indicator-top')));
        const focusIndicatorLeft = new FastDomNode(DOM.append(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-left')));
        const foldingIndicator = DOM.append(focusIndicatorLeft.domNode, DOM.$('.notebook-folding-indicator'));
        const focusIndicatorRight = new FastDomNode(DOM.append(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-right')));
        const codeInnerContent = DOM.append(container, $('.cell.code'));
        const editorPart = DOM.append(codeInnerContent, $('.cell-editor-part'));
        const cellChatPart = DOM.append(editorPart, $('.cell-chat-part'));
        const cellInputCollapsedContainer = DOM.append(codeInnerContent, $('.input-collapse-container'));
        cellInputCollapsedContainer.style.display = 'none';
        const editorContainer = DOM.append(editorPart, $('.cell-editor-container'));
        editorPart.style.display = 'none';
        const cellCommentPartContainer = DOM.append(container, $('.cell-comment-container'));
        const innerContent = DOM.append(container, $('.cell.markdown'));
        const bottomCellContainer = DOM.append(container, $('.cell-bottom-toolbar-container'));
        const scopedInstaService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
        const rootClassDelegate = {
            toggle: (className, force) => container.classList.toggle(className, force)
        };
        const titleToolbar = templateDisposables.add(scopedInstaService.createInstance(CellTitleToolbarPart, titleToolbarContainer, rootClassDelegate, this.notebookEditor.creationOptions.menuIds.cellTitleToolbar, this.notebookEditor.creationOptions.menuIds.cellDeleteToolbar, this.notebookEditor));
        const focusIndicatorBottom = new FastDomNode(DOM.append(container, $('.cell-focus-indicator.cell-focus-indicator-bottom')));
        const cellParts = new CellPartsCollection(DOM.getWindow(rootContainer), [
            templateDisposables.add(scopedInstaService.createInstance(CellChatPart, this.notebookEditor, cellChatPart)),
            templateDisposables.add(scopedInstaService.createInstance(CellEditorStatusBar, this.notebookEditor, container, editorPart, undefined)),
            templateDisposables.add(new CellFocusIndicator(this.notebookEditor, titleToolbar, focusIndicatorTop, focusIndicatorLeft, focusIndicatorRight, focusIndicatorBottom)),
            templateDisposables.add(new FoldedCellHint(this.notebookEditor, DOM.append(container, $('.notebook-folded-hint')), this._notebookExecutionStateService)),
            templateDisposables.add(new CellDecorations(this.notebookEditor, rootContainer, decorationContainer)),
            templateDisposables.add(scopedInstaService.createInstance(CellComments, this.notebookEditor, cellCommentPartContainer)),
            templateDisposables.add(new CollapsedCellInput(this.notebookEditor, cellInputCollapsedContainer)),
            templateDisposables.add(new CellFocusPart(container, undefined, this.notebookEditor)),
            templateDisposables.add(new CellDragAndDropPart(container)),
            templateDisposables.add(scopedInstaService.createInstance(CellContextKeyPart, this.notebookEditor)),
        ], [
            titleToolbar,
            templateDisposables.add(scopedInstaService.createInstance(BetweenCellToolbar, this.notebookEditor, titleToolbarContainer, bottomCellContainer))
        ]);
        templateDisposables.add(cellParts);
        const templateData = {
            rootContainer,
            cellInputCollapsedContainer,
            instantiationService: scopedInstaService,
            container,
            cellContainer: innerContent,
            editorPart,
            editorContainer,
            foldingIndicator,
            templateDisposables,
            elementDisposables: new DisposableStore(),
            cellParts,
            toJSON: () => { return {}; }
        };
        return templateData;
    }
    renderElement(element, index, templateData, height) {
        if (!this.notebookEditor.hasModel()) {
            throw new Error('The notebook editor is not attached with view model yet.');
        }
        templateData.currentRenderedCell = element;
        templateData.currentEditor = undefined;
        templateData.editorPart.style.display = 'none';
        templateData.cellContainer.innerText = '';
        if (height === undefined) {
            return;
        }
        templateData.elementDisposables.add(templateData.instantiationService.createInstance(MarkupCell, this.notebookEditor, element, templateData, this.renderedEditors));
    }
    disposeTemplate(templateData) {
        templateData.elementDisposables.dispose();
        templateData.templateDisposables.dispose();
    }
    disposeElement(_element, _index, templateData) {
        templateData.elementDisposables.clear();
    }
};
MarkupCellRenderer = MarkupCellRenderer_1 = __decorate([
    __param(4, IConfigurationService),
    __param(5, IInstantiationService),
    __param(6, IContextMenuService),
    __param(7, IMenuService),
    __param(8, IKeybindingService),
    __param(9, INotificationService),
    __param(10, INotebookExecutionStateService)
], MarkupCellRenderer);
export { MarkupCellRenderer };
let CodeCellRenderer = class CodeCellRenderer extends AbstractCellRenderer {
    static { CodeCellRenderer_1 = this; }
    static { this.TEMPLATE_ID = 'code_cell'; }
    constructor(notebookEditor, renderedEditors, editorPool, dndController, contextKeyServiceProvider, configurationService, contextMenuService, menuService, instantiationService, keybindingService, notificationService) {
        super(instantiationService, notebookEditor, contextMenuService, menuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, PLAINTEXT_LANGUAGE_ID, dndController);
        this.renderedEditors = renderedEditors;
        this.editorPool = editorPool;
    }
    get templateId() {
        return CodeCellRenderer_1.TEMPLATE_ID;
    }
    renderTemplate(rootContainer) {
        rootContainer.classList.add('code-cell-row');
        const container = DOM.append(rootContainer, DOM.$('.cell-inner-container'));
        const templateDisposables = new DisposableStore();
        const contextKeyService = templateDisposables.add(this.contextKeyServiceProvider(container));
        const decorationContainer = DOM.append(rootContainer, $('.cell-decoration'));
        const focusIndicatorTop = new FastDomNode(DOM.append(container, $('.cell-focus-indicator.cell-focus-indicator-top')));
        const titleToolbarContainer = DOM.append(container, $('.cell-title-toolbar'));
        // This is also the drag handle
        const focusIndicatorLeft = new FastDomNode(DOM.append(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-left')));
        const cellChatPart = DOM.append(container, $('.cell-chat-part'));
        const cellContainer = DOM.append(container, $('.cell.code'));
        const runButtonContainer = DOM.append(cellContainer, $('.run-button-container'));
        const cellInputCollapsedContainer = DOM.append(cellContainer, $('.input-collapse-container'));
        cellInputCollapsedContainer.style.display = 'none';
        const executionOrderLabel = DOM.append(focusIndicatorLeft.domNode, $('div.execution-count-label'));
        executionOrderLabel.title = localize('cellExecutionOrderCountLabel', 'Execution Order');
        const editorPart = DOM.append(cellContainer, $('.cell-editor-part'));
        const editorContainer = DOM.append(editorPart, $('.cell-editor-container'));
        const cellCommentPartContainer = DOM.append(container, $('.cell-comment-container'));
        // create a special context key service that set the inCompositeEditor-contextkey
        const editorContextKeyService = templateDisposables.add(this.contextKeyServiceProvider(editorPart));
        const editorInstaService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, editorContextKeyService])));
        EditorContextKeys.inCompositeEditor.bindTo(editorContextKeyService).set(true);
        const editor = editorInstaService.createInstance(CodeEditorWidget, editorContainer, {
            ...this.editorOptions.getDefaultValue(),
            dimension: {
                width: 0,
                height: 0
            },
            scrollbar: {
                vertical: 'hidden',
                horizontal: 'auto',
                handleMouseWheel: false,
                useShadows: false,
            },
        }, {
            contributions: this.notebookEditor.creationOptions.cellEditorContributions
        });
        templateDisposables.add(editor);
        const outputContainer = new FastDomNode(DOM.append(container, $('.output')));
        const cellOutputCollapsedContainer = DOM.append(outputContainer.domNode, $('.output-collapse-container'));
        const outputShowMoreContainer = new FastDomNode(DOM.append(container, $('.output-show-more-container')));
        const focusIndicatorRight = new FastDomNode(DOM.append(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-right')));
        const focusSinkElement = DOM.append(container, $('.cell-editor-focus-sink'));
        focusSinkElement.setAttribute('tabindex', '0');
        const bottomCellToolbarContainer = DOM.append(container, $('.cell-bottom-toolbar-container'));
        const focusIndicatorBottom = new FastDomNode(DOM.append(container, $('.cell-focus-indicator.cell-focus-indicator-bottom')));
        const scopedInstaService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
        const rootClassDelegate = {
            toggle: (className, force) => container.classList.toggle(className, force)
        };
        const titleToolbar = templateDisposables.add(scopedInstaService.createInstance(CellTitleToolbarPart, titleToolbarContainer, rootClassDelegate, this.notebookEditor.creationOptions.menuIds.cellTitleToolbar, this.notebookEditor.creationOptions.menuIds.cellDeleteToolbar, this.notebookEditor));
        const focusIndicatorPart = templateDisposables.add(new CellFocusIndicator(this.notebookEditor, titleToolbar, focusIndicatorTop, focusIndicatorLeft, focusIndicatorRight, focusIndicatorBottom));
        const contentParts = [
            focusIndicatorPart,
            templateDisposables.add(scopedInstaService.createInstance(CellChatPart, this.notebookEditor, cellChatPart)),
            templateDisposables.add(scopedInstaService.createInstance(CellEditorStatusBar, this.notebookEditor, container, editorPart, editor)),
            templateDisposables.add(scopedInstaService.createInstance(CellProgressBar, editorPart, cellInputCollapsedContainer)),
            templateDisposables.add(new CellDecorations(this.notebookEditor, rootContainer, decorationContainer)),
            templateDisposables.add(scopedInstaService.createInstance(CellComments, this.notebookEditor, cellCommentPartContainer)),
            templateDisposables.add(scopedInstaService.createInstance(CellExecutionPart, this.notebookEditor, executionOrderLabel)),
            templateDisposables.add(scopedInstaService.createInstance(CollapsedCellOutput, this.notebookEditor, cellOutputCollapsedContainer)),
            templateDisposables.add(new CollapsedCellInput(this.notebookEditor, cellInputCollapsedContainer)),
            templateDisposables.add(new CellFocusPart(container, focusSinkElement, this.notebookEditor)),
            templateDisposables.add(new CellDragAndDropPart(container)),
            templateDisposables.add(scopedInstaService.createInstance(CellContextKeyPart, this.notebookEditor)),
        ];
        const { cellExecutePrimary, cellExecuteToolbar } = this.notebookEditor.creationOptions.menuIds;
        if (cellExecutePrimary && cellExecuteToolbar) {
            contentParts.push(templateDisposables.add(scopedInstaService.createInstance(RunToolbar, this.notebookEditor, contextKeyService, container, runButtonContainer, cellExecutePrimary, cellExecuteToolbar)));
        }
        const cellParts = new CellPartsCollection(DOM.getWindow(rootContainer), contentParts, [
            titleToolbar,
            templateDisposables.add(scopedInstaService.createInstance(BetweenCellToolbar, this.notebookEditor, titleToolbarContainer, bottomCellToolbarContainer))
        ]);
        templateDisposables.add(cellParts);
        const templateData = {
            rootContainer,
            editorPart,
            cellInputCollapsedContainer,
            cellOutputCollapsedContainer,
            instantiationService: scopedInstaService,
            container,
            cellContainer,
            focusSinkElement,
            outputContainer,
            outputShowMoreContainer,
            editor,
            templateDisposables,
            elementDisposables: new DisposableStore(),
            cellParts,
            toJSON: () => { return {}; }
        };
        // focusIndicatorLeft covers the left margin area
        // code/outputFocusIndicator need to be registered as drag handlers so their click handlers don't take over
        const dragHandles = [focusIndicatorLeft.domNode, focusIndicatorPart.codeFocusIndicator.domNode, focusIndicatorPart.outputFocusIndicator.domNode];
        this.dndController?.registerDragHandle(templateData, rootContainer, dragHandles, () => new CodeCellDragImageRenderer().getDragImage(templateData, templateData.editor, 'code'));
        return templateData;
    }
    renderElement(element, index, templateData, height) {
        if (!this.notebookEditor.hasModel()) {
            throw new Error('The notebook editor is not attached with view model yet.');
        }
        templateData.currentRenderedCell = element;
        if (height === undefined) {
            return;
        }
        templateData.outputContainer.domNode.innerText = '';
        templateData.outputContainer.domNode.appendChild(templateData.cellOutputCollapsedContainer);
        templateData.elementDisposables.add(templateData.instantiationService.createInstance(CodeCell, this.notebookEditor, element, templateData, this.editorPool));
        this.renderedEditors.set(element, templateData.editor);
    }
    disposeTemplate(templateData) {
        templateData.templateDisposables.clear();
    }
    disposeElement(element, index, templateData, height) {
        templateData.elementDisposables.clear();
        this.renderedEditors.delete(element);
    }
};
CodeCellRenderer = CodeCellRenderer_1 = __decorate([
    __param(5, IConfigurationService),
    __param(6, IContextMenuService),
    __param(7, IMenuService),
    __param(8, IInstantiationService),
    __param(9, IKeybindingService),
    __param(10, INotificationService)
], CodeCellRenderer);
export { CodeCellRenderer };
