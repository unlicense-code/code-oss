import { CancellationToken } from './cancellation.js';
import { DisposableStore, IDisposable } from './lifecycle.js';
import { LinkedList } from './linkedList.js';
import { IObservable } from './observable.js';
import { MicrotaskDelay } from './symbols.js';
/**
 * An event with zero or one parameters that can be subscribed to. The event is a function itself.
 */
export interface Event<T> {
    (listener: (e: T) => unknown, thisArgs?: any, disposables?: IDisposable[] | DisposableStore): IDisposable;
}
export declare namespace Event {
    const None: Event<any>;
    /**
     * Given an event, returns another event which debounces calls and defers the listeners to a later task via a shared
     * `setTimeout`. The event is converted into a signal (`Event<void>`) to avoid additional object creation as a
     * result of merging events and to try prevent race conditions that could arise when using related deferred and
     * non-deferred events.
     *
     * This is useful for deferring non-critical work (eg. general UI updates) to ensure it does not block critical work
     * (eg. latency of keypress to text rendered).
     *
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     *
     * @param event The event source for the new event.
     * @param disposable A disposable store to add the new EventEmitter to.
     */
    function defer(event: Event<unknown>, disposable?: DisposableStore): Event<void>;
    /**
     * Given an event, returns another event which only fires once.
     *
     * @param event The event source for the new event.
     */
    function once<T>(event: Event<T>): Event<T>;
    /**
     * Given an event, returns another event which only fires once, and only when the condition is met.
     *
     * @param event The event source for the new event.
     */
    function onceIf<T>(event: Event<T>, condition: (e: T) => boolean): Event<T>;
    /**
     * Maps an event of one type into an event of another type using a mapping function, similar to how
     * `Array.prototype.map` works.
     *
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     *
     * @param event The event source for the new event.
     * @param map The mapping function.
     * @param disposable A disposable store to add the new EventEmitter to.
     */
    function map<I, O>(event: Event<I>, map: (i: I) => O, disposable?: DisposableStore): Event<O>;
    /**
     * Wraps an event in another event that performs some function on the event object before firing.
     *
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     *
     * @param event The event source for the new event.
     * @param each The function to perform on the event object.
     * @param disposable A disposable store to add the new EventEmitter to.
     */
    function forEach<I>(event: Event<I>, each: (i: I) => void, disposable?: DisposableStore): Event<I>;
    /**
     * Wraps an event in another event that fires only when some condition is met.
     *
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     *
     * @param event The event source for the new event.
     * @param filter The filter function that defines the condition. The event will fire for the object if this function
     * returns true.
     * @param disposable A disposable store to add the new EventEmitter to.
     */
    function filter<T, U>(event: Event<T | U>, filter: (e: T | U) => e is T, disposable?: DisposableStore): Event<T>;
    function filter<T>(event: Event<T>, filter: (e: T) => boolean, disposable?: DisposableStore): Event<T>;
    function filter<T, R>(event: Event<T | R>, filter: (e: T | R) => e is R, disposable?: DisposableStore): Event<R>;
    /**
     * Given an event, returns the same event but typed as `Event<void>`.
     */
    function signal<T>(event: Event<T>): Event<void>;
    /**
     * Given a collection of events, returns a single event which emits whenever any of the provided events emit.
     */
    function any<T>(...events: Event<T>[]): Event<T>;
    function any(...events: Event<any>[]): Event<void>;
    /**
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function reduce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, initial?: O, disposable?: DisposableStore): Event<O>;
    /**
     * Given an event, creates a new emitter that event that will debounce events based on {@link delay} and give an
     * array event object of all events that fired.
     *
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     *
     * @param event The original event to debounce.
     * @param merge A function that reduces all events into a single event.
     * @param delay The number of milliseconds to debounce.
     * @param leading Whether to fire a leading event without debouncing.
     * @param flushOnListenerRemove Whether to fire all debounced events when a listener is removed. If this is not
     * specified, some events could go missing. Use this if it's important that all events are processed, even if the
     * listener gets disposed before the debounced event fires.
     * @param leakWarningThreshold See {@link EmitterOptions.leakWarningThreshold}.
     * @param disposable A disposable store to register the debounce emitter to.
     */
    function debounce<T>(event: Event<T>, merge: (last: T | undefined, event: T) => T, delay?: number | typeof MicrotaskDelay, leading?: boolean, flushOnListenerRemove?: boolean, leakWarningThreshold?: number, disposable?: DisposableStore): Event<T>;
    function debounce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, delay?: number | typeof MicrotaskDelay, leading?: boolean, flushOnListenerRemove?: boolean, leakWarningThreshold?: number, disposable?: DisposableStore): Event<O>;
    /**
     * Debounces an event, firing after some delay (default=0) with an array of all event original objects.
     *
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     */
    function accumulate<T>(event: Event<T>, delay?: number, disposable?: DisposableStore): Event<T[]>;
    /**
     * Filters an event such that some condition is _not_ met more than once in a row, effectively ensuring duplicate
     * event objects from different sources do not fire the same event object.
     *
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     *
     * @param event The event source for the new event.
     * @param equals The equality condition.
     * @param disposable A disposable store to add the new EventEmitter to.
     *
     * @example
     * ```
     * // Fire only one time when a single window is opened or focused
     * Event.latch(Event.any(onDidOpenWindow, onDidFocusWindow))
     * ```
     */
    function latch<T>(event: Event<T>, equals?: (a: T, b: T) => boolean, disposable?: DisposableStore): Event<T>;
    /**
     * Splits an event whose parameter is a union type into 2 separate events for each type in the union.
     *
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     *
     * @example
     * ```
     * const event = new EventEmitter<number | undefined>().event;
     * const [numberEvent, undefinedEvent] = Event.split(event, isUndefined);
     * ```
     *
     * @param event The event source for the new event.
     * @param isT A function that determines what event is of the first type.
     * @param disposable A disposable store to add the new EventEmitter to.
     */
    function split<T, U>(event: Event<T | U>, isT: (e: T | U) => e is T, disposable?: DisposableStore): [Event<T>, Event<U>];
    /**
     * Buffers an event until it has a listener attached.
     *
     * *NOTE* that this function returns an `Event` and it MUST be called with a `DisposableStore` whenever the returned
     * event is accessible to "third parties", e.g the event is a public property. Otherwise a leaked listener on the
     * returned event causes this utility to leak a listener on the original event.
     *
     * @param event The event source for the new event.
     * @param flushAfterTimeout Determines whether to flush the buffer after a timeout immediately or after a
     * `setTimeout` when the first event listener is added.
     * @param _buffer Internal: A source event array used for tests.
     *
     * @example
     * ```
     * // Start accumulating events, when the first listener is attached, flush
     * // the event after a timeout such that multiple listeners attached before
     * // the timeout would receive the event
     * this.onInstallExtension = Event.buffer(service.onInstallExtension, true);
     * ```
     */
    function buffer<T>(event: Event<T>, flushAfterTimeout?: boolean, _buffer?: T[], disposable?: DisposableStore): Event<T>;
    /**
     * Wraps the event in an {@link IChainableEvent}, allowing a more functional programming style.
     *
     * @example
     * ```
     * // Normal
     * const onEnterPressNormal = Event.filter(
     *   Event.map(onKeyPress.event, e => new StandardKeyboardEvent(e)),
     *   e.keyCode === KeyCode.Enter
     * ).event;
     *
     * // Using chain
     * const onEnterPressChain = Event.chain(onKeyPress.event, $ => $
     *   .map(e => new StandardKeyboardEvent(e))
     *   .filter(e => e.keyCode === KeyCode.Enter)
     * );
     * ```
     */
    function chain<T, R>(event: Event<T>, sythensize: ($: IChainableSythensis<T>) => IChainableSythensis<R>): Event<R>;
    interface IChainableSythensis<T> {
        map<O>(fn: (i: T) => O): IChainableSythensis<O>;
        forEach(fn: (i: T) => void): IChainableSythensis<T>;
        filter<R extends T>(fn: (e: T) => e is R): IChainableSythensis<R>;
        filter(fn: (e: T) => boolean): IChainableSythensis<T>;
        reduce<R>(merge: (last: R, event: T) => R, initial: R): IChainableSythensis<R>;
        reduce<R>(merge: (last: R | undefined, event: T) => R): IChainableSythensis<R>;
        latch(equals?: (a: T, b: T) => boolean): IChainableSythensis<T>;
    }
    interface NodeEventEmitter {
        on(event: string | symbol, listener: Function): unknown;
        removeListener(event: string | symbol, listener: Function): unknown;
    }
    /**
     * Creates an {@link Event} from a node event emitter.
     */
    function fromNodeEventEmitter<T>(emitter: NodeEventEmitter, eventName: string, map?: (...args: any[]) => T): Event<T>;
    interface DOMEventEmitter {
        addEventListener(event: string | symbol, listener: Function): void;
        removeEventListener(event: string | symbol, listener: Function): void;
    }
    /**
     * Creates an {@link Event} from a DOM event emitter.
     */
    function fromDOMEventEmitter<T>(emitter: DOMEventEmitter, eventName: string, map?: (...args: any[]) => T): Event<T>;
    /**
     * Creates a promise out of an event, using the {@link Event.once} helper.
     */
    function toPromise<T>(event: Event<T>): Promise<T>;
    /**
     * Creates an event out of a promise that fires once when the promise is
     * resolved with the result of the promise or `undefined`.
     */
    function fromPromise<T>(promise: Promise<T>): Event<T | undefined>;
    /**
     * A convenience function for forwarding an event to another emitter which
     * improves readability.
     *
     * This is similar to {@link Relay} but allows instantiating and forwarding
     * on a single line and also allows for multiple source events.
     * @param from The event to forward.
     * @param to The emitter to forward the event to.
     * @example
     * Event.forward(event, emitter);
     * // equivalent to
     * event(e => emitter.fire(e));
     * // equivalent to
     * event(emitter.fire, emitter);
     */
    function forward<T>(from: Event<T>, to: Emitter<T>): IDisposable;
    /**
     * Adds a listener to an event and calls the listener immediately with undefined as the event object.
     *
     * @example
     * ```
     * // Initialize the UI and update it when dataChangeEvent fires
     * runAndSubscribe(dataChangeEvent, () => this._updateUI());
     * ```
     */
    function runAndSubscribe<T>(event: Event<T>, handler: (e: T) => unknown, initial: T): IDisposable;
    function runAndSubscribe<T>(event: Event<T>, handler: (e: T | undefined) => unknown): IDisposable;
    /**
     * Creates an event emitter that is fired when the observable changes.
     * Each listeners subscribes to the emitter.
     */
    function fromObservable<T>(obs: IObservable<T, any>, store?: DisposableStore): Event<T>;
    /**
     * Each listener is attached to the observable directly.
     */
    function fromObservableLight(observable: IObservable<any>): Event<void>;
}
export interface EmitterOptions {
    /**
     * Optional function that's called *before* the very first listener is added
     */
    onWillAddFirstListener?: Function;
    /**
     * Optional function that's called *after* the very first listener is added
     */
    onDidAddFirstListener?: Function;
    /**
     * Optional function that's called after a listener is added
     */
    onDidAddListener?: Function;
    /**
     * Optional function that's called *after* remove the very last listener
     */
    onDidRemoveLastListener?: Function;
    /**
     * Optional function that's called *before* a listener is removed
     */
    onWillRemoveListener?: Function;
    /**
     * Optional function that's called when a listener throws an error. Defaults to
     * {@link onUnexpectedError}
     */
    onListenerError?: (e: any) => void;
    /**
     * Number of listeners that are allowed before assuming a leak. Default to
     * a globally configured value
     *
     * @see setGlobalLeakWarningThreshold
     */
    leakWarningThreshold?: number;
    /**
     * Pass in a delivery queue, which is useful for ensuring
     * in order event delivery across multiple emitters.
     */
    deliveryQueue?: EventDeliveryQueue;
    /** ONLY enable this during development */
    _profName?: string;
}
export declare class EventProfiling {
    static readonly all: Set<EventProfiling>;
    private static _idPool;
    readonly name: string;
    listenerCount: number;
    invocationCount: number;
    elapsedOverall: number;
    durations: number[];
    private _stopWatch?;
    constructor(name: string);
    start(listenerCount: number): void;
    stop(): void;
}
export declare function setGlobalLeakWarningThreshold(n: number): IDisposable;
declare class Stacktrace {
    readonly value: string;
    static create(): Stacktrace;
    private constructor();
    print(): void;
}
export declare class ListenerLeakError extends Error {
    constructor(message: string, stack: string);
}
export declare class ListenerRefusalError extends Error {
    constructor(message: string, stack: string);
}
declare class UniqueContainer<T> {
    readonly value: T;
    stack?: Stacktrace;
    id: number;
    constructor(value: T);
}
type ListenerContainer<T> = UniqueContainer<(data: T) => void>;
type ListenerOrListeners<T> = (ListenerContainer<T> | undefined)[] | ListenerContainer<T>;
/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
    class Document {

        private readonly _onDidChange = new Emitter<(value:string)=>any>();

        public onDidChange = this._onDidChange.event;

        // getter-style
        // get onDidChange(): Event<(value:string)=>any> {
        // 	return this._onDidChange.event;
        // }

        private _doIt() {
            //...
            this._onDidChange.fire(value);
        }
    }
 */
export declare class Emitter<T> {
    private readonly _options?;
    private readonly _leakageMon?;
    private readonly _perfMon?;
    private _disposed?;
    private _event?;
    /**
     * A listener, or list of listeners. A single listener is the most common
     * for event emitters (#185789), so we optimize that special case to avoid
     * wrapping it in an array (just like Node.js itself.)
     *
     * A list of listeners never 'downgrades' back to a plain function if
     * listeners are removed, for two reasons:
     *
     *  1. That's complicated (especially with the deliveryQueue)
     *  2. A listener with >1 listener is likely to have >1 listener again at
     *     some point, and swapping between arrays and functions may[citation needed]
     *     introduce unnecessary work and garbage.
     *
     * The array listeners can be 'sparse', to avoid reallocating the array
     * whenever any listener is added or removed. If more than `1 / compactionThreshold`
     * of the array is empty, only then is it resized.
     */
    protected _listeners?: ListenerOrListeners<T>;
    /**
     * Always to be defined if _listeners is an array. It's no longer a true
     * queue, but holds the dispatching 'state'. If `fire()` is called on an
     * emitter, any work left in the _deliveryQueue is finished first.
     */
    private _deliveryQueue?;
    protected _size: number;
    constructor(options?: EmitterOptions);
    dispose(): void;
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get event(): Event<T>;
    private _removeListener;
    private _deliver;
    /** Delivers items in the queue. Assumes the queue is ready to go. */
    private _deliverQueue;
    /**
     * To be kept private to fire an event to
     * subscribers
     */
    fire(event: T): void;
    hasListeners(): boolean;
}
export interface EventDeliveryQueue {
    _isEventDeliveryQueue: true;
}
export declare const createEventDeliveryQueue: () => EventDeliveryQueue;
export interface IWaitUntil {
    token: CancellationToken;
    waitUntil(thenable: Promise<unknown>): void;
}
export type IWaitUntilData<T> = Omit<Omit<T, 'waitUntil'>, 'token'>;
export declare class AsyncEmitter<T extends IWaitUntil> extends Emitter<T> {
    private _asyncDeliveryQueue?;
    fireAsync(data: IWaitUntilData<T>, token: CancellationToken, promiseJoin?: (p: Promise<unknown>, listener: Function) => Promise<unknown>): Promise<void>;
}
export declare class PauseableEmitter<T> extends Emitter<T> {
    private _isPaused;
    protected _eventQueue: LinkedList<T>;
    private _mergeFn?;
    get isPaused(): boolean;
    constructor(options?: EmitterOptions & {
        merge?: (input: T[]) => T;
    });
    pause(): void;
    resume(): void;
    fire(event: T): void;
}
export declare class DebounceEmitter<T> extends PauseableEmitter<T> {
    private readonly _delay;
    private _handle;
    constructor(options: EmitterOptions & {
        merge: (input: T[]) => T;
        delay?: number;
    });
    fire(event: T): void;
}
/**
 * An emitter which queue all events and then process them at the
 * end of the event loop.
 */
export declare class MicrotaskEmitter<T> extends Emitter<T> {
    private _queuedEvents;
    private _mergeFn?;
    constructor(options?: EmitterOptions & {
        merge?: (input: T[]) => T;
    });
    fire(event: T): void;
}
/**
 * An event emitter that multiplexes many events into a single event.
 *
 * @example Listen to the `onData` event of all `Thing`s, dynamically adding and removing `Thing`s
 * to the multiplexer as needed.
 *
 * ```typescript
 * const anythingDataMultiplexer = new EventMultiplexer<{ data: string }>();
 *
 * const thingListeners = DisposableMap<Thing, IDisposable>();
 *
 * thingService.onDidAddThing(thing => {
 *   thingListeners.set(thing, anythingDataMultiplexer.add(thing.onData);
 * });
 * thingService.onDidRemoveThing(thing => {
 *   thingListeners.deleteAndDispose(thing);
 * });
 *
 * anythingDataMultiplexer.event(e => {
 *   console.log('Something fired data ' + e.data)
 * });
 * ```
 */
export declare class EventMultiplexer<T> implements IDisposable {
    private readonly emitter;
    private hasListeners;
    private events;
    constructor();
    get event(): Event<T>;
    add(event: Event<T>): IDisposable;
    private onFirstListenerAdd;
    private onLastListenerRemove;
    private hook;
    private unhook;
    dispose(): void;
}
export interface IDynamicListEventMultiplexer<TEventType> extends IDisposable {
    readonly event: Event<TEventType>;
}
export declare class DynamicListEventMultiplexer<TItem, TEventType> implements IDynamicListEventMultiplexer<TEventType> {
    private readonly _store;
    readonly event: Event<TEventType>;
    constructor(items: TItem[], onAddItem: Event<TItem>, onRemoveItem: Event<TItem>, getEvent: (item: TItem) => Event<TEventType>);
    dispose(): void;
}
/**
 * The EventBufferer is useful in situations in which you want
 * to delay firing your events during some code.
 * You can wrap that code and be sure that the event will not
 * be fired during that wrap.
 *
 * ```
 * const emitter: Emitter;
 * const delayer = new EventDelayer();
 * const delayedEvent = delayer.wrapEvent(emitter.event);
 *
 * delayedEvent(console.log);
 *
 * delayer.bufferEvents(() => {
 *   emitter.fire(); // event will not be fired yet
 * });
 *
 * // event will only be fired at this point
 * ```
 */
export declare class EventBufferer {
    private data;
    wrapEvent<T>(event: Event<T>): Event<T>;
    wrapEvent<T>(event: Event<T>, reduce: (last: T | undefined, event: T) => T): Event<T>;
    wrapEvent<T, O>(event: Event<T>, reduce: (last: O | undefined, event: T) => O, initial: O): Event<O>;
    bufferEvents<R = void>(fn: () => R): R;
}
/**
 * A Relay is an event forwarder which functions as a replugabble event pipe.
 * Once created, you can connect an input event to it and it will simply forward
 * events from that input event through its own `event` property. The `input`
 * can be changed at any point in time.
 */
export declare class Relay<T> implements IDisposable {
    private listening;
    private inputEvent;
    private inputEventListener;
    private readonly emitter;
    readonly event: Event<T>;
    set input(event: Event<T>);
    dispose(): void;
}
export interface IValueWithChangeEvent<T> {
    readonly onDidChange: Event<void>;
    get value(): T;
}
export declare class ValueWithChangeEvent<T> implements IValueWithChangeEvent<T> {
    private _value;
    static const<T>(value: T): IValueWithChangeEvent<T>;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    constructor(_value: T);
    get value(): T;
    set value(value: T);
}
/**
 * @param handleItem Is called for each item in the set (but only the first time the item is seen in the set).
 * 	The returned disposable is disposed if the item is no longer in the set.
 */
export declare function trackSetChanges<T>(getData: () => ReadonlySet<T>, onDidChangeData: Event<unknown>, handleItem: (d: T) => IDisposable): IDisposable;
export {};
