import { VSBufferReadableStream } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IWriteFileOptions, IFileStatWithMetadata } from '../../../../platform/files/common/files.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IRevertOptions, ISaveOptions, IUntypedEditorInput } from '../../../common/editor.js';
import { EditorModel } from '../../../common/editor/editorModel.js';
import { NotebookTextModel } from './model/notebookTextModel.js';
import { INotebookEditorModel, INotebookLoadOptions, IResolvedNotebookEditorModel } from './notebookCommon.js';
import { INotebookLoggingService } from './notebookLoggingService.js';
import { INotebookSerializer, INotebookService } from './notebookService.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { IFileWorkingCopyModelConfiguration, SnapshotContext } from '../../../services/workingCopy/common/fileWorkingCopy.js';
import { IFileWorkingCopyManager } from '../../../services/workingCopy/common/fileWorkingCopyManager.js';
import { IStoredFileWorkingCopyModel, IStoredFileWorkingCopyModelContentChangedEvent, IStoredFileWorkingCopyModelFactory, IStoredFileWorkingCopySaveEvent } from '../../../services/workingCopy/common/storedFileWorkingCopy.js';
import { IUntitledFileWorkingCopyModel, IUntitledFileWorkingCopyModelContentChangedEvent, IUntitledFileWorkingCopyModelFactory } from '../../../services/workingCopy/common/untitledFileWorkingCopy.js';
export declare class SimpleNotebookEditorModel extends EditorModel implements INotebookEditorModel {
    readonly resource: URI;
    private readonly _hasAssociatedFilePath;
    readonly viewType: string;
    private readonly _workingCopyManager;
    private readonly _filesConfigurationService;
    private readonly _onDidChangeDirty;
    private readonly _onDidSave;
    private readonly _onDidChangeOrphaned;
    private readonly _onDidChangeReadonly;
    private readonly _onDidRevertUntitled;
    readonly onDidChangeDirty: Event<void>;
    readonly onDidSave: Event<IStoredFileWorkingCopySaveEvent>;
    readonly onDidChangeOrphaned: Event<void>;
    readonly onDidChangeReadonly: Event<void>;
    readonly onDidRevertUntitled: Event<void>;
    private _workingCopy?;
    private readonly _workingCopyListeners;
    private readonly scratchPad;
    constructor(resource: URI, _hasAssociatedFilePath: boolean, viewType: string, _workingCopyManager: IFileWorkingCopyManager<NotebookFileWorkingCopyModel, NotebookFileWorkingCopyModel>, scratchpad: boolean, _filesConfigurationService: IFilesConfigurationService);
    dispose(): void;
    get notebook(): NotebookTextModel | undefined;
    isResolved(): this is IResolvedNotebookEditorModel;
    canDispose(): Promise<boolean>;
    isDirty(): boolean;
    isModified(): boolean;
    isOrphaned(): boolean;
    hasAssociatedFilePath(): boolean;
    isReadonly(): boolean | IMarkdownString;
    get hasErrorState(): boolean;
    revert(options?: IRevertOptions): Promise<void>;
    save(options?: ISaveOptions): Promise<boolean>;
    load(options?: INotebookLoadOptions): Promise<IResolvedNotebookEditorModel>;
    saveAs(target: URI): Promise<IUntypedEditorInput | undefined>;
    private static _isStoredFileWorkingCopy;
}
export declare class NotebookFileWorkingCopyModel extends Disposable implements IStoredFileWorkingCopyModel, IUntitledFileWorkingCopyModel {
    private readonly _notebookModel;
    private readonly _notebookService;
    private readonly _configurationService;
    private readonly _telemetryService;
    private readonly _notebookLogService;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<IStoredFileWorkingCopyModelContentChangedEvent & IUntitledFileWorkingCopyModelContentChangedEvent>;
    readonly onWillDispose: Event<void>;
    readonly configuration: IFileWorkingCopyModelConfiguration | undefined;
    save: ((options: IWriteFileOptions, token: CancellationToken) => Promise<IFileStatWithMetadata>) | undefined;
    constructor(_notebookModel: NotebookTextModel, _notebookService: INotebookService, _configurationService: IConfigurationService, _telemetryService: ITelemetryService, _notebookLogService: INotebookLoggingService);
    private setSaveDelegate;
    dispose(): void;
    get notebookModel(): NotebookTextModel;
    snapshot(context: SnapshotContext, token: CancellationToken): Promise<VSBufferReadableStream>;
    update(stream: VSBufferReadableStream, token: CancellationToken): Promise<void>;
    getNotebookSerializer(): Promise<INotebookSerializer>;
    get versionId(): string;
    pushStackElement(): void;
}
export declare class NotebookFileWorkingCopyModelFactory implements IStoredFileWorkingCopyModelFactory<NotebookFileWorkingCopyModel>, IUntitledFileWorkingCopyModelFactory<NotebookFileWorkingCopyModel> {
    private readonly _viewType;
    private readonly _notebookService;
    private readonly _configurationService;
    private readonly _telemetryService;
    private readonly _notebookLogService;
    constructor(_viewType: string, _notebookService: INotebookService, _configurationService: IConfigurationService, _telemetryService: ITelemetryService, _notebookLogService: INotebookLoggingService);
    createModel(resource: URI, stream: VSBufferReadableStream, token: CancellationToken): Promise<NotebookFileWorkingCopyModel>;
}
