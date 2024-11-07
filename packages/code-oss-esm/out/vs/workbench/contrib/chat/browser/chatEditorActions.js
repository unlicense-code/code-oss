/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { localize2 } from '../../../../nls.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { CHAT_CATEGORY } from './actions/chatActions.js';
import { ChatEditorController, ctxHasEditorModification } from './chatEditorController.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
import { ACTIVE_GROUP, IEditorService } from '../../../services/editor/common/editorService.js';
import { hasUndecidedChatEditingResourceContextKey, IChatEditingService } from '../common/chatEditingService.js';
import { ChatContextKeys } from '../common/chatContextKeys.js';
import { isEqual } from '../../../../base/common/resources.js';
import { Range } from '../../../../editor/common/core/range.js';
class NavigateAction extends Action2 {
    constructor(next) {
        super({
            id: next
                ? 'chatEditor.action.navigateNext'
                : 'chatEditor.action.navigatePrevious',
            title: next
                ? localize2('next', 'Go to Next Chat Edit')
                : localize2('prev', 'Go to Previous Chat Edit'),
            category: CHAT_CATEGORY,
            icon: next ? Codicon.arrowDown : Codicon.arrowUp,
            keybinding: {
                primary: next
                    ? 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */
                    : 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 63 /* KeyCode.F5 */,
                weight: 100 /* KeybindingWeight.EditorContrib */,
                when: ContextKeyExpr.and(ctxHasEditorModification, EditorContextKeys.focus),
            },
            f1: true,
            menu: {
                id: MenuId.ChatEditingEditorContent,
                group: 'navigate',
                order: !next ? 2 : 3,
            }
        });
        this.next = next;
    }
    run(accessor) {
        const chatEditingService = accessor.get(IChatEditingService);
        const editorService = accessor.get(IEditorService);
        const editor = editorService.activeTextEditorControl;
        if (!isCodeEditor(editor) || !editor.hasModel()) {
            return;
        }
        const session = chatEditingService.currentEditingSession;
        if (!session) {
            return;
        }
        const ctrl = ChatEditorController.get(editor);
        if (!ctrl) {
            return;
        }
        const done = this.next
            ? ctrl.revealNext(true)
            : ctrl.revealPrevious(true);
        if (done) {
            return;
        }
        const entries = session.entries.get();
        const idx = entries.findIndex(e => isEqual(e.modifiedURI, editor.getModel().uri));
        if (idx < 0) {
            return;
        }
        const newIdx = (idx + (this.next ? 1 : -1) + entries.length) % entries.length;
        if (idx === newIdx) {
            // wrap inside the same file
            if (this.next) {
                ctrl.revealNext(false);
            }
            else {
                ctrl.revealPrevious(false);
            }
            return;
        }
        const entry = entries[newIdx];
        const change = entry.diffInfo.get().changes.at(0);
        return editorService.openEditor({
            resource: entry.modifiedURI,
            options: {
                selection: change && Range.fromPositions({ lineNumber: change.original.startLineNumber, column: 1 }),
                revealIfOpened: false,
                revealIfVisible: false,
            }
        }, ACTIVE_GROUP);
    }
}
class AcceptDiscardAction extends Action2 {
    constructor(accept) {
        super({
            id: accept
                ? 'chatEditor.action.accept'
                : 'chatEditor.action.reject',
            title: accept
                ? localize2('accept', 'Accept Chat Edit')
                : localize2('discard', 'Discard Chat Edit'),
            shortTitle: accept
                ? localize2('accept2', 'Accept')
                : localize2('discard2', 'Discard'),
            category: CHAT_CATEGORY,
            precondition: ContextKeyExpr.and(ChatContextKeys.requestInProgress.negate(), hasUndecidedChatEditingResourceContextKey),
            icon: accept
                ? Codicon.check
                : Codicon.discard,
            f1: true,
            keybinding: {
                when: EditorContextKeys.focus,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: accept
                    ? 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */
                    : 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
            },
            menu: {
                id: MenuId.ChatEditingEditorContent,
                group: 'a_resolve',
                order: accept ? 0 : 1,
            }
        });
        this.accept = accept;
    }
    run(accessor) {
        const chatEditingService = accessor.get(IChatEditingService);
        const editorService = accessor.get(IEditorService);
        const editor = editorService.activeTextEditorControl;
        if (!isCodeEditor(editor) || !editor.hasModel()) {
            return;
        }
        const session = chatEditingService.getEditingSession(editor.getModel().uri);
        if (!session) {
            return;
        }
        if (this.accept) {
            session.accept(editor.getModel().uri);
        }
        else {
            session.reject(editor.getModel().uri);
        }
    }
}
export function registerChatEditorActions() {
    registerAction2(class NextAction extends NavigateAction {
        constructor() { super(true); }
    });
    registerAction2(class PrevAction extends NavigateAction {
        constructor() { super(false); }
    });
    registerAction2(class AcceptAction extends AcceptDiscardAction {
        constructor() { super(true); }
    });
    registerAction2(class RejectAction extends AcceptDiscardAction {
        constructor() { super(false); }
    });
}
