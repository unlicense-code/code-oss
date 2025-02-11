import { Event } from '../../../base/common/event.js';
declare class TabFocusImpl {
    private _tabFocus;
    private readonly _onDidChangeTabFocus;
    readonly onDidChangeTabFocus: Event<boolean>;
    getTabFocusMode(): boolean;
    setTabFocusMode(tabFocusMode: boolean): void;
}
/**
 * Control what pressing Tab does.
 * If it is false, pressing Tab or Shift-Tab will be handled by the editor.
 * If it is true, pressing Tab or Shift-Tab will move the browser focus.
 * Defaults to false.
 */
export declare const TabFocus: TabFocusImpl;
export {};
