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
var ChatSetupContribution_1, ChatSetupTrigger_1;
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IRequestService, asText } from '../../../../platform/request/common/request.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { ChatContextKeys } from '../common/chatContextKeys.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { timeout } from '../../../../base/common/async.js';
import { isCancellationError } from '../../../../base/common/errors.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IExtensionsWorkbenchService } from '../../extensions/common/extensions.js';
import { CHAT_CATEGORY } from './actions/chatActions.js';
import { showChatView, ChatViewId } from './chat.js';
import { IChatAgentService } from '../common/chatAgents.js';
import { Event } from '../../../../base/common/event.js';
import product from '../../../../platform/product/common/product.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { IViewDescriptorService } from '../../../common/views.js';
const defaultChat = {
    extensionId: product.defaultChatAgent?.extensionId ?? '',
    name: product.defaultChatAgent?.name ?? '',
    providerId: product.defaultChatAgent?.providerId ?? '',
    providerName: product.defaultChatAgent?.providerName ?? '',
    providerScopes: product.defaultChatAgent?.providerScopes ?? [],
    icon: Codicon[product.defaultChatAgent?.icon ?? 'commentDiscussion'],
    documentationUrl: product.defaultChatAgent?.documentationUrl ?? '',
    gettingStartedCommand: product.defaultChatAgent?.gettingStartedCommand ?? '',
    welcomeTitle: product.defaultChatAgent?.welcomeTitle ?? '',
};
let ChatSetupContribution = class ChatSetupContribution extends Disposable {
    static { ChatSetupContribution_1 = this; }
    static { this.CHAT_EXTENSION_INSTALLED_KEY = 'chat.extensionInstalled'; }
    constructor(contextKeyService, telemetryService, authenticationService, productService, extensionManagementService, extensionService, requestService, storageService, instantiationService) {
        super();
        this.contextKeyService = contextKeyService;
        this.telemetryService = telemetryService;
        this.authenticationService = authenticationService;
        this.productService = productService;
        this.extensionManagementService = extensionManagementService;
        this.extensionService = extensionService;
        this.requestService = requestService;
        this.storageService = storageService;
        this.instantiationService = instantiationService;
        this.chatSetupSignedInContextKey = ChatContextKeys.ChatSetup.signedIn.bindTo(this.contextKeyService);
        this.chatSetupEntitledContextKey = ChatContextKeys.ChatSetup.entitled.bindTo(this.contextKeyService);
        this.resolvedEntitlement = undefined;
        const entitlement = this.productService.gitHubEntitlement;
        if (!entitlement) {
            return;
        }
        this.checkExtensionInstallation(entitlement);
        this.registerChatWelcome();
        this.registerEntitlementListeners(entitlement);
        this.registerAuthListeners(entitlement);
    }
    async checkExtensionInstallation(entitlement) {
        const extensions = await this.extensionManagementService.getInstalled();
        const installed = extensions.find(value => ExtensionIdentifier.equals(value.identifier.id, entitlement.extensionId));
        this.updateExtensionInstalled(installed ? true : false);
    }
    registerChatWelcome() {
        // Action to hide setup
        const chatSetupTrigger = this.instantiationService.createInstance(ChatSetupTrigger);
        const disableChatSetupActionId = 'workbench.action.chat.disableSetup';
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: disableChatSetupActionId,
                    title: localize2('hideChatSetup', "Hide Chat Setup"),
                    f1: false
                });
            }
            async run(accessor) {
                const viewsDescriptorService = accessor.get(IViewDescriptorService);
                const layoutService = accessor.get(IWorkbenchLayoutService);
                const location = viewsDescriptorService.getViewLocationById(ChatViewId);
                chatSetupTrigger.update(false);
                if (location === 2 /* ViewContainerLocation.AuxiliaryBar */) {
                    const activeContainers = viewsDescriptorService.getViewContainersByLocation(location).filter(container => viewsDescriptorService.getViewContainerModel(container).activeViewDescriptors.length > 0);
                    if (activeContainers.length === 0) {
                        layoutService.setPartHidden(true, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */); // hide if there are no views in the secondary sidebar
                    }
                }
            }
        });
        // Setup: Triggered (signed-out)
        Registry.as("workbench.registry.chat.viewsWelcome" /* ChatViewsWelcomeExtensions.ChatViewsWelcomeRegistry */).register({
            title: defaultChat.welcomeTitle,
            when: ContextKeyExpr.and(ChatContextKeys.ChatSetup.triggering, ChatContextKeys.ChatSetup.signedIn.negate(), ChatContextKeys.ChatSetup.signingIn.negate(), ChatContextKeys.ChatSetup.installing.negate(), ChatContextKeys.extensionInvalid.negate(), ChatContextKeys.panelParticipantRegistered.negate()),
            icon: defaultChat.icon,
            content: new MarkdownString(`${localize('setupContent', "{0} is your AI pair programmer that helps you write code faster and smarter.", defaultChat.name)}\n\n[${localize('signInAndSetup', "Sign in to use {0}", defaultChat.name)}](command:${ChatSetupSignInAndInstallChatAction.ID})\n\n[${localize('learnMore', "Learn More")}](${defaultChat.documentationUrl}) | [${localize('hideSetup', "Hide")}](command:${disableChatSetupActionId})`, { isTrusted: true }),
        });
        // Setup: Triggered (signed-in)
        Registry.as("workbench.registry.chat.viewsWelcome" /* ChatViewsWelcomeExtensions.ChatViewsWelcomeRegistry */).register({
            title: defaultChat.welcomeTitle,
            when: ContextKeyExpr.and(ChatContextKeys.ChatSetup.triggering, ChatContextKeys.ChatSetup.signedIn, ChatContextKeys.ChatSetup.signingIn.negate(), ChatContextKeys.ChatSetup.installing.negate(), ChatContextKeys.extensionInvalid.negate(), ChatContextKeys.panelParticipantRegistered.negate()),
            icon: defaultChat.icon,
            content: new MarkdownString(`${localize('setupContent', "{0} is your AI pair programmer that helps you write code faster and smarter.", defaultChat.name)}\n\n[${localize('setup', "Install {0}", defaultChat.name)}](command:${ChatSetupInstallAction.ID})\n\n[${localize('learnMore', "Learn More")}](${defaultChat.documentationUrl}) | [${localize('hideSetup', "Hide")}](command:${disableChatSetupActionId})`, { isTrusted: true }),
        });
        // Setup: Signing-in
        Registry.as("workbench.registry.chat.viewsWelcome" /* ChatViewsWelcomeExtensions.ChatViewsWelcomeRegistry */).register({
            title: defaultChat.welcomeTitle,
            when: ContextKeyExpr.and(ChatContextKeys.ChatSetup.signingIn, ChatContextKeys.extensionInvalid.negate(), ChatContextKeys.panelParticipantRegistered.negate()),
            icon: defaultChat.icon,
            progress: localize('setupChatSigningIn', "Signing in to {0}...", defaultChat.providerName),
            content: new MarkdownString(`\n\n[${localize('learnMore', "Learn More")}](${defaultChat.documentationUrl})`, { isTrusted: true }),
        });
        // Setup: Installing
        Registry.as("workbench.registry.chat.viewsWelcome" /* ChatViewsWelcomeExtensions.ChatViewsWelcomeRegistry */).register({
            title: defaultChat.welcomeTitle,
            when: ChatContextKeys.ChatSetup.installing,
            icon: defaultChat.icon,
            progress: localize('setupChatInstalling', "Setting up Chat for you..."),
            content: new MarkdownString(`\n\n[${localize('learnMore', "Learn More")}](${defaultChat.documentationUrl})`, { isTrusted: true }),
        });
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
        const trial = parsedResult[entitlement.trialKey] === entitlement.trialValue;
        this.telemetryService.publicLog2('chatInstallEntitlement', {
            entitled: this.resolvedEntitlement,
            trial
        });
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
    __param(7, IStorageService),
    __param(8, IInstantiationService)
], ChatSetupContribution);
class ChatSetupTriggerAction extends Action2 {
    static { this.ID = 'workbench.action.chat.triggerSetup'; }
    static { this.TITLE = localize2('triggerChatSetup', "Trigger Chat Setup"); }
    constructor() {
        super({
            id: ChatSetupTriggerAction.ID,
            title: ChatSetupTriggerAction.TITLE,
            f1: false
        });
    }
    async run(accessor) {
        const viewsService = accessor.get(IViewsService);
        const instantiationService = accessor.get(IInstantiationService);
        instantiationService.createInstance(ChatSetupTrigger).update(true);
        showChatView(viewsService);
    }
}
let ChatSetupTrigger = class ChatSetupTrigger {
    static { ChatSetupTrigger_1 = this; }
    static { this.CHAT_SETUP_TRIGGERD = 'chat.setupTriggered'; }
    constructor(contextKeyService, storageService) {
        this.contextKeyService = contextKeyService;
        this.storageService = storageService;
        this.chatSetupTriggeringContext = ChatContextKeys.ChatSetup.triggering.bindTo(this.contextKeyService);
        if (this.storageService.getBoolean(ChatSetupTrigger_1.CHAT_SETUP_TRIGGERD, 0 /* StorageScope.PROFILE */)) {
            this.update(true);
        }
    }
    update(enabled) {
        if (enabled) {
            this.storageService.store(ChatSetupTrigger_1.CHAT_SETUP_TRIGGERD, enabled, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            this.storageService.remove('chat.welcomeMessageContent.panel', -1 /* StorageScope.APPLICATION */); // fixes flicker issues with cached welcome from previous install
        }
        else {
            this.storageService.remove(ChatSetupTrigger_1.CHAT_SETUP_TRIGGERD, 0 /* StorageScope.PROFILE */);
        }
        this.chatSetupTriggeringContext.set(enabled);
    }
};
ChatSetupTrigger = ChatSetupTrigger_1 = __decorate([
    __param(0, IContextKeyService),
    __param(1, IStorageService)
], ChatSetupTrigger);
class ChatSetupInstallAction extends Action2 {
    static { this.ID = 'workbench.action.chat.install'; }
    static { this.TITLE = localize2('installChat', "Install {0}", defaultChat.name); }
    constructor() {
        super({
            id: ChatSetupInstallAction.ID,
            title: ChatSetupInstallAction.TITLE,
            category: CHAT_CATEGORY,
            menu: {
                id: MenuId.ChatCommandCenter,
                group: 'a_open',
                order: 0,
                when: ContextKeyExpr.and(ChatContextKeys.panelParticipantRegistered.negate(), ContextKeyExpr.or(ChatContextKeys.ChatSetup.entitled, ChatContextKeys.ChatSetup.signedIn))
            }
        });
    }
    run(accessor) {
        return ChatSetupInstallAction.install(accessor, false);
    }
    static async install(accessor, signedIn) {
        const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const productService = accessor.get(IProductService);
        const telemetryService = accessor.get(ITelemetryService);
        const contextKeyService = accessor.get(IContextKeyService);
        const viewsService = accessor.get(IViewsService);
        const chatAgentService = accessor.get(IChatAgentService);
        const setupInstallingContextKey = ChatContextKeys.ChatSetup.installing.bindTo(contextKeyService);
        let installResult;
        try {
            setupInstallingContextKey.set(true);
            showChatView(viewsService);
            await extensionsWorkbenchService.install(defaultChat.extensionId, {
                enable: true,
                isMachineScoped: false,
                installPreReleaseVersion: productService.quality !== 'stable'
            }, ChatViewId);
            installResult = 'installed';
        }
        catch (error) {
            installResult = isCancellationError(error) ? 'cancelled' : 'failedInstall';
        }
        finally {
            Promise.race([
                timeout(2000), // helps prevent flicker with sign-in welcome view
                Event.toPromise(chatAgentService.onDidChangeAgents) // https://github.com/microsoft/vscode-copilot/issues/9274
            ]).finally(() => setupInstallingContextKey.reset());
        }
        telemetryService.publicLog2('commandCenter.chatInstall', { installResult, signedIn });
    }
}
class ChatSetupSignInAndInstallChatAction extends Action2 {
    static { this.ID = 'workbench.action.chat.signInAndInstall'; }
    static { this.TITLE = localize2('signInAndInstallChat', "Sign in to use {0}", defaultChat.name); }
    constructor() {
        super({
            id: ChatSetupSignInAndInstallChatAction.ID,
            title: ChatSetupSignInAndInstallChatAction.TITLE,
            category: CHAT_CATEGORY,
            menu: {
                id: MenuId.ChatCommandCenter,
                group: 'a_open',
                order: 0,
                when: ContextKeyExpr.and(ChatContextKeys.panelParticipantRegistered.negate(), ChatContextKeys.ChatSetup.entitled.negate(), ChatContextKeys.ChatSetup.signedIn.negate())
            }
        });
    }
    async run(accessor) {
        const authenticationService = accessor.get(IAuthenticationService);
        const instantiationService = accessor.get(IInstantiationService);
        const telemetryService = accessor.get(ITelemetryService);
        const contextKeyService = accessor.get(IContextKeyService);
        const viewsService = accessor.get(IViewsService);
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const hideSecondarySidebar = !layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
        const setupSigningInContextKey = ChatContextKeys.ChatSetup.signingIn.bindTo(contextKeyService);
        let session;
        try {
            setupSigningInContextKey.set(true);
            showChatView(viewsService);
            session = await authenticationService.createSession(defaultChat.providerId, defaultChat.providerScopes);
        }
        catch (error) {
            // noop
        }
        finally {
            setupSigningInContextKey.reset();
        }
        if (session) {
            instantiationService.invokeFunction(accessor => ChatSetupInstallAction.install(accessor, true));
        }
        else {
            if (hideSecondarySidebar) {
                layoutService.setPartHidden(true, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            }
            telemetryService.publicLog2('commandCenter.chatInstall', { installResult: 'failedNotSignedIn', signedIn: false });
        }
    }
}
registerAction2(ChatSetupTriggerAction);
registerAction2(ChatSetupInstallAction);
registerAction2(ChatSetupSignInAndInstallChatAction);
registerWorkbenchContribution2('workbench.chat.setup', ChatSetupContribution, 2 /* WorkbenchPhase.BlockRestore */);
