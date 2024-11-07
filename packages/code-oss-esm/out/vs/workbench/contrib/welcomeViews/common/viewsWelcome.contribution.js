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
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { ViewsWelcomeContribution } from './viewsWelcomeContribution.js';
import { viewsWelcomeExtensionPointDescriptor } from './viewsWelcomeExtensionPoint.js';
import { ExtensionsRegistry } from '../../../services/extensions/common/extensionsRegistry.js';
const extensionPoint = ExtensionsRegistry.registerExtensionPoint(viewsWelcomeExtensionPointDescriptor);
let WorkbenchConfigurationContribution = class WorkbenchConfigurationContribution {
    constructor(instantiationService) {
        instantiationService.createInstance(ViewsWelcomeContribution, extensionPoint);
    }
};
WorkbenchConfigurationContribution = __decorate([
    __param(0, IInstantiationService)
], WorkbenchConfigurationContribution);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(WorkbenchConfigurationContribution, 3 /* LifecyclePhase.Restored */);
