import { ILocalizedString } from '../../../../nls.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpression } from '../../../../platform/contextkey/common/contextkey.js';
import { IAction } from '../../../../base/common/actions.js';
export declare class ToggleTitleBarConfigAction extends Action2 {
    private readonly section;
    constructor(section: string, title: string, description: string | ILocalizedString | undefined, order: number, mainWindowOnly: boolean, when?: ContextKeyExpression);
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare const ACCOUNTS_ACTIVITY_TILE_ACTION: IAction;
export declare const GLOBAL_ACTIVITY_TITLE_ACTION: IAction;
