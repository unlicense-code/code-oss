import { Event } from '../../../../../base/common/event.js';
import { IMarkdownString } from '../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { ChatAgentLocation } from '../../common/chatAgents.js';
export interface IViewWelcomeDelegate {
    readonly onDidChangeViewWelcomeState: Event<void>;
    shouldShowWelcome(): boolean;
}
export declare class ChatViewWelcomeController extends Disposable {
    private readonly container;
    private readonly delegate;
    private readonly location;
    private contextKeyService;
    private instantiationService;
    private element;
    private enabled;
    private readonly enabledDisposables;
    private readonly renderDisposables;
    constructor(container: HTMLElement, delegate: IViewWelcomeDelegate, location: ChatAgentLocation, contextKeyService: IContextKeyService, instantiationService: IInstantiationService);
    private update;
    private render;
}
export interface IChatViewWelcomeContent {
    icon?: ThemeIcon;
    title: string;
    message: IMarkdownString;
    progress?: string;
    tips?: IMarkdownString;
}
export interface IChatViewWelcomeRenderOptions {
    firstLinkToButton?: boolean;
    location: ChatAgentLocation;
}
export declare class ChatViewWelcomePart extends Disposable {
    private openerService;
    private instantiationService;
    private logService;
    readonly element: HTMLElement;
    constructor(content: IChatViewWelcomeContent, options: IChatViewWelcomeRenderOptions | undefined, openerService: IOpenerService, instantiationService: IInstantiationService, logService: ILogService);
}
