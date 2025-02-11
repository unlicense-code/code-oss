import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IProgress, IProgressStep } from '../../../../../platform/progress/common/progress.js';
import { INotebookEditorService } from '../../../notebook/browser/services/notebookEditorService.js';
import { IFileMatch, ISearchComplete, ITextQuery } from '../../../../services/search/common/search.js';
import { IChangeEvent, ISearchTreeFileMatch, ISearchTreeFolderMatch, IPlainTextSearchHeading, ISearchModel, ISearchResult, ITextSearchHeading, RenderableMatch } from './searchTreeCommon.js';
import { RangeHighlightDecorations } from './rangeDecorations.js';
export declare class SearchResultImpl extends Disposable implements ISearchResult {
    readonly searchModel: ISearchModel;
    private readonly instantiationService;
    private readonly modelService;
    private readonly notebookEditorService;
    private _onChange;
    readonly onChange: Event<IChangeEvent>;
    private _onWillChangeModelListener;
    private _onDidChangeModelListener;
    private _plainTextSearchResult;
    private _aiTextSearchResult;
    private readonly _id;
    constructor(searchModel: ISearchModel, instantiationService: IInstantiationService, modelService: IModelService, notebookEditorService: INotebookEditorService);
    id(): string;
    get plainTextSearchResult(): IPlainTextSearchHeading;
    get aiTextSearchResult(): ITextSearchHeading;
    get children(): ITextSearchHeading[];
    get hasChildren(): boolean;
    get textSearchResults(): ITextSearchHeading[];
    batchReplace(elementsToReplace: RenderableMatch[]): Promise<void>;
    batchRemove(elementsToRemove: RenderableMatch[]): void;
    get isDirty(): boolean;
    get query(): ITextQuery | null;
    set query(query: ITextQuery | null);
    setAIQueryUsingTextQuery(query?: ITextQuery | null): void;
    private onDidAddNotebookEditorWidget;
    folderMatches(ai?: boolean): ISearchTreeFolderMatch[];
    private onModelAdded;
    private onNotebookEditorWidgetAdded;
    private onNotebookEditorWidgetRemoved;
    add(allRaw: IFileMatch[], searchInstanceID: string, ai: boolean, silent?: boolean): void;
    clear(): void;
    remove(matches: ISearchTreeFileMatch | ISearchTreeFolderMatch | (ISearchTreeFileMatch | ISearchTreeFolderMatch)[], ai?: boolean): void;
    replace(match: ISearchTreeFileMatch): Promise<any>;
    matches(ai?: boolean): ISearchTreeFileMatch[];
    isEmpty(): boolean;
    fileCount(): number;
    count(): number;
    setCachedSearchComplete(cachedSearchComplete: ISearchComplete | undefined, ai: boolean): void;
    getCachedSearchComplete(ai: boolean): ISearchComplete | undefined;
    toggleHighlights(value: boolean, ai?: boolean): void;
    getRangeHighlightDecorations(ai?: boolean): RangeHighlightDecorations;
    replaceAll(progress: IProgress<IProgressStep>): Promise<any>;
    dispose(): Promise<void>;
}
