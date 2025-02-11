import { CursorConfiguration, ICursorSimpleModel, SingleCursorState, IColumnSelectData } from '../cursorCommon.js';
export declare class ColumnSelection {
    static columnSelect(config: CursorConfiguration, model: ICursorSimpleModel, fromLineNumber: number, fromVisibleColumn: number, toLineNumber: number, toVisibleColumn: number): IColumnSelectResult;
    static columnSelectLeft(config: CursorConfiguration, model: ICursorSimpleModel, prevColumnSelectData: IColumnSelectData): IColumnSelectResult;
    static columnSelectRight(config: CursorConfiguration, model: ICursorSimpleModel, prevColumnSelectData: IColumnSelectData): IColumnSelectResult;
    static columnSelectUp(config: CursorConfiguration, model: ICursorSimpleModel, prevColumnSelectData: IColumnSelectData, isPaged: boolean): IColumnSelectResult;
    static columnSelectDown(config: CursorConfiguration, model: ICursorSimpleModel, prevColumnSelectData: IColumnSelectData, isPaged: boolean): IColumnSelectResult;
}
export interface IColumnSelectResult {
    viewStates: SingleCursorState[];
    reversed: boolean;
    fromLineNumber: number;
    fromVisualColumn: number;
    toLineNumber: number;
    toVisualColumn: number;
}
