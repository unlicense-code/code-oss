import { IDisposable } from '../../../../base/common/lifecycle.js';
import { DefaultEndOfLine, ITextBuffer, ITextBufferBuilder, ITextBufferFactory } from '../../model.js';
import { StringBuffer } from './pieceTreeBase.js';
declare class PieceTreeTextBufferFactory implements ITextBufferFactory {
    private readonly _chunks;
    private readonly _bom;
    private readonly _cr;
    private readonly _lf;
    private readonly _crlf;
    private readonly _containsRTL;
    private readonly _containsUnusualLineTerminators;
    private readonly _isBasicASCII;
    private readonly _normalizeEOL;
    constructor(_chunks: StringBuffer[], _bom: string, _cr: number, _lf: number, _crlf: number, _containsRTL: boolean, _containsUnusualLineTerminators: boolean, _isBasicASCII: boolean, _normalizeEOL: boolean);
    private _getEOL;
    create(defaultEOL: DefaultEndOfLine): {
        textBuffer: ITextBuffer;
        disposable: IDisposable;
    };
    getFirstLineText(lengthLimit: number): string;
}
export declare class PieceTreeTextBufferBuilder implements ITextBufferBuilder {
    private readonly chunks;
    private BOM;
    private _hasPreviousChar;
    private _previousChar;
    private readonly _tmpLineStarts;
    private cr;
    private lf;
    private crlf;
    private containsRTL;
    private containsUnusualLineTerminators;
    private isBasicASCII;
    constructor();
    acceptChunk(chunk: string): void;
    private _acceptChunk1;
    private _acceptChunk2;
    finish(normalizeEOL?: boolean): PieceTreeTextBufferFactory;
    private _finish;
}
export {};
