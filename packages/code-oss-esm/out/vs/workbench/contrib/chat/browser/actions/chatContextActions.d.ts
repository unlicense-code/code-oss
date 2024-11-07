import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Action2, IAction2Options } from '../../../../../platform/actions/common/actions.js';
export declare function registerChatContextActions(): void;
export declare class AttachContextAction extends Action2 {
    static readonly ID = "workbench.action.chat.attachContext";
    protected static _cdt: import("../../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
    constructor(desc?: Readonly<IAction2Options>);
    private _getFileContextId;
    private _attachContext;
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
    private _show;
}
