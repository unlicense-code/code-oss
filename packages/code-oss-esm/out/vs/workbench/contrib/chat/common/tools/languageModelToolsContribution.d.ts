import { IJSONSchema } from '../../../../../base/common/jsonSchema.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { ILanguageModelToolsService } from '../languageModelToolsService.js';
export interface IRawToolContribution {
    name: string;
    displayName: string;
    modelDescription: string;
    toolReferenceName?: string;
    icon?: string | {
        light: string;
        dark: string;
    };
    when?: string;
    tags?: string[];
    userDescription?: string;
    inputSchema?: IJSONSchema;
    canBeReferencedInPrompt?: boolean;
}
export declare class LanguageModelToolsExtensionPointHandler implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.toolsExtensionPointHandler";
    private _registrationDisposables;
    constructor(languageModelToolsService: ILanguageModelToolsService, logService: ILogService);
}
