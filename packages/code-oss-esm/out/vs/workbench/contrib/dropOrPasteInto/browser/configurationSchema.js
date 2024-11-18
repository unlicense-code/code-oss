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
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { editorConfigurationBaseNode } from '../../../../editor/common/config/editorConfigurationSchema.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { pasteAsCommandId } from '../../../../editor/contrib/dropOrPasteInto/browser/copyPasteContribution.js';
import { pasteAsPreferenceConfig } from '../../../../editor/contrib/dropOrPasteInto/browser/copyPasteController.js';
import { dropAsPreferenceConfig } from '../../../../editor/contrib/dropOrPasteInto/browser/dropIntoEditorController.js';
import * as nls from '../../../../nls.js';
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
const dropEnumValues = [];
const dropAsPreferenceSchema = {
    type: 'array',
    scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
    description: nls.localize('dropPreferredDescription', "Configures the preferred type of edit to use when dropping content.\n\nThis is an ordered list of edit kinds. The first available edit of a preferred kind will be used."),
    default: [],
    items: {
        description: nls.localize('dropKind', "The kind identifier of the drop edit."),
        anyOf: [
            { type: 'string' },
            { enum: dropEnumValues }
        ],
    }
};
const pasteEnumValues = [];
const pasteAsPreferenceSchema = {
    type: 'array',
    scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
    description: nls.localize('pastePreferredDescription', "Configures the preferred type of edit to use when pasting content.\n\nThis is an ordered list of edit kinds. The first available edit of a preferred kind will be used."),
    default: [],
    items: {
        description: nls.localize('pasteKind', "The kind identifier of the paste edit."),
        anyOf: [
            { type: 'string' },
            { enum: pasteEnumValues }
        ]
    }
};
export const editorConfiguration = Object.freeze({
    ...editorConfigurationBaseNode,
    properties: {
        [pasteAsPreferenceConfig]: pasteAsPreferenceSchema,
        [dropAsPreferenceConfig]: dropAsPreferenceSchema,
    }
});
let DropOrPasteSchemaContribution = class DropOrPasteSchemaContribution extends Disposable {
    static { this.ID = 'workbench.contrib.dropOrPasteIntoSchema'; }
    constructor(keybindingService, languageFeatures) {
        super();
        this.languageFeatures = languageFeatures;
        this._onDidChangeSchemaContributions = this._register(new Emitter());
        this._allProvidedDropKinds = [];
        this._allProvidedPasteKinds = [];
        this._register(Event.runAndSubscribe(Event.debounce(Event.any(languageFeatures.documentPasteEditProvider.onDidChange, languageFeatures.documentPasteEditProvider.onDidChange), () => { }, 1000), () => {
            this.updateProvidedKinds();
            this.updateConfigurationSchema();
            this._onDidChangeSchemaContributions.fire();
        }));
        keybindingService.registerSchemaContribution({
            getSchemaAdditions: () => this.getKeybindingSchemaAdditions(),
            onDidChange: this._onDidChangeSchemaContributions.event,
        });
    }
    updateProvidedKinds() {
        // Drop
        const dropKinds = new Map();
        for (const provider of this.languageFeatures.documentDropEditProvider.allNoModel()) {
            for (const kind of provider.providedDropEditKinds ?? []) {
                dropKinds.set(kind.value, kind);
            }
        }
        this._allProvidedDropKinds = Array.from(dropKinds.values());
        // Paste
        const pasteKinds = new Map();
        for (const provider of this.languageFeatures.documentPasteEditProvider.allNoModel()) {
            for (const kind of provider.providedPasteEditKinds ?? []) {
                pasteKinds.set(kind.value, kind);
            }
        }
        this._allProvidedPasteKinds = Array.from(pasteKinds.values());
    }
    updateConfigurationSchema() {
        pasteEnumValues.length = 0;
        for (const codeActionKind of this._allProvidedPasteKinds) {
            pasteEnumValues.push(codeActionKind.value);
        }
        dropEnumValues.length = 0;
        for (const codeActionKind of this._allProvidedDropKinds) {
            dropEnumValues.push(codeActionKind.value);
        }
        Registry.as(Extensions.Configuration)
            .notifyConfigurationSchemaUpdated(editorConfiguration);
    }
    getKeybindingSchemaAdditions() {
        return [
            {
                if: {
                    required: ['command'],
                    properties: {
                        'command': { const: pasteAsCommandId }
                    }
                },
                then: {
                    properties: {
                        'args': {
                            required: ['kind'],
                            properties: {
                                'kind': {
                                    anyOf: [
                                        { enum: Array.from(this._allProvidedPasteKinds.map(x => x.value)) },
                                        { type: 'string' },
                                    ]
                                }
                            }
                        }
                    }
                }
            },
        ];
    }
};
DropOrPasteSchemaContribution = __decorate([
    __param(0, IKeybindingService),
    __param(1, ILanguageFeaturesService)
], DropOrPasteSchemaContribution);
export { DropOrPasteSchemaContribution };
