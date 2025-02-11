/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import assert from 'assert';
import { isGridBranchNode } from '../../../../browser/ui/grid/gridview.js';
import { Emitter } from '../../../../common/event.js';
export class TestView {
    get minimumWidth() { return this._minimumWidth; }
    set minimumWidth(size) { this._minimumWidth = size; this._onDidChange.fire(undefined); }
    get maximumWidth() { return this._maximumWidth; }
    set maximumWidth(size) { this._maximumWidth = size; this._onDidChange.fire(undefined); }
    get minimumHeight() { return this._minimumHeight; }
    set minimumHeight(size) { this._minimumHeight = size; this._onDidChange.fire(undefined); }
    get maximumHeight() { return this._maximumHeight; }
    set maximumHeight(size) { this._maximumHeight = size; this._onDidChange.fire(undefined); }
    get element() { this._onDidGetElement.fire(); return this._element; }
    get width() { return this._width; }
    get height() { return this._height; }
    get top() { return this._top; }
    get left() { return this._left; }
    get size() { return [this.width, this.height]; }
    constructor(_minimumWidth, _maximumWidth, _minimumHeight, _maximumHeight) {
        this._minimumWidth = _minimumWidth;
        this._maximumWidth = _maximumWidth;
        this._minimumHeight = _minimumHeight;
        this._maximumHeight = _maximumHeight;
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
        this._element = document.createElement('div');
        this._onDidGetElement = new Emitter();
        this.onDidGetElement = this._onDidGetElement.event;
        this._width = 0;
        this._height = 0;
        this._top = 0;
        this._left = 0;
        this._onDidLayout = new Emitter();
        this.onDidLayout = this._onDidLayout.event;
        this._onDidFocus = new Emitter();
        this.onDidFocus = this._onDidFocus.event;
        assert(_minimumWidth <= _maximumWidth, 'gridview view minimum width must be <= maximum width');
        assert(_minimumHeight <= _maximumHeight, 'gridview view minimum height must be <= maximum height');
    }
    layout(width, height, top, left) {
        this._width = width;
        this._height = height;
        this._top = top;
        this._left = left;
        this._onDidLayout.fire({ width, height, top, left });
    }
    focus() {
        this._onDidFocus.fire();
    }
    dispose() {
        this._onDidChange.dispose();
        this._onDidGetElement.dispose();
        this._onDidLayout.dispose();
        this._onDidFocus.dispose();
    }
}
export function nodesToArrays(node) {
    if (isGridBranchNode(node)) {
        return node.children.map(nodesToArrays);
    }
    else {
        return node.view;
    }
}
