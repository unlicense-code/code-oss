import { RGBA8 } from '../../../common/core/rgba.js';
export declare class MinimapCharRenderer {
    readonly scale: number;
    _minimapCharRendererBrand: void;
    private readonly charDataNormal;
    private readonly charDataLight;
    constructor(charData: Uint8ClampedArray, scale: number);
    private static soften;
    renderChar(target: ImageData, dx: number, dy: number, chCode: number, color: RGBA8, foregroundAlpha: number, backgroundColor: RGBA8, backgroundAlpha: number, fontScale: number, useLighterFont: boolean, force1pxHeight: boolean): void;
    blockRenderChar(target: ImageData, dx: number, dy: number, color: RGBA8, foregroundAlpha: number, backgroundColor: RGBA8, backgroundAlpha: number, force1pxHeight: boolean): void;
}
