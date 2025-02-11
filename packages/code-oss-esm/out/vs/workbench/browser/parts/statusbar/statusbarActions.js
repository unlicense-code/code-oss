/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize, localize2 } from '../../../../nls.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import { Action } from '../../../../base/common/actions.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { StatusBarFocused } from '../../../common/contextkeys.js';
import { getActiveWindow } from '../../../../base/browser/dom.js';
export class ToggleStatusbarEntryVisibilityAction extends Action {
    constructor(id, label, model) {
        super(id, label, undefined, true);
        this.model = model;
        this.checked = !model.isHidden(id);
    }
    async run() {
        if (this.model.isHidden(this.id)) {
            this.model.show(this.id);
        }
        else {
            this.model.hide(this.id);
        }
    }
}
export class HideStatusbarEntryAction extends Action {
    constructor(id, name, model) {
        super(id, localize('hide', "Hide '{0}'", name), undefined, true);
        this.model = model;
    }
    async run() {
        this.model.hide(this.id);
    }
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.statusBar.focusPrevious',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    primary: 15 /* KeyCode.LeftArrow */,
    secondary: [16 /* KeyCode.UpArrow */],
    when: StatusBarFocused,
    handler: (accessor) => {
        const statusBarService = accessor.get(IStatusbarService);
        statusBarService.focusPreviousEntry();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.statusBar.focusNext',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    primary: 17 /* KeyCode.RightArrow */,
    secondary: [18 /* KeyCode.DownArrow */],
    when: StatusBarFocused,
    handler: (accessor) => {
        const statusBarService = accessor.get(IStatusbarService);
        statusBarService.focusNextEntry();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.statusBar.focusFirst',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    primary: 14 /* KeyCode.Home */,
    when: StatusBarFocused,
    handler: (accessor) => {
        const statusBarService = accessor.get(IStatusbarService);
        statusBarService.focus(false);
        statusBarService.focusNextEntry();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.statusBar.focusLast',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    primary: 13 /* KeyCode.End */,
    when: StatusBarFocused,
    handler: (accessor) => {
        const statusBarService = accessor.get(IStatusbarService);
        statusBarService.focus(false);
        statusBarService.focusPreviousEntry();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.statusBar.clearFocus',
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    primary: 9 /* KeyCode.Escape */,
    when: StatusBarFocused,
    handler: (accessor) => {
        const statusBarService = accessor.get(IStatusbarService);
        const editorService = accessor.get(IEditorService);
        if (statusBarService.isEntryFocused()) {
            statusBarService.focus(false);
        }
        else if (editorService.activeEditorPane) {
            editorService.activeEditorPane.focus();
        }
    }
});
class FocusStatusBarAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.focusStatusBar',
            title: localize2('focusStatusBar', 'Focus Status Bar'),
            category: Categories.View,
            f1: true
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        layoutService.focusPart("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */, getActiveWindow());
    }
}
registerAction2(FocusStatusBarAction);
