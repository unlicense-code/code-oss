import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const HAS_OPENED_NOTEBOOK: RawContextKey<boolean>;
export declare const KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED: RawContextKey<boolean>;
export declare const InteractiveWindowOpen: RawContextKey<boolean>;
export declare const MOST_RECENT_REPL_EDITOR: RawContextKey<string>;
export declare const NOTEBOOK_IS_ACTIVE_EDITOR: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
export declare const INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
export declare const REPL_NOTEBOOK_IS_ACTIVE_EDITOR: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
export declare const IS_COMPOSITE_NOTEBOOK: RawContextKey<boolean>;
export declare const NOTEBOOK_EDITOR_FOCUSED: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_LIST_FOCUSED: RawContextKey<boolean>;
export declare const NOTEBOOK_OUTPUT_FOCUSED: RawContextKey<boolean>;
export declare const NOTEBOOK_OUTPUT_INPUT_FOCUSED: RawContextKey<boolean>;
export declare const NOTEBOOK_EDITOR_EDITABLE: RawContextKey<boolean>;
export declare const NOTEBOOK_HAS_RUNNING_CELL: RawContextKey<boolean>;
export declare const NOTEBOOK_HAS_SOMETHING_RUNNING: RawContextKey<boolean>;
export declare const NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON: RawContextKey<boolean>;
export declare const NOTEBOOK_BREAKPOINT_MARGIN_ACTIVE: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_TOOLBAR_LOCATION: RawContextKey<"left" | "right" | "hidden">;
export declare const NOTEBOOK_CURSOR_NAVIGATION_MODE: RawContextKey<boolean>;
export declare const NOTEBOOK_LAST_CELL_FAILED: RawContextKey<boolean>;
export declare const NOTEBOOK_VIEW_TYPE: RawContextKey<string>;
export declare const NOTEBOOK_CELL_TYPE: RawContextKey<"code" | "markup">;
export declare const NOTEBOOK_CELL_EDITABLE: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_FOCUSED: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_EDITOR_FOCUSED: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_MARKDOWN_EDIT_MODE: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_LINE_NUMBERS: RawContextKey<"inherit" | "off" | "on">;
export type NotebookCellExecutionStateContext = 'idle' | 'pending' | 'executing' | 'succeeded' | 'failed';
export declare const NOTEBOOK_CELL_EXECUTION_STATE: RawContextKey<NotebookCellExecutionStateContext>;
export declare const NOTEBOOK_CELL_EXECUTING: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_HAS_OUTPUTS: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_IS_FIRST_OUTPUT: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_INPUT_COLLAPSED: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_OUTPUT_COLLAPSED: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_RESOURCE: RawContextKey<string>;
export declare const NOTEBOOK_CELL_GENERATED_BY_CHAT: RawContextKey<boolean>;
export declare const NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS: RawContextKey<boolean>;
export declare const NOTEBOOK_KERNEL: RawContextKey<string>;
export declare const NOTEBOOK_KERNEL_COUNT: RawContextKey<number>;
export declare const NOTEBOOK_KERNEL_SOURCE_COUNT: RawContextKey<number>;
export declare const NOTEBOOK_KERNEL_SELECTED: RawContextKey<boolean>;
export declare const NOTEBOOK_INTERRUPTIBLE_KERNEL: RawContextKey<boolean>;
export declare const NOTEBOOK_MISSING_KERNEL_EXTENSION: RawContextKey<boolean>;
export declare const NOTEBOOK_HAS_OUTPUTS: RawContextKey<boolean>;
export declare const KERNEL_HAS_VARIABLE_PROVIDER: RawContextKey<boolean>;
