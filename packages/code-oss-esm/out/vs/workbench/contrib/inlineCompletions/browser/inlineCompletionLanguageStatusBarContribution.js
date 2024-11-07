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
var InlineCompletionLanguageStatusBarContribution_1;
import { createHotClass } from '../../../../base/common/hotReloadHelpers.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { autorunWithStore } from '../../../../base/common/observable.js';
import Severity from '../../../../base/common/severity.js';
import { InlineCompletionsController } from '../../../../editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { observableConfigValue } from '../../../../platform/observable/common/platformObservableUtils.js';
import { ILanguageStatusService } from '../../../services/languageStatus/common/languageStatusService.js';
let InlineCompletionLanguageStatusBarContribution = class InlineCompletionLanguageStatusBarContribution extends Disposable {
    static { InlineCompletionLanguageStatusBarContribution_1 = this; }
    static { this.hot = createHotClass(InlineCompletionLanguageStatusBarContribution_1); }
    static { this.Id = 'vs.editor.contrib.inlineCompletionLanguageStatusBarContribution'; }
    constructor(_editor, _languageStatusService, _configurationService) {
        super();
        this._editor = _editor;
        this._languageStatusService = _languageStatusService;
        this._configurationService = _configurationService;
        // TODO always enable this!
        this._inlineCompletionInlineEdits = observableConfigValue('editor.inlineSuggest.experimentalInlineEditsEnabled', false, this._configurationService);
        const c = InlineCompletionsController.get(this._editor);
        this._register(autorunWithStore((reader, store) => {
            // TODO always enable this feature!
            if (!this._inlineCompletionInlineEdits.read(reader)) {
                return;
            }
            const model = c?.model.read(reader);
            if (!model) {
                return;
            }
            const status = model.status.read(reader);
            const statusMap = {
                loading: { shortLabel: '', label: 'Loading', loading: true, },
                ghostText: { shortLabel: '$(lightbulb)', label: 'Inline Completion available', loading: false, },
                inlineEdit: { shortLabel: '$(lightbulb-sparkle)', label: 'Inline Edit available', loading: false, },
                noSuggestion: { shortLabel: '$(circle-slash)', label: 'No inline suggestion available', loading: false, },
            };
            store.add(this._languageStatusService.addStatus({
                accessibilityInfo: undefined,
                busy: statusMap[status].loading,
                command: undefined,
                detail: 'Inline Suggestions',
                id: 'inlineSuggestions',
                label: { value: statusMap[status].label, shortValue: statusMap[status].shortLabel },
                name: 'Inline Suggestions',
                selector: { pattern: model.textModel.uri.fsPath },
                severity: Severity.Info,
                source: 'inlineSuggestions',
            }));
        }));
    }
};
InlineCompletionLanguageStatusBarContribution = InlineCompletionLanguageStatusBarContribution_1 = __decorate([
    __param(1, ILanguageStatusService),
    __param(2, IConfigurationService)
], InlineCompletionLanguageStatusBarContribution);
export { InlineCompletionLanguageStatusBarContribution };
