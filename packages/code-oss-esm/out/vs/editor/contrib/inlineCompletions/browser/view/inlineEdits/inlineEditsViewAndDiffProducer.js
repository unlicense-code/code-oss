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
var InlineEditsViewAndDiffProducer_1;
import { LRUCachedFunction } from '../../../../../../base/common/cache.js';
import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { equalsIfDefined, itemEquals } from '../../../../../../base/common/equals.js';
import { createHotClass } from '../../../../../../base/common/hotReloadHelpers.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { derivedDisposable, ObservablePromise, derived, derivedOpts } from '../../../../../../base/common/observable.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IDiffProviderFactoryService } from '../../../../../browser/widget/diffEditor/diffProviderFactoryService.js';
import { SingleLineEdit } from '../../../../../common/core/lineEdit.js';
import { SingleTextEdit, TextEdit } from '../../../../../common/core/textEdit.js';
import { TextLength } from '../../../../../common/core/textLength.js';
import { TextModelText } from '../../../../../common/model/textModelText.js';
import { IModelService } from '../../../../../common/services/model.js';
import { InlineEditsView } from './inlineEditsView.js';
import { UniqueUriGenerator } from './utils.js';
let InlineEditsViewAndDiffProducer = class InlineEditsViewAndDiffProducer extends Disposable {
    static { InlineEditsViewAndDiffProducer_1 = this; }
    static { this.hot = createHotClass(InlineEditsViewAndDiffProducer_1); }
    constructor(_editor, _edit, _model, _instantiationService, _diffProviderFactoryService, _modelService) {
        super();
        this._editor = _editor;
        this._edit = _edit;
        this._model = _model;
        this._instantiationService = _instantiationService;
        this._diffProviderFactoryService = _diffProviderFactoryService;
        this._modelService = _modelService;
        this._modelUriGenerator = new UniqueUriGenerator('inline-edits');
        this._originalModel = derivedDisposable(() => this._modelService.createModel('', null, this._modelUriGenerator.getUniqueUri())).keepObserved(this._store);
        this._modifiedModel = derivedDisposable(() => this._modelService.createModel('', null, this._modelUriGenerator.getUniqueUri())).keepObserved(this._store);
        this._differ = new LRUCachedFunction({ getCacheKey: JSON.stringify }, (arg) => {
            this._originalModel.get().setValue(arg.original);
            this._modifiedModel.get().setValue(arg.modified);
            const diffAlgo = this._diffProviderFactoryService.createDiffProvider({ diffAlgorithm: 'advanced' });
            return ObservablePromise.fromFn(async () => {
                const result = await diffAlgo.computeDiff(this._originalModel.get(), this._modifiedModel.get(), {
                    computeMoves: false,
                    ignoreTrimWhitespace: false,
                    maxComputationTimeMs: 1000,
                }, CancellationToken.None);
                return result;
            });
        });
        this._inlineEditPromise = derived(this, (reader) => {
            const inlineEdit = this._edit.read(reader);
            if (!inlineEdit) {
                return undefined;
            }
            //if (inlineEdit.text.trim() === '') { return undefined; }
            const text = new TextModelText(this._editor.getModel());
            const edit = inlineEdit.edit.extendToFullLine(text);
            const diffResult = this._differ.get({ original: this._editor.getModel().getValueInRange(edit.range), modified: edit.text });
            return diffResult.promiseResult.map(p => {
                if (!p || !p.data) {
                    return undefined;
                }
                const result = p.data;
                const rangeStartPos = edit.range.getStartPosition();
                const innerChanges = result.changes.flatMap(c => c.innerChanges);
                function addRangeToPos(pos, range) {
                    const start = TextLength.fromPosition(range.getStartPosition());
                    return TextLength.ofRange(range).createRange(start.addToPosition(pos));
                }
                const edits = innerChanges.map(c => new SingleTextEdit(addRangeToPos(rangeStartPos, c.originalRange), this._modifiedModel.get().getValueInRange(c.modifiedRange)));
                const diffEdits = new TextEdit(edits);
                return new InlineEditWithChanges(text, diffEdits, inlineEdit.isCollapsed, inlineEdit.renderExplicitly, inlineEdit.commands, inlineEdit.inlineCompletion); //inlineEdit.showInlineIfPossible);
            });
        });
        this._inlineEdit = derivedOpts({ owner: this, equalsFn: equalsIfDefined(itemEquals()) }, reader => this._inlineEditPromise.read(reader)?.read(reader));
        this._register(this._instantiationService.createInstance(InlineEditsView, this._editor, this._inlineEdit, this._model));
    }
};
InlineEditsViewAndDiffProducer = InlineEditsViewAndDiffProducer_1 = __decorate([
    __param(3, IInstantiationService),
    __param(4, IDiffProviderFactoryService),
    __param(5, IModelService)
], InlineEditsViewAndDiffProducer);
export { InlineEditsViewAndDiffProducer };
export class InlineEditWithChanges {
    constructor(originalText, edit, isCollapsed, userJumpedToIt, commands, inlineCompletion) {
        this.originalText = originalText;
        this.edit = edit;
        this.isCollapsed = isCollapsed;
        this.userJumpedToIt = userJumpedToIt;
        this.commands = commands;
        this.inlineCompletion = inlineCompletion;
        this.lineEdit = SingleLineEdit.fromSingleTextEdit(this.edit.toSingle(this.originalText), this.originalText);
        this.originalLineRange = this.lineEdit.lineRange;
        this.modifiedLineRange = this.lineEdit.toLineEdit().getNewLineRanges()[0];
    }
    equals(other) {
        return this.originalText.getValue() === other.originalText.getValue() &&
            this.edit.equals(other.edit) &&
            this.isCollapsed === other.isCollapsed &&
            this.userJumpedToIt === other.userJumpedToIt &&
            this.commands === other.commands &&
            this.inlineCompletion === other.inlineCompletion;
    }
}
