/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Transform } from 'stream';
import { binaryIndexOf } from '../common/buffer.js';
/**
 * A Transform stream that splits the input on the "splitter" substring.
 * The resulting chunks will contain (and trail with) the splitter match.
 * The last chunk when the stream ends will be emitted even if a splitter
 * is not encountered.
 */
export class StreamSplitter extends Transform {
    constructor(splitter) {
        super();
        if (typeof splitter === 'number') {
            this.splitter = splitter;
            this.spitterLen = 1;
        }
        else {
            const buf = Buffer.isBuffer(splitter) ? splitter : Buffer.from(splitter);
            this.splitter = buf.length === 1 ? buf[0] : buf;
            this.spitterLen = buf.length;
        }
    }
    _transform(chunk, _encoding, callback) {
        if (!this.buffer) {
            this.buffer = chunk;
        }
        else {
            this.buffer = Buffer.concat([this.buffer, chunk]);
        }
        let offset = 0;
        while (offset < this.buffer.length) {
            const index = typeof this.splitter === 'number'
                ? this.buffer.indexOf(this.splitter, offset)
                : binaryIndexOf(this.buffer, this.splitter, offset);
            if (index === -1) {
                break;
            }
            this.push(this.buffer.slice(offset, index + this.spitterLen));
            offset = index + this.spitterLen;
        }
        this.buffer = offset === this.buffer.length ? undefined : this.buffer.slice(offset);
        callback();
    }
    _flush(callback) {
        if (this.buffer) {
            this.push(this.buffer);
        }
        callback();
    }
}
