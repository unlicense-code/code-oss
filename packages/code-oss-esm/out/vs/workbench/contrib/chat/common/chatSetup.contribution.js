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
var ChatSetupContribution_1;
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IRequestService, asText } from '../../../../platform/request/common/request.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { ChatContextKeys } from './chatContextKeys.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
let ChatSetupContribution = class ChatSetupContribution extends Disposable {
    static { ChatSetupContribution_1 = this; }
    static { this.CHAT_EXTENSION_INSTALLED_KEY = 'chat.extensionInstalled'; }
    constructor(contextService, telemetryService, authenticationService, productService, extensionManagementService, extensionService, requestService, storageService) {
        super();
        this.contextService = contextService;
        this.telemetryService = telemetryService;
        this.authenticationService = authenticationService;
        this.productService = productService;
        this.extensionManagementService = extensionManagementService;
        this.extensionService = extensionService;
        this.requestService = requestService;
        this.storageService = storageService;
        this.chatSetupSignedInContextKey = ChatContextKeys.ChatSetup.signedIn.bindTo(this.contextService);
        this.chatSetupEntitledContextKey = ChatContextKeys.ChatSetup.entitled.bindTo(this.contextService);
        this.resolvedEntitlement = undefined;
        const entitlement = this.productService.gitHubEntitlement;
        if (!entitlement) {
            return;
        }
        this.checkExtensionInstallation(entitlement);
        this.registerEntitlementListeners(entitlement);
        this.registerAuthListeners(entitlement);
    }
    async checkExtensionInstallation(entitlement) {
        const extensions = await this.extensionManagementService.getInstalled();
        const installed = extensions.find(value => ExtensionIdentifier.equals(value.identifier.id, entitlement.extensionId));
        this.updateExtensionInstalled(installed ? true : false);
    }
    registerEntitlementListeners(entitlement) {
        this._register(this.extensionService.onDidChangeExtensions(result => {
            for (const extension of result.removed) {
                if (ExtensionIdentifier.equals(entitlement.extensionId, extension.identifier)) {
                    this.updateExtensionInstalled(false);
                    break;
                }
            }
            for (const extension of result.added) {
                if (ExtensionIdentifier.equals(entitlement.extensionId, extension.identifier)) {
                    this.updateExtensionInstalled(true);
                    break;
                }
            }
        }));
        this._register(this.authenticationService.onDidChangeSessions(e => {
            if (e.providerId === entitlement.providerId) {
                if (e.event.added?.length) {
                    this.resolveEntitlement(entitlement, e.event.added[0]);
                }
                else if (e.event.removed?.length) {
                    this.chatSetupEntitledContextKey.set(false);
                }
            }
        }));
        this._register(this.authenticationService.onDidRegisterAuthenticationProvider(async (e) => {
            if (e.id === entitlement.providerId) {
                this.resolveEntitlement(entitlement, (await this.authenticationService.getSessions(e.id))[0]);
            }
        }));
    }
    registerAuthListeners(entitlement) {
        const hasProviderSessions = async () => {
            const sessions = await this.authenticationService.getSessions(entitlement.providerId);
            return sessions.length > 0;
        };
        const handleDeclaredAuthProviders = async () => {
            if (this.authenticationService.declaredProviders.find(p => p.id === entitlement.providerId)) {
                this.chatSetupSignedInContextKey.set(await hasProviderSessions());
            }
        };
        this._register(this.authenticationService.onDidChangeDeclaredProviders(handleDeclaredAuthProviders));
        this._register(this.authenticationService.onDidRegisterAuthenticationProvider(handleDeclaredAuthProviders));
        handleDeclaredAuthProviders();
        this._register(this.authenticationService.onDidChangeSessions(async ({ providerId }) => {
            if (providerId === entitlement.providerId) {
                this.chatSetupSignedInContextKey.set(await hasProviderSessions());
            }
        }));
    }
    async resolveEntitlement(entitlement, session) {
        if (!session) {
            return;
        }
        const entitled = await this.doResolveEntitlement(entitlement, session);
        this.chatSetupEntitledContextKey.set(entitled);
    }
    async doResolveEntitlement(entitlement, session) {
        if (typeof this.resolvedEntitlement === 'boolean') {
            return this.resolvedEntitlement;
        }
        const cts = new CancellationTokenSource();
        this._register(toDisposable(() => cts.dispose(true)));
        let context;
        try {
            context = await this.requestService.request({
                type: 'GET',
                url: entitlement.entitlementUrl,
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`
                }
            }, cts.token);
        }
        catch (error) {
            return false;
        }
        if (context.res.statusCode && context.res.statusCode !== 200) {
            return false;
        }
        const result = await asText(context);
        if (!result) {
            return false;
        }
        let parsedResult;
        try {
            parsedResult = JSON.parse(result);
        }
        catch (err) {
            return false; //ignore
        }
        this.resolvedEntitlement = Boolean(parsedResult[entitlement.enablementKey]);
        this.telemetryService.publicLog2('chatInstallEntitlement', { entitled: this.resolvedEntitlement });
        return this.resolvedEntitlement;
    }
    updateExtensionInstalled(isExtensionInstalled) {
        this.storageService.store(ChatSetupContribution_1.CHAT_EXTENSION_INSTALLED_KEY, isExtensionInstalled, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
    }
};
ChatSetupContribution = ChatSetupContribution_1 = __decorate([
    __param(0, IContextKeyService),
    __param(1, ITelemetryService),
    __param(2, IAuthenticationService),
    __param(3, IProductService),
    __param(4, IExtensionManagementService),
    __param(5, IExtensionService),
    __param(6, IRequestService),
    __param(7, IStorageService)
], ChatSetupContribution);
registerWorkbenchContribution2('workbench.chat.setup', ChatSetupContribution, 2 /* WorkbenchPhase.BlockRestore */);
