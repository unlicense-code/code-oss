import { Position } from '../../../../../editor/common/core/position.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { IWordAtPosition } from '../../../../../editor/common/core/wordHelper.js';
import { ITextModel } from '../../../../../editor/common/model.js';
export interface IChatCompletionRangeResult {
    insert: Range;
    replace: Range;
    varWord: IWordAtPosition | null;
}
export declare function computeCompletionRanges(model: ITextModel, position: Position, reg: RegExp, onlyOnWordStart?: boolean): IChatCompletionRangeResult | undefined;
