import { CancellationToken } from '../../../base/common/cancellation.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { Range } from '../../common/core/range.js';
import * as languages from '../../common/languages.js';
import { ILanguageExtensionPoint, ILanguageService } from '../../common/languages/language.js';
import { LanguageConfiguration } from '../../common/languages/languageConfiguration.js';
import { LanguageSelector } from '../../common/languageSelector.js';
import * as model from '../../common/model.js';
import { IMonarchLanguage } from '../common/monarch/monarchTypes.js';
import { IStandaloneThemeService } from '../common/standaloneTheme.js';
import { IMarkerData } from '../../../platform/markers/common/markers.js';
/**
 * Register information about a new language.
 */
export declare function register(language: ILanguageExtensionPoint): void;
/**
 * Get the information of all the registered languages.
 */
export declare function getLanguages(): ILanguageExtensionPoint[];
export declare function getEncodedLanguageId(languageId: string): number;
/**
 * An event emitted when a language is associated for the first time with a text model.
 * @event
 */
export declare function onLanguage(languageId: string, callback: () => void): IDisposable;
/**
 * An event emitted when a language is associated for the first time with a text model or
 * when a language is encountered during the tokenization of another language.
 * @event
 */
export declare function onLanguageEncountered(languageId: string, callback: () => void): IDisposable;
/**
 * Set the editing configuration for a language.
 */
export declare function setLanguageConfiguration(languageId: string, configuration: LanguageConfiguration): IDisposable;
/**
 * @internal
 */
export declare class EncodedTokenizationSupportAdapter implements languages.ITokenizationSupport, IDisposable {
    private readonly _languageId;
    private readonly _actual;
    constructor(languageId: string, actual: EncodedTokensProvider);
    dispose(): void;
    getInitialState(): languages.IState;
    tokenize(line: string, hasEOL: boolean, state: languages.IState): languages.TokenizationResult;
    tokenizeEncoded(line: string, hasEOL: boolean, state: languages.IState): languages.EncodedTokenizationResult;
}
/**
 * @internal
 */
export declare class TokenizationSupportAdapter implements languages.ITokenizationSupport, IDisposable {
    private readonly _languageId;
    private readonly _actual;
    private readonly _languageService;
    private readonly _standaloneThemeService;
    constructor(_languageId: string, _actual: TokensProvider, _languageService: ILanguageService, _standaloneThemeService: IStandaloneThemeService);
    dispose(): void;
    getInitialState(): languages.IState;
    private static _toClassicTokens;
    static adaptTokenize(language: string, actual: {
        tokenize(line: string, state: languages.IState): ILineTokens;
    }, line: string, state: languages.IState): languages.TokenizationResult;
    tokenize(line: string, hasEOL: boolean, state: languages.IState): languages.TokenizationResult;
    private _toBinaryTokens;
    tokenizeEncoded(line: string, hasEOL: boolean, state: languages.IState): languages.EncodedTokenizationResult;
}
/**
 * A token.
 */
export interface IToken {
    startIndex: number;
    scopes: string;
}
/**
 * The result of a line tokenization.
 */
export interface ILineTokens {
    /**
     * The list of tokens on the line.
     */
    tokens: IToken[];
    /**
     * The tokenization end state.
     * A pointer will be held to this and the object should not be modified by the tokenizer after the pointer is returned.
     */
    endState: languages.IState;
}
/**
 * The result of a line tokenization.
 */
export interface IEncodedLineTokens {
    /**
     * The tokens on the line in a binary, encoded format. Each token occupies two array indices. For token i:
     *  - at offset 2*i => startIndex
     *  - at offset 2*i + 1 => metadata
     * Meta data is in binary format:
     * - -------------------------------------------
     *     3322 2222 2222 1111 1111 1100 0000 0000
     *     1098 7654 3210 9876 5432 1098 7654 3210
     * - -------------------------------------------
     *     bbbb bbbb bfff ffff ffFF FFTT LLLL LLLL
     * - -------------------------------------------
     *  - L = EncodedLanguageId (8 bits): Use `getEncodedLanguageId` to get the encoded ID of a language.
     *  - T = StandardTokenType (2 bits): Other = 0, Comment = 1, String = 2, RegEx = 3.
     *  - F = FontStyle (4 bits): None = 0, Italic = 1, Bold = 2, Underline = 4, Strikethrough = 8.
     *  - f = foreground ColorId (9 bits)
     *  - b = background ColorId (9 bits)
     *  - The color value for each colorId is defined in IStandaloneThemeData.customTokenColors:
     * e.g. colorId = 1 is stored in IStandaloneThemeData.customTokenColors[1]. Color id = 0 means no color,
     * id = 1 is for the default foreground color, id = 2 for the default background.
     */
    tokens: Uint32Array;
    /**
     * The tokenization end state.
     * A pointer will be held to this and the object should not be modified by the tokenizer after the pointer is returned.
     */
    endState: languages.IState;
}
/**
 * A factory for token providers.
 */
export interface TokensProviderFactory {
    create(): languages.ProviderResult<TokensProvider | EncodedTokensProvider | IMonarchLanguage>;
}
/**
 * A "manual" provider of tokens.
 */
export interface TokensProvider {
    /**
     * The initial state of a language. Will be the state passed in to tokenize the first line.
     */
    getInitialState(): languages.IState;
    /**
     * Tokenize a line given the state at the beginning of the line.
     */
    tokenize(line: string, state: languages.IState): ILineTokens;
}
/**
 * A "manual" provider of tokens, returning tokens in a binary form.
 */
export interface EncodedTokensProvider {
    /**
     * The initial state of a language. Will be the state passed in to tokenize the first line.
     */
    getInitialState(): languages.IState;
    /**
     * Tokenize a line given the state at the beginning of the line.
     */
    tokenizeEncoded(line: string, state: languages.IState): IEncodedLineTokens;
    /**
     * Tokenize a line given the state at the beginning of the line.
     */
    tokenize?(line: string, state: languages.IState): ILineTokens;
}
/**
 * Change the color map that is used for token colors.
 * Supported formats (hex): #RRGGBB, $RRGGBBAA, #RGB, #RGBA
 */
export declare function setColorMap(colorMap: string[] | null): void;
/**
 * Register a tokens provider factory for a language. This tokenizer will be exclusive with a tokenizer
 * set using `setTokensProvider` or one created using `setMonarchTokensProvider`, but will work together
 * with a tokens provider set using `registerDocumentSemanticTokensProvider` or `registerDocumentRangeSemanticTokensProvider`.
 */
export declare function registerTokensProviderFactory(languageId: string, factory: TokensProviderFactory): IDisposable;
/**
 * Set the tokens provider for a language (manual implementation). This tokenizer will be exclusive
 * with a tokenizer created using `setMonarchTokensProvider`, or with `registerTokensProviderFactory`,
 * but will work together with a tokens provider set using `registerDocumentSemanticTokensProvider`
 * or `registerDocumentRangeSemanticTokensProvider`.
 */
export declare function setTokensProvider(languageId: string, provider: TokensProvider | EncodedTokensProvider | Thenable<TokensProvider | EncodedTokensProvider>): IDisposable;
/**
 * Set the tokens provider for a language (monarch implementation). This tokenizer will be exclusive
 * with a tokenizer set using `setTokensProvider`, or with `registerTokensProviderFactory`, but will
 * work together with a tokens provider set using `registerDocumentSemanticTokensProvider` or
 * `registerDocumentRangeSemanticTokensProvider`.
 */
export declare function setMonarchTokensProvider(languageId: string, languageDef: IMonarchLanguage | Thenable<IMonarchLanguage>): IDisposable;
/**
 * Register a reference provider (used by e.g. reference search).
 */
export declare function registerReferenceProvider(languageSelector: LanguageSelector, provider: languages.ReferenceProvider): IDisposable;
/**
 * Register a rename provider (used by e.g. rename symbol).
 */
export declare function registerRenameProvider(languageSelector: LanguageSelector, provider: languages.RenameProvider): IDisposable;
/**
 * Register a new symbol-name provider (e.g., when a symbol is being renamed, show new possible symbol-names)
 */
export declare function registerNewSymbolNameProvider(languageSelector: LanguageSelector, provider: languages.NewSymbolNamesProvider): IDisposable;
/**
 * Register a signature help provider (used by e.g. parameter hints).
 */
export declare function registerSignatureHelpProvider(languageSelector: LanguageSelector, provider: languages.SignatureHelpProvider): IDisposable;
/**
 * Register a hover provider (used by e.g. editor hover).
 */
export declare function registerHoverProvider(languageSelector: LanguageSelector, provider: languages.HoverProvider): IDisposable;
/**
 * Register a document symbol provider (used by e.g. outline).
 */
export declare function registerDocumentSymbolProvider(languageSelector: LanguageSelector, provider: languages.DocumentSymbolProvider): IDisposable;
/**
 * Register a document highlight provider (used by e.g. highlight occurrences).
 */
export declare function registerDocumentHighlightProvider(languageSelector: LanguageSelector, provider: languages.DocumentHighlightProvider): IDisposable;
/**
 * Register an linked editing range provider.
 */
export declare function registerLinkedEditingRangeProvider(languageSelector: LanguageSelector, provider: languages.LinkedEditingRangeProvider): IDisposable;
/**
 * Register a definition provider (used by e.g. go to definition).
 */
export declare function registerDefinitionProvider(languageSelector: LanguageSelector, provider: languages.DefinitionProvider): IDisposable;
/**
 * Register a implementation provider (used by e.g. go to implementation).
 */
export declare function registerImplementationProvider(languageSelector: LanguageSelector, provider: languages.ImplementationProvider): IDisposable;
/**
 * Register a type definition provider (used by e.g. go to type definition).
 */
export declare function registerTypeDefinitionProvider(languageSelector: LanguageSelector, provider: languages.TypeDefinitionProvider): IDisposable;
/**
 * Register a code lens provider (used by e.g. inline code lenses).
 */
export declare function registerCodeLensProvider(languageSelector: LanguageSelector, provider: languages.CodeLensProvider): IDisposable;
/**
 * Register a code action provider (used by e.g. quick fix).
 */
export declare function registerCodeActionProvider(languageSelector: LanguageSelector, provider: CodeActionProvider, metadata?: CodeActionProviderMetadata): IDisposable;
/**
 * Register a formatter that can handle only entire models.
 */
export declare function registerDocumentFormattingEditProvider(languageSelector: LanguageSelector, provider: languages.DocumentFormattingEditProvider): IDisposable;
/**
 * Register a formatter that can handle a range inside a model.
 */
export declare function registerDocumentRangeFormattingEditProvider(languageSelector: LanguageSelector, provider: languages.DocumentRangeFormattingEditProvider): IDisposable;
/**
 * Register a formatter than can do formatting as the user types.
 */
export declare function registerOnTypeFormattingEditProvider(languageSelector: LanguageSelector, provider: languages.OnTypeFormattingEditProvider): IDisposable;
/**
 * Register a link provider that can find links in text.
 */
export declare function registerLinkProvider(languageSelector: LanguageSelector, provider: languages.LinkProvider): IDisposable;
/**
 * Register a completion item provider (use by e.g. suggestions).
 */
export declare function registerCompletionItemProvider(languageSelector: LanguageSelector, provider: languages.CompletionItemProvider): IDisposable;
/**
 * Register a document color provider (used by Color Picker, Color Decorator).
 */
export declare function registerColorProvider(languageSelector: LanguageSelector, provider: languages.DocumentColorProvider): IDisposable;
/**
 * Register a folding range provider
 */
export declare function registerFoldingRangeProvider(languageSelector: LanguageSelector, provider: languages.FoldingRangeProvider): IDisposable;
/**
 * Register a declaration provider
 */
export declare function registerDeclarationProvider(languageSelector: LanguageSelector, provider: languages.DeclarationProvider): IDisposable;
/**
 * Register a selection range provider
 */
export declare function registerSelectionRangeProvider(languageSelector: LanguageSelector, provider: languages.SelectionRangeProvider): IDisposable;
/**
 * Register a document semantic tokens provider. A semantic tokens provider will complement and enhance a
 * simple top-down tokenizer. Simple top-down tokenizers can be set either via `setMonarchTokensProvider`
 * or `setTokensProvider`.
 *
 * For the best user experience, register both a semantic tokens provider and a top-down tokenizer.
 */
export declare function registerDocumentSemanticTokensProvider(languageSelector: LanguageSelector, provider: languages.DocumentSemanticTokensProvider): IDisposable;
/**
 * Register a document range semantic tokens provider. A semantic tokens provider will complement and enhance a
 * simple top-down tokenizer. Simple top-down tokenizers can be set either via `setMonarchTokensProvider`
 * or `setTokensProvider`.
 *
 * For the best user experience, register both a semantic tokens provider and a top-down tokenizer.
 */
export declare function registerDocumentRangeSemanticTokensProvider(languageSelector: LanguageSelector, provider: languages.DocumentRangeSemanticTokensProvider): IDisposable;
/**
 * Register an inline completions provider.
 */
export declare function registerInlineCompletionsProvider(languageSelector: LanguageSelector, provider: languages.InlineCompletionsProvider): IDisposable;
export declare function registerInlineEditProvider(languageSelector: LanguageSelector, provider: languages.InlineEditProvider): IDisposable;
/**
 * Register an inlay hints provider.
 */
export declare function registerInlayHintsProvider(languageSelector: LanguageSelector, provider: languages.InlayHintsProvider): IDisposable;
/**
 * Contains additional diagnostic information about the context in which
 * a [code action](#CodeActionProvider.provideCodeActions) is run.
 */
export interface CodeActionContext {
    /**
     * An array of diagnostics.
     */
    readonly markers: IMarkerData[];
    /**
     * Requested kind of actions to return.
     */
    readonly only?: string;
    /**
     * The reason why code actions were requested.
     */
    readonly trigger: languages.CodeActionTriggerType;
}
/**
 * The code action interface defines the contract between extensions and
 * the [light bulb](https://code.visualstudio.com/docs/editor/editingevolved#_code-action) feature.
 */
export interface CodeActionProvider {
    /**
     * Provide commands for the given document and range.
     */
    provideCodeActions(model: model.ITextModel, range: Range, context: CodeActionContext, token: CancellationToken): languages.ProviderResult<languages.CodeActionList>;
    /**
     * Given a code action fill in the edit. Will only invoked when missing.
     */
    resolveCodeAction?(codeAction: languages.CodeAction, token: CancellationToken): languages.ProviderResult<languages.CodeAction>;
}
/**
 * Metadata about the type of code actions that a {@link CodeActionProvider} provides.
 */
export interface CodeActionProviderMetadata {
    /**
     * List of code action kinds that a {@link CodeActionProvider} may return.
     *
     * This list is used to determine if a given `CodeActionProvider` should be invoked or not.
     * To avoid unnecessary computation, every `CodeActionProvider` should list use `providedCodeActionKinds`. The
     * list of kinds may either be generic, such as `["quickfix", "refactor", "source"]`, or list out every kind provided,
     * such as `["quickfix.removeLine", "source.fixAll" ...]`.
     */
    readonly providedCodeActionKinds?: readonly string[];
    readonly documentation?: ReadonlyArray<{
        readonly kind: string;
        readonly command: languages.Command;
    }>;
}
/**
 * @internal
 */
export declare function createMonacoLanguagesAPI(): typeof monaco.languages;
