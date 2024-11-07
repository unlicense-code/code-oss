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
import { Emitter } from '../../../../base/common/event.js';
import { debounce, throttle } from '../../../../base/common/decorators.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { MergedEnvironmentVariableCollection } from '../../../../platform/terminal/common/environmentVariableCollection.js';
import { deserializeEnvironmentDescriptionMap, deserializeEnvironmentVariableCollection, serializeEnvironmentDescriptionMap, serializeEnvironmentVariableCollection } from '../../../../platform/terminal/common/environmentVariableShared.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
/**
 * Tracks and persists environment variable collections as defined by extensions.
 */
let EnvironmentVariableService = class EnvironmentVariableService extends Disposable {
    get onDidChangeCollections() { return this._onDidChangeCollections.event; }
    constructor(_extensionService, _storageService) {
        super();
        this._extensionService = _extensionService;
        this._storageService = _storageService;
        this.collections = new Map();
        this._onDidChangeCollections = this._register(new Emitter());
        this._storageService.remove("terminal.integrated.environmentVariableCollections" /* TerminalStorageKeys.DeprecatedEnvironmentVariableCollections */, 1 /* StorageScope.WORKSPACE */);
        const serializedPersistedCollections = this._storageService.get("terminal.integrated.environmentVariableCollectionsV2" /* TerminalStorageKeys.EnvironmentVariableCollections */, 1 /* StorageScope.WORKSPACE */);
        if (serializedPersistedCollections) {
            const collectionsJson = JSON.parse(serializedPersistedCollections);
            collectionsJson.forEach(c => this.collections.set(c.extensionIdentifier, {
                persistent: true,
                map: deserializeEnvironmentVariableCollection(c.collection),
                descriptionMap: deserializeEnvironmentDescriptionMap(c.description)
            }));
            // Asynchronously invalidate collections where extensions have been uninstalled, this is
            // async to avoid making all functions on the service synchronous and because extensions
            // being uninstalled is rare.
            this._invalidateExtensionCollections();
        }
        this.mergedCollection = this._resolveMergedCollection();
        // Listen for uninstalled/disabled extensions
        this._register(this._extensionService.onDidChangeExtensions(() => this._invalidateExtensionCollections()));
    }
    set(extensionIdentifier, collection) {
        this.collections.set(extensionIdentifier, collection);
        this._updateCollections();
    }
    delete(extensionIdentifier) {
        this.collections.delete(extensionIdentifier);
        this._updateCollections();
    }
    _updateCollections() {
        this._persistCollectionsEventually();
        this.mergedCollection = this._resolveMergedCollection();
        this._notifyCollectionUpdatesEventually();
    }
    _persistCollectionsEventually() {
        this._persistCollections();
    }
    _persistCollections() {
        const collectionsJson = [];
        this.collections.forEach((collection, extensionIdentifier) => {
            if (collection.persistent) {
                collectionsJson.push({
                    extensionIdentifier,
                    collection: serializeEnvironmentVariableCollection(this.collections.get(extensionIdentifier).map),
                    description: serializeEnvironmentDescriptionMap(collection.descriptionMap)
                });
            }
        });
        const stringifiedJson = JSON.stringify(collectionsJson);
        this._storageService.store("terminal.integrated.environmentVariableCollectionsV2" /* TerminalStorageKeys.EnvironmentVariableCollections */, stringifiedJson, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
    }
    _notifyCollectionUpdatesEventually() {
        this._notifyCollectionUpdates();
    }
    _notifyCollectionUpdates() {
        this._onDidChangeCollections.fire(this.mergedCollection);
    }
    _resolveMergedCollection() {
        return new MergedEnvironmentVariableCollection(this.collections);
    }
    async _invalidateExtensionCollections() {
        await this._extensionService.whenInstalledExtensionsRegistered();
        const registeredExtensions = this._extensionService.extensions;
        let changes = false;
        this.collections.forEach((_, extensionIdentifier) => {
            const isExtensionRegistered = registeredExtensions.some(r => r.identifier.value === extensionIdentifier);
            if (!isExtensionRegistered) {
                this.collections.delete(extensionIdentifier);
                changes = true;
            }
        });
        if (changes) {
            this._updateCollections();
        }
    }
};
__decorate([
    throttle(1000)
], EnvironmentVariableService.prototype, "_persistCollectionsEventually", null);
__decorate([
    debounce(1000)
], EnvironmentVariableService.prototype, "_notifyCollectionUpdatesEventually", null);
EnvironmentVariableService = __decorate([
    __param(0, IExtensionService),
    __param(1, IStorageService)
], EnvironmentVariableService);
export { EnvironmentVariableService };
