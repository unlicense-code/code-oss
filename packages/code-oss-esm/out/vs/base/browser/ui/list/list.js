/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var ListDragOverEffectType;
(function (ListDragOverEffectType) {
    ListDragOverEffectType[ListDragOverEffectType["Copy"] = 0] = "Copy";
    ListDragOverEffectType[ListDragOverEffectType["Move"] = 1] = "Move";
})(ListDragOverEffectType || (ListDragOverEffectType = {}));
export var ListDragOverEffectPosition;
(function (ListDragOverEffectPosition) {
    ListDragOverEffectPosition["Over"] = "drop-target";
    ListDragOverEffectPosition["Before"] = "drop-target-before";
    ListDragOverEffectPosition["After"] = "drop-target-after";
})(ListDragOverEffectPosition || (ListDragOverEffectPosition = {}));
export const ListDragOverReactions = {
    reject() { return { accept: false }; },
    accept() { return { accept: true }; },
};
export class ListError extends Error {
    constructor(user, message) {
        super(`ListError [${user}] ${message}`);
    }
}
export class CachedListVirtualDelegate {
    constructor() {
        this.cache = new WeakMap();
    }
    getHeight(element) {
        return this.cache.get(element) ?? this.estimateHeight(element);
    }
    setDynamicHeight(element, height) {
        if (height > 0) {
            this.cache.set(element, height);
        }
    }
}
