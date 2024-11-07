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
var WindowTitle_1;
import { localize } from '../../../../nls.js';
import { dirname, basename } from '../../../../base/common/resources.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { isWindows, isWeb, isMacintosh, isNative } from '../../../../base/common/platform.js';
import { trim } from '../../../../base/common/strings.js';
import { template } from '../../../../base/common/labels.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { Emitter } from '../../../../base/common/event.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Schemas } from '../../../../base/common/network.js';
import { getVirtualWorkspaceLocation } from '../../../../platform/workspace/common/virtualWorkspace.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { isCodeEditor, isDiffEditor } from '../../../../editor/browser/editorBrowser.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { getWindowById } from '../../../../base/browser/dom.js';
var WindowSettingNames;
(function (WindowSettingNames) {
    WindowSettingNames["titleSeparator"] = "window.titleSeparator";
    WindowSettingNames["title"] = "window.title";
})(WindowSettingNames || (WindowSettingNames = {}));
export const defaultWindowTitle = (() => {
    if (isMacintosh && isNative) {
        return '${activeEditorShort}${separator}${rootName}${separator}${profileName}'; // macOS has native dirty indicator
    }
    const base = '${dirty}${activeEditorShort}${separator}${rootName}${separator}${profileName}${separator}${appName}';
    if (isWeb) {
        return base + '${separator}${remoteName}'; // Web: always show remote name
    }
    return base;
})();
export const defaultWindowTitleSeparator = isMacintosh ? ' \u2014 ' : ' - ';
let WindowTitle = class WindowTitle extends Disposable {
    static { WindowTitle_1 = this; }
    static { this.NLS_USER_IS_ADMIN = isWindows ? localize('userIsAdmin', "[Administrator]") : localize('userIsSudo', "[Superuser]"); }
    static { this.NLS_EXTENSION_HOST = localize('devExtensionWindowTitlePrefix', "[Extension Development Host]"); }
    static { this.TITLE_DIRTY = '\u25cf '; }
    get value() { return this.title ?? ''; }
    get workspaceName() { return this.labelService.getWorkspaceLabel(this.contextService.getWorkspace()); }
    get fileName() {
        const activeEditor = this.editorService.activeEditor;
        if (!activeEditor) {
            return undefined;
        }
        const fileName = activeEditor.getTitle(0 /* Verbosity.SHORT */);
        const dirty = activeEditor?.isDirty() && !activeEditor.isSaving() ? WindowTitle_1.TITLE_DIRTY : '';
        return `${dirty}${fileName}`;
    }
    constructor(targetWindow, editorGroupsContainer, configurationService, contextKeyService, editorService, environmentService, contextService, labelService, userDataProfileService, productService, viewsService) {
        super();
        this.configurationService = configurationService;
        this.contextKeyService = contextKeyService;
        this.environmentService = environmentService;
        this.contextService = contextService;
        this.labelService = labelService;
        this.userDataProfileService = userDataProfileService;
        this.productService = productService;
        this.viewsService = viewsService;
        this.properties = { isPure: true, isAdmin: false, prefix: undefined };
        this.variables = new Map();
        this.activeEditorListeners = this._register(new DisposableStore());
        this.titleUpdater = this._register(new RunOnceScheduler(() => this.doUpdateTitle(), 0));
        this.onDidChangeEmitter = new Emitter();
        this.onDidChange = this.onDidChangeEmitter.event;
        this.titleIncludesFocusedView = false;
        this.editorService = editorService.createScoped(editorGroupsContainer, this._store);
        this.windowId = targetWindow.vscodeWindowId;
        this.updateTitleIncludesFocusedView();
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationChanged(e)));
        this._register(this.editorService.onDidActiveEditorChange(() => this.onActiveEditorChange()));
        this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.titleUpdater.schedule()));
        this._register(this.contextService.onDidChangeWorkbenchState(() => this.titleUpdater.schedule()));
        this._register(this.contextService.onDidChangeWorkspaceName(() => this.titleUpdater.schedule()));
        this._register(this.labelService.onDidChangeFormatters(() => this.titleUpdater.schedule()));
        this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => this.titleUpdater.schedule()));
        this._register(this.viewsService.onDidChangeFocusedView(() => {
            if (this.titleIncludesFocusedView) {
                this.titleUpdater.schedule();
            }
        }));
        this._register(this.contextKeyService.onDidChangeContext(e => {
            if (e.affectsSome(this.variables)) {
                this.titleUpdater.schedule();
            }
        }));
    }
    onConfigurationChanged(event) {
        if (event.affectsConfiguration("window.title" /* WindowSettingNames.title */)) {
            this.updateTitleIncludesFocusedView();
        }
        if (event.affectsConfiguration("window.title" /* WindowSettingNames.title */) || event.affectsConfiguration("window.titleSeparator" /* WindowSettingNames.titleSeparator */)) {
            this.titleUpdater.schedule();
        }
    }
    updateTitleIncludesFocusedView() {
        const titleTemplate = this.configurationService.getValue("window.title" /* WindowSettingNames.title */);
        this.titleIncludesFocusedView = typeof titleTemplate === 'string' && titleTemplate.includes('${focusedView}');
    }
    onActiveEditorChange() {
        // Dispose old listeners
        this.activeEditorListeners.clear();
        // Calculate New Window Title
        this.titleUpdater.schedule();
        // Apply listener for dirty and label changes
        const activeEditor = this.editorService.activeEditor;
        if (activeEditor) {
            this.activeEditorListeners.add(activeEditor.onDidChangeDirty(() => this.titleUpdater.schedule()));
            this.activeEditorListeners.add(activeEditor.onDidChangeLabel(() => this.titleUpdater.schedule()));
        }
        // Apply listeners for tracking focused code editor
        if (this.titleIncludesFocusedView) {
            const activeTextEditorControl = this.editorService.activeTextEditorControl;
            const textEditorControls = [];
            if (isCodeEditor(activeTextEditorControl)) {
                textEditorControls.push(activeTextEditorControl);
            }
            else if (isDiffEditor(activeTextEditorControl)) {
                textEditorControls.push(activeTextEditorControl.getOriginalEditor(), activeTextEditorControl.getModifiedEditor());
            }
            for (const textEditorControl of textEditorControls) {
                this.activeEditorListeners.add(textEditorControl.onDidBlurEditorText(() => this.titleUpdater.schedule()));
                this.activeEditorListeners.add(textEditorControl.onDidFocusEditorText(() => this.titleUpdater.schedule()));
            }
        }
    }
    doUpdateTitle() {
        const title = this.getFullWindowTitle();
        if (title !== this.title) {
            // Always set the native window title to identify us properly to the OS
            let nativeTitle = title;
            if (!trim(nativeTitle)) {
                nativeTitle = this.productService.nameLong;
            }
            const window = getWindowById(this.windowId, true).window;
            if (!window.document.title && isMacintosh && nativeTitle === this.productService.nameLong) {
                // TODO@electron macOS: if we set a window title for
                // the first time and it matches the one we set in
                // `windowImpl.ts` somehow the window does not appear
                // in the "Windows" menu. As such, we set the title
                // briefly to something different to ensure macOS
                // recognizes we have a window.
                // See: https://github.com/microsoft/vscode/issues/191288
                window.document.title = `${this.productService.nameLong} ${WindowTitle_1.TITLE_DIRTY}`;
            }
            window.document.title = nativeTitle;
            this.title = title;
            this.onDidChangeEmitter.fire();
        }
    }
    getFullWindowTitle() {
        const { prefix, suffix } = this.getTitleDecorations();
        let title = this.getWindowTitle() || this.productService.nameLong;
        if (prefix) {
            title = `${prefix} ${title}`;
        }
        if (suffix) {
            title = `${title} ${suffix}`;
        }
        // Replace non-space whitespace
        return title.replace(/[^\S ]/g, ' ');
    }
    getTitleDecorations() {
        let prefix;
        let suffix;
        if (this.properties.prefix) {
            prefix = this.properties.prefix;
        }
        if (this.environmentService.isExtensionDevelopment) {
            prefix = !prefix
                ? WindowTitle_1.NLS_EXTENSION_HOST
                : `${WindowTitle_1.NLS_EXTENSION_HOST} - ${prefix}`;
        }
        if (this.properties.isAdmin) {
            suffix = WindowTitle_1.NLS_USER_IS_ADMIN;
        }
        return { prefix, suffix };
    }
    updateProperties(properties) {
        const isAdmin = typeof properties.isAdmin === 'boolean' ? properties.isAdmin : this.properties.isAdmin;
        const isPure = typeof properties.isPure === 'boolean' ? properties.isPure : this.properties.isPure;
        const prefix = typeof properties.prefix === 'string' ? properties.prefix : this.properties.prefix;
        if (isAdmin !== this.properties.isAdmin || isPure !== this.properties.isPure || prefix !== this.properties.prefix) {
            this.properties.isAdmin = isAdmin;
            this.properties.isPure = isPure;
            this.properties.prefix = prefix;
            this.titleUpdater.schedule();
        }
    }
    registerVariables(variables) {
        let changed = false;
        for (const { name, contextKey } of variables) {
            if (!this.variables.has(contextKey)) {
                this.variables.set(contextKey, name);
                changed = true;
            }
        }
        if (changed) {
            this.titleUpdater.schedule();
        }
    }
    /**
     * Possible template values:
     *
     * {activeEditorLong}: e.g. /Users/Development/myFolder/myFileFolder/myFile.txt
     * {activeEditorMedium}: e.g. myFolder/myFileFolder/myFile.txt
     * {activeEditorShort}: e.g. myFile.txt
     * {activeFolderLong}: e.g. /Users/Development/myFolder/myFileFolder
     * {activeFolderMedium}: e.g. myFolder/myFileFolder
     * {activeFolderShort}: e.g. myFileFolder
     * {rootName}: e.g. myFolder1, myFolder2, myFolder3
     * {rootPath}: e.g. /Users/Development
     * {folderName}: e.g. myFolder
     * {folderPath}: e.g. /Users/Development/myFolder
     * {appName}: e.g. VS Code
     * {remoteName}: e.g. SSH
     * {dirty}: indicator
     * {focusedView}: e.g. Terminal
     * {separator}: conditional separator
     */
    getWindowTitle() {
        const editor = this.editorService.activeEditor;
        const workspace = this.contextService.getWorkspace();
        // Compute root
        let root;
        if (workspace.configuration) {
            root = workspace.configuration;
        }
        else if (workspace.folders.length) {
            root = workspace.folders[0].uri;
        }
        // Compute active editor folder
        const editorResource = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY });
        let editorFolderResource = editorResource ? dirname(editorResource) : undefined;
        if (editorFolderResource?.path === '.') {
            editorFolderResource = undefined;
        }
        // Compute folder resource
        // Single Root Workspace: always the root single workspace in this case
        // Otherwise: root folder of the currently active file if any
        let folder = undefined;
        if (this.contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
            folder = workspace.folders[0];
        }
        else if (editorResource) {
            folder = this.contextService.getWorkspaceFolder(editorResource) ?? undefined;
        }
        // Compute remote
        // vscode-remtoe: use as is
        // otherwise figure out if we have a virtual folder opened
        let remoteName = undefined;
        if (this.environmentService.remoteAuthority && !isWeb) {
            remoteName = this.labelService.getHostLabel(Schemas.vscodeRemote, this.environmentService.remoteAuthority);
        }
        else {
            const virtualWorkspaceLocation = getVirtualWorkspaceLocation(workspace);
            if (virtualWorkspaceLocation) {
                remoteName = this.labelService.getHostLabel(virtualWorkspaceLocation.scheme, virtualWorkspaceLocation.authority);
            }
        }
        // Variables
        const activeEditorShort = editor ? editor.getTitle(0 /* Verbosity.SHORT */) : '';
        const activeEditorMedium = editor ? editor.getTitle(1 /* Verbosity.MEDIUM */) : activeEditorShort;
        const activeEditorLong = editor ? editor.getTitle(2 /* Verbosity.LONG */) : activeEditorMedium;
        const activeFolderShort = editorFolderResource ? basename(editorFolderResource) : '';
        const activeFolderMedium = editorFolderResource ? this.labelService.getUriLabel(editorFolderResource, { relative: true }) : '';
        const activeFolderLong = editorFolderResource ? this.labelService.getUriLabel(editorFolderResource) : '';
        const rootName = this.labelService.getWorkspaceLabel(workspace);
        const rootNameShort = this.labelService.getWorkspaceLabel(workspace, { verbose: 0 /* LabelVerbosity.SHORT */ });
        const rootPath = root ? this.labelService.getUriLabel(root) : '';
        const folderName = folder ? folder.name : '';
        const folderPath = folder ? this.labelService.getUriLabel(folder.uri) : '';
        const dirty = editor?.isDirty() && !editor.isSaving() ? WindowTitle_1.TITLE_DIRTY : '';
        const appName = this.productService.nameLong;
        const profileName = this.userDataProfileService.currentProfile.isDefault ? '' : this.userDataProfileService.currentProfile.name;
        const focusedView = this.viewsService.getFocusedViewName();
        const variables = {};
        for (const [contextKey, name] of this.variables) {
            variables[name] = this.contextKeyService.getContextKeyValue(contextKey) ?? '';
        }
        let titleTemplate = this.configurationService.getValue("window.title" /* WindowSettingNames.title */);
        if (typeof titleTemplate !== 'string') {
            titleTemplate = defaultWindowTitle;
        }
        let separator = this.configurationService.getValue("window.titleSeparator" /* WindowSettingNames.titleSeparator */);
        if (typeof separator !== 'string') {
            separator = defaultWindowTitleSeparator;
        }
        return template(titleTemplate, {
            ...variables,
            activeEditorShort,
            activeEditorLong,
            activeEditorMedium,
            activeFolderShort,
            activeFolderMedium,
            activeFolderLong,
            rootName,
            rootPath,
            rootNameShort,
            folderName,
            folderPath,
            dirty,
            appName,
            remoteName,
            profileName,
            focusedView,
            separator: { label: separator }
        });
    }
    isCustomTitleFormat() {
        const title = this.configurationService.inspect("window.title" /* WindowSettingNames.title */);
        const titleSeparator = this.configurationService.inspect("window.titleSeparator" /* WindowSettingNames.titleSeparator */);
        return title.value !== title.defaultValue || titleSeparator.value !== titleSeparator.defaultValue;
    }
};
WindowTitle = WindowTitle_1 = __decorate([
    __param(2, IConfigurationService),
    __param(3, IContextKeyService),
    __param(4, IEditorService),
    __param(5, IBrowserWorkbenchEnvironmentService),
    __param(6, IWorkspaceContextService),
    __param(7, ILabelService),
    __param(8, IUserDataProfileService),
    __param(9, IProductService),
    __param(10, IViewsService)
], WindowTitle);
export { WindowTitle };
