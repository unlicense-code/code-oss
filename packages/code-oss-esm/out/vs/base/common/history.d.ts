import { INavigator } from './navigator.js';
export interface IHistory<T> {
    delete(t: T): boolean;
    add(t: T): this;
    has(t: T): boolean;
    clear(): void;
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
    replace?(t: T[]): void;
}
export declare class HistoryNavigator<T> implements INavigator<T> {
    private _history;
    private _limit;
    private _navigator;
    constructor(_history?: IHistory<T>, limit?: number);
    getHistory(): T[];
    add(t: T): void;
    next(): T | null;
    previous(): T | null;
    current(): T | null;
    first(): T | null;
    last(): T | null;
    isFirst(): boolean;
    isLast(): boolean;
    isNowhere(): boolean;
    has(t: T): boolean;
    clear(): void;
    private _onChange;
    private _reduceToLimit;
    private _currentPosition;
    private get _elements();
}
/**
 * The right way to use HistoryNavigator2 is for the last item in the list to be the user's uncommitted current text. eg empty string, or whatever has been typed. Then
 * the user can navigate away from the last item through the list, and back to it. When updating the last item, call replaceLast.
 */
export declare class HistoryNavigator2<T> {
    private capacity;
    private identityFn;
    private valueSet;
    private head;
    private tail;
    private cursor;
    private _size;
    get size(): number;
    constructor(history: readonly T[], capacity?: number, identityFn?: (t: T) => unknown);
    add(value: T): void;
    /**
     * @returns old last value
     */
    replaceLast(value: T): T;
    prepend(value: T): void;
    isAtEnd(): boolean;
    current(): T;
    previous(): T;
    next(): T;
    has(t: T): boolean;
    resetCursor(): T;
    [Symbol.iterator](): Iterator<T>;
    private _deleteFromList;
}
