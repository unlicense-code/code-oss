import { MinimapCharRenderer } from './minimapCharRenderer.js';
/**
 * Creates character renderers. It takes a 'scale' that determines how large
 * characters should be drawn. Using this, it draws data into a canvas and
 * then downsamples the characters as necessary for the current display.
 * This makes rendering more efficient, rather than drawing a full (tiny)
 * font, or downsampling in real-time.
 */
export declare class MinimapCharRendererFactory {
    private static lastCreated?;
    private static lastFontFamily?;
    /**
     * Creates a new character renderer factory with the given scale.
     */
    static create(scale: number, fontFamily: string): MinimapCharRenderer;
    /**
     * Creates the font sample data, writing to a canvas.
     */
    static createSampleData(fontFamily: string): ImageData;
    /**
     * Creates a character renderer from the canvas sample data.
     */
    static createFromSampleData(source: Uint8ClampedArray, scale: number): MinimapCharRenderer;
    private static _downsampleChar;
    private static _downsample;
}
