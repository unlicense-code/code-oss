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
import { IFileService } from '../../../../platform/files/common/files.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { Emitter } from '../../../../base/common/event.js';
import { ResourceFileEdit, ResourceTextEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { ResourceNotebookCellEdit } from './bulkCellEdits.js';
import { ILogService } from '../../../../platform/log/common/log.js';
let ConflictDetector = class ConflictDetector {
    constructor(edits, fileService, modelService, logService) {
        this._conflicts = new ResourceMap();
        this._disposables = new DisposableStore();
        this._onDidConflict = new Emitter();
        this.onDidConflict = this._onDidConflict.event;
        const _workspaceEditResources = new ResourceMap();
        for (const edit of edits) {
            if (edit instanceof ResourceTextEdit) {
                _workspaceEditResources.set(edit.resource, true);
                if (typeof edit.versionId === 'number') {
                    const model = modelService.getModel(edit.resource);
                    if (model && model.getVersionId() !== edit.versionId) {
                        this._conflicts.set(edit.resource, true);
                        this._onDidConflict.fire(this);
                    }
                }
            }
            else if (edit instanceof ResourceFileEdit) {
                if (edit.newResource) {
                    _workspaceEditResources.set(edit.newResource, true);
                }
                else if (edit.oldResource) {
                    _workspaceEditResources.set(edit.oldResource, true);
                }
            }
            else if (edit instanceof ResourceNotebookCellEdit) {
                _workspaceEditResources.set(edit.resource, true);
            }
            else {
                logService.warn('UNKNOWN edit type', edit);
            }
        }
        // listen to file changes
        this._disposables.add(fileService.onDidFilesChange(e => {
            for (const uri of _workspaceEditResources.keys()) {
                // conflict happens when a file that we are working
                // on changes on disk. ignore changes for which a model
                // exists because we have a better check for models
                if (!modelService.getModel(uri) && e.contains(uri)) {
                    this._conflicts.set(uri, true);
                    this._onDidConflict.fire(this);
                    break;
                }
            }
        }));
        // listen to model changes...?
        const onDidChangeModel = (model) => {
            // conflict
            if (_workspaceEditResources.has(model.uri)) {
                this._conflicts.set(model.uri, true);
                this._onDidConflict.fire(this);
            }
        };
        for (const model of modelService.getModels()) {
            this._disposables.add(model.onDidChangeContent(() => onDidChangeModel(model)));
        }
    }
    dispose() {
        this._disposables.dispose();
        this._onDidConflict.dispose();
    }
    list() {
        return [...this._conflicts.keys()];
    }
    hasConflicts() {
        return this._conflicts.size > 0;
    }
};
ConflictDetector = __decorate([
    __param(1, IFileService),
    __param(2, IModelService),
    __param(3, ILogService)
], ConflictDetector);
export { ConflictDetector };
