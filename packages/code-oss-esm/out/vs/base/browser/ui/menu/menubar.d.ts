import { IMenuDirection, IMenuStyles } from './menu.js';
import { IAction, IActionRunner } from '../../../common/actions.js';
import { Event } from '../../../common/event.js';
import { ResolvedKeybinding } from '../../../common/keybindings.js';
import { Disposable } from '../../../common/lifecycle.js';
import './menubar.css';
export interface IMenuBarOptions {
    enableMnemonics?: boolean;
    disableAltFocus?: boolean;
    visibility?: string;
    getKeybinding?: (action: IAction) => ResolvedKeybinding | undefined;
    alwaysOnMnemonics?: boolean;
    compactMode?: IMenuDirection;
    actionRunner?: IActionRunner;
    getCompactMenuActions?: () => IAction[];
}
export interface MenuBarMenu {
    actions: IAction[];
    label: string;
}
export declare class MenuBar extends Disposable {
    private container;
    private options;
    private menuStyle;
    static readonly OVERFLOW_INDEX: number;
    private menus;
    private overflowMenu;
    private focusedMenu;
    private focusToReturn;
    private menuUpdater;
    private _mnemonicsInUse;
    private openedViaKeyboard;
    private awaitingAltRelease;
    private ignoreNextMouseUp;
    private mnemonics;
    private updatePending;
    private _focusState;
    private actionRunner;
    private readonly _onVisibilityChange;
    private readonly _onFocusStateChange;
    private numMenusShown;
    private overflowLayoutScheduled;
    private readonly menuDisposables;
    constructor(container: HTMLElement, options: IMenuBarOptions, menuStyle: IMenuStyles);
    push(arg: MenuBarMenu | MenuBarMenu[]): void;
    createOverflowMenu(): void;
    updateMenu(menu: MenuBarMenu): void;
    dispose(): void;
    blur(): void;
    getWidth(): number;
    getHeight(): number;
    toggleFocus(): void;
    private updateOverflowAction;
    private updateLabels;
    update(options?: IMenuBarOptions): void;
    private registerMnemonic;
    private hideMenubar;
    private showMenubar;
    private get focusState();
    private set focusState(value);
    get isVisible(): boolean;
    private get isFocused();
    private get isOpen();
    private get hasOverflow();
    private get isCompact();
    private setUnfocusedState;
    private focusPrevious;
    private focusNext;
    private updateMnemonicVisibility;
    private get mnemonicsInUse();
    private set mnemonicsInUse(value);
    private get shouldAltKeyFocus();
    get onVisibilityChange(): Event<boolean>;
    get onFocusStateChange(): Event<boolean>;
    private onMenuTriggered;
    private onModifierKeyToggled;
    private isCurrentMenu;
    private cleanupCustomMenu;
    private showCustomMenu;
}
