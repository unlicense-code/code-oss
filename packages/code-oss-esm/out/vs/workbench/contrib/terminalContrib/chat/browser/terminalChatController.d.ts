import type { Terminal as RawXtermTerminal } from '@xterm/xterm';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatCodeBlockContextProviderService } from '../../../chat/browser/chat.js';
import { IChatService } from '../../../chat/common/chatService.js';
import { ITerminalContribution, ITerminalInstance, ITerminalService, IXtermTerminal } from '../../../terminal/browser/terminal.js';
import { TerminalChatWidget } from './terminalChatWidget.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import type { ITerminalContributionContext } from '../../../terminal/browser/terminalExtensions.js';
export declare class TerminalChatController extends Disposable implements ITerminalContribution {
    private readonly _ctx;
    private readonly _chatService;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    private readonly _terminalService;
    private readonly _viewsService;
    static readonly ID = "terminal.chat";
    static get(instance: ITerminalInstance): TerminalChatController | null;
    /**
     * The controller for the currently focused chat widget. This is used to track action context since 'active terminals'
     * are only tracked for non-detached terminal instanecs.
     */
    static activeChatController?: TerminalChatController;
    /**
     * The chat widget for the controller, this is lazy as we don't want to instantiate it until
     * both it's required and xterm is ready.
     */
    private _terminalChatWidget;
    /**
     * The terminal chat widget for the controller, this will be undefined if xterm is not ready yet (ie. the
     * terminal is still initializing). This wraps the inline chat widget.
     */
    get terminalChatWidget(): TerminalChatWidget | undefined;
    private _lastResponseContent;
    get lastResponseContent(): string | undefined;
    private _terminalAgentName;
    get scopedContextKeyService(): IContextKeyService;
    private _currentRequestId;
    constructor(_ctx: ITerminalContributionContext, chatCodeBlockContextProviderService: IChatCodeBlockContextProviderService, _chatService: IChatService, _contextKeyService: IContextKeyService, _instantiationService: IInstantiationService, _terminalService: ITerminalService, _viewsService: IViewsService);
    xtermReady(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    private _forcedPlaceholder;
    private _updatePlaceholder;
    private _getPlaceholderText;
    setPlaceholder(text: string): void;
    resetPlaceholder(): void;
    updateInput(text: string, selectAll?: boolean): void;
    focus(): void;
    hasFocus(): boolean;
    viewInChat(): Promise<void>;
}
