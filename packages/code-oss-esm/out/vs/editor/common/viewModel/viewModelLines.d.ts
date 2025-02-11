import { IDisposable } from '../../../base/common/lifecycle.js';
import { WrappingIndent } from '../config/editorOptions.js';
import { FontInfo } from '../config/fontInfo.js';
import { IPosition, Position } from '../core/position.js';
import { Range } from '../core/range.js';
import { IModelDecoration, ITextModel, PositionAffinity } from '../model.js';
import { IActiveIndentGuideInfo, BracketGuideOptions, IndentGuide } from '../textModelGuides.js';
import * as viewEvents from '../viewEvents.js';
import { ILineBreaksComputer, ModelLineProjectionData, InjectedText, ILineBreaksComputerFactory } from '../modelLineProjectionData.js';
import { ICoordinatesConverter, ViewLineData } from '../viewModel.js';
export interface IViewModelLines extends IDisposable {
    createCoordinatesConverter(): ICoordinatesConverter;
    setWrappingSettings(fontInfo: FontInfo, wrappingStrategy: 'simple' | 'advanced', wrappingColumn: number, wrappingIndent: WrappingIndent, wordBreak: 'normal' | 'keepAll'): boolean;
    setTabSize(newTabSize: number): boolean;
    getHiddenAreas(): Range[];
    setHiddenAreas(_ranges: readonly Range[]): boolean;
    createLineBreaksComputer(): ILineBreaksComputer;
    onModelFlushed(): void;
    onModelLinesDeleted(versionId: number | null, fromLineNumber: number, toLineNumber: number): viewEvents.ViewLinesDeletedEvent | null;
    onModelLinesInserted(versionId: number | null, fromLineNumber: number, toLineNumber: number, lineBreaks: (ModelLineProjectionData | null)[]): viewEvents.ViewLinesInsertedEvent | null;
    onModelLineChanged(versionId: number | null, lineNumber: number, lineBreakData: ModelLineProjectionData | null): [boolean, viewEvents.ViewLinesChangedEvent | null, viewEvents.ViewLinesInsertedEvent | null, viewEvents.ViewLinesDeletedEvent | null];
    acceptVersionId(versionId: number): void;
    getViewLineCount(): number;
    getActiveIndentGuide(viewLineNumber: number, minLineNumber: number, maxLineNumber: number): IActiveIndentGuideInfo;
    getViewLinesIndentGuides(viewStartLineNumber: number, viewEndLineNumber: number): number[];
    getViewLinesBracketGuides(startLineNumber: number, endLineNumber: number, activePosition: IPosition | null, options: BracketGuideOptions): IndentGuide[][];
    getViewLineContent(viewLineNumber: number): string;
    getViewLineLength(viewLineNumber: number): number;
    getViewLineMinColumn(viewLineNumber: number): number;
    getViewLineMaxColumn(viewLineNumber: number): number;
    getViewLineData(viewLineNumber: number): ViewLineData;
    getViewLinesData(viewStartLineNumber: number, viewEndLineNumber: number, needed: boolean[]): Array<ViewLineData | null>;
    getDecorationsInRange(range: Range, ownerId: number, filterOutValidation: boolean, onlyMinimapDecorations: boolean, onlyMarginDecorations: boolean): IModelDecoration[];
    getInjectedTextAt(viewPosition: Position): InjectedText | null;
    normalizePosition(position: Position, affinity: PositionAffinity): Position;
    /**
     * Gets the column at which indentation stops at a given line.
     * @internal
    */
    getLineIndentColumn(lineNumber: number): number;
}
export declare class ViewModelLinesFromProjectedModel implements IViewModelLines {
    private readonly _editorId;
    private readonly model;
    private _validModelVersionId;
    private readonly _domLineBreaksComputerFactory;
    private readonly _monospaceLineBreaksComputerFactory;
    private fontInfo;
    private tabSize;
    private wrappingColumn;
    private wrappingIndent;
    private wordBreak;
    private wrappingStrategy;
    private modelLineProjections;
    /**
     * Reflects the sum of the line counts of all projected model lines.
    */
    private projectedModelLineLineCounts;
    private hiddenAreasDecorationIds;
    constructor(editorId: number, model: ITextModel, domLineBreaksComputerFactory: ILineBreaksComputerFactory, monospaceLineBreaksComputerFactory: ILineBreaksComputerFactory, fontInfo: FontInfo, tabSize: number, wrappingStrategy: 'simple' | 'advanced', wrappingColumn: number, wrappingIndent: WrappingIndent, wordBreak: 'normal' | 'keepAll');
    dispose(): void;
    createCoordinatesConverter(): ICoordinatesConverter;
    private _constructLines;
    getHiddenAreas(): Range[];
    setHiddenAreas(_ranges: Range[]): boolean;
    modelPositionIsVisible(modelLineNumber: number, _modelColumn: number): boolean;
    getModelLineViewLineCount(modelLineNumber: number): number;
    setTabSize(newTabSize: number): boolean;
    setWrappingSettings(fontInfo: FontInfo, wrappingStrategy: 'simple' | 'advanced', wrappingColumn: number, wrappingIndent: WrappingIndent, wordBreak: 'normal' | 'keepAll'): boolean;
    createLineBreaksComputer(): ILineBreaksComputer;
    onModelFlushed(): void;
    onModelLinesDeleted(versionId: number | null, fromLineNumber: number, toLineNumber: number): viewEvents.ViewLinesDeletedEvent | null;
    onModelLinesInserted(versionId: number | null, fromLineNumber: number, _toLineNumber: number, lineBreaks: (ModelLineProjectionData | null)[]): viewEvents.ViewLinesInsertedEvent | null;
    onModelLineChanged(versionId: number | null, lineNumber: number, lineBreakData: ModelLineProjectionData | null): [boolean, viewEvents.ViewLinesChangedEvent | null, viewEvents.ViewLinesInsertedEvent | null, viewEvents.ViewLinesDeletedEvent | null];
    acceptVersionId(versionId: number): void;
    getViewLineCount(): number;
    private _toValidViewLineNumber;
    getActiveIndentGuide(viewLineNumber: number, minLineNumber: number, maxLineNumber: number): IActiveIndentGuideInfo;
    private getViewLineInfo;
    private getMinColumnOfViewLine;
    private getMaxColumnOfViewLine;
    private getModelStartPositionOfViewLine;
    private getModelEndPositionOfViewLine;
    private getViewLineInfosGroupedByModelRanges;
    getViewLinesBracketGuides(viewStartLineNumber: number, viewEndLineNumber: number, activeViewPosition: IPosition | null, options: BracketGuideOptions): IndentGuide[][];
    getViewLinesIndentGuides(viewStartLineNumber: number, viewEndLineNumber: number): number[];
    getViewLineContent(viewLineNumber: number): string;
    getViewLineLength(viewLineNumber: number): number;
    getViewLineMinColumn(viewLineNumber: number): number;
    getViewLineMaxColumn(viewLineNumber: number): number;
    getViewLineData(viewLineNumber: number): ViewLineData;
    getViewLinesData(viewStartLineNumber: number, viewEndLineNumber: number, needed: boolean[]): ViewLineData[];
    validateViewPosition(viewLineNumber: number, viewColumn: number, expectedModelPosition: Position): Position;
    validateViewRange(viewRange: Range, expectedModelRange: Range): Range;
    convertViewPositionToModelPosition(viewLineNumber: number, viewColumn: number): Position;
    convertViewRangeToModelRange(viewRange: Range): Range;
    convertModelPositionToViewPosition(_modelLineNumber: number, _modelColumn: number, affinity?: PositionAffinity, allowZeroLineNumber?: boolean, belowHiddenRanges?: boolean): Position;
    /**
     * @param affinity The affinity in case of an empty range. Has no effect for non-empty ranges.
    */
    convertModelRangeToViewRange(modelRange: Range, affinity?: PositionAffinity): Range;
    getViewLineNumberOfModelPosition(modelLineNumber: number, modelColumn: number): number;
    getDecorationsInRange(range: Range, ownerId: number, filterOutValidation: boolean, onlyMinimapDecorations: boolean, onlyMarginDecorations: boolean): IModelDecoration[];
    getInjectedTextAt(position: Position): InjectedText | null;
    normalizePosition(position: Position, affinity: PositionAffinity): Position;
    getLineIndentColumn(lineNumber: number): number;
}
export declare class ViewModelLinesFromModelAsIs implements IViewModelLines {
    readonly model: ITextModel;
    constructor(model: ITextModel);
    dispose(): void;
    createCoordinatesConverter(): ICoordinatesConverter;
    getHiddenAreas(): Range[];
    setHiddenAreas(_ranges: Range[]): boolean;
    setTabSize(_newTabSize: number): boolean;
    setWrappingSettings(_fontInfo: FontInfo, _wrappingStrategy: 'simple' | 'advanced', _wrappingColumn: number, _wrappingIndent: WrappingIndent): boolean;
    createLineBreaksComputer(): ILineBreaksComputer;
    onModelFlushed(): void;
    onModelLinesDeleted(_versionId: number | null, fromLineNumber: number, toLineNumber: number): viewEvents.ViewLinesDeletedEvent | null;
    onModelLinesInserted(_versionId: number | null, fromLineNumber: number, toLineNumber: number, lineBreaks: (ModelLineProjectionData | null)[]): viewEvents.ViewLinesInsertedEvent | null;
    onModelLineChanged(_versionId: number | null, lineNumber: number, lineBreakData: ModelLineProjectionData | null): [boolean, viewEvents.ViewLinesChangedEvent | null, viewEvents.ViewLinesInsertedEvent | null, viewEvents.ViewLinesDeletedEvent | null];
    acceptVersionId(_versionId: number): void;
    getViewLineCount(): number;
    getActiveIndentGuide(viewLineNumber: number, _minLineNumber: number, _maxLineNumber: number): IActiveIndentGuideInfo;
    getViewLinesBracketGuides(startLineNumber: number, endLineNumber: number, activePosition: IPosition | null): IndentGuide[][];
    getViewLinesIndentGuides(viewStartLineNumber: number, viewEndLineNumber: number): number[];
    getViewLineContent(viewLineNumber: number): string;
    getViewLineLength(viewLineNumber: number): number;
    getViewLineMinColumn(viewLineNumber: number): number;
    getViewLineMaxColumn(viewLineNumber: number): number;
    getViewLineData(viewLineNumber: number): ViewLineData;
    getViewLinesData(viewStartLineNumber: number, viewEndLineNumber: number, needed: boolean[]): Array<ViewLineData | null>;
    getDecorationsInRange(range: Range, ownerId: number, filterOutValidation: boolean, onlyMinimapDecorations: boolean, onlyMarginDecorations: boolean): IModelDecoration[];
    normalizePosition(position: Position, affinity: PositionAffinity): Position;
    getLineIndentColumn(lineNumber: number): number;
    getInjectedTextAt(position: Position): InjectedText | null;
}
