/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { deepClone, equals } from '../../../base/common/objects.js';
import * as semver from '../../../base/common/semver/semver.js';
import { assertIsDefined } from '../../../base/common/types.js';
export function merge(localExtensions, remoteExtensions, lastSyncExtensions, skippedExtensions, ignoredExtensions, lastSyncBuiltinExtensions) {
    const added = [];
    const removed = [];
    const updated = [];
    if (!remoteExtensions) {
        const remote = localExtensions.filter(({ identifier }) => ignoredExtensions.every(id => id.toLowerCase() !== identifier.id.toLowerCase()));
        return {
            local: {
                added,
                removed,
                updated,
            },
            remote: remote.length > 0 ? {
                added: remote,
                updated: [],
                removed: [],
                all: remote
            } : null
        };
    }
    localExtensions = localExtensions.map(massageIncomingExtension);
    remoteExtensions = remoteExtensions.map(massageIncomingExtension);
    lastSyncExtensions = lastSyncExtensions ? lastSyncExtensions.map(massageIncomingExtension) : null;
    const uuids = new Map();
    const addUUID = (identifier) => { if (identifier.uuid) {
        uuids.set(identifier.id.toLowerCase(), identifier.uuid);
    } };
    localExtensions.forEach(({ identifier }) => addUUID(identifier));
    remoteExtensions.forEach(({ identifier }) => addUUID(identifier));
    lastSyncExtensions?.forEach(({ identifier }) => addUUID(identifier));
    skippedExtensions?.forEach(({ identifier }) => addUUID(identifier));
    lastSyncBuiltinExtensions?.forEach(identifier => addUUID(identifier));
    const getKey = (extension) => {
        const uuid = extension.identifier.uuid || uuids.get(extension.identifier.id.toLowerCase());
        return uuid ? `uuid:${uuid}` : `id:${extension.identifier.id.toLowerCase()}`;
    };
    const addExtensionToMap = (map, extension) => {
        map.set(getKey(extension), extension);
        return map;
    };
    const localExtensionsMap = localExtensions.reduce(addExtensionToMap, new Map());
    const remoteExtensionsMap = remoteExtensions.reduce(addExtensionToMap, new Map());
    const newRemoteExtensionsMap = remoteExtensions.reduce((map, extension) => addExtensionToMap(map, deepClone(extension)), new Map());
    const lastSyncExtensionsMap = lastSyncExtensions ? lastSyncExtensions.reduce(addExtensionToMap, new Map()) : null;
    const skippedExtensionsMap = skippedExtensions.reduce(addExtensionToMap, new Map());
    const ignoredExtensionsSet = ignoredExtensions.reduce((set, id) => {
        const uuid = uuids.get(id.toLowerCase());
        return set.add(uuid ? `uuid:${uuid}` : `id:${id.toLowerCase()}`);
    }, new Set());
    const lastSyncBuiltinExtensionsSet = lastSyncBuiltinExtensions ? lastSyncBuiltinExtensions.reduce((set, { id, uuid }) => {
        uuid = uuid ?? uuids.get(id.toLowerCase());
        return set.add(uuid ? `uuid:${uuid}` : `id:${id.toLowerCase()}`);
    }, new Set()) : null;
    const localToRemote = compare(localExtensionsMap, remoteExtensionsMap, ignoredExtensionsSet, false);
    if (localToRemote.added.size > 0 || localToRemote.removed.size > 0 || localToRemote.updated.size > 0) {
        const baseToLocal = compare(lastSyncExtensionsMap, localExtensionsMap, ignoredExtensionsSet, false);
        const baseToRemote = compare(lastSyncExtensionsMap, remoteExtensionsMap, ignoredExtensionsSet, true);
        const merge = (key, localExtension, remoteExtension, preferred) => {
            let pinned, version, preRelease;
            if (localExtension.installed) {
                pinned = preferred.pinned;
                preRelease = preferred.preRelease;
                if (pinned) {
                    version = preferred.version;
                }
            }
            else {
                pinned = remoteExtension.pinned;
                preRelease = remoteExtension.preRelease;
                if (pinned) {
                    version = remoteExtension.version;
                }
            }
            if (pinned === undefined /* from older client*/) {
                pinned = localExtension.pinned;
                if (pinned) {
                    version = localExtension.version;
                }
            }
            if (preRelease === undefined /* from older client*/) {
                preRelease = localExtension.preRelease;
            }
            return {
                ...preferred,
                installed: localExtension.installed || remoteExtension.installed,
                pinned,
                preRelease,
                version: version ?? (remoteExtension.version && (!localExtension.installed || semver.gt(remoteExtension.version, localExtension.version)) ? remoteExtension.version : localExtension.version),
                state: mergeExtensionState(localExtension, remoteExtension, lastSyncExtensionsMap?.get(key)),
            };
        };
        // Remotely removed extension => exist in base and does not in remote
        for (const key of baseToRemote.removed.values()) {
            const localExtension = localExtensionsMap.get(key);
            if (!localExtension) {
                continue;
            }
            const baseExtension = assertIsDefined(lastSyncExtensionsMap?.get(key));
            const wasAnInstalledExtensionDuringLastSync = lastSyncBuiltinExtensionsSet && !lastSyncBuiltinExtensionsSet.has(key) && baseExtension.installed;
            if (localExtension.installed && wasAnInstalledExtensionDuringLastSync /* It is an installed extension now and during last sync */) {
                // Installed extension is removed from remote. Remove it from local.
                removed.push(localExtension.identifier);
            }
            else {
                // Add to remote: It is a builtin extenision or got installed after last sync
                newRemoteExtensionsMap.set(key, localExtension);
            }
        }
        // Remotely added extension => does not exist in base and exist in remote
        for (const key of baseToRemote.added.values()) {
            const remoteExtension = assertIsDefined(remoteExtensionsMap.get(key));
            const localExtension = localExtensionsMap.get(key);
            // Also exist in local
            if (localExtension) {
                // Is different from local to remote
                if (localToRemote.updated.has(key)) {
                    const mergedExtension = merge(key, localExtension, remoteExtension, remoteExtension);
                    // Update locally only when the extension has changes in properties other than installed poperty
                    if (!areSame(localExtension, remoteExtension, false, false)) {
                        updated.push(massageOutgoingExtension(mergedExtension, key));
                    }
                    newRemoteExtensionsMap.set(key, mergedExtension);
                }
            }
            else {
                // Add only if the extension is an installed extension
                if (remoteExtension.installed) {
                    added.push(massageOutgoingExtension(remoteExtension, key));
                }
            }
        }
        // Remotely updated extension => exist in base and remote
        for (const key of baseToRemote.updated.values()) {
            const remoteExtension = assertIsDefined(remoteExtensionsMap.get(key));
            const baseExtension = assertIsDefined(lastSyncExtensionsMap?.get(key));
            const localExtension = localExtensionsMap.get(key);
            // Also exist in local
            if (localExtension) {
                const wasAnInstalledExtensionDuringLastSync = lastSyncBuiltinExtensionsSet && !lastSyncBuiltinExtensionsSet.has(key) && baseExtension.installed;
                if (wasAnInstalledExtensionDuringLastSync && localExtension.installed && !remoteExtension.installed) {
                    // Remove it locally if it is installed locally and not remotely
                    removed.push(localExtension.identifier);
                }
                else {
                    // Update in local always
                    const mergedExtension = merge(key, localExtension, remoteExtension, remoteExtension);
                    updated.push(massageOutgoingExtension(mergedExtension, key));
                    newRemoteExtensionsMap.set(key, mergedExtension);
                }
            }
            // Add it locally if does not exist locally and installed remotely
            else if (remoteExtension.installed) {
                added.push(massageOutgoingExtension(remoteExtension, key));
            }
        }
        // Locally added extension => does not exist in base and exist in local
        for (const key of baseToLocal.added.values()) {
            // If added in remote (already handled)
            if (baseToRemote.added.has(key)) {
                continue;
            }
            newRemoteExtensionsMap.set(key, assertIsDefined(localExtensionsMap.get(key)));
        }
        // Locally updated extension => exist in base and local
        for (const key of baseToLocal.updated.values()) {
            // If removed in remote (already handled)
            if (baseToRemote.removed.has(key)) {
                continue;
            }
            // If updated in remote (already handled)
            if (baseToRemote.updated.has(key)) {
                continue;
            }
            const localExtension = assertIsDefined(localExtensionsMap.get(key));
            const remoteExtension = assertIsDefined(remoteExtensionsMap.get(key));
            // Update remotely
            newRemoteExtensionsMap.set(key, merge(key, localExtension, remoteExtension, localExtension));
        }
        // Locally removed extensions => exist in base and does not exist in local
        for (const key of baseToLocal.removed.values()) {
            // If updated in remote (already handled)
            if (baseToRemote.updated.has(key)) {
                continue;
            }
            // If removed in remote (already handled)
            if (baseToRemote.removed.has(key)) {
                continue;
            }
            // Skipped
            if (skippedExtensionsMap.has(key)) {
                continue;
            }
            // Skip if it is a builtin extension
            if (!assertIsDefined(remoteExtensionsMap.get(key)).installed) {
                continue;
            }
            // Skip if last sync builtin extensions set is not available
            if (!lastSyncBuiltinExtensionsSet) {
                continue;
            }
            // Skip if it was a builtin extension during last sync
            if (lastSyncBuiltinExtensionsSet.has(key) || !assertIsDefined(lastSyncExtensionsMap?.get(key)).installed) {
                continue;
            }
            newRemoteExtensionsMap.delete(key);
        }
    }
    const remote = [];
    const remoteChanges = compare(remoteExtensionsMap, newRemoteExtensionsMap, new Set(), true);
    const hasRemoteChanges = remoteChanges.added.size > 0 || remoteChanges.updated.size > 0 || remoteChanges.removed.size > 0;
    if (hasRemoteChanges) {
        newRemoteExtensionsMap.forEach((value, key) => remote.push(massageOutgoingExtension(value, key)));
    }
    return {
        local: { added, removed, updated },
        remote: hasRemoteChanges ? {
            added: [...remoteChanges.added].map(id => newRemoteExtensionsMap.get(id)),
            updated: [...remoteChanges.updated].map(id => newRemoteExtensionsMap.get(id)),
            removed: [...remoteChanges.removed].map(id => remoteExtensionsMap.get(id)),
            all: remote
        } : null
    };
}
function compare(from, to, ignoredExtensions, checkVersionProperty) {
    const fromKeys = from ? [...from.keys()].filter(key => !ignoredExtensions.has(key)) : [];
    const toKeys = [...to.keys()].filter(key => !ignoredExtensions.has(key));
    const added = toKeys.filter(key => !fromKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const removed = fromKeys.filter(key => !toKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const updated = new Set();
    for (const key of fromKeys) {
        if (removed.has(key)) {
            continue;
        }
        const fromExtension = from.get(key);
        const toExtension = to.get(key);
        if (!toExtension || !areSame(fromExtension, toExtension, checkVersionProperty, true)) {
            updated.add(key);
        }
    }
    return { added, removed, updated };
}
function areSame(fromExtension, toExtension, checkVersionProperty, checkInstalledProperty) {
    if (fromExtension.disabled !== toExtension.disabled) {
        /* extension enablement changed */
        return false;
    }
    if (!!fromExtension.isApplicationScoped !== !!toExtension.isApplicationScoped) {
        /* extension application scope has changed */
        return false;
    }
    if (checkInstalledProperty && fromExtension.installed !== toExtension.installed) {
        /* extension installed property changed */
        return false;
    }
    if (fromExtension.installed && toExtension.installed) {
        if (fromExtension.preRelease !== toExtension.preRelease) {
            /* installed extension's pre-release version changed */
            return false;
        }
        if (fromExtension.pinned !== toExtension.pinned) {
            /* installed extension's pinning changed */
            return false;
        }
        if (toExtension.pinned && fromExtension.version !== toExtension.version) {
            /* installed extension's pinned version changed */
            return false;
        }
    }
    if (!isSameExtensionState(fromExtension.state, toExtension.state)) {
        /* extension state changed */
        return false;
    }
    if ((checkVersionProperty && fromExtension.version !== toExtension.version)) {
        /* extension version changed */
        return false;
    }
    return true;
}
function mergeExtensionState(localExtension, remoteExtension, lastSyncExtension) {
    const localState = localExtension.state;
    const remoteState = remoteExtension.state;
    const baseState = lastSyncExtension?.state;
    // If remote extension has no version, use local state
    if (!remoteExtension.version) {
        return localState;
    }
    // If local state exists and local extension is latest then use local state
    if (localState && semver.gt(localExtension.version, remoteExtension.version)) {
        return localState;
    }
    // If remote state exists and remote extension is latest, use remote state
    if (remoteState && semver.gt(remoteExtension.version, localExtension.version)) {
        return remoteState;
    }
    /* Remote and local are on same version */
    // If local state is not yet set, use remote state
    if (!localState) {
        return remoteState;
    }
    // If remote state is not yet set, use local state
    if (!remoteState) {
        return localState;
    }
    const mergedState = deepClone(localState);
    const baseToRemote = baseState ? compareExtensionState(baseState, remoteState) : { added: Object.keys(remoteState).reduce((r, k) => { r.add(k); return r; }, new Set()), removed: new Set(), updated: new Set() };
    const baseToLocal = baseState ? compareExtensionState(baseState, localState) : { added: Object.keys(localState).reduce((r, k) => { r.add(k); return r; }, new Set()), removed: new Set(), updated: new Set() };
    // Added/Updated in remote
    for (const key of [...baseToRemote.added.values(), ...baseToRemote.updated.values()]) {
        mergedState[key] = remoteState[key];
    }
    // Removed in remote
    for (const key of baseToRemote.removed.values()) {
        // Not updated in local
        if (!baseToLocal.updated.has(key)) {
            delete mergedState[key];
        }
    }
    return mergedState;
}
function compareExtensionState(from, to) {
    const fromKeys = Object.keys(from);
    const toKeys = Object.keys(to);
    const added = toKeys.filter(key => !fromKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const removed = fromKeys.filter(key => !toKeys.includes(key)).reduce((r, key) => { r.add(key); return r; }, new Set());
    const updated = new Set();
    for (const key of fromKeys) {
        if (removed.has(key)) {
            continue;
        }
        const value1 = from[key];
        const value2 = to[key];
        if (!equals(value1, value2)) {
            updated.add(key);
        }
    }
    return { added, removed, updated };
}
function isSameExtensionState(a = {}, b = {}) {
    const { added, removed, updated } = compareExtensionState(a, b);
    return added.size === 0 && removed.size === 0 && updated.size === 0;
}
// massage incoming extension - add optional properties
function massageIncomingExtension(extension) {
    return { ...extension, ...{ disabled: !!extension.disabled, installed: !!extension.installed } };
}
// massage outgoing extension - remove optional properties
function massageOutgoingExtension(extension, key) {
    const massagedExtension = {
        ...extension,
        identifier: {
            id: extension.identifier.id,
            uuid: key.startsWith('uuid:') ? key.substring('uuid:'.length) : undefined
        },
        /* set following always so that to differentiate with older clients */
        preRelease: !!extension.preRelease,
        pinned: !!extension.pinned,
    };
    if (!extension.disabled) {
        delete massagedExtension.disabled;
    }
    if (!extension.installed) {
        delete massagedExtension.installed;
    }
    if (!extension.state) {
        delete massagedExtension.state;
    }
    if (!extension.isApplicationScoped) {
        delete massagedExtension.isApplicationScoped;
    }
    return massagedExtension;
}
