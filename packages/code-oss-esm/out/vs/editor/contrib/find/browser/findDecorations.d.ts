import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IActiveCodeEditor } from '../../../browser/editorBrowser.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { FindMatch } from '../../../common/model.js';
import { ModelDecorationOptions } from '../../../common/model/textModel.js';
export declare class FindDecorations implements IDisposable {
    private readonly _editor;
    private _decorations;
    private _overviewRulerApproximateDecorations;
    private _findScopeDecorationIds;
    private _rangeHighlightDecorationId;
    private _highlightedDecorationId;
    private _startPosition;
    constructor(editor: IActiveCodeEditor);
    dispose(): void;
    reset(): void;
    getCount(): number;
    /** @deprecated use getFindScopes to support multiple selections */
    getFindScope(): Range | null;
    getFindScopes(): Range[] | null;
    getStartPosition(): Position;
    setStartPosition(newStartPosition: Position): void;
    private _getDecorationIndex;
    getDecorationRangeAt(index: number): Range | null;
    getCurrentMatchesPosition(desiredRange: Range): number;
    setCurrentFindMatch(nextMatch: Range | null): number;
    set(findMatches: FindMatch[], findScopes: Range[] | null): void;
    matchBeforePosition(position: Position): Range | null;
    matchAfterPosition(position: Position): Range | null;
    private _allDecorations;
    static readonly _CURRENT_FIND_MATCH_DECORATION: ModelDecorationOptions;
    static readonly _FIND_MATCH_DECORATION: ModelDecorationOptions;
    static readonly _FIND_MATCH_NO_OVERVIEW_DECORATION: ModelDecorationOptions;
    private static readonly _FIND_MATCH_ONLY_OVERVIEW_DECORATION;
    private static readonly _RANGE_HIGHLIGHT_DECORATION;
    private static readonly _FIND_SCOPE_DECORATION;
}
