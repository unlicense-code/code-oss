import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IAccessibleViewImplentation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { AccessibleViewType, AccessibleContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
export declare class ReplEditorInputAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 105;
    readonly name = "REPL Editor Input";
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
    readonly type: AccessibleViewType;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
export declare class ReplEditorHistoryAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 105;
    readonly name = "REPL Editor History";
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
    readonly type: AccessibleViewType;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
