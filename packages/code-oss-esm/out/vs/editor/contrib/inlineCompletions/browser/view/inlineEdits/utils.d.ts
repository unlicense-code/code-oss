import { IReader } from '../../../../../../base/common/observable.js';
import { URI } from '../../../../../../base/common/uri.js';
import { MenuEntryActionViewItem } from '../../../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { ObservableCodeEditor } from '../../../../../browser/observableCodeEditor.js';
import { LineRange } from '../../../../../common/core/lineRange.js';
import { TextEdit } from '../../../../../common/core/textEdit.js';
import { RangeMapping } from '../../../../../common/diff/rangeMapping.js';
export declare function maxLeftInRange(editor: ObservableCodeEditor, range: LineRange, reader: IReader): number;
export declare class StatusBarViewItem extends MenuEntryActionViewItem {
    protected updateLabel(): void;
    protected updateTooltip(): void;
}
export declare class Point {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number);
    add(other: Point): Point;
    deltaX(delta: number): Point;
}
export declare class UniqueUriGenerator {
    readonly scheme: string;
    private static _modelId;
    constructor(scheme: string);
    getUniqueUri(): URI;
}
export declare function applyEditToModifiedRangeMappings(rangeMapping: RangeMapping[], edit: TextEdit): RangeMapping[];
export declare function classNames(...classes: (string | false | undefined | null)[]): string;
export declare function createReindentEdit(text: string, range: LineRange): TextEdit;
export declare class PathBuilder {
    private _data;
    moveTo(point: Point): this;
    lineTo(point: Point): this;
    curveTo(cp: Point, to: Point): this;
    curveTo2(cp1: Point, cp2: Point, to: Point): this;
    build(): string;
}
