import { BareFontInfo } from '../../common/config/fontInfo.js';
export declare const enum CharWidthRequestType {
    Regular = 0,
    Italic = 1,
    Bold = 2
}
export declare class CharWidthRequest {
    readonly chr: string;
    readonly type: CharWidthRequestType;
    width: number;
    constructor(chr: string, type: CharWidthRequestType);
    fulfill(width: number): void;
}
export declare function readCharWidths(targetWindow: Window, bareFontInfo: BareFontInfo, requests: CharWidthRequest[]): void;
