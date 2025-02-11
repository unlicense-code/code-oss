import { Emitter, Event } from '../../../../base/common/event.js';
import { IMatch } from '../../../../base/common/filters.js';
import { IDisposable, IReference } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { Position } from '../../../common/core/position.js';
import { IRange } from '../../../common/core/range.js';
import { LocationLink } from '../../../common/languages.js';
import { ITextEditorModel, ITextModelService } from '../../../common/services/resolverService.js';
export declare class OneReference {
    readonly isProviderFirst: boolean;
    readonly parent: FileReferences;
    readonly link: LocationLink;
    private _rangeCallback;
    readonly id: string;
    private _range?;
    constructor(isProviderFirst: boolean, parent: FileReferences, link: LocationLink, _rangeCallback: (ref: OneReference) => void);
    get uri(): URI;
    get range(): IRange;
    set range(value: IRange);
    get ariaMessage(): string;
}
export declare class FilePreview implements IDisposable {
    private readonly _modelReference;
    constructor(_modelReference: IReference<ITextEditorModel>);
    dispose(): void;
    preview(range: IRange, n?: number): {
        value: string;
        highlight: IMatch;
    } | undefined;
}
export declare class FileReferences implements IDisposable {
    readonly parent: ReferencesModel;
    readonly uri: URI;
    readonly children: OneReference[];
    private _previews;
    constructor(parent: ReferencesModel, uri: URI);
    dispose(): void;
    getPreview(child: OneReference): FilePreview | undefined;
    get ariaMessage(): string;
    resolve(textModelResolverService: ITextModelService): Promise<FileReferences>;
}
export declare class ReferencesModel implements IDisposable {
    private readonly _links;
    private readonly _title;
    readonly groups: FileReferences[];
    readonly references: OneReference[];
    readonly _onDidChangeReferenceRange: Emitter<OneReference>;
    readonly onDidChangeReferenceRange: Event<OneReference>;
    constructor(links: LocationLink[], title: string);
    dispose(): void;
    clone(): ReferencesModel;
    get title(): string;
    get isEmpty(): boolean;
    get ariaMessage(): string;
    nextOrPreviousReference(reference: OneReference, next: boolean): OneReference;
    nearestReference(resource: URI, position: Position): OneReference | undefined;
    referenceAt(resource: URI, position: Position): OneReference | undefined;
    firstReference(): OneReference | undefined;
    private static _compareReferences;
}
