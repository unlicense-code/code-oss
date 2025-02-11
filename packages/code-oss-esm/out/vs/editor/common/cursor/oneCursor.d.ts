import { CursorState, SingleCursorState } from '../cursorCommon.js';
import { CursorContext } from './cursorContext.js';
import { Selection } from '../core/selection.js';
/**
 * Represents a single cursor.
*/
export declare class Cursor {
    modelState: SingleCursorState;
    viewState: SingleCursorState;
    private _selTrackedRange;
    private _trackSelection;
    constructor(context: CursorContext);
    dispose(context: CursorContext): void;
    startTrackingSelection(context: CursorContext): void;
    stopTrackingSelection(context: CursorContext): void;
    private _updateTrackedRange;
    private _removeTrackedRange;
    asCursorState(): CursorState;
    readSelectionFromMarkers(context: CursorContext): Selection;
    ensureValidState(context: CursorContext): void;
    setState(context: CursorContext, modelState: SingleCursorState | null, viewState: SingleCursorState | null): void;
    private static _validatePositionWithCache;
    private static _validateViewState;
    private _setState;
}
