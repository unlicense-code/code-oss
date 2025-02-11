export declare namespace Iterable {
    function is<T = any>(thing: any): thing is Iterable<T>;
    function empty<T = any>(): Iterable<T>;
    function single<T>(element: T): Iterable<T>;
    function wrap<T>(iterableOrElement: Iterable<T> | T): Iterable<T>;
    function from<T>(iterable: Iterable<T> | undefined | null): Iterable<T>;
    function reverse<T>(array: Array<T>): Iterable<T>;
    function isEmpty<T>(iterable: Iterable<T> | undefined | null): boolean;
    function first<T>(iterable: Iterable<T>): T | undefined;
    function some<T>(iterable: Iterable<T>, predicate: (t: T, i: number) => unknown): boolean;
    function find<T, R extends T>(iterable: Iterable<T>, predicate: (t: T) => t is R): R | undefined;
    function find<T>(iterable: Iterable<T>, predicate: (t: T) => boolean): T | undefined;
    function filter<T, R extends T>(iterable: Iterable<T>, predicate: (t: T) => t is R): Iterable<R>;
    function filter<T>(iterable: Iterable<T>, predicate: (t: T) => boolean): Iterable<T>;
    function map<T, R>(iterable: Iterable<T>, fn: (t: T, index: number) => R): Iterable<R>;
    function flatMap<T, R>(iterable: Iterable<T>, fn: (t: T, index: number) => Iterable<R>): Iterable<R>;
    function concat<T>(...iterables: Iterable<T>[]): Iterable<T>;
    function reduce<T, R>(iterable: Iterable<T>, reducer: (previousValue: R, currentValue: T) => R, initialValue: R): R;
    /**
     * Returns an iterable slice of the array, with the same semantics as `array.slice()`.
     */
    function slice<T>(arr: ReadonlyArray<T>, from: number, to?: number): Iterable<T>;
    /**
     * Consumes `atMost` elements from iterable and returns the consumed elements,
     * and an iterable for the rest of the elements.
     */
    function consume<T>(iterable: Iterable<T>, atMost?: number): [T[], Iterable<T>];
    function asyncToArray<T>(iterable: AsyncIterable<T>): Promise<T[]>;
}
