import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILanguageStatusService } from '../../../services/languageStatus/common/languageStatusService.js';
export declare class InlineCompletionLanguageStatusBarContribution extends Disposable {
    private readonly _editor;
    private readonly _languageStatusService;
    private readonly _configurationService;
    static readonly hot: import("../../../../base/common/observable.js").IObservable<typeof InlineCompletionLanguageStatusBarContribution, unknown>;
    static Id: string;
    private readonly _inlineCompletionInlineEdits;
    constructor(_editor: ICodeEditor, _languageStatusService: ILanguageStatusService, _configurationService: IConfigurationService);
}
