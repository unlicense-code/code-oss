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
var InlineAnchorWidget_1;
import * as dom from '../../../../base/browser/dom.js';
import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { Lazy } from '../../../../base/common/lazy.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
import { SymbolKinds } from '../../../../editor/common/languages.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { getIconClasses } from '../../../../editor/common/services/getIconClasses.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { DefinitionAction } from '../../../../editor/contrib/gotoSymbol/browser/goToCommands.js';
import * as nls from '../../../../nls.js';
import { localize } from '../../../../nls.js';
import { getFlatContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { Action2, IMenuService, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { FileKind, IFileService } from '../../../../platform/files/common/files.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { fillEditorsDragData } from '../../../browser/dnd.js';
import { ResourceContextKey } from '../../../common/contextkeys.js';
import { IEditorService, SIDE_GROUP } from '../../../services/editor/common/editorService.js';
import { ExplorerFolderContext } from '../../files/common/files.js';
import { IChatVariablesService } from '../common/chatVariables.js';
import { IChatWidgetService } from './chat.js';
import { IChatMarkdownAnchorService } from './chatContentParts/chatMarkdownAnchorService.js';
const chatResourceContextKey = new RawContextKey('chatAnchorResource', undefined, { type: 'URI', description: localize('resource', "The full value of the chat anchor resource, including scheme and path") });
let InlineAnchorWidget = class InlineAnchorWidget extends Disposable {
    static { InlineAnchorWidget_1 = this; }
    static { this.className = 'chat-inline-anchor-widget'; }
    constructor(element, inlineReference, originalContextKeyService, contextMenuService, fileService, hoverService, instantiationService, labelService, languageFeaturesService, languageService, menuService, modelService, textModelService, telemetryService) {
        super();
        this.element = element;
        this.inlineReference = inlineReference;
        this._isDisposed = false;
        // TODO: Make sure we handle updates from an inlineReference being `resolved` late
        this.data = 'uri' in inlineReference.inlineReference
            ? inlineReference.inlineReference
            : 'name' in inlineReference.inlineReference
                ? { kind: 'symbol', symbol: inlineReference.inlineReference }
                : { uri: inlineReference.inlineReference };
        const contextKeyService = this._register(originalContextKeyService.createScoped(element));
        this._chatResourceContext = chatResourceContextKey.bindTo(contextKeyService);
        const anchorId = new Lazy(generateUuid);
        element.classList.add(InlineAnchorWidget_1.className, 'show-file-icons');
        let iconText;
        let iconClasses;
        let location;
        let contextMenuId;
        let contextMenuArg;
        let updateContextKeys;
        if (this.data.kind === 'symbol') {
            location = this.data.symbol.location;
            contextMenuId = MenuId.ChatInlineSymbolAnchorContext;
            contextMenuArg = location;
            iconText = this.data.symbol.name;
            iconClasses = ['codicon', ...getIconClasses(modelService, languageService, undefined, undefined, SymbolKinds.toIcon(this.data.symbol.kind))];
            const providerContexts = [
                [EditorContextKeys.hasDefinitionProvider.bindTo(contextKeyService), languageFeaturesService.definitionProvider],
                [EditorContextKeys.hasReferenceProvider.bindTo(contextKeyService), languageFeaturesService.referenceProvider],
                [EditorContextKeys.hasImplementationProvider.bindTo(contextKeyService), languageFeaturesService.implementationProvider],
                [EditorContextKeys.hasTypeDefinitionProvider.bindTo(contextKeyService), languageFeaturesService.typeDefinitionProvider],
            ];
            updateContextKeys = async () => {
                const modelRef = await textModelService.createModelReference(location.uri);
                try {
                    if (this._isDisposed) {
                        return;
                    }
                    const model = modelRef.object.textEditorModel;
                    for (const [contextKey, registry] of providerContexts) {
                        contextKey.set(registry.has(model));
                    }
                }
                finally {
                    modelRef.dispose();
                }
            };
            this._register(dom.addDisposableListener(element, 'click', () => {
                telemetryService.publicLog2('chat.inlineAnchor.openSymbol', {
                    anchorId: anchorId.value
                });
            }));
        }
        else {
            location = this.data;
            contextMenuId = MenuId.ChatInlineResourceAnchorContext;
            contextMenuArg = location.uri;
            const label = labelService.getUriBasenameLabel(location.uri);
            iconText = location.range && this.data.kind !== 'symbol' ?
                `${label}#${location.range.startLineNumber}-${location.range.endLineNumber}` :
                label;
            const fileKind = location.uri.path.endsWith('/') ? FileKind.FOLDER : FileKind.FILE;
            iconClasses = getIconClasses(modelService, languageService, location.uri, fileKind);
            const isFolderContext = ExplorerFolderContext.bindTo(contextKeyService);
            fileService.stat(location.uri)
                .then(stat => {
                isFolderContext.set(stat.isDirectory);
            })
                .catch(() => { });
            this._register(dom.addDisposableListener(element, 'click', () => {
                telemetryService.publicLog2('chat.inlineAnchor.openResource', {
                    anchorId: anchorId.value
                });
            }));
        }
        const resourceContextKey = this._register(new ResourceContextKey(contextKeyService, fileService, languageService, modelService));
        resourceContextKey.set(location.uri);
        this._chatResourceContext.set(location.uri.toString());
        const iconEl = dom.$('span.icon');
        iconEl.classList.add(...iconClasses);
        element.replaceChildren(iconEl, dom.$('span.icon-label', {}, iconText));
        const fragment = location.range ? `${location.range.startLineNumber},${location.range.startColumn}` : '';
        element.setAttribute('data-href', (fragment ? location.uri.with({ fragment }) : location.uri).toString());
        // Context menu
        this._register(dom.addDisposableListener(element, dom.EventType.CONTEXT_MENU, async (domEvent) => {
            const event = new StandardMouseEvent(dom.getWindow(domEvent), domEvent);
            dom.EventHelper.stop(domEvent, true);
            try {
                await updateContextKeys?.();
            }
            catch (e) {
                console.error(e);
            }
            if (this._isDisposed) {
                return;
            }
            contextMenuService.showContextMenu({
                contextKeyService,
                getAnchor: () => event,
                getActions: () => {
                    const menu = menuService.getMenuActions(contextMenuId, contextKeyService, { arg: contextMenuArg });
                    return getFlatContextMenuActions(menu);
                },
            });
        }));
        // Hover
        const relativeLabel = labelService.getUriLabel(location.uri, { relative: true });
        this._register(hoverService.setupManagedHover(getDefaultHoverDelegate('element'), element, relativeLabel));
        // Drag and drop
        element.draggable = true;
        this._register(dom.addDisposableListener(element, 'dragstart', e => {
            instantiationService.invokeFunction(accessor => fillEditorsDragData(accessor, [location.uri], e));
            e.dataTransfer?.setDragImage(element, 0, 0);
        }));
    }
    dispose() {
        this._isDisposed = true;
        super.dispose();
    }
    getHTMLElement() {
        return this.element;
    }
};
InlineAnchorWidget = InlineAnchorWidget_1 = __decorate([
    __param(2, IContextKeyService),
    __param(3, IContextMenuService),
    __param(4, IFileService),
    __param(5, IHoverService),
    __param(6, IInstantiationService),
    __param(7, ILabelService),
    __param(8, ILanguageFeaturesService),
    __param(9, ILanguageService),
    __param(10, IMenuService),
    __param(11, IModelService),
    __param(12, ITextModelService),
    __param(13, ITelemetryService)
], InlineAnchorWidget);
export { InlineAnchorWidget };
//#region Resource context menu
registerAction2(class AddFileToChatAction extends Action2 {
    static { this.id = 'chat.inlineResourceAnchor.addFileToChat'; }
    constructor() {
        super({
            id: AddFileToChatAction.id,
            title: nls.localize2('actions.attach.label', "Add File to Chat"),
            menu: [{
                    id: MenuId.ChatInlineResourceAnchorContext,
                    group: 'chat',
                    order: 1,
                    when: ExplorerFolderContext.negate(),
                }]
        });
    }
    async run(accessor, resource) {
        const chatWidgetService = accessor.get(IChatWidgetService);
        const variablesService = accessor.get(IChatVariablesService);
        const widget = chatWidgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        variablesService.attachContext('file', resource, widget.location);
    }
});
//#endregion
//#region Resource keybindings
registerAction2(class CopyResourceAction extends Action2 {
    static { this.id = 'chat.inlineResourceAnchor.copyResource'; }
    constructor() {
        super({
            id: CopyResourceAction.id,
            title: nls.localize2('actions.copy.label', "Copy"),
            f1: false,
            precondition: chatResourceContextKey,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
            }
        });
    }
    async run(accessor) {
        const chatWidgetService = accessor.get(IChatMarkdownAnchorService);
        const clipboardService = accessor.get(IClipboardService);
        const anchor = chatWidgetService.lastFocusedAnchor;
        if (!anchor) {
            return;
        }
        // TODO: we should also write out the standard mime types so that external programs can use them
        // like how `fillEditorsDragData` works but without having an event to work with.
        const resource = anchor.data.kind === 'symbol' ? anchor.data.symbol.location.uri : anchor.data.uri;
        clipboardService.writeResources([resource]);
    }
});
registerAction2(class OpenToSideResourceAction extends Action2 {
    static { this.id = 'chat.inlineResourceAnchor.openToSide'; }
    constructor() {
        super({
            id: OpenToSideResourceAction.id,
            title: nls.localize2('actions.openToSide.label', "Open to the Side"),
            f1: false,
            precondition: chatResourceContextKey,
            keybinding: {
                weight: 400 /* KeybindingWeight.ExternalExtension */ + 2,
                primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                mac: {
                    primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */
                },
            },
            menu: [{
                    id: MenuId.ChatInlineSymbolAnchorContext,
                    group: 'navigation',
                    order: 1
                }]
        });
    }
    async run(accessor) {
        const chatWidgetService = accessor.get(IChatMarkdownAnchorService);
        const editorService = accessor.get(IEditorService);
        const anchor = chatWidgetService.lastFocusedAnchor;
        if (!anchor) {
            return;
        }
        const input = anchor.data.kind === 'symbol'
            ? {
                resource: anchor.data.symbol.location.uri, options: {
                    selection: {
                        startColumn: anchor.data.symbol.location.range.startColumn,
                        startLineNumber: anchor.data.symbol.location.range.startLineNumber,
                    }
                }
            }
            : { resource: anchor.data.uri };
        await editorService.openEditors([input], SIDE_GROUP);
    }
});
//#endregion
//#region Symbol context menu
registerAction2(class GoToDefinitionAction extends Action2 {
    static { this.id = 'chat.inlineSymbolAnchor.goToDefinition'; }
    constructor() {
        super({
            id: GoToDefinitionAction.id,
            title: {
                ...nls.localize2('actions.goToDecl.label', "Go to Definition"),
                mnemonicTitle: nls.localize({ key: 'miGotoDefinition', comment: ['&& denotes a mnemonic'] }, "Go to &&Definition"),
            },
            menu: [{
                    id: MenuId.ChatInlineSymbolAnchorContext,
                    group: '4_symbol_nav',
                    order: 1.1,
                    when: EditorContextKeys.hasDefinitionProvider,
                }]
        });
    }
    async run(accessor, location) {
        const editorService = accessor.get(ICodeEditorService);
        await openEditorWithSelection(editorService, location);
        const action = new DefinitionAction({ openToSide: false, openInPeek: false, muteMessage: true }, { title: { value: '', original: '' }, id: '', precondition: undefined });
        return action.run(accessor);
    }
});
async function openEditorWithSelection(editorService, location) {
    await editorService.openCodeEditor({
        resource: location.uri, options: {
            selection: {
                startColumn: location.range.startColumn,
                startLineNumber: location.range.startLineNumber,
            }
        }
    }, null);
}
async function runGoToCommand(accessor, command, location) {
    const editorService = accessor.get(ICodeEditorService);
    const commandService = accessor.get(ICommandService);
    await openEditorWithSelection(editorService, location);
    return commandService.executeCommand(command);
}
registerAction2(class GoToTypeDefinitionsAction extends Action2 {
    static { this.id = 'chat.inlineSymbolAnchor.goToTypeDefinitions'; }
    constructor() {
        super({
            id: GoToTypeDefinitionsAction.id,
            title: {
                ...nls.localize2('goToTypeDefinitions.label', "Go to Type Definitions"),
                mnemonicTitle: nls.localize({ key: 'miGotoTypeDefinition', comment: ['&& denotes a mnemonic'] }, "Go to &&Type Definitions"),
            },
            menu: [{
                    id: MenuId.ChatInlineSymbolAnchorContext,
                    group: '4_symbol_nav',
                    order: 1.1,
                    when: EditorContextKeys.hasTypeDefinitionProvider,
                },]
        });
    }
    async run(accessor, location) {
        return runGoToCommand(accessor, 'editor.action.goToTypeDefinition', location);
    }
});
registerAction2(class GoToImplementations extends Action2 {
    static { this.id = 'chat.inlineSymbolAnchor.goToImplementations'; }
    constructor() {
        super({
            id: GoToImplementations.id,
            title: {
                ...nls.localize2('goToImplementations.label', "Go to Implementations"),
                mnemonicTitle: nls.localize({ key: 'miGotoImplementations', comment: ['&& denotes a mnemonic'] }, "Go to &&Implementations"),
            },
            menu: [{
                    id: MenuId.ChatInlineSymbolAnchorContext,
                    group: '4_symbol_nav',
                    order: 1.2,
                    when: EditorContextKeys.hasImplementationProvider,
                },]
        });
    }
    async run(accessor, location) {
        return runGoToCommand(accessor, 'editor.action.goToImplementation', location);
    }
});
registerAction2(class GoToReferencesAction extends Action2 {
    static { this.id = 'chat.inlineSymbolAnchor.goToReferences'; }
    constructor() {
        super({
            id: GoToReferencesAction.id,
            title: {
                ...nls.localize2('goToReferences.label', "Go to References"),
                mnemonicTitle: nls.localize({ key: 'miGotoReference', comment: ['&& denotes a mnemonic'] }, "Go to &&References"),
            },
            menu: [{
                    id: MenuId.ChatInlineSymbolAnchorContext,
                    group: '4_symbol_nav',
                    order: 1.3,
                    when: EditorContextKeys.hasReferenceProvider,
                },]
        });
    }
    async run(accessor, location) {
        return runGoToCommand(accessor, 'editor.action.goToReferences', location);
    }
});
//#endregion
