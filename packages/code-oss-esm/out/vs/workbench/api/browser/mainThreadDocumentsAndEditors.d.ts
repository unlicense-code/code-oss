import { ICodeEditor } from '../../../editor/browser/editorBrowser.js';
import { ICodeEditorService } from '../../../editor/browser/services/codeEditorService.js';
import { IModelService } from '../../../editor/common/services/model.js';
import { ITextModelService } from '../../../editor/common/services/resolverService.js';
import { IFileService } from '../../../platform/files/common/files.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadTextEditor } from './mainThreadEditor.js';
import { IEditorPane } from '../../common/editor.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
import { IEditorGroupsService } from '../../services/editor/common/editorGroupsService.js';
import { ITextFileService } from '../../services/textfile/common/textfiles.js';
import { IWorkbenchEnvironmentService } from '../../services/environment/common/environmentService.js';
import { IWorkingCopyFileService } from '../../services/workingCopy/common/workingCopyFileService.js';
import { IUriIdentityService } from '../../../platform/uriIdentity/common/uriIdentity.js';
import { IClipboardService } from '../../../platform/clipboard/common/clipboardService.js';
import { IPathService } from '../../services/path/common/pathService.js';
import { IPaneCompositePartService } from '../../services/panecomposite/browser/panecomposite.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
export declare class MainThreadDocumentsAndEditors {
    private readonly _modelService;
    private readonly _textFileService;
    private readonly _editorService;
    private readonly _editorGroupService;
    private readonly _clipboardService;
    private readonly _toDispose;
    private readonly _proxy;
    private readonly _mainThreadDocuments;
    private readonly _mainThreadEditors;
    private readonly _textEditors;
    constructor(extHostContext: IExtHostContext, _modelService: IModelService, _textFileService: ITextFileService, _editorService: IEditorService, codeEditorService: ICodeEditorService, fileService: IFileService, textModelResolverService: ITextModelService, _editorGroupService: IEditorGroupsService, paneCompositeService: IPaneCompositePartService, environmentService: IWorkbenchEnvironmentService, workingCopyFileService: IWorkingCopyFileService, uriIdentityService: IUriIdentityService, _clipboardService: IClipboardService, pathService: IPathService, configurationService: IConfigurationService);
    dispose(): void;
    private _onDelta;
    private _toModelAddData;
    private _toTextEditorAddData;
    private _findEditorPosition;
    findTextEditorIdFor(editorPane: IEditorPane): string | undefined;
    getIdOfCodeEditor(codeEditor: ICodeEditor): string | undefined;
    getEditor(id: string): MainThreadTextEditor | undefined;
}
