import type { Parser } from '@vscode/tree-sitter-wasm';
import { Event } from '../../../../base/common/event.js';
import { ITextModel } from '../../../common/model.js';
import { ITreeSitterParserService, ITreeSitterParseResult, ITextModelTreeSitter } from '../../../common/services/treeSitterParserService.js';
import { Range } from '../../../common/core/range.js';
export declare class TestTreeSitterParserService implements ITreeSitterParserService {
    getTextModelTreeSitter(textModel: ITextModel): ITextModelTreeSitter | undefined;
    getTree(content: string, languageId: string): Promise<Parser.Tree | undefined>;
    onDidUpdateTree: Event<{
        textModel: ITextModel;
        ranges: Range[];
    }>;
    onDidAddLanguage: Event<{
        id: string;
        language: Parser.Language;
    }>;
    _serviceBrand: undefined;
    getOrInitLanguage(languageId: string): Parser.Language | undefined;
    waitForLanguage(languageId: string): Promise<Parser.Language | undefined>;
    getParseResult(textModel: ITextModel): ITreeSitterParseResult | undefined;
}
