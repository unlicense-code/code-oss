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
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { autorunWithStore } from '../../../../../base/common/observable.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { CodeEditorWidget } from '../../../../browser/widget/codeEditor/codeEditorWidget.js';
import { formatRecordableLogEntry, observableContextKey } from './inlineCompletionsSource.js';
let TextModelChangeRecorder = class TextModelChangeRecorder extends Disposable {
    constructor(_editor, _contextKeyService, _logService) {
        super();
        this._editor = _editor;
        this._contextKeyService = _contextKeyService;
        this._logService = _logService;
        this._recordingLoggingEnabled = observableContextKey('editor.inlineSuggest.logChangeReason', this._contextKeyService).recomputeInitiallyAndOnChange(this._store);
        this._register(autorunWithStore((reader, store) => {
            if (!(this._editor instanceof CodeEditorWidget)) {
                return;
            }
            if (!this._recordingLoggingEnabled.read(reader)) {
                return;
            }
            const sources = [];
            store.add(this._editor.onBeforeExecuteEdit(({ source }) => {
                if (source) {
                    sources.push(source);
                }
            }));
            store.add(this._editor.onDidChangeModelContent(e => {
                const tm = this._editor.getModel();
                if (!tm) {
                    return;
                }
                for (const source of sources) {
                    this._logService.info(formatRecordableLogEntry('TextModel.setChangeReason', {
                        time: Date.now(),
                        modelUri: tm.uri.toString(),
                        modelVersion: tm.getVersionId(),
                        source: source,
                    }));
                }
                sources.length = 0;
            }));
        }));
    }
};
TextModelChangeRecorder = __decorate([
    __param(1, IContextKeyService),
    __param(2, ILogService)
], TextModelChangeRecorder);
export { TextModelChangeRecorder };
