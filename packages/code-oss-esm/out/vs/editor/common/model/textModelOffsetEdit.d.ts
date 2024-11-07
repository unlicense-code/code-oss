import { OffsetEdit } from '../core/offsetEdit.js';
import { DetailedLineRangeMapping } from '../diff/rangeMapping.js';
import { ITextModel, IIdentifiedSingleEditOperation } from '../model.js';
import { IModelContentChange } from '../textModelEvents.js';
export declare abstract class OffsetEdits {
    private constructor();
    static asEditOperations(offsetEdit: OffsetEdit, doc: ITextModel): IIdentifiedSingleEditOperation[];
    static fromContentChanges(contentChanges: readonly IModelContentChange[]): OffsetEdit;
    static fromLineRangeMapping(original: ITextModel, modified: ITextModel, changes: readonly DetailedLineRangeMapping[]): OffsetEdit;
}
