import { IIdentityProvider, IKeyboardNavigationLabelProvider, IListVirtualDelegate } from '../list/list.js';
import { AbstractTree, IAbstractTreeOptions, IAbstractTreeOptionsUpdate } from './abstractTree.js';
import { CompressibleObjectTreeModel, ElementMapper, ICompressedTreeElement, ICompressedTreeNode } from './compressedObjectTreeModel.js';
import { IObjectTreeModel } from './objectTreeModel.js';
import { ICollapseStateChangeEvent, IObjectTreeElement, ITreeModel, ITreeNode, ITreeRenderer, ITreeSorter } from './tree.js';
import { Event } from '../../../common/event.js';
export interface IObjectTreeOptions<T, TFilterData = void> extends IAbstractTreeOptions<T, TFilterData> {
    readonly sorter?: ITreeSorter<T>;
}
export interface IObjectTreeSetChildrenOptions<T> {
    /**
     * If set, child updates will recurse the given number of levels even if
     * items in the splice operation are unchanged. `Infinity` is a valid value.
     */
    readonly diffDepth?: number;
    /**
     * Identity provider used to optimize splice() calls in the IndexTree. If
     * this is not present, optimized splicing is not enabled.
     *
     * Warning: if this is present, calls to `setChildren()` will not replace
     * or update nodes if their identity is the same, even if the elements are
     * different. For this, you should call `rerender()`.
     */
    readonly diffIdentityProvider?: IIdentityProvider<T>;
}
export declare class ObjectTree<T extends NonNullable<any>, TFilterData = void> extends AbstractTree<T | null, TFilterData, T | null> {
    protected readonly user: string;
    protected model: IObjectTreeModel<T, TFilterData>;
    get onDidChangeCollapseState(): Event<ICollapseStateChangeEvent<T | null, TFilterData>>;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], options?: IObjectTreeOptions<T, TFilterData>);
    setChildren(element: T | null, children?: Iterable<IObjectTreeElement<T>>, options?: IObjectTreeSetChildrenOptions<T>): void;
    rerender(element?: T): void;
    updateElementHeight(element: T, height: number | undefined): void;
    resort(element: T | null, recursive?: boolean): void;
    hasElement(element: T): boolean;
    protected createModel(user: string, options: IObjectTreeOptions<T, TFilterData>): ITreeModel<T | null, TFilterData, T | null>;
}
interface ICompressedTreeNodeProvider<T, TFilterData> {
    getCompressedTreeNode(location: T | null): ITreeNode<ICompressedTreeNode<T> | null, TFilterData>;
}
export interface ICompressibleTreeRenderer<T, TFilterData = void, TTemplateData = void> extends ITreeRenderer<T, TFilterData, TTemplateData> {
    renderCompressedElements(node: ITreeNode<ICompressedTreeNode<T>, TFilterData>, index: number, templateData: TTemplateData, height: number | undefined): void;
    disposeCompressedElements?(node: ITreeNode<ICompressedTreeNode<T>, TFilterData>, index: number, templateData: TTemplateData, height: number | undefined): void;
}
export interface ICompressibleKeyboardNavigationLabelProvider<T> extends IKeyboardNavigationLabelProvider<T> {
    getCompressedNodeKeyboardNavigationLabel(elements: T[]): {
        toString(): string | undefined;
    } | undefined;
}
export interface ICompressibleObjectTreeOptions<T, TFilterData = void> extends IObjectTreeOptions<T, TFilterData> {
    readonly compressionEnabled?: boolean;
    readonly elementMapper?: ElementMapper<T>;
    readonly keyboardNavigationLabelProvider?: ICompressibleKeyboardNavigationLabelProvider<T>;
}
export interface ICompressibleObjectTreeOptionsUpdate extends IAbstractTreeOptionsUpdate {
    readonly compressionEnabled?: boolean;
}
export declare class CompressibleObjectTree<T extends NonNullable<any>, TFilterData = void> extends ObjectTree<T, TFilterData> implements ICompressedTreeNodeProvider<T, TFilterData> {
    protected model: CompressibleObjectTreeModel<T, TFilterData>;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ICompressibleTreeRenderer<T, TFilterData, any>[], options?: ICompressibleObjectTreeOptions<T, TFilterData>);
    setChildren(element: T | null, children?: Iterable<ICompressedTreeElement<T>>, options?: IObjectTreeSetChildrenOptions<T>): void;
    protected createModel(user: string, options: ICompressibleObjectTreeOptions<T, TFilterData>): ITreeModel<T | null, TFilterData, T | null>;
    updateOptions(optionsUpdate?: ICompressibleObjectTreeOptionsUpdate): void;
    getCompressedTreeNode(element?: T | null): ITreeNode<ICompressedTreeNode<T> | null, TFilterData>;
}
export {};
