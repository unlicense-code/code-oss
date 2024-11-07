import { IThemeService, Themable } from '../../../../platform/theme/common/themeService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ChatInputPart } from './chatInputPart.js';
import { IChatWidgetStyles } from './chatWidget.js';
export declare class ChatDragAndDrop extends Themable {
    private readonly contianer;
    private readonly inputPart;
    private readonly styles;
    private readonly extensionService;
    private readonly overlay;
    private overlayText?;
    private overlayTextBackground;
    constructor(contianer: HTMLElement, inputPart: ChatInputPart, styles: IChatWidgetStyles, themeService: IThemeService, extensionService: IExtensionService);
    private onDragEnter;
    private onDragLeave;
    private onDrop;
    private updateDropFeedback;
    private isImageDnd;
    private guessDropType;
    private isDragEventSupported;
    private getDropTypeName;
    private getAttachContext;
    private resolveAttachContext;
    private setOverlay;
    updateStyles(): void;
}
