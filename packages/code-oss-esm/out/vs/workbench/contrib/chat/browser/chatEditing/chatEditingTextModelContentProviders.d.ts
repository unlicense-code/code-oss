import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { ITextModelContentProvider } from '../../../../../editor/common/services/resolverService.js';
import { ChatEditingSession } from './chatEditingSession.js';
export declare class ChatEditingTextModelContentProvider implements ITextModelContentProvider {
    private readonly _currentSessionObs;
    private readonly _modelService;
    static readonly scheme = "chat-editing-text-model";
    static getEmptyFileURI(): URI;
    static getFileURI(documentId: string, path: string): URI;
    constructor(_currentSessionObs: IObservable<ChatEditingSession | null>, _modelService: IModelService);
    provideTextContent(resource: URI): Promise<ITextModel | null>;
}
export declare class ChatEditingSnapshotTextModelContentProvider implements ITextModelContentProvider {
    private readonly _currentSessionObs;
    private readonly _modelService;
    static readonly scheme = "chat-editing-snapshot-text-model";
    static getSnapshotFileURI(requestId: string | undefined, path: string): URI;
    constructor(_currentSessionObs: IObservable<ChatEditingSession | null>, _modelService: IModelService);
    provideTextContent(resource: URI): Promise<ITextModel | null>;
}
