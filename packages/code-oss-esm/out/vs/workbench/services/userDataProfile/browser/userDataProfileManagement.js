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
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { CancellationError } from '../../../../base/common/errors.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { equals } from '../../../../base/common/objects.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRequestService, asJson } from '../../../../platform/request/common/request.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { isEmptyWorkspaceIdentifier, IWorkspaceContextService, toWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.js';
import { CONFIG_NEW_WINDOW_PROFILE } from '../../../common/configuration.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IHostService } from '../../host/browser/host.js';
import { IUserDataProfileManagementService, IUserDataProfileService } from '../common/userDataProfile.js';
let UserDataProfileManagementService = class UserDataProfileManagementService extends Disposable {
    constructor(userDataProfilesService, userDataProfileService, hostService, dialogService, workspaceContextService, extensionService, environmentService, telemetryService, productService, requestService, configurationService, uriIdentityService, logService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        this.userDataProfileService = userDataProfileService;
        this.hostService = hostService;
        this.dialogService = dialogService;
        this.workspaceContextService = workspaceContextService;
        this.extensionService = extensionService;
        this.environmentService = environmentService;
        this.telemetryService = telemetryService;
        this.productService = productService;
        this.requestService = requestService;
        this.configurationService = configurationService;
        this.uriIdentityService = uriIdentityService;
        this.logService = logService;
        this._register(userDataProfileService.onDidChangeCurrentProfile(e => this.onDidChangeCurrentProfile(e)));
        this._register(userDataProfilesService.onDidChangeProfiles(e => {
            if (e.removed.some(profile => profile.id === this.userDataProfileService.currentProfile.id)) {
                const profileToUse = this.getProfileToUseForCurrentWorkspace();
                this.switchProfile(profileToUse);
                this.changeCurrentProfile(profileToUse, localize('reload message when removed', "The current profile has been removed. Please reload to switch back to default profile"));
                return;
            }
            const updatedCurrentProfile = e.updated.find(p => this.userDataProfileService.currentProfile.id === p.id);
            if (updatedCurrentProfile) {
                const profileToUse = this.getProfileToUseForCurrentWorkspace();
                if (profileToUse?.id !== updatedCurrentProfile.id) {
                    this.switchProfile(profileToUse);
                    this.changeCurrentProfile(profileToUse, localize('reload message when switched', "The current workspace has been removed from the current profile. Please reload to switch back to the updated profile"));
                }
                else {
                    this.changeCurrentProfile(updatedCurrentProfile, localize('reload message when updated', "The current profile has been updated. Please reload to switch back to the updated profile"));
                }
            }
        }));
    }
    async onDidChangeCurrentProfile(e) {
        if (e.previous.isTransient) {
            await this.userDataProfilesService.cleanUpTransientProfiles();
        }
    }
    getWorkspaceUri() {
        const workspace = this.workspaceContextService.getWorkspace();
        return workspace.configuration ?? workspace.folders[0]?.uri;
    }
    getProfileToUseForCurrentWorkspace() {
        const workspaceUri = this.getWorkspaceUri();
        if (workspaceUri) {
            const profileForWorkspace = this.userDataProfilesService.profiles.find(profile => profile.workspaces?.some(ws => this.uriIdentityService.extUri.isEqual(ws, workspaceUri)));
            if (profileForWorkspace) {
                return profileForWorkspace;
            }
        }
        else {
            // If no workspace is open, use the current profile
            const currentProfile = this.userDataProfilesService.profiles.find(profile => profile.id === this.userDataProfileService.currentProfile.id);
            if (currentProfile) {
                return currentProfile;
            }
        }
        return this.getDefaultProfileToUse();
    }
    getDefaultProfileToUse() {
        const newWindowProfileConfigValue = this.configurationService.getValue(CONFIG_NEW_WINDOW_PROFILE);
        if (newWindowProfileConfigValue) {
            const newWindowProfile = this.userDataProfilesService.profiles.find(profile => profile.name === newWindowProfileConfigValue);
            if (newWindowProfile) {
                return newWindowProfile;
            }
        }
        return this.userDataProfilesService.defaultProfile;
    }
    async createProfile(name, options) {
        return this.userDataProfilesService.createNamedProfile(name, options);
    }
    async createAndEnterProfile(name, options) {
        const profile = await this.userDataProfilesService.createNamedProfile(name, options, toWorkspaceIdentifier(this.workspaceContextService.getWorkspace()));
        await this.changeCurrentProfile(profile);
        this.telemetryService.publicLog2('profileManagementActionExecuted', { id: 'createAndEnterProfile' });
        return profile;
    }
    async createAndEnterTransientProfile() {
        const profile = await this.userDataProfilesService.createTransientProfile(toWorkspaceIdentifier(this.workspaceContextService.getWorkspace()));
        await this.changeCurrentProfile(profile);
        this.telemetryService.publicLog2('profileManagementActionExecuted', { id: 'createAndEnterTransientProfile' });
        return profile;
    }
    async updateProfile(profile, updateOptions) {
        if (!this.userDataProfilesService.profiles.some(p => p.id === profile.id)) {
            throw new Error(`Profile ${profile.name} does not exist`);
        }
        if (profile.isDefault) {
            throw new Error(localize('cannotRenameDefaultProfile', "Cannot rename the default profile"));
        }
        const updatedProfile = await this.userDataProfilesService.updateProfile(profile, updateOptions);
        this.telemetryService.publicLog2('profileManagementActionExecuted', { id: 'updateProfile' });
        return updatedProfile;
    }
    async removeProfile(profile) {
        if (!this.userDataProfilesService.profiles.some(p => p.id === profile.id)) {
            throw new Error(`Profile ${profile.name} does not exist`);
        }
        if (profile.isDefault) {
            throw new Error(localize('cannotDeleteDefaultProfile', "Cannot delete the default profile"));
        }
        await this.userDataProfilesService.removeProfile(profile);
        this.telemetryService.publicLog2('profileManagementActionExecuted', { id: 'removeProfile' });
    }
    async switchProfile(profile) {
        if (!this.userDataProfilesService.profiles.some(p => p.id === profile.id)) {
            throw new Error(`Profile ${profile.name} does not exist`);
        }
        if (this.userDataProfileService.currentProfile.id === profile.id) {
            return;
        }
        const workspaceUri = this.getWorkspaceUri();
        if (workspaceUri && profile.workspaces?.some(ws => this.uriIdentityService.extUri.isEqual(ws, workspaceUri))) {
            return;
        }
        const workspaceIdentifier = toWorkspaceIdentifier(this.workspaceContextService.getWorkspace());
        await this.userDataProfilesService.setProfileForWorkspace(workspaceIdentifier, profile);
        this.telemetryService.publicLog2('profileManagementActionExecuted', { id: 'switchProfile' });
        if (isEmptyWorkspaceIdentifier(workspaceIdentifier)) {
            await this.changeCurrentProfile(profile);
        }
    }
    async getBuiltinProfileTemplates() {
        if (this.productService.profileTemplatesUrl) {
            try {
                const context = await this.requestService.request({ type: 'GET', url: this.productService.profileTemplatesUrl }, CancellationToken.None);
                if (context.res.statusCode === 200) {
                    return (await asJson(context)) || [];
                }
                else {
                    this.logService.error('Could not get profile templates.', context.res.statusCode);
                }
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        return [];
    }
    async changeCurrentProfile(profile, reloadMessage) {
        const isRemoteWindow = !!this.environmentService.remoteAuthority;
        const shouldRestartExtensionHosts = this.userDataProfileService.currentProfile.id !== profile.id || !equals(this.userDataProfileService.currentProfile.useDefaultFlags, profile.useDefaultFlags);
        if (shouldRestartExtensionHosts) {
            if (!isRemoteWindow) {
                if (!(await this.extensionService.stopExtensionHosts(localize('switch profile', "Switching to a profile.")))) {
                    // If extension host did not stop, do not switch profile
                    if (this.userDataProfilesService.profiles.some(p => p.id === this.userDataProfileService.currentProfile.id)) {
                        await this.userDataProfilesService.setProfileForWorkspace(toWorkspaceIdentifier(this.workspaceContextService.getWorkspace()), this.userDataProfileService.currentProfile);
                    }
                    throw new CancellationError();
                }
            }
        }
        // In a remote window update current profile before reloading so that data is preserved from current profile if asked to preserve
        await this.userDataProfileService.updateCurrentProfile(profile);
        if (shouldRestartExtensionHosts) {
            if (isRemoteWindow) {
                const { confirmed } = await this.dialogService.confirm({
                    message: reloadMessage ?? localize('reload message', "Switching a profile requires reloading VS Code."),
                    primaryButton: localize('reload button', "&&Reload"),
                });
                if (confirmed) {
                    await this.hostService.reload();
                }
            }
            else {
                await this.extensionService.startExtensionHosts();
            }
        }
    }
};
UserDataProfileManagementService = __decorate([
    __param(0, IUserDataProfilesService),
    __param(1, IUserDataProfileService),
    __param(2, IHostService),
    __param(3, IDialogService),
    __param(4, IWorkspaceContextService),
    __param(5, IExtensionService),
    __param(6, IWorkbenchEnvironmentService),
    __param(7, ITelemetryService),
    __param(8, IProductService),
    __param(9, IRequestService),
    __param(10, IConfigurationService),
    __param(11, IUriIdentityService),
    __param(12, ILogService)
], UserDataProfileManagementService);
export { UserDataProfileManagementService };
registerSingleton(IUserDataProfileManagementService, UserDataProfileManagementService, 0 /* InstantiationType.Eager */);
