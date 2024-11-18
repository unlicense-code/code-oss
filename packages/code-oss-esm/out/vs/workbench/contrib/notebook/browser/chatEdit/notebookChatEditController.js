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
import { isEqual } from '../../../../../base/common/resources.js';
import { Disposable, dispose, toDisposable } from '../../../../../base/common/lifecycle.js';
import { autorun, derived, derivedWithStore, observableFromEvent, observableValue } from '../../../../../base/common/observable.js';
import { IChatEditingService } from '../../../chat/common/chatEditingService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { NotebookDeletedCellDecorator, NotebookInsertedCellDecorator, NotebookCellDiffDecorator } from './notebookCellDecorators.js';
import { INotebookModelSynchronizerFactory } from './notebookSynchronizer.js';
import { INotebookOriginalModelReferenceFactory } from './notebookOriginalModelRefFactory.js';
import { debouncedObservable2 } from '../../../../../base/common/observableInternal/utils.js';
import { NotebookChatActionsOverlayController } from './notebookChatActionsOverlay.js';
import { IContextKeyService, RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
import { localize } from '../../../../../nls.js';
export const ctxNotebookHasEditorModification = new RawContextKey('chat.hasNotebookEditorModifications', undefined, localize('chat.hasNotebookEditorModifications', "The current Notebook editor contains chat modifications"));
let NotebookChatEditorControllerContrib = class NotebookChatEditorControllerContrib extends Disposable {
    static { this.ID = 'workbench.notebook.chatEditorController'; }
    constructor(notebookEditor, instantiationService, configurationService) {
        super();
        if (configurationService.getValue('notebook.experimental.chatEdits')) {
            this._register(instantiationService.createInstance(NotebookChatEditorController, notebookEditor));
        }
    }
};
NotebookChatEditorControllerContrib = __decorate([
    __param(1, IInstantiationService),
    __param(2, IConfigurationService)
], NotebookChatEditorControllerContrib);
export { NotebookChatEditorControllerContrib };
let NotebookChatEditorController = class NotebookChatEditorController extends Disposable {
    constructor(notebookEditor, _chatEditingService, originalModelRefFactory, synchronizerFactory, instantiationService, contextKeyService) {
        super();
        this.notebookEditor = notebookEditor;
        this._chatEditingService = _chatEditingService;
        this.originalModelRefFactory = originalModelRefFactory;
        this.synchronizerFactory = synchronizerFactory;
        this.instantiationService = instantiationService;
        this._ctxHasEditorModification = ctxNotebookHasEditorModification.bindTo(contextKeyService);
        this.deletedCellDecorator = this._register(instantiationService.createInstance(NotebookDeletedCellDecorator, notebookEditor));
        this.insertedCellDecorator = this._register(instantiationService.createInstance(NotebookInsertedCellDecorator, notebookEditor));
        const notebookModel = observableFromEvent(this.notebookEditor.onDidChangeModel, e => e);
        const originalModel = observableValue('originalModel', undefined);
        const viewModelAttached = observableFromEvent(this.notebookEditor.onDidAttachViewModel, () => !!this.notebookEditor.getViewModel());
        const onDidChangeVisibleRanges = debouncedObservable2(observableFromEvent(this.notebookEditor.onDidChangeVisibleRanges, () => this.notebookEditor.visibleRanges), 100);
        const decorators = new Map();
        let updatedCellDecoratorsOnceBefore = false;
        let updatedDeletedInsertedDecoratorsOnceBefore = false;
        const clearDecorators = () => {
            dispose(Array.from(decorators.values()));
            decorators.clear();
            this.deletedCellDecorator.clear();
            this.insertedCellDecorator.clear();
        };
        this._register(toDisposable(() => clearDecorators()));
        let notebookSynchronizer;
        const entryObs = derived((r) => {
            const session = this._chatEditingService.currentEditingSessionObs.read(r);
            const model = notebookModel.read(r);
            if (!model || !session) {
                return;
            }
            return session.entries.read(r).find(e => isEqual(e.modifiedURI, model.uri));
        }).recomputeInitiallyAndOnChange(this._store);
        this._register(autorun(r => {
            const entry = entryObs.read(r);
            const model = notebookModel.read(r);
            if (!entry || !model || entry.state.read(r) !== 0 /* WorkingSetEntryState.Modified */) {
                clearDecorators();
            }
        }));
        const notebookDiffInfo = derivedWithStore(this, (r, store) => {
            const entry = entryObs.read(r);
            const model = notebookModel.read(r);
            if (!entry || !model) {
                // If entry is undefined, then revert the changes to the notebook.
                if (notebookSynchronizer && model) {
                    notebookSynchronizer.object.revert();
                }
                return observableValue('DefaultDiffIno', undefined);
            }
            notebookSynchronizer = notebookSynchronizer || this._register(this.synchronizerFactory.getOrCreate(model));
            this.originalModelRefFactory.getOrCreate(entry, model.viewType).then(ref => originalModel.set(this._register(ref).object, undefined));
            return notebookSynchronizer.object.diffInfo;
        }).recomputeInitiallyAndOnChange(this._store).flatten();
        const notebookCellDiffInfo = notebookDiffInfo.map(d => d?.cellDiff);
        this._register(instantiationService.createInstance(NotebookChatActionsOverlayController, notebookEditor, notebookCellDiffInfo));
        this._register(autorun(r => {
            // If we have a new entry for the file, then clear old decorators.
            // User could be cycling through different edit sessions (Undo Last Edit / Redo Last Edit).
            entryObs.read(r);
            clearDecorators();
        }));
        this._register(autorun(r => {
            // If there's no diff info, then we either accepted or rejected everything.
            const diffs = notebookDiffInfo.read(r);
            if (!diffs || !diffs.cellDiff.length) {
                clearDecorators();
                this._ctxHasEditorModification.reset();
            }
            else {
                this._ctxHasEditorModification.set(true);
            }
        }));
        this._register(autorun(r => {
            const entry = entryObs.read(r);
            const diffInfo = notebookDiffInfo.read(r);
            const modified = notebookModel.read(r);
            const original = originalModel.read(r);
            onDidChangeVisibleRanges.read(r);
            if (!entry || !modified || !original || !diffInfo) {
                return;
            }
            if (diffInfo && updatedCellDecoratorsOnceBefore && (diffInfo.modelVersion !== modified.versionId)) {
                return;
            }
            updatedCellDecoratorsOnceBefore = true;
            diffInfo.cellDiff.forEach((diff) => {
                if (diff.type === 'modified') {
                    const modifiedCell = modified.cells[diff.modifiedCellIndex];
                    const originalCellValue = original.cells[diff.originalCellIndex].getValue();
                    const editor = this.notebookEditor.codeEditors.find(([vm,]) => vm.handle === modifiedCell.handle)?.[1];
                    if (editor && decorators.get(modifiedCell)?.editor !== editor) {
                        decorators.get(modifiedCell)?.dispose();
                        const decorator = this.instantiationService.createInstance(NotebookCellDiffDecorator, editor, originalCellValue, modifiedCell.cellKind);
                        decorators.set(modifiedCell, decorator);
                        this._register(editor.onDidDispose(() => {
                            decorator.dispose();
                            if (decorators.get(modifiedCell) === decorator) {
                                decorators.delete(modifiedCell);
                            }
                        }));
                    }
                }
            });
        }));
        this._register(autorun(r => {
            const entry = entryObs.read(r);
            const diffInfo = notebookDiffInfo.read(r);
            const modified = notebookModel.read(r);
            const original = originalModel.read(r);
            const vmAttached = viewModelAttached.read(r);
            if (!vmAttached || !entry || !modified || !original || !diffInfo) {
                return;
            }
            if (diffInfo && updatedDeletedInsertedDecoratorsOnceBefore && (diffInfo.modelVersion !== modified.versionId)) {
                return;
            }
            updatedDeletedInsertedDecoratorsOnceBefore = true;
            this.insertedCellDecorator.apply(diffInfo.cellDiff);
            this.deletedCellDecorator.apply(diffInfo.cellDiff, original);
        }));
    }
};
NotebookChatEditorController = __decorate([
    __param(1, IChatEditingService),
    __param(2, INotebookOriginalModelReferenceFactory),
    __param(3, INotebookModelSynchronizerFactory),
    __param(4, IInstantiationService),
    __param(5, IContextKeyService)
], NotebookChatEditorController);
