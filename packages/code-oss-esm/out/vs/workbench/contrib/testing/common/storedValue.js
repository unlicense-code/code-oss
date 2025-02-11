/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
const defaultSerialization = {
    deserialize: d => JSON.parse(d),
    serialize: d => JSON.stringify(d),
};
/**
 * todo@connor4312: is this worthy to be in common?
 */
let StoredValue = class StoredValue extends Disposable {
    constructor(options, storage) {
        super();
        this.storage = storage;
        this.key = options.key;
        this.scope = options.scope;
        this.target = options.target;
        this.serialization = options.serialization ?? defaultSerialization;
        this.onDidChange = this.storage.onDidChangeValue(this.scope, this.key, this._store);
    }
    get(defaultValue) {
        if (this.value === undefined) {
            const value = this.storage.get(this.key, this.scope);
            this.value = value === undefined ? defaultValue : this.serialization.deserialize(value);
        }
        return this.value;
    }
    /**
     * Persists changes to the value.
     * @param value
     */
    store(value) {
        this.value = value;
        this.storage.store(this.key, this.serialization.serialize(value), this.scope, this.target);
    }
    /**
     * Delete an element stored under the provided key from storage.
     */
    delete() {
        this.storage.remove(this.key, this.scope);
    }
};
StoredValue = __decorate([
    __param(1, IStorageService)
], StoredValue);
export { StoredValue };
