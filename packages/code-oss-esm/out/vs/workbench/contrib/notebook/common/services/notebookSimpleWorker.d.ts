import { IDiffResult } from '../../../../../base/common/diff/diff.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IRequestHandler, IWorkerServer } from '../../../../../base/common/worker/simpleWorker.js';
import { CellKind, IMainCellDto, INotebookDiffResult, IOutputDto, NotebookCellInternalMetadata, NotebookCellMetadata, NotebookCellsChangedEventDto, NotebookCellTextModelSplice, NotebookDocumentMetadata, TransientDocumentMetadata } from '../notebookCommon.js';
import { DefaultEndOfLine } from '../../../../../editor/common/model.js';
import { IModelChangedEvent } from '../../../../../editor/common/model/mirrorTextModel.js';
declare class MirrorCell {
    readonly handle: number;
    private readonly _eol;
    language: string;
    cellKind: CellKind;
    outputs: IOutputDto[];
    metadata?: NotebookCellMetadata | undefined;
    internalMetadata?: NotebookCellInternalMetadata | undefined;
    private readonly textModel;
    private _hash?;
    get eol(): DefaultEndOfLine;
    constructor(handle: number, uri: URI, source: string[], _eol: string, versionId: number, language: string, cellKind: CellKind, outputs: IOutputDto[], metadata?: NotebookCellMetadata | undefined, internalMetadata?: NotebookCellInternalMetadata | undefined);
    onEvents(e: IModelChangedEvent): void;
    getValue(): string;
    getComparisonValue(): Promise<number>;
    private _getHash;
}
declare class MirrorNotebookDocument {
    readonly uri: URI;
    cells: MirrorCell[];
    metadata: NotebookDocumentMetadata;
    transientDocumentMetadata: TransientDocumentMetadata;
    constructor(uri: URI, cells: MirrorCell[], metadata: NotebookDocumentMetadata, transientDocumentMetadata: TransientDocumentMetadata);
    acceptModelChanged(event: NotebookCellsChangedEventDto): void;
    private _assertIndex;
    _spliceNotebookCells(splices: NotebookCellTextModelSplice<IMainCellDto>[]): void;
}
export declare class NotebookEditorSimpleWorker implements IRequestHandler, IDisposable {
    _requestHandlerBrand: any;
    private _models;
    constructor();
    dispose(): void;
    $acceptNewModel(uri: string, metadata: NotebookDocumentMetadata, transientDocumentMetadata: TransientDocumentMetadata, cells: IMainCellDto[]): void;
    $acceptModelChanged(strURL: string, event: NotebookCellsChangedEventDto): void;
    $acceptCellModelChanged(strURL: string, handle: number, event: IModelChangedEvent): void;
    $acceptRemovedModel(strURL: string): void;
    $computeDiff(originalUrl: string, modifiedUrl: string): Promise<INotebookDiffResult>;
    $computeDiffWithCellIds(original: MirrorNotebookDocument, modified: MirrorNotebookDocument): Promise<IDiffResult | undefined>;
    $canPromptRecommendation(modelUrl: string): boolean;
    protected _getModel(uri: string): MirrorNotebookDocument;
}
/**
 * Defines the worker entry point. Must be exported and named `create`.
 * @skipMangle
 */
export declare function create(workerServer: IWorkerServer): IRequestHandler;
export {};
