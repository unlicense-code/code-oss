import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { LanguagesRegistry } from './languagesRegistry.js';
import { ILanguageNameIdPair, ILanguageSelection, ILanguageService, ILanguageIcon, ILanguageExtensionPoint } from '../languages/language.js';
import { ILanguageIdCodec } from '../languages.js';
export declare class LanguageService extends Disposable implements ILanguageService {
    _serviceBrand: undefined;
    static instanceCount: number;
    private readonly _onDidRequestBasicLanguageFeatures;
    readonly onDidRequestBasicLanguageFeatures: Event<string>;
    private readonly _onDidRequestRichLanguageFeatures;
    readonly onDidRequestRichLanguageFeatures: Event<string>;
    protected readonly _onDidChange: Emitter<void>;
    readonly onDidChange: Event<void>;
    private readonly _requestedBasicLanguages;
    private readonly _requestedRichLanguages;
    protected readonly _registry: LanguagesRegistry;
    readonly languageIdCodec: ILanguageIdCodec;
    constructor(warnOnOverwrite?: boolean);
    dispose(): void;
    registerLanguage(def: ILanguageExtensionPoint): IDisposable;
    isRegisteredLanguageId(languageId: string | null | undefined): boolean;
    getRegisteredLanguageIds(): string[];
    getSortedRegisteredLanguageNames(): ILanguageNameIdPair[];
    getLanguageName(languageId: string): string | null;
    getMimeType(languageId: string): string | null;
    getIcon(languageId: string): ILanguageIcon | null;
    getExtensions(languageId: string): ReadonlyArray<string>;
    getFilenames(languageId: string): ReadonlyArray<string>;
    getConfigurationFiles(languageId: string): ReadonlyArray<URI>;
    getLanguageIdByLanguageName(languageName: string): string | null;
    getLanguageIdByMimeType(mimeType: string | null | undefined): string | null;
    guessLanguageIdByFilepathOrFirstLine(resource: URI | null, firstLine?: string): string | null;
    createById(languageId: string | null | undefined): ILanguageSelection;
    createByMimeType(mimeType: string | null | undefined): ILanguageSelection;
    createByFilepathOrFirstLine(resource: URI | null, firstLine?: string): ILanguageSelection;
    private _createAndGetLanguageIdentifier;
    requestBasicLanguageFeatures(languageId: string): void;
    requestRichLanguageFeatures(languageId: string): void;
}
