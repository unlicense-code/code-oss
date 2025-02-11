import { CancellationToken } from './cancellation.js';
/**
 * The payload that flows in readable stream events.
 */
export type ReadableStreamEventPayload<T> = T | Error | 'end';
export interface ReadableStreamEvents<T> {
    /**
     * The 'data' event is emitted whenever the stream is
     * relinquishing ownership of a chunk of data to a consumer.
     *
     * NOTE: PLEASE UNDERSTAND THAT ADDING A DATA LISTENER CAN
     * TURN THE STREAM INTO FLOWING MODE. IT IS THEREFOR THE
     * LAST LISTENER THAT SHOULD BE ADDED AND NOT THE FIRST
     *
     * Use `listenStream` as a helper method to listen to
     * stream events in the right order.
     */
    on(event: 'data', callback: (data: T) => void): void;
    /**
     * Emitted when any error occurs.
     */
    on(event: 'error', callback: (err: Error) => void): void;
    /**
     * The 'end' event is emitted when there is no more data
     * to be consumed from the stream. The 'end' event will
     * not be emitted unless the data is completely consumed.
     */
    on(event: 'end', callback: () => void): void;
}
/**
 * A interface that emulates the API shape of a node.js readable
 * stream for use in native and web environments.
 */
export interface ReadableStream<T> extends ReadableStreamEvents<T> {
    /**
     * Stops emitting any events until resume() is called.
     */
    pause(): void;
    /**
     * Starts emitting events again after pause() was called.
     */
    resume(): void;
    /**
     * Destroys the stream and stops emitting any event.
     */
    destroy(): void;
    /**
     * Allows to remove a listener that was previously added.
     */
    removeListener(event: string, callback: Function): void;
}
/**
 * A interface that emulates the API shape of a node.js readable
 * for use in native and web environments.
 */
export interface Readable<T> {
    /**
     * Read data from the underlying source. Will return
     * null to indicate that no more data can be read.
     */
    read(): T | null;
}
export declare function isReadable<T>(obj: unknown): obj is Readable<T>;
/**
 * A interface that emulates the API shape of a node.js writeable
 * stream for use in native and web environments.
 */
export interface WriteableStream<T> extends ReadableStream<T> {
    /**
     * Writing data to the stream will trigger the on('data')
     * event listener if the stream is flowing and buffer the
     * data otherwise until the stream is flowing.
     *
     * If a `highWaterMark` is configured and writing to the
     * stream reaches this mark, a promise will be returned
     * that should be awaited on before writing more data.
     * Otherwise there is a risk of buffering a large number
     * of data chunks without consumer.
     */
    write(data: T): void | Promise<void>;
    /**
     * Signals an error to the consumer of the stream via the
     * on('error') handler if the stream is flowing.
     *
     * NOTE: call `end` to signal that the stream has ended,
     * this DOES NOT happen automatically from `error`.
     */
    error(error: Error): void;
    /**
     * Signals the end of the stream to the consumer. If the
     * result is provided, will trigger the on('data') event
     * listener if the stream is flowing and buffer the data
     * otherwise until the stream is flowing.
     */
    end(result?: T): void;
}
/**
 * A stream that has a buffer already read. Returns the original stream
 * that was read as well as the chunks that got read.
 *
 * The `ended` flag indicates if the stream has been fully consumed.
 */
export interface ReadableBufferedStream<T> {
    /**
     * The original stream that is being read.
     */
    stream: ReadableStream<T>;
    /**
     * An array of chunks already read from this stream.
     */
    buffer: T[];
    /**
     * Signals if the stream has ended or not. If not, consumers
     * should continue to read from the stream until consumed.
     */
    ended: boolean;
}
export declare function isReadableStream<T>(obj: unknown): obj is ReadableStream<T>;
export declare function isReadableBufferedStream<T>(obj: unknown): obj is ReadableBufferedStream<T>;
export interface IReducer<T, R = T> {
    (data: T[]): R;
}
export interface IDataTransformer<Original, Transformed> {
    (data: Original): Transformed;
}
export interface IErrorTransformer {
    (error: Error): Error;
}
export interface ITransformer<Original, Transformed> {
    data: IDataTransformer<Original, Transformed>;
    error?: IErrorTransformer;
}
export declare function newWriteableStream<T>(reducer: IReducer<T>, options?: WriteableStreamOptions): WriteableStream<T>;
export interface WriteableStreamOptions {
    /**
     * The number of objects to buffer before WriteableStream#write()
     * signals back that the buffer is full. Can be used to reduce
     * the memory pressure when the stream is not flowing.
     */
    highWaterMark?: number;
}
/**
 * Helper to fully read a T readable into a T.
 */
export declare function consumeReadable<T>(readable: Readable<T>, reducer: IReducer<T>): T;
/**
 * Helper to read a T readable up to a maximum of chunks. If the limit is
 * reached, will return a readable instead to ensure all data can still
 * be read.
 */
export declare function peekReadable<T>(readable: Readable<T>, reducer: IReducer<T>, maxChunks: number): T | Readable<T>;
/**
 * Helper to fully read a T stream into a T or consuming
 * a stream fully, awaiting all the events without caring
 * about the data.
 */
export declare function consumeStream<T, R = T>(stream: ReadableStreamEvents<T>, reducer: IReducer<T, R>): Promise<R>;
export declare function consumeStream(stream: ReadableStreamEvents<unknown>): Promise<undefined>;
export interface IStreamListener<T> {
    /**
     * The 'data' event is emitted whenever the stream is
     * relinquishing ownership of a chunk of data to a consumer.
     */
    onData(data: T): void;
    /**
     * Emitted when any error occurs.
     */
    onError(err: Error): void;
    /**
     * The 'end' event is emitted when there is no more data
     * to be consumed from the stream. The 'end' event will
     * not be emitted unless the data is completely consumed.
     */
    onEnd(): void;
}
/**
 * Helper to listen to all events of a T stream in proper order.
 */
export declare function listenStream<T>(stream: ReadableStreamEvents<T>, listener: IStreamListener<T>, token?: CancellationToken): void;
/**
 * Helper to peek up to `maxChunks` into a stream. The return type signals if
 * the stream has ended or not. If not, caller needs to add a `data` listener
 * to continue reading.
 */
export declare function peekStream<T>(stream: ReadableStream<T>, maxChunks: number): Promise<ReadableBufferedStream<T>>;
/**
 * Helper to create a readable stream from an existing T.
 */
export declare function toStream<T>(t: T, reducer: IReducer<T>): ReadableStream<T>;
/**
 * Helper to create an empty stream
 */
export declare function emptyStream(): ReadableStream<never>;
/**
 * Helper to convert a T into a Readable<T>.
 */
export declare function toReadable<T>(t: T): Readable<T>;
/**
 * Helper to transform a readable stream into another stream.
 */
export declare function transform<Original, Transformed>(stream: ReadableStreamEvents<Original>, transformer: ITransformer<Original, Transformed>, reducer: IReducer<Transformed>): ReadableStream<Transformed>;
/**
 * Helper to take an existing readable that will
 * have a prefix injected to the beginning.
 */
export declare function prefixedReadable<T>(prefix: T, readable: Readable<T>, reducer: IReducer<T>): Readable<T>;
/**
 * Helper to take an existing stream that will
 * have a prefix injected to the beginning.
 */
export declare function prefixedStream<T>(prefix: T, stream: ReadableStream<T>, reducer: IReducer<T>): ReadableStream<T>;
