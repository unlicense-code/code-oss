import { Orientation, Sash } from '../sash/sash.js';
import { Color } from '../../../common/color.js';
import { Event } from '../../../common/event.js';
import { Disposable, IDisposable } from '../../../common/lifecycle.js';
import { ScrollbarVisibility, ScrollEvent } from '../../../common/scrollable.js';
import './splitview.css';
export { Orientation } from '../sash/sash.js';
export interface ISplitViewStyles {
    readonly separatorBorder: Color;
}
export declare const enum LayoutPriority {
    Normal = 0,
    Low = 1,
    High = 2
}
/**
 * The interface to implement for views within a {@link SplitView}.
 *
 * An optional {@link TLayoutContext layout context type} may be used in order to
 * pass along layout contextual data from the {@link SplitView.layout} method down
 * to each view's {@link IView.layout} calls.
 */
export interface IView<TLayoutContext = undefined> {
    /**
     * The DOM element for this view.
     */
    readonly element: HTMLElement;
    /**
     * A minimum size for this view.
     *
     * @remarks If none, set it to `0`.
     */
    readonly minimumSize: number;
    /**
     * A maximum size for this view.
     *
     * @remarks If none, set it to `Number.POSITIVE_INFINITY`.
     */
    readonly maximumSize: number;
    /**
     * The priority of the view when the {@link SplitView.resize layout} algorithm
     * runs. Views with higher priority will be resized first.
     *
     * @remarks Only used when `proportionalLayout` is false.
     */
    readonly priority?: LayoutPriority;
    /**
     * If the {@link SplitView} supports {@link ISplitViewOptions.proportionalLayout proportional layout},
     * this property allows for finer control over the proportional layout algorithm, per view.
     *
     * @defaultValue `true`
     */
    readonly proportionalLayout?: boolean;
    /**
     * Whether the view will snap whenever the user reaches its minimum size or
     * attempts to grow it beyond the minimum size.
     *
     * @defaultValue `false`
     */
    readonly snap?: boolean;
    /**
     * View instances are supposed to fire the {@link IView.onDidChange} event whenever
     * any of the constraint properties have changed:
     *
     * - {@link IView.minimumSize}
     * - {@link IView.maximumSize}
     * - {@link IView.priority}
     * - {@link IView.snap}
     *
     * The SplitView will relayout whenever that happens. The event can optionally emit
     * the view's preferred size for that relayout.
     */
    readonly onDidChange: Event<number | undefined>;
    /**
     * This will be called by the {@link SplitView} during layout. A view meant to
     * pass along the layout information down to its descendants.
     *
     * @param size The size of this view, in pixels.
     * @param offset The offset of this view, relative to the start of the {@link SplitView}.
     * @param context The optional {@link IView layout context} passed to {@link SplitView.layout}.
     */
    layout(size: number, offset: number, context: TLayoutContext | undefined): void;
    /**
     * This will be called by the {@link SplitView} whenever this view is made
     * visible or hidden.
     *
     * @param visible Whether the view becomes visible.
     */
    setVisible?(visible: boolean): void;
}
/**
 * A descriptor for a {@link SplitView} instance.
 */
export interface ISplitViewDescriptor<TLayoutContext = undefined, TView extends IView<TLayoutContext> = IView<TLayoutContext>> {
    /**
     * The layout size of the {@link SplitView}.
     */
    readonly size: number;
    /**
     * Descriptors for each {@link IView view}.
     */
    readonly views: {
        /**
         * Whether the {@link IView view} is visible.
         *
         * @defaultValue `true`
         */
        readonly visible?: boolean;
        /**
         * The size of the {@link IView view}.
         *
         * @defaultValue `true`
         */
        readonly size: number;
        /**
         * The size of the {@link IView view}.
         *
         * @defaultValue `true`
         */
        readonly view: TView;
    }[];
}
export interface ISplitViewOptions<TLayoutContext = undefined, TView extends IView<TLayoutContext> = IView<TLayoutContext>> {
    /**
     * Which axis the views align on.
     *
     * @defaultValue `Orientation.VERTICAL`
     */
    readonly orientation?: Orientation;
    /**
     * Styles overriding the {@link defaultStyles default ones}.
     */
    readonly styles?: ISplitViewStyles;
    /**
     * Make Alt-drag the default drag operation.
     */
    readonly inverseAltBehavior?: boolean;
    /**
     * Resize each view proportionally when resizing the SplitView.
     *
     * @defaultValue `true`
     */
    readonly proportionalLayout?: boolean;
    /**
     * An initial description of this {@link SplitView} instance, allowing
     * to initialze all views within the ctor.
     */
    readonly descriptor?: ISplitViewDescriptor<TLayoutContext, TView>;
    /**
     * The scrollbar visibility setting for whenever the views within
     * the {@link SplitView} overflow.
     */
    readonly scrollbarVisibility?: ScrollbarVisibility;
    /**
     * Override the orthogonal size of sashes.
     */
    readonly getSashOrthogonalSize?: () => number;
}
interface ISashItem {
    sash: Sash;
    disposable: IDisposable;
}
/**
 * When adding or removing views, uniformly distribute the entire split view space among
 * all views.
 */
export type DistributeSizing = {
    type: 'distribute';
};
/**
 * When adding a view, make space for it by reducing the size of another view,
 * indexed by the provided `index`.
 */
export type SplitSizing = {
    type: 'split';
    index: number;
};
/**
 * When adding a view, use DistributeSizing when all pre-existing views are
 * distributed evenly, otherwise use SplitSizing.
 */
export type AutoSizing = {
    type: 'auto';
    index: number;
};
/**
 * When adding or removing views, assume the view is invisible.
 */
export type InvisibleSizing = {
    type: 'invisible';
    cachedVisibleSize: number;
};
/**
 * When adding or removing views, the sizing provides fine grained
 * control over how other views get resized.
 */
export type Sizing = DistributeSizing | SplitSizing | AutoSizing | InvisibleSizing;
export declare namespace Sizing {
    /**
     * When adding or removing views, distribute the delta space among
     * all other views.
     */
    const Distribute: DistributeSizing;
    /**
     * When adding or removing views, split the delta space with another
     * specific view, indexed by the provided `index`.
     */
    function Split(index: number): SplitSizing;
    /**
     * When adding a view, use DistributeSizing when all pre-existing views are
     * distributed evenly, otherwise use SplitSizing.
     */
    function Auto(index: number): AutoSizing;
    /**
     * When adding or removing views, assume the view is invisible.
     */
    function Invisible(cachedVisibleSize: number): InvisibleSizing;
}
/**
 * The {@link SplitView} is the UI component which implements a one dimensional
 * flex-like layout algorithm for a collection of {@link IView} instances, which
 * are essentially HTMLElement instances with the following size constraints:
 *
 * - {@link IView.minimumSize}
 * - {@link IView.maximumSize}
 * - {@link IView.priority}
 * - {@link IView.snap}
 *
 * In case the SplitView doesn't have enough size to fit all views, it will overflow
 * its content with a scrollbar.
 *
 * In between each pair of views there will be a {@link Sash} allowing the user
 * to resize the views, making sure the constraints are respected.
 *
 * An optional {@link TLayoutContext layout context type} may be used in order to
 * pass along layout contextual data from the {@link SplitView.layout} method down
 * to each view's {@link IView.layout} calls.
 *
 * Features:
 * - Flex-like layout algorithm
 * - Snap support
 * - Orthogonal sash support, for corner sashes
 * - View hide/show support
 * - View swap/move support
 * - Alt key modifier behavior, macOS style
 */
export declare class SplitView<TLayoutContext = undefined, TView extends IView<TLayoutContext> = IView<TLayoutContext>> extends Disposable {
    /**
     * This {@link SplitView}'s orientation.
     */
    readonly orientation: Orientation;
    /**
     * The DOM element representing this {@link SplitView}.
     */
    readonly el: HTMLElement;
    private sashContainer;
    private viewContainer;
    private scrollable;
    private scrollableElement;
    private size;
    private layoutContext;
    private _contentSize;
    private proportions;
    private viewItems;
    sashItems: ISashItem[];
    private sashDragState;
    private state;
    private inverseAltBehavior;
    private proportionalLayout;
    private readonly getSashOrthogonalSize;
    private _onDidSashChange;
    private _onDidSashReset;
    private _orthogonalStartSash;
    private _orthogonalEndSash;
    private _startSnappingEnabled;
    private _endSnappingEnabled;
    /**
     * The sum of all views' sizes.
     */
    get contentSize(): number;
    /**
     * Fires whenever the user resizes a {@link Sash sash}.
     */
    readonly onDidSashChange: Event<number>;
    /**
     * Fires whenever the user double clicks a {@link Sash sash}.
     */
    readonly onDidSashReset: Event<number>;
    /**
     * Fires whenever the split view is scrolled.
     */
    readonly onDidScroll: Event<ScrollEvent>;
    /**
     * The amount of views in this {@link SplitView}.
     */
    get length(): number;
    /**
     * The minimum size of this {@link SplitView}.
     */
    get minimumSize(): number;
    /**
     * The maximum size of this {@link SplitView}.
     */
    get maximumSize(): number;
    get orthogonalStartSash(): Sash | undefined;
    get orthogonalEndSash(): Sash | undefined;
    get startSnappingEnabled(): boolean;
    get endSnappingEnabled(): boolean;
    /**
     * A reference to a sash, perpendicular to all sashes in this {@link SplitView},
     * located at the left- or top-most side of the SplitView.
     * Corner sashes will be created automatically at the intersections.
     */
    set orthogonalStartSash(sash: Sash | undefined);
    /**
     * A reference to a sash, perpendicular to all sashes in this {@link SplitView},
     * located at the right- or bottom-most side of the SplitView.
     * Corner sashes will be created automatically at the intersections.
     */
    set orthogonalEndSash(sash: Sash | undefined);
    /**
     * The internal sashes within this {@link SplitView}.
     */
    get sashes(): readonly Sash[];
    /**
     * Enable/disable snapping at the beginning of this {@link SplitView}.
     */
    set startSnappingEnabled(startSnappingEnabled: boolean);
    /**
     * Enable/disable snapping at the end of this {@link SplitView}.
     */
    set endSnappingEnabled(endSnappingEnabled: boolean);
    /**
     * Create a new {@link SplitView} instance.
     */
    constructor(container: HTMLElement, options?: ISplitViewOptions<TLayoutContext, TView>);
    style(styles: ISplitViewStyles): void;
    /**
     * Add a {@link IView view} to this {@link SplitView}.
     *
     * @param view The view to add.
     * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
     * @param index The index to insert the view on.
     * @param skipLayout Whether layout should be skipped.
     */
    addView(view: TView, size: number | Sizing, index?: number, skipLayout?: boolean): void;
    /**
     * Remove a {@link IView view} from this {@link SplitView}.
     *
     * @param index The index where the {@link IView view} is located.
     * @param sizing Whether to distribute other {@link IView view}'s sizes.
     */
    removeView(index: number, sizing?: Sizing): TView;
    removeAllViews(): TView[];
    /**
     * Move a {@link IView view} to a different index.
     *
     * @param from The source index.
     * @param to The target index.
     */
    moveView(from: number, to: number): void;
    /**
     * Swap two {@link IView views}.
     *
     * @param from The source index.
     * @param to The target index.
     */
    swapViews(from: number, to: number): void;
    /**
     * Returns whether the {@link IView view} is visible.
     *
     * @param index The {@link IView view} index.
     */
    isViewVisible(index: number): boolean;
    /**
     * Set a {@link IView view}'s visibility.
     *
     * @param index The {@link IView view} index.
     * @param visible Whether the {@link IView view} should be visible.
     */
    setViewVisible(index: number, visible: boolean): void;
    /**
     * Returns the {@link IView view}'s size previously to being hidden.
     *
     * @param index The {@link IView view} index.
     */
    getViewCachedVisibleSize(index: number): number | undefined;
    /**
     * Layout the {@link SplitView}.
     *
     * @param size The entire size of the {@link SplitView}.
     * @param layoutContext An optional layout context to pass along to {@link IView views}.
     */
    layout(size: number, layoutContext?: TLayoutContext): void;
    private saveProportions;
    private onSashStart;
    private onSashChange;
    private onSashEnd;
    private onViewChange;
    /**
     * Resize a {@link IView view} within the {@link SplitView}.
     *
     * @param index The {@link IView view} index.
     * @param size The {@link IView view} size.
     */
    resizeView(index: number, size: number): void;
    /**
     * Returns whether all other {@link IView views} are at their minimum size.
     */
    isViewExpanded(index: number): boolean;
    /**
     * Distribute the entire {@link SplitView} size among all {@link IView views}.
     */
    distributeViewSizes(): void;
    /**
     * Returns the size of a {@link IView view}.
     */
    getViewSize(index: number): number;
    private doAddView;
    private relayout;
    private resize;
    private distributeEmptySpace;
    private layoutViews;
    private updateScrollableElement;
    private updateSashEnablement;
    private getSashPosition;
    private findFirstSnapIndex;
    private areViewsDistributed;
    dispose(): void;
}
