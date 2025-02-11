import { FastDomNode } from '../../fastDomNode.js';
import { Disposable } from '../../../common/lifecycle.js';
import { ScrollbarVisibility } from '../../../common/scrollable.js';
export declare class ScrollbarVisibilityController extends Disposable {
    private _visibility;
    private _visibleClassName;
    private _invisibleClassName;
    private _domNode;
    private _rawShouldBeVisible;
    private _shouldBeVisible;
    private _isNeeded;
    private _isVisible;
    private _revealTimer;
    constructor(visibility: ScrollbarVisibility, visibleClassName: string, invisibleClassName: string);
    setVisibility(visibility: ScrollbarVisibility): void;
    setShouldBeVisible(rawShouldBeVisible: boolean): void;
    private _applyVisibilitySetting;
    private _updateShouldBeVisible;
    setIsNeeded(isNeeded: boolean): void;
    setDomNode(domNode: FastDomNode<HTMLElement>): void;
    ensureVisibility(): void;
    private _reveal;
    private _hide;
}
