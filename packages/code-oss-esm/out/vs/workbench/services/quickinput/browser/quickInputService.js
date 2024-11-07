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
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { QuickInputService as BaseQuickInputService } from '../../../../platform/quickinput/browser/quickInputService.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { InQuickPickContextKey } from '../../../browser/quickaccess.js';
let QuickInputService = class QuickInputService extends BaseQuickInputService {
    constructor(configurationService, instantiationService, keybindingService, contextKeyService, themeService, layoutService) {
        super(instantiationService, contextKeyService, themeService, layoutService, configurationService);
        this.keybindingService = keybindingService;
        this.inQuickInputContext = InQuickPickContextKey.bindTo(this.contextKeyService);
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.onShow(() => this.inQuickInputContext.set(true)));
        this._register(this.onHide(() => this.inQuickInputContext.set(false)));
    }
    createController() {
        return super.createController(this.layoutService, {
            ignoreFocusOut: () => !this.configurationService.getValue('workbench.quickOpen.closeOnFocusLost'),
            backKeybindingLabel: () => this.keybindingService.lookupKeybinding('workbench.action.quickInputBack')?.getLabel() || undefined,
        });
    }
};
QuickInputService = __decorate([
    __param(0, IConfigurationService),
    __param(1, IInstantiationService),
    __param(2, IKeybindingService),
    __param(3, IContextKeyService),
    __param(4, IThemeService),
    __param(5, ILayoutService)
], QuickInputService);
export { QuickInputService };
registerSingleton(IQuickInputService, QuickInputService, 1 /* InstantiationType.Delayed */);
