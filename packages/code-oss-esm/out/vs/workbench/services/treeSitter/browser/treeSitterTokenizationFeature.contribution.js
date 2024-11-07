/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { TreeSitterTextModelService } from '../../../../editor/browser/services/treeSitter/treeSitterParserService.js';
import { ITreeSitterParserService } from '../../../../editor/common/services/treeSitterParserService.js';
import { ITreeSitterTokenizationFeature } from './treeSitterTokenizationFeature.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { TreeSitterTokenizationRegistry } from '../../../../editor/common/languages.js';
import { ITextFileService } from '../../textfile/common/textfiles.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
/**
 * Makes sure the ITreeSitterTokenizationService is instantiated
 */
let TreeSitterTokenizationInstantiator = class TreeSitterTokenizationInstantiator {
    static { this.ID = 'workbench.contrib.treeSitterTokenizationInstantiator'; }
    constructor(_treeSitterTokenizationService, _treeSitterTokenizationFeature) { }
};
TreeSitterTokenizationInstantiator = __decorate([
    __param(0, ITreeSitterParserService),
    __param(1, ITreeSitterTokenizationFeature)
], TreeSitterTokenizationInstantiator);
registerSingleton(ITreeSitterParserService, TreeSitterTextModelService, 0 /* InstantiationType.Eager */);
registerWorkbenchContribution2(TreeSitterTokenizationInstantiator.ID, TreeSitterTokenizationInstantiator, 2 /* WorkbenchPhase.BlockRestore */);
CommandsRegistry.registerCommand('_workbench.colorizeTreeSitterTokens', async (accessor, resource) => {
    const treeSitterParserService = accessor.get(ITreeSitterParserService);
    const textModelService = accessor.get(ITextFileService);
    const textModel = resource ? (await textModelService.files.resolve(resource)).textEditorModel : undefined;
    if (!textModel) {
        throw new Error(`Cannot resolve text model for resource ${resource}`);
    }
    const tokenizer = await TreeSitterTokenizationRegistry.getOrCreate(textModel.getLanguageId());
    if (!tokenizer) {
        throw new Error(`Cannot resolve tokenizer for language ${textModel.getLanguageId()}`);
    }
    const textModelTreeSitter = treeSitterParserService.getTextModelTreeSitter(textModel);
    if (!textModelTreeSitter) {
        throw new Error(`Cannot resolve tree sitter parser for language ${textModel.getLanguageId()}`);
    }
    const stopwatch = new StopWatch();
    await textModelTreeSitter.parse();
    stopwatch.stop();
    let captureTime = 0;
    let metadataTime = 0;
    for (let i = 1; i <= textModel.getLineCount(); i++) {
        const result = tokenizer.tokenizeEncodedInstrumented(i, textModel);
        if (result) {
            captureTime += result.captureTime;
            metadataTime += result.metadataTime;
        }
    }
    textModelTreeSitter.dispose();
    textModel.dispose();
    return { parseTime: stopwatch.elapsed(), captureTime, metadataTime };
});
