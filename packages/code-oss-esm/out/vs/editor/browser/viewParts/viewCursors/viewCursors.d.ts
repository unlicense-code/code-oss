import './viewCursors.css';
import { FastDomNode } from '../../../../base/browser/fastDomNode.js';
import { ViewPart } from '../../view/viewPart.js';
import { IViewCursorRenderData } from './viewCursor.js';
import { RenderingContext, RestrictedRenderingContext } from '../../view/renderingContext.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../common/viewEvents.js';
/**
 * View cursors is a view part responsible for rendering the primary cursor and
 * any secondary cursors that are currently active.
 */
export declare class ViewCursors extends ViewPart {
    static readonly BLINK_INTERVAL = 500;
    private _readOnly;
    private _cursorBlinking;
    private _cursorStyle;
    private _cursorSmoothCaretAnimation;
    private _experimentalEditContextEnabled;
    private _selectionIsEmpty;
    private _isComposingInput;
    private _isVisible;
    private readonly _domNode;
    private readonly _startCursorBlinkAnimation;
    private readonly _cursorFlatBlinkInterval;
    private _blinkingEnabled;
    private _editorHasFocus;
    private readonly _primaryCursor;
    private readonly _secondaryCursors;
    private _renderData;
    constructor(context: ViewContext);
    dispose(): void;
    getDomNode(): FastDomNode<HTMLElement>;
    onCompositionStart(e: viewEvents.ViewCompositionStartEvent): boolean;
    onCompositionEnd(e: viewEvents.ViewCompositionEndEvent): boolean;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    private _onCursorPositionChanged;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onFocusChanged(e: viewEvents.ViewFocusChangedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onTokensChanged(e: viewEvents.ViewTokensChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    private _getCursorBlinking;
    private _updateBlinking;
    private _updateDomClassName;
    private _getClassName;
    private _show;
    private _hide;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
    getLastRenderData(): IViewCursorRenderData[];
}
