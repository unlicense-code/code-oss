import { Disposable } from '../../base/common/lifecycle.js';
import * as viewEvents from './viewEvents.js';
export declare class ViewEventHandler extends Disposable {
    private _shouldRender;
    constructor();
    shouldRender(): boolean;
    forceShouldRender(): void;
    protected setShouldRender(): void;
    onDidRender(): void;
    onCompositionStart(e: viewEvents.ViewCompositionStartEvent): boolean;
    onCompositionEnd(e: viewEvents.ViewCompositionEndEvent): boolean;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onFocusChanged(e: viewEvents.ViewFocusChangedEvent): boolean;
    onLanguageConfigurationChanged(e: viewEvents.ViewLanguageConfigurationEvent): boolean;
    onLineMappingChanged(e: viewEvents.ViewLineMappingChangedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onRevealRangeRequest(e: viewEvents.ViewRevealRangeRequestEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onThemeChanged(e: viewEvents.ViewThemeChangedEvent): boolean;
    onTokensChanged(e: viewEvents.ViewTokensChangedEvent): boolean;
    onTokensColorsChanged(e: viewEvents.ViewTokensColorsChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    handleEvents(events: viewEvents.ViewEvent[]): void;
}
