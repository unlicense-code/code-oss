import { Dimension } from '../../dom.js';
import { Event } from '../../../common/event.js';
export interface IResizeEvent {
    dimension: Dimension;
    done: boolean;
    north?: boolean;
    east?: boolean;
    south?: boolean;
    west?: boolean;
}
export declare class ResizableHTMLElement {
    readonly domNode: HTMLElement;
    private readonly _onDidWillResize;
    readonly onDidWillResize: Event<void>;
    private readonly _onDidResize;
    readonly onDidResize: Event<IResizeEvent>;
    private readonly _northSash;
    private readonly _eastSash;
    private readonly _southSash;
    private readonly _westSash;
    private readonly _sashListener;
    private _size;
    private _minSize;
    private _maxSize;
    private _preferredSize?;
    constructor();
    dispose(): void;
    enableSashes(north: boolean, east: boolean, south: boolean, west: boolean): void;
    layout(height?: number, width?: number): void;
    clearSashHoverState(): void;
    get size(): Dimension;
    set maxSize(value: Dimension);
    get maxSize(): Dimension;
    set minSize(value: Dimension);
    get minSize(): Dimension;
    set preferredSize(value: Dimension | undefined);
    get preferredSize(): Dimension | undefined;
}
