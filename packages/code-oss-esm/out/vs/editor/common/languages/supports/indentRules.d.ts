import { IndentationRule } from '../languageConfiguration.js';
export declare const enum IndentConsts {
    INCREASE_MASK = 1,
    DECREASE_MASK = 2,
    INDENT_NEXTLINE_MASK = 4,
    UNINDENT_MASK = 8
}
export declare class IndentRulesSupport {
    private readonly _indentationRules;
    constructor(indentationRules: IndentationRule);
    shouldIncrease(text: string): boolean;
    shouldDecrease(text: string): boolean;
    shouldIndentNextLine(text: string): boolean;
    shouldIgnore(text: string): boolean;
    getIndentMetadata(text: string): number;
}
