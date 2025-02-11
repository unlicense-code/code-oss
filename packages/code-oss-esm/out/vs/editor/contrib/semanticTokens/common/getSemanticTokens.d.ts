import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ITextModel } from '../../../common/model.js';
import { DocumentSemanticTokensProvider, SemanticTokens, SemanticTokensEdits, DocumentRangeSemanticTokensProvider } from '../../../common/languages.js';
import { Range } from '../../../common/core/range.js';
import { LanguageFeatureRegistry } from '../../../common/languageFeatureRegistry.js';
export declare function isSemanticTokens(v: SemanticTokens | SemanticTokensEdits): v is SemanticTokens;
export declare function isSemanticTokensEdits(v: SemanticTokens | SemanticTokensEdits): v is SemanticTokensEdits;
export declare class DocumentSemanticTokensResult {
    readonly provider: DocumentSemanticTokensProvider;
    readonly tokens: SemanticTokens | SemanticTokensEdits | null;
    readonly error: any;
    constructor(provider: DocumentSemanticTokensProvider, tokens: SemanticTokens | SemanticTokensEdits | null, error: any);
}
export declare function hasDocumentSemanticTokensProvider(registry: LanguageFeatureRegistry<DocumentSemanticTokensProvider>, model: ITextModel): boolean;
export declare function getDocumentSemanticTokens(registry: LanguageFeatureRegistry<DocumentSemanticTokensProvider>, model: ITextModel, lastProvider: DocumentSemanticTokensProvider | null, lastResultId: string | null, token: CancellationToken): Promise<DocumentSemanticTokensResult | null>;
declare class DocumentRangeSemanticTokensResult {
    readonly provider: DocumentRangeSemanticTokensProvider;
    readonly tokens: SemanticTokens | null;
    constructor(provider: DocumentRangeSemanticTokensProvider, tokens: SemanticTokens | null);
}
export declare function hasDocumentRangeSemanticTokensProvider(providers: LanguageFeatureRegistry<DocumentRangeSemanticTokensProvider>, model: ITextModel): boolean;
export declare function getDocumentRangeSemanticTokens(registry: LanguageFeatureRegistry<DocumentRangeSemanticTokensProvider>, model: ITextModel, range: Range, token: CancellationToken): Promise<DocumentRangeSemanticTokensResult | null>;
export {};
