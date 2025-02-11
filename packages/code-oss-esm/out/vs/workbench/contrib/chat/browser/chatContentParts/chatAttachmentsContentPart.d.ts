import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IChatRequestVariableEntry } from '../../common/chatModel.js';
import { IChatContentReference } from '../../common/chatService.js';
export declare class ChatAttachmentsContentPart extends Disposable {
    private readonly variables;
    private readonly contentReferences;
    private readonly workingSet;
    readonly domNode: HTMLElement;
    private readonly instantiationService;
    private readonly openerService;
    private readonly hoverService;
    private readonly fileService;
    private readonly commandService;
    private readonly themeService;
    private readonly attachedContextDisposables;
    private readonly _onDidChangeVisibility;
    private readonly _contextResourceLabels;
    constructor(variables: IChatRequestVariableEntry[], contentReferences: ReadonlyArray<IChatContentReference>, workingSet: ReadonlyArray<URI>, domNode: HTMLElement, instantiationService: IInstantiationService, openerService: IOpenerService, hoverService: IHoverService, fileService: IFileService, commandService: ICommandService, themeService: IThemeService);
    private initAttachedContext;
    private openResource;
    private createImageElements;
}
