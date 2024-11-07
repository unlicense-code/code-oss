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
var DebugHoverWidget_1;
import * as dom from '../../../../base/browser/dom.js';
import { DomScrollableElement } from '../../../../base/browser/ui/scrollbar/scrollableElement.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import * as lifecycle from '../../../../base/common/lifecycle.js';
import { clamp } from '../../../../base/common/numbers.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { Range } from '../../../../editor/common/core/range.js';
import { ModelDecorationOptions } from '../../../../editor/common/model/textModel.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import * as nls from '../../../../nls.js';
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { WorkbenchAsyncDataTree } from '../../../../platform/list/browser/listService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { asCssVariable, editorHoverBackground, editorHoverBorder, editorHoverForeground } from '../../../../platform/theme/common/colorRegistry.js';
import { IDebugService } from '../common/debug.js';
import { Expression, Variable, VisualizedExpression } from '../common/debugModel.js';
import { getEvaluatableExpressionAtPosition } from '../common/debugUtils.js';
import { AbstractExpressionDataSource } from './baseDebugView.js';
import { DebugExpressionRenderer } from './debugExpressionRenderer.js';
import { VariablesRenderer, VisualizedVariableRenderer, openContextMenuForVariableTreeElement } from './variablesView.js';
const $ = dom.$;
export var ShowDebugHoverResult;
(function (ShowDebugHoverResult) {
    ShowDebugHoverResult[ShowDebugHoverResult["NOT_CHANGED"] = 0] = "NOT_CHANGED";
    ShowDebugHoverResult[ShowDebugHoverResult["NOT_AVAILABLE"] = 1] = "NOT_AVAILABLE";
    ShowDebugHoverResult[ShowDebugHoverResult["CANCELLED"] = 2] = "CANCELLED";
})(ShowDebugHoverResult || (ShowDebugHoverResult = {}));
async function doFindExpression(container, namesToFind) {
    if (!container) {
        return null;
    }
    const children = await container.getChildren();
    // look for our variable in the list. First find the parents of the hovered variable if there are any.
    const filtered = children.filter(v => namesToFind[0] === v.name);
    if (filtered.length !== 1) {
        return null;
    }
    if (namesToFind.length === 1) {
        return filtered[0];
    }
    else {
        return doFindExpression(filtered[0], namesToFind.slice(1));
    }
}
export async function findExpressionInStackFrame(stackFrame, namesToFind) {
    const scopes = await stackFrame.getScopes();
    const nonExpensive = scopes.filter(s => !s.expensive);
    const expressions = coalesce(await Promise.all(nonExpensive.map(scope => doFindExpression(scope, namesToFind))));
    // only show if all expressions found have the same value
    return expressions.length > 0 && expressions.every(e => e.value === expressions[0].value) ? expressions[0] : undefined;
}
let DebugHoverWidget = class DebugHoverWidget {
    static { DebugHoverWidget_1 = this; }
    static { this.ID = 'debug.hoverWidget'; }
    get isShowingComplexValue() {
        return this.complexValueContainer?.hidden === false;
    }
    constructor(editor, debugService, instantiationService, menuService, contextKeyService, contextMenuService) {
        this.editor = editor;
        this.debugService = debugService;
        this.instantiationService = instantiationService;
        this.menuService = menuService;
        this.contextKeyService = contextKeyService;
        this.contextMenuService = contextMenuService;
        // editor.IContentWidget.allowEditorOverflow
        this.allowEditorOverflow = true;
        this.highlightDecorations = this.editor.createDecorationsCollection();
        this.isUpdatingTree = false;
        this.toDispose = [];
        this.showAtPosition = null;
        this.positionPreference = [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */];
        this.debugHoverComputer = this.instantiationService.createInstance(DebugHoverComputer, this.editor);
        this.expressionRenderer = this.instantiationService.createInstance(DebugExpressionRenderer);
    }
    create() {
        this.domNode = $('.debug-hover-widget');
        this.complexValueContainer = dom.append(this.domNode, $('.complex-value'));
        this.complexValueTitle = dom.append(this.complexValueContainer, $('.title'));
        this.treeContainer = dom.append(this.complexValueContainer, $('.debug-hover-tree'));
        this.treeContainer.setAttribute('role', 'tree');
        const tip = dom.append(this.complexValueContainer, $('.tip'));
        tip.textContent = nls.localize({ key: 'quickTip', comment: ['"switch to editor language hover" means to show the programming language hover widget instead of the debug hover'] }, 'Hold {0} key to switch to editor language hover', isMacintosh ? 'Option' : 'Alt');
        const dataSource = this.instantiationService.createInstance(DebugHoverDataSource);
        this.tree = this.instantiationService.createInstance(WorkbenchAsyncDataTree, 'DebugHover', this.treeContainer, new DebugHoverDelegate(), [
            this.instantiationService.createInstance(VariablesRenderer, this.expressionRenderer),
            this.instantiationService.createInstance(VisualizedVariableRenderer, this.expressionRenderer),
        ], dataSource, {
            accessibilityProvider: new DebugHoverAccessibilityProvider(),
            mouseSupport: false,
            horizontalScrolling: true,
            useShadows: false,
            keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.name },
            overrideStyles: {
                listBackground: editorHoverBackground
            }
        });
        this.toDispose.push(VisualizedVariableRenderer.rendererOnVisualizationRange(this.debugService.getViewModel(), this.tree));
        this.valueContainer = $('.value');
        this.valueContainer.tabIndex = 0;
        this.valueContainer.setAttribute('role', 'tooltip');
        this.scrollbar = new DomScrollableElement(this.valueContainer, { horizontal: 2 /* ScrollbarVisibility.Hidden */ });
        this.domNode.appendChild(this.scrollbar.getDomNode());
        this.toDispose.push(this.scrollbar);
        this.editor.applyFontInfo(this.domNode);
        this.domNode.style.backgroundColor = asCssVariable(editorHoverBackground);
        this.domNode.style.border = `1px solid ${asCssVariable(editorHoverBorder)}`;
        this.domNode.style.color = asCssVariable(editorHoverForeground);
        this.toDispose.push(this.tree.onContextMenu(async (e) => await this.onContextMenu(e)));
        this.toDispose.push(this.tree.onDidChangeContentHeight(() => {
            if (!this.isUpdatingTree) {
                // Don't do a layout in the middle of the async setInput
                this.layoutTreeAndContainer();
            }
        }));
        this.toDispose.push(this.tree.onDidChangeContentWidth(() => {
            if (!this.isUpdatingTree) {
                // Don't do a layout in the middle of the async setInput
                this.layoutTreeAndContainer();
            }
        }));
        this.registerListeners();
        this.editor.addContentWidget(this);
    }
    async onContextMenu(e) {
        const variable = e.element;
        if (!(variable instanceof Variable) || !variable.value) {
            return;
        }
        return openContextMenuForVariableTreeElement(this.contextKeyService, this.menuService, this.contextMenuService, MenuId.DebugHoverContext, e);
    }
    registerListeners() {
        this.toDispose.push(dom.addStandardDisposableListener(this.domNode, 'keydown', (e) => {
            if (e.equals(9 /* KeyCode.Escape */)) {
                this.hide();
            }
        }));
        this.toDispose.push(this.editor.onDidChangeConfiguration((e) => {
            if (e.hasChanged(52 /* EditorOption.fontInfo */)) {
                this.editor.applyFontInfo(this.domNode);
            }
        }));
        this.toDispose.push(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
            if (e instanceof Variable && this.tree.hasNode(e)) {
                await this.tree.updateChildren(e, false, true);
                await this.tree.expand(e);
            }
        }));
    }
    isHovered() {
        return !!this.domNode?.matches(':hover');
    }
    isVisible() {
        return !!this._isVisible;
    }
    willBeVisible() {
        return !!this.showCancellationSource;
    }
    getId() {
        return DebugHoverWidget_1.ID;
    }
    getDomNode() {
        return this.domNode;
    }
    /**
     * Gets whether the given coordinates are in the safe triangle formed from
     * the position at which the hover was initiated.
     */
    isInSafeTriangle(x, y) {
        return this._isVisible && !!this.safeTriangle?.contains(x, y);
    }
    async showAt(position, focus, mouseEvent) {
        this.showCancellationSource?.dispose(true);
        const cancellationSource = this.showCancellationSource = new CancellationTokenSource();
        const session = this.debugService.getViewModel().focusedSession;
        if (!session || !this.editor.hasModel()) {
            this.hide();
            return 1 /* ShowDebugHoverResult.NOT_AVAILABLE */;
        }
        const result = await this.debugHoverComputer.compute(position, cancellationSource.token);
        if (cancellationSource.token.isCancellationRequested) {
            this.hide();
            return 2 /* ShowDebugHoverResult.CANCELLED */;
        }
        if (!result.range) {
            this.hide();
            return 1 /* ShowDebugHoverResult.NOT_AVAILABLE */;
        }
        if (this.isVisible() && !result.rangeChanged) {
            return 0 /* ShowDebugHoverResult.NOT_CHANGED */;
        }
        const expression = await this.debugHoverComputer.evaluate(session);
        if (cancellationSource.token.isCancellationRequested) {
            this.hide();
            return 2 /* ShowDebugHoverResult.CANCELLED */;
        }
        if (!expression || (expression instanceof Expression && !expression.available)) {
            this.hide();
            return 1 /* ShowDebugHoverResult.NOT_AVAILABLE */;
        }
        this.highlightDecorations.set([{
                range: result.range,
                options: DebugHoverWidget_1._HOVER_HIGHLIGHT_DECORATION_OPTIONS
            }]);
        return this.doShow(session, result.range.getStartPosition(), expression, focus, mouseEvent);
    }
    static { this._HOVER_HIGHLIGHT_DECORATION_OPTIONS = ModelDecorationOptions.register({
        description: 'bdebug-hover-highlight',
        className: 'hoverHighlight'
    }); }
    async doShow(session, position, expression, focus, mouseEvent) {
        if (!this.domNode) {
            this.create();
        }
        this.showAtPosition = position;
        const store = new lifecycle.DisposableStore();
        this._isVisible = { store };
        if (!expression.hasChildren) {
            this.complexValueContainer.hidden = true;
            this.valueContainer.hidden = false;
            store.add(this.expressionRenderer.renderValue(this.valueContainer, expression, {
                showChanged: false,
                colorize: true,
                hover: false,
                session,
            }));
            this.valueContainer.title = '';
            this.editor.layoutContentWidget(this);
            this.safeTriangle = mouseEvent && new dom.SafeTriangle(mouseEvent.posx, mouseEvent.posy, this.domNode);
            this.scrollbar.scanDomNode();
            if (focus) {
                this.editor.render();
                this.valueContainer.focus();
            }
            return undefined;
        }
        this.valueContainer.hidden = true;
        this.expressionToRender = expression;
        store.add(this.expressionRenderer.renderValue(this.complexValueTitle, expression, { hover: false, session }));
        this.editor.layoutContentWidget(this);
        this.safeTriangle = mouseEvent && new dom.SafeTriangle(mouseEvent.posx, mouseEvent.posy, this.domNode);
        this.tree.scrollTop = 0;
        this.tree.scrollLeft = 0;
        this.complexValueContainer.hidden = false;
        if (focus) {
            this.editor.render();
            this.tree.domFocus();
        }
    }
    layoutTreeAndContainer() {
        this.layoutTree();
        this.editor.layoutContentWidget(this);
    }
    layoutTree() {
        const scrollBarHeight = 10;
        let maxHeightToAvoidCursorOverlay = Infinity;
        if (this.showAtPosition) {
            const editorTop = this.editor.getDomNode()?.offsetTop || 0;
            const containerTop = this.treeContainer.offsetTop + editorTop;
            const hoveredCharTop = this.editor.getTopForLineNumber(this.showAtPosition.lineNumber, true) - this.editor.getScrollTop();
            if (containerTop < hoveredCharTop) {
                maxHeightToAvoidCursorOverlay = hoveredCharTop + editorTop - 22; // 22 is monaco top padding https://github.com/microsoft/vscode/blob/a1df2d7319382d42f66ad7f411af01e4cc49c80a/src/vs/editor/browser/viewParts/contentWidgets/contentWidgets.ts#L364
            }
        }
        const treeHeight = Math.min(Math.max(266, this.editor.getLayoutInfo().height * 0.55), this.tree.contentHeight + scrollBarHeight, maxHeightToAvoidCursorOverlay);
        const realTreeWidth = this.tree.contentWidth;
        const treeWidth = clamp(realTreeWidth, 400, 550);
        this.tree.layout(treeHeight, treeWidth);
        this.treeContainer.style.height = `${treeHeight}px`;
        this.scrollbar.scanDomNode();
    }
    beforeRender() {
        // beforeRender will be called each time the hover size changes, and the content widget is layed out again.
        if (this.expressionToRender) {
            const expression = this.expressionToRender;
            this.expressionToRender = undefined;
            // Do this in beforeRender once the content widget is no longer display=none so that its elements' sizes will be measured correctly.
            this.isUpdatingTree = true;
            this.tree.setInput(expression).finally(() => {
                this.isUpdatingTree = false;
            });
        }
        return null;
    }
    afterRender(positionPreference) {
        if (positionPreference) {
            // Remember where the editor placed you to keep position stable #109226
            this.positionPreference = [positionPreference];
        }
    }
    hide() {
        if (this.showCancellationSource) {
            this.showCancellationSource.dispose(true);
            this.showCancellationSource = undefined;
        }
        if (!this._isVisible) {
            return;
        }
        if (dom.isAncestorOfActiveElement(this.domNode)) {
            this.editor.focus();
        }
        this._isVisible.store.dispose();
        this._isVisible = undefined;
        this.highlightDecorations.clear();
        this.editor.layoutContentWidget(this);
        this.positionPreference = [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */];
    }
    getPosition() {
        return this._isVisible ? {
            position: this.showAtPosition,
            preference: this.positionPreference
        } : null;
    }
    dispose() {
        this.toDispose = lifecycle.dispose(this.toDispose);
    }
};
DebugHoverWidget = DebugHoverWidget_1 = __decorate([
    __param(1, IDebugService),
    __param(2, IInstantiationService),
    __param(3, IMenuService),
    __param(4, IContextKeyService),
    __param(5, IContextMenuService)
], DebugHoverWidget);
export { DebugHoverWidget };
class DebugHoverAccessibilityProvider {
    getWidgetAriaLabel() {
        return nls.localize('treeAriaLabel', "Debug Hover");
    }
    getAriaLabel(element) {
        return nls.localize({ key: 'variableAriaLabel', comment: ['Do not translate placeholders. Placeholders are name and value of a variable.'] }, "{0}, value {1}, variables, debug", element.name, element.value);
    }
}
class DebugHoverDataSource extends AbstractExpressionDataSource {
    hasChildren(element) {
        return element.hasChildren;
    }
    doGetChildren(element) {
        return element.getChildren();
    }
}
class DebugHoverDelegate {
    getHeight(element) {
        return 18;
    }
    getTemplateId(element) {
        if (element instanceof VisualizedExpression) {
            return VisualizedVariableRenderer.ID;
        }
        return VariablesRenderer.ID;
    }
}
let DebugHoverComputer = class DebugHoverComputer {
    constructor(editor, debugService, languageFeaturesService, logService) {
        this.editor = editor;
        this.debugService = debugService;
        this.languageFeaturesService = languageFeaturesService;
        this.logService = logService;
    }
    async compute(position, token) {
        const session = this.debugService.getViewModel().focusedSession;
        if (!session || !this.editor.hasModel()) {
            return { rangeChanged: false };
        }
        const model = this.editor.getModel();
        const result = await getEvaluatableExpressionAtPosition(this.languageFeaturesService, model, position, token);
        if (!result) {
            return { rangeChanged: false };
        }
        const { range, matchingExpression } = result;
        const rangeChanged = !this._current?.range.equalsRange(range);
        this._current = { expression: matchingExpression, range: Range.lift(range) };
        return { rangeChanged, range: this._current.range };
    }
    async evaluate(session) {
        if (!this._current) {
            this.logService.error('No expression to evaluate');
            return;
        }
        const textModel = this.editor.getModel();
        const debugSource = textModel && session.getSourceForUri(textModel?.uri);
        if (session.capabilities.supportsEvaluateForHovers) {
            const expression = new Expression(this._current.expression);
            await expression.evaluate(session, this.debugService.getViewModel().focusedStackFrame, 'hover', undefined, debugSource ? {
                line: this._current.range.startLineNumber,
                column: this._current.range.startColumn,
                source: debugSource.raw,
            } : undefined);
            return expression;
        }
        else {
            const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
            if (focusedStackFrame) {
                return await findExpressionInStackFrame(focusedStackFrame, coalesce(this._current.expression.split('.').map(word => word.trim())));
            }
        }
        return undefined;
    }
};
DebugHoverComputer = __decorate([
    __param(1, IDebugService),
    __param(2, ILanguageFeaturesService),
    __param(3, ILogService)
], DebugHoverComputer);
