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
var ContentHoverController_1;
import { DECREASE_HOVER_VERBOSITY_ACTION_ID, INCREASE_HOVER_VERBOSITY_ACTION_ID, SHOW_OR_FOCUS_HOVER_ACTION_ID } from './hoverActionIds.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { InlineSuggestionHintsContentWidget } from '../../inlineCompletions/browser/hintsWidget/inlineCompletionsHintsWidget.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { isMousePositionWithinElement } from './hoverUtils.js';
import { ContentHoverWidgetWrapper } from './contentHoverWidgetWrapper.js';
import './hover.css';
import { Emitter } from '../../../../base/common/event.js';
import { isOnColorDecorator } from '../../colorPicker/browser/hoverColorPicker/hoverColorPickerContribution.js';
// sticky hover widget which doesn't disappear on focus out and such
const _sticky = false;
let ContentHoverController = class ContentHoverController extends Disposable {
    static { ContentHoverController_1 = this; }
    static { this.ID = 'editor.contrib.contentHover'; }
    constructor(_editor, _instantiationService, _keybindingService) {
        super();
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this._keybindingService = _keybindingService;
        this._onHoverContentsChanged = this._register(new Emitter());
        this.onHoverContentsChanged = this._onHoverContentsChanged.event;
        this.shouldKeepOpenOnEditorMouseMoveOrLeave = false;
        this._listenersStore = new DisposableStore();
        this._isMouseDown = false;
        this._reactToEditorMouseMoveRunner = this._register(new RunOnceScheduler(() => this._reactToEditorMouseMove(this._mouseMoveEvent), 0));
        this._hookListeners();
        this._register(this._editor.onDidChangeConfiguration((e) => {
            if (e.hasChanged(62 /* EditorOption.hover */)) {
                this._unhookListeners();
                this._hookListeners();
            }
        }));
    }
    static get(editor) {
        return editor.getContribution(ContentHoverController_1.ID);
    }
    _hookListeners() {
        const hoverOpts = this._editor.getOption(62 /* EditorOption.hover */);
        this._hoverSettings = {
            enabled: hoverOpts.enabled,
            sticky: hoverOpts.sticky,
            hidingDelay: hoverOpts.hidingDelay
        };
        if (hoverOpts.enabled) {
            this._listenersStore.add(this._editor.onMouseDown((e) => this._onEditorMouseDown(e)));
            this._listenersStore.add(this._editor.onMouseUp(() => this._onEditorMouseUp()));
            this._listenersStore.add(this._editor.onMouseMove((e) => this._onEditorMouseMove(e)));
            this._listenersStore.add(this._editor.onKeyDown((e) => this._onKeyDown(e)));
            this._listenersStore.add(this._editor.onMouseLeave((e) => this._onEditorMouseLeave(e)));
            this._listenersStore.add(this._editor.onDidChangeModel(() => this._cancelSchedulerAndHide()));
            this._listenersStore.add(this._editor.onDidChangeModelContent(() => this._cancelScheduler()));
            this._listenersStore.add(this._editor.onDidScrollChange((e) => this._onEditorScrollChanged(e)));
        }
        else {
            this._cancelSchedulerAndHide();
        }
    }
    _unhookListeners() {
        this._listenersStore.clear();
    }
    _cancelSchedulerAndHide() {
        this._cancelScheduler();
        this.hideContentHover();
    }
    _cancelScheduler() {
        this._mouseMoveEvent = undefined;
        this._reactToEditorMouseMoveRunner.cancel();
    }
    _onEditorScrollChanged(e) {
        if (e.scrollTopChanged || e.scrollLeftChanged) {
            this.hideContentHover();
        }
    }
    _onEditorMouseDown(mouseEvent) {
        this._isMouseDown = true;
        const shouldKeepHoverWidgetVisible = this._shouldKeepHoverWidgetVisible(mouseEvent);
        if (shouldKeepHoverWidgetVisible) {
            return;
        }
        this.hideContentHover();
    }
    _shouldKeepHoverWidgetVisible(mouseEvent) {
        return this._isMouseOnContentHoverWidget(mouseEvent) || this._isContentWidgetResizing() || isOnColorDecorator(mouseEvent);
    }
    _isMouseOnContentHoverWidget(mouseEvent) {
        if (!this._contentWidget) {
            return false;
        }
        return isMousePositionWithinElement(this._contentWidget.getDomNode(), mouseEvent.event.posx, mouseEvent.event.posy);
    }
    _onEditorMouseUp() {
        this._isMouseDown = false;
    }
    _onEditorMouseLeave(mouseEvent) {
        if (this.shouldKeepOpenOnEditorMouseMoveOrLeave) {
            return;
        }
        this._cancelScheduler();
        const shouldKeepHoverWidgetVisible = this._shouldKeepHoverWidgetVisible(mouseEvent);
        if (shouldKeepHoverWidgetVisible) {
            return;
        }
        if (_sticky) {
            return;
        }
        this.hideContentHover();
    }
    _shouldNotRecomputeCurrentHoverWidget(mouseEvent) {
        const isHoverSticky = this._hoverSettings.sticky;
        const isMouseOnStickyContentHoverWidget = (mouseEvent, isHoverSticky) => {
            const isMouseOnContentHoverWidget = this._isMouseOnContentHoverWidget(mouseEvent);
            return isHoverSticky && isMouseOnContentHoverWidget;
        };
        const isMouseOnColorPicker = (mouseEvent) => {
            const isMouseOnContentHoverWidget = this._isMouseOnContentHoverWidget(mouseEvent);
            const isColorPickerVisible = this._contentWidget?.isColorPickerVisible ?? false;
            return isMouseOnContentHoverWidget && isColorPickerVisible;
        };
        // TODO@aiday-mar verify if the following is necessary code
        const isTextSelectedWithinContentHoverWidget = (mouseEvent, sticky) => {
            return (sticky
                && this._contentWidget?.containsNode(mouseEvent.event.browserEvent.view?.document.activeElement)
                && !mouseEvent.event.browserEvent.view?.getSelection()?.isCollapsed) ?? false;
        };
        return isMouseOnStickyContentHoverWidget(mouseEvent, isHoverSticky)
            || isMouseOnColorPicker(mouseEvent)
            || isTextSelectedWithinContentHoverWidget(mouseEvent, isHoverSticky);
    }
    _onEditorMouseMove(mouseEvent) {
        const shouldReactToEditorMouseMove = this._shouldReactToEditorMouseMove(mouseEvent);
        if (!shouldReactToEditorMouseMove) {
            return;
        }
        const shouldRescheduleHoverComputation = this._shouldRescheduleHoverComputation();
        if (shouldRescheduleHoverComputation) {
            if (!this._reactToEditorMouseMoveRunner.isScheduled()) {
                this._reactToEditorMouseMoveRunner.schedule(this._hoverSettings.hidingDelay);
            }
            return;
        }
        this._reactToEditorMouseMove(mouseEvent);
    }
    _shouldReactToEditorMouseMove(mouseEvent) {
        if (this.shouldKeepOpenOnEditorMouseMoveOrLeave) {
            return false;
        }
        this._mouseMoveEvent = mouseEvent;
        if (this._contentWidget && (this._contentWidget.isFocused || this._contentWidget.isResizing || this._isMouseDown && this._contentWidget.isColorPickerVisible)) {
            return false;
        }
        const sticky = this._hoverSettings.sticky;
        if (sticky && this._contentWidget?.isVisibleFromKeyboard) {
            // Sticky mode is on and the hover has been shown via keyboard
            // so moving the mouse has no effect
            return false;
        }
        const shouldNotRecomputeCurrentHoverWidget = this._shouldNotRecomputeCurrentHoverWidget(mouseEvent);
        if (shouldNotRecomputeCurrentHoverWidget) {
            this._reactToEditorMouseMoveRunner.cancel();
            return false;
        }
        return true;
    }
    _shouldRescheduleHoverComputation() {
        const hidingDelay = this._hoverSettings.hidingDelay;
        const isContentHoverWidgetVisible = this._contentWidget?.isVisible ?? false;
        // If the mouse is not over the widget, and if sticky is on,
        // then give it a grace period before reacting to the mouse event
        return isContentHoverWidgetVisible && this._hoverSettings.sticky && hidingDelay > 0;
    }
    _reactToEditorMouseMove(mouseEvent) {
        if (!mouseEvent) {
            return;
        }
        const contentWidget = this._getOrCreateContentWidget();
        if (contentWidget.showsOrWillShow(mouseEvent)) {
            return;
        }
        if (_sticky) {
            return;
        }
        this.hideContentHover();
    }
    _onKeyDown(e) {
        if (!this._editor.hasModel()) {
            return;
        }
        const isPotentialKeyboardShortcut = this._isPotentialKeyboardShortcut(e);
        const isModifierKeyPressed = this._isModifierKeyPressed(e);
        if (isPotentialKeyboardShortcut || isModifierKeyPressed) {
            return;
        }
        this.hideContentHover();
    }
    _isPotentialKeyboardShortcut(e) {
        if (!this._editor.hasModel() || !this._contentWidget) {
            return false;
        }
        const resolvedKeyboardEvent = this._keybindingService.softDispatch(e, this._editor.getDomNode());
        const moreChordsAreNeeded = resolvedKeyboardEvent.kind === 1 /* ResultKind.MoreChordsNeeded */;
        const isHoverAction = resolvedKeyboardEvent.kind === 2 /* ResultKind.KbFound */
            && (resolvedKeyboardEvent.commandId === SHOW_OR_FOCUS_HOVER_ACTION_ID
                || resolvedKeyboardEvent.commandId === INCREASE_HOVER_VERBOSITY_ACTION_ID
                || resolvedKeyboardEvent.commandId === DECREASE_HOVER_VERBOSITY_ACTION_ID)
            && this._contentWidget.isVisible;
        return moreChordsAreNeeded || isHoverAction;
    }
    _isModifierKeyPressed(e) {
        return e.keyCode === 5 /* KeyCode.Ctrl */
            || e.keyCode === 6 /* KeyCode.Alt */
            || e.keyCode === 57 /* KeyCode.Meta */
            || e.keyCode === 4 /* KeyCode.Shift */;
    }
    hideContentHover() {
        if (_sticky) {
            return;
        }
        if (InlineSuggestionHintsContentWidget.dropDownVisible) {
            return;
        }
        this._contentWidget?.hide();
    }
    _getOrCreateContentWidget() {
        if (!this._contentWidget) {
            this._contentWidget = this._instantiationService.createInstance(ContentHoverWidgetWrapper, this._editor);
            this._listenersStore.add(this._contentWidget.onContentsChanged(() => this._onHoverContentsChanged.fire()));
        }
        return this._contentWidget;
    }
    showContentHover(range, mode, source, focus) {
        this._getOrCreateContentWidget().startShowingAtRange(range, mode, source, focus);
    }
    _isContentWidgetResizing() {
        return this._contentWidget?.widget.isResizing || false;
    }
    focusedHoverPartIndex() {
        return this._getOrCreateContentWidget().focusedHoverPartIndex();
    }
    doesHoverAtIndexSupportVerbosityAction(index, action) {
        return this._getOrCreateContentWidget().doesHoverAtIndexSupportVerbosityAction(index, action);
    }
    updateHoverVerbosityLevel(action, index, focus) {
        this._getOrCreateContentWidget().updateHoverVerbosityLevel(action, index, focus);
    }
    focus() {
        this._contentWidget?.focus();
    }
    focusHoverPartWithIndex(index) {
        this._contentWidget?.focusHoverPartWithIndex(index);
    }
    scrollUp() {
        this._contentWidget?.scrollUp();
    }
    scrollDown() {
        this._contentWidget?.scrollDown();
    }
    scrollLeft() {
        this._contentWidget?.scrollLeft();
    }
    scrollRight() {
        this._contentWidget?.scrollRight();
    }
    pageUp() {
        this._contentWidget?.pageUp();
    }
    pageDown() {
        this._contentWidget?.pageDown();
    }
    goToTop() {
        this._contentWidget?.goToTop();
    }
    goToBottom() {
        this._contentWidget?.goToBottom();
    }
    getWidgetContent() {
        return this._contentWidget?.getWidgetContent();
    }
    getAccessibleWidgetContent() {
        return this._contentWidget?.getAccessibleWidgetContent();
    }
    getAccessibleWidgetContentAtIndex(index) {
        return this._contentWidget?.getAccessibleWidgetContentAtIndex(index);
    }
    get isColorPickerVisible() {
        return this._contentWidget?.isColorPickerVisible;
    }
    get isHoverVisible() {
        return this._contentWidget?.isVisible;
    }
    dispose() {
        super.dispose();
        this._unhookListeners();
        this._listenersStore.dispose();
        this._contentWidget?.dispose();
    }
};
ContentHoverController = ContentHoverController_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IKeybindingService)
], ContentHoverController);
export { ContentHoverController };
