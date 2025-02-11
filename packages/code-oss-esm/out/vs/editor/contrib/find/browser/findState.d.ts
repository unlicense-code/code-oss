import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Range } from '../../../common/core/range.js';
export interface FindReplaceStateChangedEvent {
    moveCursor: boolean;
    updateHistory: boolean;
    searchString: boolean;
    replaceString: boolean;
    isRevealed: boolean;
    isReplaceRevealed: boolean;
    isRegex: boolean;
    wholeWord: boolean;
    matchCase: boolean;
    preserveCase: boolean;
    searchScope: boolean;
    matchesPosition: boolean;
    matchesCount: boolean;
    currentMatch: boolean;
    loop: boolean;
    isSearching: boolean;
    filters: boolean;
}
export declare const enum FindOptionOverride {
    NotSet = 0,
    True = 1,
    False = 2
}
export interface INewFindReplaceState<T extends {
    update: (value: T) => void;
} = {
    update: () => {};
}> {
    searchString?: string;
    replaceString?: string;
    isRevealed?: boolean;
    isReplaceRevealed?: boolean;
    isRegex?: boolean;
    isRegexOverride?: FindOptionOverride;
    wholeWord?: boolean;
    wholeWordOverride?: FindOptionOverride;
    matchCase?: boolean;
    matchCaseOverride?: FindOptionOverride;
    preserveCase?: boolean;
    preserveCaseOverride?: FindOptionOverride;
    searchScope?: Range[] | null;
    loop?: boolean;
    isSearching?: boolean;
    filters?: T;
}
export declare class FindReplaceState<T extends {
    update: (value: T) => void;
} = {
    update: () => {};
}> extends Disposable {
    private _searchString;
    private _replaceString;
    private _isRevealed;
    private _isReplaceRevealed;
    private _isRegex;
    private _isRegexOverride;
    private _wholeWord;
    private _wholeWordOverride;
    private _matchCase;
    private _matchCaseOverride;
    private _preserveCase;
    private _preserveCaseOverride;
    private _searchScope;
    private _matchesPosition;
    private _matchesCount;
    private _currentMatch;
    private _loop;
    private _isSearching;
    private _filters;
    private readonly _onFindReplaceStateChange;
    get searchString(): string;
    get replaceString(): string;
    get isRevealed(): boolean;
    get isReplaceRevealed(): boolean;
    get isRegex(): boolean;
    get wholeWord(): boolean;
    get matchCase(): boolean;
    get preserveCase(): boolean;
    get actualIsRegex(): boolean;
    get actualWholeWord(): boolean;
    get actualMatchCase(): boolean;
    get actualPreserveCase(): boolean;
    get searchScope(): Range[] | null;
    get matchesPosition(): number;
    get matchesCount(): number;
    get currentMatch(): Range | null;
    get isSearching(): boolean;
    get filters(): T | null;
    readonly onFindReplaceStateChange: Event<FindReplaceStateChangedEvent>;
    constructor();
    changeMatchInfo(matchesPosition: number, matchesCount: number, currentMatch: Range | undefined): void;
    change(newState: INewFindReplaceState<T>, moveCursor: boolean, updateHistory?: boolean): void;
    canNavigateBack(): boolean;
    canNavigateForward(): boolean;
    private canNavigateInLoop;
}
