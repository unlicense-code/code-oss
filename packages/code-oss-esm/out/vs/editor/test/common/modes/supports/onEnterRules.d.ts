import { IndentAction } from '../../../../common/languages/languageConfiguration.js';
export declare const javascriptOnEnterRules: ({
    beforeText: RegExp;
    afterText: RegExp;
    action: {
        indentAction: IndentAction;
        appendText: string;
        removeText?: undefined;
    };
    previousLineText?: undefined;
} | {
    beforeText: RegExp;
    action: {
        indentAction: IndentAction;
        appendText: string;
        removeText?: undefined;
    };
    afterText?: undefined;
    previousLineText?: undefined;
} | {
    beforeText: RegExp;
    previousLineText: RegExp;
    action: {
        indentAction: IndentAction;
        appendText: string;
        removeText?: undefined;
    };
    afterText?: undefined;
} | {
    beforeText: RegExp;
    action: {
        indentAction: IndentAction;
        removeText: number;
        appendText?: undefined;
    };
    afterText?: undefined;
    previousLineText?: undefined;
} | {
    beforeText: RegExp;
    afterText: RegExp;
    action: {
        indentAction: IndentAction;
        appendText?: undefined;
        removeText?: undefined;
    };
    previousLineText?: undefined;
} | {
    previousLineText: RegExp;
    beforeText: RegExp;
    action: {
        indentAction: IndentAction;
        appendText?: undefined;
        removeText?: undefined;
    };
    afterText?: undefined;
})[];
export declare const phpOnEnterRules: ({
    beforeText: RegExp;
    afterText: RegExp;
    action: {
        indentAction: IndentAction;
        appendText: string;
        removeText?: undefined;
    };
    previousLineText?: undefined;
} | {
    beforeText: RegExp;
    action: {
        indentAction: IndentAction;
        appendText: string;
        removeText?: undefined;
    };
    afterText?: undefined;
    previousLineText?: undefined;
} | {
    beforeText: RegExp;
    action: {
        indentAction: IndentAction;
        removeText: number;
        appendText?: undefined;
    };
    afterText?: undefined;
    previousLineText?: undefined;
} | {
    beforeText: RegExp;
    previousLineText: RegExp;
    action: {
        indentAction: IndentAction;
        appendText?: undefined;
        removeText?: undefined;
    };
    afterText?: undefined;
})[];
export declare const cppOnEnterRules: {
    previousLineText: RegExp;
    beforeText: RegExp;
    action: {
        indentAction: IndentAction;
    };
}[];
export declare const htmlOnEnterRules: ({
    beforeText: RegExp;
    afterText: RegExp;
    action: {
        indentAction: IndentAction;
    };
} | {
    beforeText: RegExp;
    action: {
        indentAction: IndentAction;
    };
    afterText?: undefined;
})[];
