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
var ChatEditorOverlayController_1;
import './media/chatEditorOverlay.css';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { autorun, observableFromEvent, observableSignal, observableValue } from '../../../../base/common/observable.js';
import { isEqual } from '../../../../base/common/resources.js';
import { MenuWorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IChatEditingService } from '../common/chatEditingService.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { ActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { ACTIVE_GROUP, IEditorService } from '../../../services/editor/common/editorService.js';
import { Range } from '../../../../editor/common/core/range.js';
import { getWindow, scheduleAtNextAnimationFrame } from '../../../../base/browser/dom.js';
let ChatEditorOverlayWidget = class ChatEditorOverlayWidget {
    constructor(_editor, editorService, instaService) {
        this._editor = _editor;
        this.allowEditorOverflow = false;
        this._isAdded = false;
        this._showStore = new DisposableStore();
        this._entry = observableValue(this, undefined);
        this._domNode = document.createElement('div');
        this._domNode.classList.add('chat-editor-overlay-widget');
        this._progressNode = document.createElement('div');
        this._progressNode.classList.add('chat-editor-overlay-progress');
        this._domNode.appendChild(this._progressNode);
        const toolbarNode = document.createElement('div');
        toolbarNode.classList.add('chat-editor-overlay-toolbar');
        this._domNode.appendChild(toolbarNode);
        this._toolbar = instaService.createInstance(MenuWorkbenchToolBar, toolbarNode, MenuId.ChatEditingEditorContent, {
            telemetrySource: 'chatEditor.overlayToolbar',
            toolbarOptions: {
                primaryGroup: () => true,
                useSeparatorsInPrimaryActions: true
            },
            menuOptions: { renderShortTitle: true },
            actionViewItemProvider: (action, options) => {
                const that = this;
                if (action.id === 'chatEditor.action.accept' || action.id === 'chatEditor.action.reject') {
                    return new class extends ActionViewItem {
                        constructor() {
                            super(undefined, action, { ...options, icon: false, label: true, keybindingNotRenderedWithLabel: true });
                            this._reveal = this._store.add(new MutableDisposable());
                        }
                        set actionRunner(actionRunner) {
                            super.actionRunner = actionRunner;
                            const store = new DisposableStore();
                            store.add(actionRunner.onWillRun(_e => {
                                that._editor.focus();
                            }));
                            store.add(actionRunner.onDidRun(e => {
                                if (e.action !== this.action) {
                                    return;
                                }
                                const d = that._entry.get();
                                if (!d || d.entry === d.next) {
                                    return;
                                }
                                const change = d.next.diffInfo.get().changes.at(0);
                                return editorService.openEditor({
                                    resource: d.next.modifiedURI,
                                    options: {
                                        selection: change && Range.fromPositions({ lineNumber: change.original.startLineNumber, column: 1 }),
                                        revealIfOpened: false,
                                        revealIfVisible: false,
                                    }
                                }, ACTIVE_GROUP);
                            }));
                            this._reveal.value = store;
                        }
                        get actionRunner() {
                            return super.actionRunner;
                        }
                    };
                }
                return undefined;
            }
        });
    }
    dispose() {
        this.hide();
        this._showStore.dispose();
        this._toolbar.dispose();
    }
    getId() {
        return 'chatEditorOverlayWidget';
    }
    getDomNode() {
        return this._domNode;
    }
    getPosition() {
        return { preference: 1 /* OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER */ };
    }
    show(entry, next) {
        this._showStore.clear();
        this._entry.set({ entry, next }, undefined);
        this._showStore.add(autorun(r => {
            const busy = entry.isCurrentlyBeingModified.read(r);
            this._domNode.classList.toggle('busy', busy);
        }));
        const slickRatio = ObservableAnimatedValue.const(0);
        let t = Date.now();
        this._showStore.add(autorun(r => {
            const value = entry.rewriteRatio.read(r);
            slickRatio.changeAnimation(prev => {
                const result = new AnimatedValue(prev.getValue(), value, Date.now() - t);
                t = Date.now();
                return result;
            }, undefined);
            const value2 = slickRatio.getValue(r);
            this._progressNode.innerText = `${Math.round(value2 * 100)}%`;
        }));
        if (!this._isAdded) {
            this._editor.addOverlayWidget(this);
            this._isAdded = true;
        }
    }
    hide() {
        this._entry.set(undefined, undefined);
        if (this._isAdded) {
            this._editor.removeOverlayWidget(this);
            this._isAdded = false;
            this._showStore.clear();
        }
    }
};
ChatEditorOverlayWidget = __decorate([
    __param(1, IEditorService),
    __param(2, IInstantiationService)
], ChatEditorOverlayWidget);
export class ObservableAnimatedValue {
    static const(value) {
        return new ObservableAnimatedValue(AnimatedValue.const(value));
    }
    constructor(initialValue) {
        this._value = observableValue(this, initialValue);
    }
    setAnimation(value, tx) {
        this._value.set(value, tx);
    }
    changeAnimation(fn, tx) {
        const value = fn(this._value.get());
        this._value.set(value, tx);
    }
    getValue(reader) {
        const value = this._value.read(reader);
        if (!value.isFinished()) {
            Scheduler.instance.invalidateOnNextAnimationFrame(reader);
        }
        return value.getValue();
    }
}
class Scheduler {
    constructor() {
        this._signal = observableSignal(this);
        this._isScheduled = false;
    }
    static { this.instance = new Scheduler(); }
    invalidateOnNextAnimationFrame(reader) {
        this._signal.read(reader);
        if (!this._isScheduled) {
            this._isScheduled = true;
            scheduleAtNextAnimationFrame(getWindow(undefined), () => {
                this._isScheduled = false;
                this._signal.trigger(undefined);
            });
        }
    }
}
class AnimatedValue {
    static const(value) {
        return new AnimatedValue(value, value, 0);
    }
    constructor(startValue, endValue, durationMs) {
        this.startValue = startValue;
        this.endValue = endValue;
        this.durationMs = durationMs;
        this.startTimeMs = Date.now();
        if (startValue === endValue) {
            this.durationMs = 0;
        }
    }
    isFinished() {
        return Date.now() >= this.startTimeMs + this.durationMs;
    }
    getValue() {
        const timePassed = Date.now() - this.startTimeMs;
        if (timePassed >= this.durationMs) {
            return this.endValue;
        }
        const value = easeOutExpo(timePassed, this.startValue, this.endValue - this.startValue, this.durationMs);
        return value;
    }
}
function easeOutExpo(passedTime, start, length, totalDuration) {
    return passedTime === totalDuration
        ? start + length
        : length * (-Math.pow(2, -10 * passedTime / totalDuration) + 1) + start;
}
let ChatEditorOverlayController = class ChatEditorOverlayController {
    static { ChatEditorOverlayController_1 = this; }
    static { this.ID = 'editor.contrib.chatOverlayController'; }
    static get(editor) {
        return editor.getContribution(ChatEditorOverlayController_1.ID);
    }
    constructor(_editor, chatEditingService, instaService) {
        this._editor = _editor;
        this._store = new DisposableStore();
        const modelObs = observableFromEvent(this._editor.onDidChangeModel, () => this._editor.getModel());
        const widget = instaService.createInstance(ChatEditorOverlayWidget, this._editor);
        this._store.add(autorun(r => {
            const model = modelObs.read(r);
            const session = chatEditingService.currentEditingSessionObs.read(r);
            if (!session || !model) {
                widget.hide();
                return;
            }
            const state = session.state.read(r);
            if (state === 3 /* ChatEditingSessionState.Disposed */) {
                widget.hide();
                return;
            }
            const entries = session.entries.read(r);
            const idx = entries.findIndex(e => isEqual(e.modifiedURI, model.uri));
            if (idx < 0) {
                widget.hide();
                return;
            }
            const isModifyingOrModified = entries.some(e => e.state.read(r) === 0 /* WorkingSetEntryState.Modified */ || e.isCurrentlyBeingModified.read(r));
            if (!isModifyingOrModified) {
                widget.hide();
                return;
            }
            const entry = entries[idx];
            widget.show(entry, entries[(idx + 1) % entries.length]);
        }));
    }
    dispose() {
        this._store.dispose();
    }
};
ChatEditorOverlayController = ChatEditorOverlayController_1 = __decorate([
    __param(1, IChatEditingService),
    __param(2, IInstantiationService)
], ChatEditorOverlayController);
export { ChatEditorOverlayController };
