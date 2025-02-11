import { Event } from '../../../../base/common/event.js';
import { IModelDecorationOptions, IModelDecorationsChangeAccessor, ITextModel } from '../../../common/model.js';
import { FoldingRegion, FoldingRegions, ILineRange, FoldSource } from './foldingRanges.js';
import { SelectedLines } from './folding.js';
export interface IDecorationProvider {
    getDecorationOption(isCollapsed: boolean, isHidden: boolean, isManual: boolean): IModelDecorationOptions;
    changeDecorations<T>(callback: (changeAccessor: IModelDecorationsChangeAccessor) => T): T | null;
    removeDecorations(decorationIds: string[]): void;
}
export interface FoldingModelChangeEvent {
    model: FoldingModel;
    collapseStateChanged?: FoldingRegion[];
}
interface ILineMemento extends ILineRange {
    checksum?: number;
    isCollapsed?: boolean;
    source?: FoldSource;
}
export type CollapseMemento = ILineMemento[];
export declare class FoldingModel {
    private readonly _textModel;
    private readonly _decorationProvider;
    private _regions;
    private _editorDecorationIds;
    private readonly _updateEventEmitter;
    readonly onDidChange: Event<FoldingModelChangeEvent>;
    get regions(): FoldingRegions;
    get textModel(): ITextModel;
    get decorationProvider(): IDecorationProvider;
    constructor(textModel: ITextModel, decorationProvider: IDecorationProvider);
    toggleCollapseState(toggledRegions: FoldingRegion[]): void;
    removeManualRanges(ranges: ILineRange[]): void;
    update(newRegions: FoldingRegions, selection?: SelectedLines): void;
    updatePost(newRegions: FoldingRegions): void;
    private _currentFoldedOrManualRanges;
    /**
     * Collapse state memento, for persistence only
     */
    getMemento(): CollapseMemento | undefined;
    /**
     * Apply persisted state, for persistence only
     */
    applyMemento(state: CollapseMemento): void;
    private _getLinesChecksum;
    dispose(): void;
    getAllRegionsAtLine(lineNumber: number, filter?: (r: FoldingRegion, level: number) => boolean): FoldingRegion[];
    getRegionAtLine(lineNumber: number): FoldingRegion | null;
    getRegionsInside(region: FoldingRegion | null, filter?: RegionFilter | RegionFilterWithLevel): FoldingRegion[];
}
type RegionFilter = (r: FoldingRegion) => boolean;
type RegionFilterWithLevel = (r: FoldingRegion, level: number) => boolean;
/**
 * Collapse or expand the regions at the given locations
 * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
 * @param lineNumbers the location of the regions to collapse or expand, or if not set, all regions in the model.
 */
export declare function toggleCollapseState(foldingModel: FoldingModel, levels: number, lineNumbers: number[]): void;
/**
 * Collapse or expand the regions at the given locations including all children.
 * @param doCollapse Whether to collapse or expand
 * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
 * @param lineNumbers the location of the regions to collapse or expand, or if not set, all regions in the model.
 */
export declare function setCollapseStateLevelsDown(foldingModel: FoldingModel, doCollapse: boolean, levels?: number, lineNumbers?: number[]): void;
/**
 * Collapse or expand the regions at the given locations including all parents.
 * @param doCollapse Whether to collapse or expand
 * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
 * @param lineNumbers the location of the regions to collapse or expand.
 */
export declare function setCollapseStateLevelsUp(foldingModel: FoldingModel, doCollapse: boolean, levels: number, lineNumbers: number[]): void;
/**
 * Collapse or expand a region at the given locations. If the inner most region is already collapsed/expanded, uses the first parent instead.
 * @param doCollapse Whether to collapse or expand
 * @param lineNumbers the location of the regions to collapse or expand.
 */
export declare function setCollapseStateUp(foldingModel: FoldingModel, doCollapse: boolean, lineNumbers: number[]): void;
/**
 * Folds or unfolds all regions that have a given level, except if they contain one of the blocked lines.
 * @param foldLevel level. Level == 1 is the top level
 * @param doCollapse Whether to collapse or expand
*/
export declare function setCollapseStateAtLevel(foldingModel: FoldingModel, foldLevel: number, doCollapse: boolean, blockedLineNumbers: number[]): void;
/**
 * Folds or unfolds all regions, except if they contain or are contained by a region of one of the blocked lines.
 * @param doCollapse Whether to collapse or expand
 * @param blockedLineNumbers the location of regions to not collapse or expand
 */
export declare function setCollapseStateForRest(foldingModel: FoldingModel, doCollapse: boolean, blockedLineNumbers: number[]): void;
/**
 * Folds all regions for which the lines start with a given regex
 * @param foldingModel the folding model
 */
export declare function setCollapseStateForMatchingLines(foldingModel: FoldingModel, regExp: RegExp, doCollapse: boolean): void;
/**
 * Folds all regions of the given type
 * @param foldingModel the folding model
 */
export declare function setCollapseStateForType(foldingModel: FoldingModel, type: string, doCollapse: boolean): void;
/**
 * Get line to go to for parent fold of current line
 * @param lineNumber the current line number
 * @param foldingModel the folding model
 *
 * @return Parent fold start line
 */
export declare function getParentFoldLine(lineNumber: number, foldingModel: FoldingModel): number | null;
/**
 * Get line to go to for previous fold at the same level of current line
 * @param lineNumber the current line number
 * @param foldingModel the folding model
 *
 * @return Previous fold start line
 */
export declare function getPreviousFoldLine(lineNumber: number, foldingModel: FoldingModel): number | null;
/**
 * Get line to go to next fold at the same level of current line
 * @param lineNumber the current line number
 * @param foldingModel the folding model
 *
 * @return Next fold start line
 */
export declare function getNextFoldLine(lineNumber: number, foldingModel: FoldingModel): number | null;
export {};
