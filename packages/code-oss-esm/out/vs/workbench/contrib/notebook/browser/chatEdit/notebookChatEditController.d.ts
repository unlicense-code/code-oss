import { Disposable } from '../../../../../base/common/lifecycle.js';
import { INotebookEditor, INotebookEditorContribution } from '../notebookBrowser.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
export declare const ctxNotebookHasEditorModification: RawContextKey<boolean>;
export declare class NotebookChatEditorControllerContrib extends Disposable implements INotebookEditorContribution {
    static readonly ID: string;
    readonly _serviceBrand: undefined;
    constructor(notebookEditor: INotebookEditor, instantiationService: IInstantiationService, configurationService: IConfigurationService);
}
