import { Event } from '../../../common/event.js';
import { IDisposable } from '../../../common/lifecycle.js';
import { IPagedModel } from '../../../common/paging.js';
import { ScrollbarVisibility } from '../../../common/scrollable.js';
import './list.css';
import { IListContextMenuEvent, IListEvent, IListMouseEvent, IListRenderer, IListVirtualDelegate } from './list.js';
import { IListAccessibilityProvider, IListOptionsUpdate, IListStyles, List, TypeNavigationMode } from './listWidget.js';
export interface IPagedRenderer<TElement, TTemplateData> extends IListRenderer<TElement, TTemplateData> {
    renderPlaceholder(index: number, templateData: TTemplateData): void;
}
export interface ITemplateData<T> {
    data?: T;
    disposable?: IDisposable;
}
export interface IPagedListOptions<T> {
    readonly typeNavigationEnabled?: boolean;
    readonly typeNavigationMode?: TypeNavigationMode;
    readonly ariaLabel?: string;
    readonly keyboardSupport?: boolean;
    readonly multipleSelectionSupport?: boolean;
    readonly accessibilityProvider?: IListAccessibilityProvider<T>;
    readonly useShadows?: boolean;
    readonly verticalScrollMode?: ScrollbarVisibility;
    readonly setRowLineHeight?: boolean;
    readonly setRowHeight?: boolean;
    readonly supportDynamicHeights?: boolean;
    readonly mouseSupport?: boolean;
    readonly horizontalScrolling?: boolean;
    readonly scrollByPage?: boolean;
    readonly paddingBottom?: number;
}
export declare class PagedList<T> implements IDisposable {
    private list;
    private _model;
    constructor(user: string, container: HTMLElement, virtualDelegate: IListVirtualDelegate<number>, renderers: IPagedRenderer<T, any>[], options?: IPagedListOptions<T>);
    updateOptions(options: IListOptionsUpdate): void;
    getHTMLElement(): HTMLElement;
    isDOMFocused(): boolean;
    domFocus(): void;
    get onDidFocus(): Event<void>;
    get onDidBlur(): Event<void>;
    get widget(): List<number>;
    get onDidDispose(): Event<void>;
    get onMouseClick(): Event<IListMouseEvent<T>>;
    get onMouseDblClick(): Event<IListMouseEvent<T>>;
    get onTap(): Event<IListMouseEvent<T>>;
    get onPointer(): Event<IListMouseEvent<T>>;
    get onDidChangeFocus(): Event<IListEvent<T>>;
    get onDidChangeSelection(): Event<IListEvent<T>>;
    get onContextMenu(): Event<IListContextMenuEvent<T>>;
    get model(): IPagedModel<T>;
    set model(model: IPagedModel<T>);
    get length(): number;
    get scrollTop(): number;
    set scrollTop(scrollTop: number);
    get scrollLeft(): number;
    set scrollLeft(scrollLeft: number);
    setAnchor(index: number | undefined): void;
    getAnchor(): number | undefined;
    setFocus(indexes: number[]): void;
    focusNext(n?: number, loop?: boolean): void;
    focusPrevious(n?: number, loop?: boolean): void;
    focusNextPage(): Promise<void>;
    focusPreviousPage(): Promise<void>;
    focusLast(): void;
    focusFirst(): void;
    getFocus(): number[];
    setSelection(indexes: number[], browserEvent?: UIEvent): void;
    getSelection(): number[];
    getSelectedElements(): T[];
    layout(height?: number, width?: number): void;
    triggerTypeNavigation(): void;
    reveal(index: number, relativeTop?: number): void;
    style(styles: IListStyles): void;
    dispose(): void;
}
