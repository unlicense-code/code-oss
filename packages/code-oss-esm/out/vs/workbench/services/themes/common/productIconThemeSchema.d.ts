export declare const fontIdRegex = "^([\\w_-]+)$";
export declare const fontStyleRegex = "^(normal|italic|(oblique[ \\w\\s-]+))$";
export declare const fontWeightRegex = "^(normal|bold|lighter|bolder|(\\d{0-1000}))$";
export declare const fontSizeRegex = "^([\\w_.%+-]+)$";
export declare const fontFormatRegex = "^woff|woff2|truetype|opentype|embedded-opentype|svg$";
export declare const fontCharacterRegex = "^([^\\\\]|\\\\[a-fA-F0-9]+)$";
export declare const fontColorRegex = "^#[0-9a-fA-F]{0,6}$";
export declare function registerProductIconThemeSchemas(): void;
