import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { IRange } from '../../../common/core/range.js';
import { ITextModel } from '../../../common/model.js';
import { ILink, ILinksList, LinkProvider } from '../../../common/languages.js';
import { LanguageFeatureRegistry } from '../../../common/languageFeatureRegistry.js';
export declare class Link implements ILink {
    private _link;
    private readonly _provider;
    constructor(link: ILink, provider: LinkProvider);
    toJSON(): ILink;
    get range(): IRange;
    get url(): URI | string | undefined;
    get tooltip(): string | undefined;
    resolve(token: CancellationToken): Promise<URI | string>;
}
export declare class LinksList {
    readonly links: Link[];
    private readonly _disposables;
    constructor(tuples: [ILinksList, LinkProvider][]);
    dispose(): void;
    private static _union;
}
export declare function getLinks(providers: LanguageFeatureRegistry<LinkProvider>, model: ITextModel, token: CancellationToken): Promise<LinksList>;
