import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { ICodeEditor } from '../../../../browser/editorBrowser.js';
export declare class TextModelChangeRecorder extends Disposable {
    private readonly _editor;
    private readonly _contextKeyService;
    private readonly _logService;
    private readonly _recordingLoggingEnabled;
    constructor(_editor: ICodeEditor, _contextKeyService: IContextKeyService, _logService: ILogService);
}
