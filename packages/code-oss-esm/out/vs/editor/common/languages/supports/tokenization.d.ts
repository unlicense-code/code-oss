import { Color } from '../../../../base/common/color.js';
import { LanguageId, FontStyle, ColorId, StandardTokenType } from '../../encodedTokenAttributes.js';
export interface ITokenThemeRule {
    token: string;
    foreground?: string;
    background?: string;
    fontStyle?: string;
}
export declare class ParsedTokenThemeRule {
    _parsedThemeRuleBrand: void;
    readonly token: string;
    readonly index: number;
    /**
     * -1 if not set. An or mask of `FontStyle` otherwise.
     */
    readonly fontStyle: FontStyle;
    readonly foreground: string | null;
    readonly background: string | null;
    constructor(token: string, index: number, fontStyle: number, foreground: string | null, background: string | null);
}
/**
 * Parse a raw theme into rules.
 */
export declare function parseTokenTheme(source: ITokenThemeRule[]): ParsedTokenThemeRule[];
export declare class ColorMap {
    private _lastColorId;
    private readonly _id2color;
    private readonly _color2id;
    constructor();
    getId(color: string | null): ColorId;
    getColorMap(): Color[];
}
export declare class TokenTheme {
    static createFromRawTokenTheme(source: ITokenThemeRule[], customTokenColors: string[]): TokenTheme;
    static createFromParsedTokenTheme(source: ParsedTokenThemeRule[], customTokenColors: string[]): TokenTheme;
    private readonly _colorMap;
    private readonly _root;
    private readonly _cache;
    constructor(colorMap: ColorMap, root: ThemeTrieElement);
    getColorMap(): Color[];
    /**
     * used for testing purposes
     */
    getThemeTrieElement(): ExternalThemeTrieElement;
    _match(token: string): ThemeTrieElementRule;
    match(languageId: LanguageId, token: string): number;
}
export declare function toStandardTokenType(tokenType: string): StandardTokenType;
export declare function strcmp(a: string, b: string): number;
export declare class ThemeTrieElementRule {
    _themeTrieElementRuleBrand: void;
    private _fontStyle;
    private _foreground;
    private _background;
    metadata: number;
    constructor(fontStyle: FontStyle, foreground: ColorId, background: ColorId);
    clone(): ThemeTrieElementRule;
    acceptOverwrite(fontStyle: FontStyle, foreground: ColorId, background: ColorId): void;
}
export declare class ExternalThemeTrieElement {
    readonly mainRule: ThemeTrieElementRule;
    readonly children: Map<string, ExternalThemeTrieElement>;
    constructor(mainRule: ThemeTrieElementRule, children?: Map<string, ExternalThemeTrieElement> | {
        [key: string]: ExternalThemeTrieElement;
    });
}
export declare class ThemeTrieElement {
    _themeTrieElementBrand: void;
    private readonly _mainRule;
    private readonly _children;
    constructor(mainRule: ThemeTrieElementRule);
    /**
     * used for testing purposes
     */
    toExternalThemeTrieElement(): ExternalThemeTrieElement;
    match(token: string): ThemeTrieElementRule;
    insert(token: string, fontStyle: FontStyle, foreground: ColorId, background: ColorId): void;
}
export declare function generateTokensCSSForColorMap(colorMap: readonly Color[]): string;
