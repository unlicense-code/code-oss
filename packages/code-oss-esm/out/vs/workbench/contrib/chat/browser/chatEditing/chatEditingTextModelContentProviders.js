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
var ChatEditingTextModelContentProvider_1, ChatEditingSnapshotTextModelContentProvider_1;
import { URI } from '../../../../../base/common/uri.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
let ChatEditingTextModelContentProvider = class ChatEditingTextModelContentProvider {
    static { ChatEditingTextModelContentProvider_1 = this; }
    static { this.scheme = 'chat-editing-text-model'; }
    static getEmptyFileURI() {
        return URI.from({
            scheme: ChatEditingTextModelContentProvider_1.scheme,
            query: JSON.stringify({ kind: 'empty' }),
        });
    }
    static getFileURI(documentId, path) {
        return URI.from({
            scheme: ChatEditingTextModelContentProvider_1.scheme,
            path,
            query: JSON.stringify({ kind: 'doc', documentId }),
        });
    }
    constructor(_currentSessionObs, _modelService) {
        this._currentSessionObs = _currentSessionObs;
        this._modelService = _modelService;
    }
    async provideTextContent(resource) {
        const existing = this._modelService.getModel(resource);
        if (existing && !existing.isDisposed()) {
            return existing;
        }
        const data = JSON.parse(resource.query);
        if (data.kind === 'empty') {
            return this._modelService.createModel('', null, resource, false);
        }
        const session = this._currentSessionObs.get();
        if (!session) {
            return null;
        }
        return session.getVirtualModel(data.documentId);
    }
};
ChatEditingTextModelContentProvider = ChatEditingTextModelContentProvider_1 = __decorate([
    __param(1, IModelService)
], ChatEditingTextModelContentProvider);
export { ChatEditingTextModelContentProvider };
let ChatEditingSnapshotTextModelContentProvider = class ChatEditingSnapshotTextModelContentProvider {
    static { ChatEditingSnapshotTextModelContentProvider_1 = this; }
    static { this.scheme = 'chat-editing-snapshot-text-model'; }
    static getSnapshotFileURI(requestId, path) {
        return URI.from({
            scheme: ChatEditingSnapshotTextModelContentProvider_1.scheme,
            path,
            query: JSON.stringify({ requestId: requestId ?? '' }),
        });
    }
    constructor(_currentSessionObs, _modelService) {
        this._currentSessionObs = _currentSessionObs;
        this._modelService = _modelService;
    }
    async provideTextContent(resource) {
        const existing = this._modelService.getModel(resource);
        if (existing && !existing.isDisposed()) {
            return existing;
        }
        const data = JSON.parse(resource.query);
        const session = this._currentSessionObs.get();
        if (!session || !data.requestId) {
            return null;
        }
        return session.getSnapshotModel(data.requestId, resource);
    }
};
ChatEditingSnapshotTextModelContentProvider = ChatEditingSnapshotTextModelContentProvider_1 = __decorate([
    __param(1, IModelService)
], ChatEditingSnapshotTextModelContentProvider);
export { ChatEditingSnapshotTextModelContentProvider };
