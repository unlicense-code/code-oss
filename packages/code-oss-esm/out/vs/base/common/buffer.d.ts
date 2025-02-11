import * as streams from './stream.js';
export declare class VSBuffer {
    /**
     * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
     * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
     */
    static alloc(byteLength: number): VSBuffer;
    /**
     * When running in a nodejs context, if `actual` is not a nodejs Buffer, the backing store for
     * the returned `VSBuffer` instance might use a nodejs Buffer allocated from node's Buffer pool,
     * which is not transferrable.
     */
    static wrap(actual: Uint8Array): VSBuffer;
    /**
     * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
     * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
     */
    static fromString(source: string, options?: {
        dontUseNodeBuffer?: boolean;
    }): VSBuffer;
    /**
     * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
     * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
     */
    static fromByteArray(source: number[]): VSBuffer;
    /**
     * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
     * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
     */
    static concat(buffers: VSBuffer[], totalLength?: number): VSBuffer;
    readonly buffer: Uint8Array;
    readonly byteLength: number;
    private constructor();
    /**
     * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
     * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
     */
    clone(): VSBuffer;
    toString(): string;
    slice(start?: number, end?: number): VSBuffer;
    set(array: VSBuffer, offset?: number): void;
    set(array: Uint8Array, offset?: number): void;
    set(array: ArrayBuffer, offset?: number): void;
    set(array: ArrayBufferView, offset?: number): void;
    set(array: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView, offset?: number): void;
    readUInt32BE(offset: number): number;
    writeUInt32BE(value: number, offset: number): void;
    readUInt32LE(offset: number): number;
    writeUInt32LE(value: number, offset: number): void;
    readUInt8(offset: number): number;
    writeUInt8(value: number, offset: number): void;
    indexOf(subarray: VSBuffer | Uint8Array, offset?: number): number;
}
/**
 * Like String.indexOf, but works on Uint8Arrays.
 * Uses the boyer-moore-horspool algorithm to be reasonably speedy.
 */
export declare function binaryIndexOf(haystack: Uint8Array, needle: Uint8Array, offset?: number): number;
export declare function readUInt16LE(source: Uint8Array, offset: number): number;
export declare function writeUInt16LE(destination: Uint8Array, value: number, offset: number): void;
export declare function readUInt32BE(source: Uint8Array, offset: number): number;
export declare function writeUInt32BE(destination: Uint8Array, value: number, offset: number): void;
export declare function readUInt32LE(source: Uint8Array, offset: number): number;
export declare function writeUInt32LE(destination: Uint8Array, value: number, offset: number): void;
export declare function readUInt8(source: Uint8Array, offset: number): number;
export declare function writeUInt8(destination: Uint8Array, value: number, offset: number): void;
export interface VSBufferReadable extends streams.Readable<VSBuffer> {
}
export interface VSBufferReadableStream extends streams.ReadableStream<VSBuffer> {
}
export interface VSBufferWriteableStream extends streams.WriteableStream<VSBuffer> {
}
export interface VSBufferReadableBufferedStream extends streams.ReadableBufferedStream<VSBuffer> {
}
export declare function readableToBuffer(readable: VSBufferReadable): VSBuffer;
export declare function bufferToReadable(buffer: VSBuffer): VSBufferReadable;
export declare function streamToBuffer(stream: streams.ReadableStream<VSBuffer>): Promise<VSBuffer>;
export declare function bufferedStreamToBuffer(bufferedStream: streams.ReadableBufferedStream<VSBuffer>): Promise<VSBuffer>;
export declare function bufferToStream(buffer: VSBuffer): streams.ReadableStream<VSBuffer>;
export declare function streamToBufferReadableStream(stream: streams.ReadableStreamEvents<Uint8Array | string>): streams.ReadableStream<VSBuffer>;
export declare function newWriteableBufferStream(options?: streams.WriteableStreamOptions): streams.WriteableStream<VSBuffer>;
export declare function prefixedBufferReadable(prefix: VSBuffer, readable: VSBufferReadable): VSBufferReadable;
export declare function prefixedBufferStream(prefix: VSBuffer, stream: VSBufferReadableStream): VSBufferReadableStream;
/** Decodes base64 to a uint8 array. URL-encoded and unpadded base64 is allowed. */
export declare function decodeBase64(encoded: string): VSBuffer;
/** Encodes a buffer to a base64 string. */
export declare function encodeBase64({ buffer }: VSBuffer, padded?: boolean, urlSafe?: boolean): string;
