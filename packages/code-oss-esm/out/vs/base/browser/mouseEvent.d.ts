export interface IMouseEvent {
    readonly browserEvent: MouseEvent;
    readonly leftButton: boolean;
    readonly middleButton: boolean;
    readonly rightButton: boolean;
    readonly buttons: number;
    readonly target: HTMLElement;
    readonly detail: number;
    readonly posx: number;
    readonly posy: number;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly timestamp: number;
    preventDefault(): void;
    stopPropagation(): void;
}
export declare class StandardMouseEvent implements IMouseEvent {
    readonly browserEvent: MouseEvent;
    readonly leftButton: boolean;
    readonly middleButton: boolean;
    readonly rightButton: boolean;
    readonly buttons: number;
    readonly target: HTMLElement;
    detail: number;
    readonly posx: number;
    readonly posy: number;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly timestamp: number;
    constructor(targetWindow: Window, e: MouseEvent);
    preventDefault(): void;
    stopPropagation(): void;
}
export declare class DragMouseEvent extends StandardMouseEvent {
    readonly dataTransfer: DataTransfer;
    constructor(targetWindow: Window, e: MouseEvent);
}
export interface IMouseWheelEvent extends MouseEvent {
    readonly wheelDelta: number;
    readonly wheelDeltaX: number;
    readonly wheelDeltaY: number;
    readonly deltaX: number;
    readonly deltaY: number;
    readonly deltaZ: number;
    readonly deltaMode: number;
}
export declare class StandardWheelEvent {
    readonly browserEvent: IMouseWheelEvent | null;
    readonly deltaY: number;
    readonly deltaX: number;
    readonly target: Node;
    constructor(e: IMouseWheelEvent | null, deltaX?: number, deltaY?: number);
    preventDefault(): void;
    stopPropagation(): void;
}
