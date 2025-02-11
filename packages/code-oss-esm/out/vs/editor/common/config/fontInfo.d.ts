import { EditorOption, FindComputedEditorOptionValueById } from './editorOptions.js';
/**
 * @internal
 */
export interface IValidatedEditorOptions {
    get<T extends EditorOption>(id: T): FindComputedEditorOptionValueById<T>;
}
export declare class BareFontInfo {
    readonly _bareFontInfoBrand: void;
    /**
     * @internal
     */
    static createFromValidatedSettings(options: IValidatedEditorOptions, pixelRatio: number, ignoreEditorZoom: boolean): BareFontInfo;
    /**
     * @internal
     */
    static createFromRawSettings(opts: {
        fontFamily?: string;
        fontWeight?: string;
        fontSize?: number;
        fontLigatures?: boolean | string;
        fontVariations?: boolean | string;
        lineHeight?: number;
        letterSpacing?: number;
    }, pixelRatio: number, ignoreEditorZoom?: boolean): BareFontInfo;
    /**
     * @internal
     */
    private static _create;
    readonly pixelRatio: number;
    readonly fontFamily: string;
    readonly fontWeight: string;
    readonly fontSize: number;
    readonly fontFeatureSettings: string;
    readonly fontVariationSettings: string;
    readonly lineHeight: number;
    readonly letterSpacing: number;
    /**
     * @internal
     */
    protected constructor(opts: {
        pixelRatio: number;
        fontFamily: string;
        fontWeight: string;
        fontSize: number;
        fontFeatureSettings: string;
        fontVariationSettings: string;
        lineHeight: number;
        letterSpacing: number;
    });
    /**
     * @internal
     */
    getId(): string;
    /**
     * @internal
     */
    getMassagedFontFamily(): string;
    private static _wrapInQuotes;
}
export declare const SERIALIZED_FONT_INFO_VERSION = 2;
export declare class FontInfo extends BareFontInfo {
    readonly _editorStylingBrand: void;
    readonly version: number;
    readonly isTrusted: boolean;
    readonly isMonospace: boolean;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly typicalFullwidthCharacterWidth: number;
    readonly canUseHalfwidthRightwardsArrow: boolean;
    readonly spaceWidth: number;
    readonly middotWidth: number;
    readonly wsmiddotWidth: number;
    readonly maxDigitWidth: number;
    /**
     * @internal
     */
    constructor(opts: {
        pixelRatio: number;
        fontFamily: string;
        fontWeight: string;
        fontSize: number;
        fontFeatureSettings: string;
        fontVariationSettings: string;
        lineHeight: number;
        letterSpacing: number;
        isMonospace: boolean;
        typicalHalfwidthCharacterWidth: number;
        typicalFullwidthCharacterWidth: number;
        canUseHalfwidthRightwardsArrow: boolean;
        spaceWidth: number;
        middotWidth: number;
        wsmiddotWidth: number;
        maxDigitWidth: number;
    }, isTrusted: boolean);
    /**
     * @internal
     */
    equals(other: FontInfo): boolean;
}
