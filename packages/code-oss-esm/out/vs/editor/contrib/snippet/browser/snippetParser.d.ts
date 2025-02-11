export declare const enum TokenType {
    Dollar = 0,
    Colon = 1,
    Comma = 2,
    CurlyOpen = 3,
    CurlyClose = 4,
    Backslash = 5,
    Forwardslash = 6,
    Pipe = 7,
    Int = 8,
    VariableName = 9,
    Format = 10,
    Plus = 11,
    Dash = 12,
    QuestionMark = 13,
    EOF = 14
}
export interface Token {
    type: TokenType;
    pos: number;
    len: number;
}
export declare class Scanner {
    private static _table;
    static isDigitCharacter(ch: number): boolean;
    static isVariableCharacter(ch: number): boolean;
    value: string;
    pos: number;
    text(value: string): void;
    tokenText(token: Token): string;
    next(): Token;
}
export declare abstract class Marker {
    readonly _markerBrand: any;
    parent: Marker;
    protected _children: Marker[];
    appendChild(child: Marker): this;
    replace(child: Marker, others: Marker[]): void;
    get children(): Marker[];
    get rightMostDescendant(): Marker;
    get snippet(): TextmateSnippet | undefined;
    toString(): string;
    abstract toTextmateString(): string;
    len(): number;
    abstract clone(): Marker;
}
export declare class Text extends Marker {
    value: string;
    static escape(value: string): string;
    constructor(value: string);
    toString(): string;
    toTextmateString(): string;
    len(): number;
    clone(): Text;
}
export declare abstract class TransformableMarker extends Marker {
    transform?: Transform;
}
export declare class Placeholder extends TransformableMarker {
    index: number;
    static compareByIndex(a: Placeholder, b: Placeholder): number;
    constructor(index: number);
    get isFinalTabstop(): boolean;
    get choice(): Choice | undefined;
    toTextmateString(): string;
    clone(): Placeholder;
}
export declare class Choice extends Marker {
    readonly options: Text[];
    appendChild(marker: Marker): this;
    toString(): string;
    toTextmateString(): string;
    len(): number;
    clone(): Choice;
}
export declare class Transform extends Marker {
    regexp: RegExp;
    resolve(value: string): string;
    private _replace;
    toString(): string;
    toTextmateString(): string;
    clone(): Transform;
}
export declare class FormatString extends Marker {
    readonly index: number;
    readonly shorthandName?: string | undefined;
    readonly ifValue?: string | undefined;
    readonly elseValue?: string | undefined;
    constructor(index: number, shorthandName?: string | undefined, ifValue?: string | undefined, elseValue?: string | undefined);
    resolve(value?: string): string;
    private _toPascalCase;
    private _toCamelCase;
    toTextmateString(): string;
    clone(): FormatString;
}
export declare class Variable extends TransformableMarker {
    name: string;
    constructor(name: string);
    resolve(resolver: VariableResolver): boolean;
    toTextmateString(): string;
    clone(): Variable;
}
export interface VariableResolver {
    resolve(variable: Variable): string | undefined;
}
export declare class TextmateSnippet extends Marker {
    private _placeholders?;
    get placeholderInfo(): {
        all: Placeholder[];
        last?: Placeholder;
    };
    get placeholders(): Placeholder[];
    offset(marker: Marker): number;
    fullLen(marker: Marker): number;
    enclosingPlaceholders(placeholder: Placeholder): Placeholder[];
    resolveVariables(resolver: VariableResolver): this;
    appendChild(child: Marker): this;
    replace(child: Marker, others: Marker[]): void;
    toTextmateString(): string;
    clone(): TextmateSnippet;
    walk(visitor: (marker: Marker) => boolean): void;
}
export declare class SnippetParser {
    static escape(value: string): string;
    /**
     * Takes a snippet and returns the insertable string, e.g return the snippet-string
     * without any placeholder, tabstop, variables etc...
     */
    static asInsertText(value: string): string;
    static guessNeedsClipboard(template: string): boolean;
    private _scanner;
    private _token;
    parse(value: string, insertFinalTabstop?: boolean, enforceFinalTabstop?: boolean): TextmateSnippet;
    parseFragment(value: string, snippet: TextmateSnippet): readonly Marker[];
    ensureFinalTabstop(snippet: TextmateSnippet, enforceFinalTabstop: boolean, insertFinalTabstop: boolean): void;
    private _accept;
    private _backTo;
    private _until;
    private _parse;
    private _parseEscaped;
    private _parseTabstopOrVariableName;
    private _parseComplexPlaceholder;
    private _parseChoiceElement;
    private _parseComplexVariable;
    private _parseTransform;
    private _parseFormatString;
    private _parseAnything;
}
