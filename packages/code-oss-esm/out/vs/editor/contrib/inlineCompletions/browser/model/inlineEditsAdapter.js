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
var InlineEditsAdapterContribution_1;
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { autorunWithStore, observableSignalFromEvent } from '../../../../../base/common/observable.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { InlineEditTriggerKind } from '../../../../common/languages.js';
import { ILanguageFeaturesService } from '../../../../common/services/languageFeatures.js';
let InlineEditsAdapterContribution = class InlineEditsAdapterContribution extends Disposable {
    static { InlineEditsAdapterContribution_1 = this; }
    static { this.ID = 'editor.contrib.inlineEditsAdapter'; }
    static { this.isFirst = true; }
    constructor(_editor, instantiationService) {
        super();
        this.instantiationService = instantiationService;
        if (InlineEditsAdapterContribution_1.isFirst) {
            InlineEditsAdapterContribution_1.isFirst = false;
            this.instantiationService.createInstance(InlineEditsAdapter);
        }
    }
};
InlineEditsAdapterContribution = InlineEditsAdapterContribution_1 = __decorate([
    __param(1, IInstantiationService)
], InlineEditsAdapterContribution);
export { InlineEditsAdapterContribution };
let InlineEditsAdapter = class InlineEditsAdapter extends Disposable {
    constructor(_languageFeaturesService, _commandService) {
        super();
        this._languageFeaturesService = _languageFeaturesService;
        this._commandService = _commandService;
        const didChangeSignal = observableSignalFromEvent('didChangeSignal', this._languageFeaturesService.inlineEditProvider.onDidChange);
        this._register(autorunWithStore((reader, store) => {
            didChangeSignal.read(reader);
            store.add(this._languageFeaturesService.inlineCompletionsProvider.register('*', {
                async provideInlineCompletions(model, position, context, token) {
                    if (!context.includeInlineEdits) {
                        return undefined;
                    }
                    const allInlineEditProvider = _languageFeaturesService.inlineEditProvider.all(model);
                    const inlineEdits = await Promise.all(allInlineEditProvider.map(async (provider) => {
                        const result = await provider.provideInlineEdit(model, {
                            triggerKind: InlineEditTriggerKind.Automatic,
                        }, token);
                        if (!result) {
                            return undefined;
                        }
                        return { result, provider };
                    }));
                    const definedEdits = inlineEdits.filter(e => !!e);
                    return {
                        edits: definedEdits,
                        items: definedEdits.map(e => {
                            return {
                                range: e.result.range,
                                insertText: e.result.text,
                                command: e.result.accepted,
                                isInlineEdit: true,
                                edit: e.result,
                            };
                        }),
                        commands: definedEdits.flatMap(e => e.result.commands ?? []),
                    };
                },
                handleRejection: (completions, item) => {
                    if (item.edit.rejected) {
                        this._commandService.executeCommand(item.edit.rejected.id, ...(item.edit.rejected.arguments ?? []));
                    }
                },
                freeInlineCompletions(c) {
                    for (const e of c.edits) {
                        e.provider.freeInlineEdit(e.result);
                    }
                },
                toString() {
                    return 'InlineEditsAdapter';
                }
            }));
        }));
    }
};
InlineEditsAdapter = __decorate([
    __param(0, ILanguageFeaturesService),
    __param(1, ICommandService)
], InlineEditsAdapter);
export { InlineEditsAdapter };
