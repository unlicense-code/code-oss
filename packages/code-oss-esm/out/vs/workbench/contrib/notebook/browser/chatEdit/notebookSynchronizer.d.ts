import { Disposable, IReference } from '../../../../../base/common/lifecycle.js';
import { IChatEditingService } from '../../../chat/common/chatEditingService.js';
import { INotebookService } from '../../common/notebookService.js';
import { NotebookTextModel } from '../../common/model/notebookTextModel.js';
import { CellDiffInfo } from '../diff/notebookDiffViewModel.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { INotebookEditorWorkerService } from '../../common/services/notebookWorkerService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { INotebookLoggingService } from '../../common/notebookLoggingService.js';
import { INotebookEditorModelResolverService } from '../../common/notebookEditorModelResolverService.js';
import { IChatService } from '../../../chat/common/chatService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { INotebookOriginalModelReferenceFactory } from './notebookOriginalModelRefFactory.js';
import { IObservable } from '../../../../../base/common/observable.js';
export declare const INotebookModelSynchronizerFactory: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookModelSynchronizerFactory>;
export interface INotebookModelSynchronizerFactory {
    readonly _serviceBrand: undefined;
    getOrCreate(model: NotebookTextModel): IReference<NotebookModelSynchronizer>;
}
export declare class NotebookModelSynchronizerFactory implements INotebookModelSynchronizerFactory {
    readonly _serviceBrand: undefined;
    private readonly _data;
    constructor(instantiationService: IInstantiationService);
    getOrCreate(model: NotebookTextModel): IReference<NotebookModelSynchronizer>;
}
export declare class NotebookModelSynchronizer extends Disposable {
    private readonly model;
    private readonly notebookService;
    private readonly logService;
    private readonly configurationService;
    private readonly notebookEditorWorkerService;
    private readonly notebookModelResolverService;
    private readonly originalModelRefFactory;
    private readonly throttledUpdateNotebookModel;
    private _diffInfo;
    get diffInfo(): IObservable<{
        cellDiff: CellDiffInfo[];
        modelVersion: number;
    } | undefined>;
    private snapshot?;
    private isEditFromUs;
    constructor(model: NotebookTextModel, _chatEditingService: IChatEditingService, notebookService: INotebookService, chatService: IChatService, logService: INotebookLoggingService, configurationService: IConfigurationService, notebookEditorWorkerService: INotebookEditorWorkerService, notebookModelResolverService: INotebookEditorModelResolverService, originalModelRefFactory: INotebookOriginalModelReferenceFactory);
    private createSnapshot;
    revert(): Promise<void>;
    private revertImpl;
    private updateNotebook;
    private accept;
    getNotebookSerializer(): Promise<import("../../common/notebookService.js").INotebookSerializer>;
    private _originalModel?;
    private getOriginalModel;
    private updateNotebookModel;
    private previousUriOfModelForDiff?;
    private getModifiedModelForDiff;
    computeDiff(original: NotebookTextModel, modified: NotebookTextModel, token: CancellationToken): Promise<{
        cellDiffInfo: CellDiffInfo[];
        firstChangeIndex: number;
    } | undefined>;
}
