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
import { Action } from '../../../../base/common/actions.js';
import { URI } from '../../../../base/common/uri.js';
import { getIconClasses } from '../../../../editor/common/services/getIconClasses.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import * as nls from '../../../../nls.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { EditorExtensionsRegistry } from '../../../../editor/browser/editorExtensions.js';
import { MenuId, MenuRegistry, isIMenuItem } from '../../../../platform/actions/common/actions.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { isLocalizedString } from '../../../../platform/action/common/action.js';
let ConfigureLanguageBasedSettingsAction = class ConfigureLanguageBasedSettingsAction extends Action {
    static { this.ID = 'workbench.action.configureLanguageBasedSettings'; }
    static { this.LABEL = nls.localize2('configureLanguageBasedSettings', "Configure Language Specific Settings..."); }
    constructor(id, label, modelService, languageService, quickInputService, preferencesService) {
        super(id, label);
        this.modelService = modelService;
        this.languageService = languageService;
        this.quickInputService = quickInputService;
        this.preferencesService = preferencesService;
    }
    async run() {
        const languages = this.languageService.getSortedRegisteredLanguageNames();
        const picks = languages.map(({ languageName, languageId }) => {
            const description = nls.localize('languageDescriptionConfigured', "({0})", languageId);
            // construct a fake resource to be able to show nice icons if any
            let fakeResource;
            const extensions = this.languageService.getExtensions(languageId);
            if (extensions.length) {
                fakeResource = URI.file(extensions[0]);
            }
            else {
                const filenames = this.languageService.getFilenames(languageId);
                if (filenames.length) {
                    fakeResource = URI.file(filenames[0]);
                }
            }
            return {
                label: languageName,
                iconClasses: getIconClasses(this.modelService, this.languageService, fakeResource),
                description
            };
        });
        await this.quickInputService.pick(picks, { placeHolder: nls.localize('pickLanguage', "Select Language") })
            .then(pick => {
            if (pick) {
                const languageId = this.languageService.getLanguageIdByLanguageName(pick.label);
                if (typeof languageId === 'string') {
                    return this.preferencesService.openLanguageSpecificSettings(languageId);
                }
            }
            return undefined;
        });
    }
};
ConfigureLanguageBasedSettingsAction = __decorate([
    __param(2, IModelService),
    __param(3, ILanguageService),
    __param(4, IQuickInputService),
    __param(5, IPreferencesService)
], ConfigureLanguageBasedSettingsAction);
export { ConfigureLanguageBasedSettingsAction };
// Register a command that gets all settings
CommandsRegistry.registerCommand({
    id: '_getAllSettings',
    handler: () => {
        const configRegistry = Registry.as(Extensions.Configuration);
        const allSettings = configRegistry.getConfigurationProperties();
        return allSettings;
    }
});
//#region --- Register a command to get all actions from the command palette
CommandsRegistry.registerCommand('_getAllCommands', function (accessor) {
    const keybindingService = accessor.get(IKeybindingService);
    const actions = [];
    for (const editorAction of EditorExtensionsRegistry.getEditorActions()) {
        const keybinding = keybindingService.lookupKeybinding(editorAction.id);
        actions.push({
            command: editorAction.id,
            label: editorAction.label,
            description: isLocalizedString(editorAction.metadata?.description) ? editorAction.metadata.description.value : editorAction.metadata?.description,
            precondition: editorAction.precondition?.serialize(),
            keybinding: keybinding?.getLabel() ?? 'Not set'
        });
    }
    for (const menuItem of MenuRegistry.getMenuItems(MenuId.CommandPalette)) {
        if (isIMenuItem(menuItem)) {
            const title = typeof menuItem.command.title === 'string' ? menuItem.command.title : menuItem.command.title.value;
            const category = menuItem.command.category ? typeof menuItem.command.category === 'string' ? menuItem.command.category : menuItem.command.category.value : undefined;
            const label = category ? `${category}: ${title}` : title;
            const description = isLocalizedString(menuItem.command.metadata?.description) ? menuItem.command.metadata.description.value : menuItem.command.metadata?.description;
            const keybinding = keybindingService.lookupKeybinding(menuItem.command.id);
            actions.push({
                command: menuItem.command.id,
                label,
                description,
                precondition: menuItem.when?.serialize(),
                keybinding: keybinding?.getLabel() ?? 'Not set'
            });
        }
    }
    return actions;
});
//#endregion
