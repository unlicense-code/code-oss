import { Event } from '../../../../../base/common/event.js';
import { IMarkdownString } from '../../../../../base/common/htmlContent.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { ContextKeyExpression } from '../../../../../platform/contextkey/common/contextkey.js';
export declare const enum ChatViewsWelcomeExtensions {
    ChatViewsWelcomeRegistry = "workbench.registry.chat.viewsWelcome"
}
export interface IChatViewsWelcomeDescriptor {
    icon?: ThemeIcon;
    title: string;
    content: IMarkdownString;
    progress?: string;
    when: ContextKeyExpression;
}
export interface IChatViewsWelcomeContributionRegistry {
    onDidChange: Event<void>;
    get(): ReadonlyArray<IChatViewsWelcomeDescriptor>;
    register(descriptor: IChatViewsWelcomeDescriptor): void;
}
declare class ChatViewsWelcomeContributionRegistry implements IChatViewsWelcomeContributionRegistry {
    private readonly descriptors;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    register(descriptor: IChatViewsWelcomeDescriptor): void;
    get(): ReadonlyArray<IChatViewsWelcomeDescriptor>;
}
export declare const chatViewsWelcomeRegistry: ChatViewsWelcomeContributionRegistry;
export {};
