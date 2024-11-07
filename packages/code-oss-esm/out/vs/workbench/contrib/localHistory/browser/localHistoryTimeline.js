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
var LocalHistoryTimeline_1;
import { localize } from '../../../../nls.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { ITimelineService } from '../../timeline/common/timeline.js';
import { IWorkingCopyHistoryService } from '../../../services/workingCopy/common/workingCopyHistory.js';
import { URI } from '../../../../base/common/uri.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { API_OPEN_DIFF_EDITOR_COMMAND_ID } from '../../../browser/parts/editor/editorCommands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { LocalHistoryFileSystemProvider } from './localHistoryFileSystemProvider.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { SaveSourceRegistry } from '../../../common/editor.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { COMPARE_WITH_FILE_LABEL, toDiffEditorArguments } from './localHistoryCommands.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { getLocalHistoryDateFormatter, LOCAL_HISTORY_ICON_ENTRY, LOCAL_HISTORY_MENU_CONTEXT_VALUE } from './localHistory.js';
import { Schemas } from '../../../../base/common/network.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { getVirtualWorkspaceAuthority } from '../../../../platform/workspace/common/virtualWorkspace.js';
let LocalHistoryTimeline = class LocalHistoryTimeline extends Disposable {
    static { LocalHistoryTimeline_1 = this; }
    static { this.ID = 'workbench.contrib.localHistoryTimeline'; }
    static { this.LOCAL_HISTORY_ENABLED_SETTINGS_KEY = 'workbench.localHistory.enabled'; }
    constructor(timelineService, workingCopyHistoryService, pathService, fileService, environmentService, configurationService, contextService) {
        super();
        this.timelineService = timelineService;
        this.workingCopyHistoryService = workingCopyHistoryService;
        this.pathService = pathService;
        this.fileService = fileService;
        this.environmentService = environmentService;
        this.configurationService = configurationService;
        this.contextService = contextService;
        this.id = 'timeline.localHistory';
        this.label = localize('localHistory', "Local History");
        this.scheme = '*'; // we try to show local history for all schemes if possible
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this.timelineProviderDisposable = this._register(new MutableDisposable());
        this.registerComponents();
        this.registerListeners();
    }
    registerComponents() {
        // Timeline (if enabled)
        this.updateTimelineRegistration();
        // File Service Provider
        this._register(this.fileService.registerProvider(LocalHistoryFileSystemProvider.SCHEMA, new LocalHistoryFileSystemProvider(this.fileService)));
    }
    updateTimelineRegistration() {
        if (this.configurationService.getValue(LocalHistoryTimeline_1.LOCAL_HISTORY_ENABLED_SETTINGS_KEY)) {
            this.timelineProviderDisposable.value = this.timelineService.registerTimelineProvider(this);
        }
        else {
            this.timelineProviderDisposable.clear();
        }
    }
    registerListeners() {
        // History changes
        this._register(this.workingCopyHistoryService.onDidAddEntry(e => this.onDidChangeWorkingCopyHistoryEntry(e.entry)));
        this._register(this.workingCopyHistoryService.onDidChangeEntry(e => this.onDidChangeWorkingCopyHistoryEntry(e.entry)));
        this._register(this.workingCopyHistoryService.onDidReplaceEntry(e => this.onDidChangeWorkingCopyHistoryEntry(e.entry)));
        this._register(this.workingCopyHistoryService.onDidRemoveEntry(e => this.onDidChangeWorkingCopyHistoryEntry(e.entry)));
        this._register(this.workingCopyHistoryService.onDidRemoveEntries(() => this.onDidChangeWorkingCopyHistoryEntry(undefined /* all entries */)));
        this._register(this.workingCopyHistoryService.onDidMoveEntries(() => this.onDidChangeWorkingCopyHistoryEntry(undefined /* all entries */)));
        // Configuration changes
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(LocalHistoryTimeline_1.LOCAL_HISTORY_ENABLED_SETTINGS_KEY)) {
                this.updateTimelineRegistration();
            }
        }));
    }
    onDidChangeWorkingCopyHistoryEntry(entry) {
        // Re-emit as timeline change event
        this._onDidChange.fire({
            id: this.id,
            uri: entry?.workingCopy.resource,
            reset: true // there is no other way to indicate that items might have been replaced/removed
        });
    }
    async provideTimeline(uri, options, token) {
        const items = [];
        // Try to convert the provided `uri` into a form that is likely
        // for the provider to find entries for so that we can ensure
        // the timeline is always providing local history entries
        let resource = undefined;
        if (uri.scheme === LocalHistoryFileSystemProvider.SCHEMA) {
            // `vscode-local-history`: convert back to the associated resource
            resource = LocalHistoryFileSystemProvider.fromLocalHistoryFileSystem(uri).associatedResource;
        }
        else if (uri.scheme === this.pathService.defaultUriScheme || uri.scheme === Schemas.vscodeUserData) {
            // default-scheme / settings: keep as is
            resource = uri;
        }
        else if (this.fileService.hasProvider(uri)) {
            // anything that is backed by a file system provider:
            // try best to convert the URI back into a form that is
            // likely to match the workspace URIs. That means:
            // - change to the default URI scheme
            // - change to the remote authority or virtual workspace authority
            // - preserve the path
            resource = URI.from({
                scheme: this.pathService.defaultUriScheme,
                authority: this.environmentService.remoteAuthority ?? getVirtualWorkspaceAuthority(this.contextService.getWorkspace()),
                path: uri.path
            });
        }
        if (resource) {
            // Retrieve from working copy history
            const entries = await this.workingCopyHistoryService.getEntries(resource, token);
            // Convert to timeline items
            for (const entry of entries) {
                items.push(this.toTimelineItem(entry));
            }
        }
        return {
            source: this.id,
            items
        };
    }
    toTimelineItem(entry) {
        return {
            handle: entry.id,
            label: SaveSourceRegistry.getSourceLabel(entry.source),
            tooltip: new MarkdownString(`$(history) ${getLocalHistoryDateFormatter().format(entry.timestamp)}\n\n${SaveSourceRegistry.getSourceLabel(entry.source)}${entry.sourceDescription ? ` (${entry.sourceDescription})` : ``}`, { supportThemeIcons: true }),
            source: this.id,
            timestamp: entry.timestamp,
            themeIcon: LOCAL_HISTORY_ICON_ENTRY,
            contextValue: LOCAL_HISTORY_MENU_CONTEXT_VALUE,
            command: {
                id: API_OPEN_DIFF_EDITOR_COMMAND_ID,
                title: COMPARE_WITH_FILE_LABEL.value,
                arguments: toDiffEditorArguments(entry, entry.workingCopy.resource)
            }
        };
    }
};
LocalHistoryTimeline = LocalHistoryTimeline_1 = __decorate([
    __param(0, ITimelineService),
    __param(1, IWorkingCopyHistoryService),
    __param(2, IPathService),
    __param(3, IFileService),
    __param(4, IWorkbenchEnvironmentService),
    __param(5, IConfigurationService),
    __param(6, IWorkspaceContextService)
], LocalHistoryTimeline);
export { LocalHistoryTimeline };
