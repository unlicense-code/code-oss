/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as strings from '../../../base/common/strings.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { getRemoteName } from '../../remote/common/remoteHosts.js';
export const USER_MANIFEST_CACHE_FILE = 'extensions.user.cache';
export const BUILTIN_MANIFEST_CACHE_FILE = 'extensions.builtin.cache';
export const UNDEFINED_PUBLISHER = 'undefined_publisher';
export const ALL_EXTENSION_KINDS = ['ui', 'workspace', 'web'];
export function getWorkspaceSupportTypeMessage(supportType) {
    if (typeof supportType === 'object' && supportType !== null) {
        if (supportType.supported !== true) {
            return supportType.description;
        }
    }
    return undefined;
}
export const EXTENSION_CATEGORIES = [
    'AI',
    'Azure',
    'Chat',
    'Data Science',
    'Debuggers',
    'Extension Packs',
    'Education',
    'Formatters',
    'Keymaps',
    'Language Packs',
    'Linters',
    'Machine Learning',
    'Notebooks',
    'Programming Languages',
    'SCM Providers',
    'Snippets',
    'Testing',
    'Themes',
    'Visualization',
    'Other',
];
export var ExtensionType;
(function (ExtensionType) {
    ExtensionType[ExtensionType["System"] = 0] = "System";
    ExtensionType[ExtensionType["User"] = 1] = "User";
})(ExtensionType || (ExtensionType = {}));
export var TargetPlatform;
(function (TargetPlatform) {
    TargetPlatform["WIN32_X64"] = "win32-x64";
    TargetPlatform["WIN32_ARM64"] = "win32-arm64";
    TargetPlatform["LINUX_X64"] = "linux-x64";
    TargetPlatform["LINUX_ARM64"] = "linux-arm64";
    TargetPlatform["LINUX_ARMHF"] = "linux-armhf";
    TargetPlatform["ALPINE_X64"] = "alpine-x64";
    TargetPlatform["ALPINE_ARM64"] = "alpine-arm64";
    TargetPlatform["DARWIN_X64"] = "darwin-x64";
    TargetPlatform["DARWIN_ARM64"] = "darwin-arm64";
    TargetPlatform["WEB"] = "web";
    TargetPlatform["UNIVERSAL"] = "universal";
    TargetPlatform["UNKNOWN"] = "unknown";
    TargetPlatform["UNDEFINED"] = "undefined";
})(TargetPlatform || (TargetPlatform = {}));
/**
 * **!Do not construct directly!**
 *
 * **!Only static methods because it gets serialized!**
 *
 * This represents the "canonical" version for an extension identifier. Extension ids
 * have to be case-insensitive (due to the marketplace), but we must ensure case
 * preservation because the extension API is already public at this time.
 *
 * For example, given an extension with the publisher `"Hello"` and the name `"World"`,
 * its canonical extension identifier is `"Hello.World"`. This extension could be
 * referenced in some other extension's dependencies using the string `"hello.world"`.
 *
 * To make matters more complicated, an extension can optionally have an UUID. When two
 * extensions have the same UUID, they are considered equal even if their identifier is different.
 */
export class ExtensionIdentifier {
    constructor(value) {
        this.value = value;
        this._lower = value.toLowerCase();
    }
    static equals(a, b) {
        if (typeof a === 'undefined' || a === null) {
            return (typeof b === 'undefined' || b === null);
        }
        if (typeof b === 'undefined' || b === null) {
            return false;
        }
        if (typeof a === 'string' || typeof b === 'string') {
            // At least one of the arguments is an extension id in string form,
            // so we have to use the string comparison which ignores case.
            const aValue = (typeof a === 'string' ? a : a.value);
            const bValue = (typeof b === 'string' ? b : b.value);
            return strings.equalsIgnoreCase(aValue, bValue);
        }
        // Now we know both arguments are ExtensionIdentifier
        return (a._lower === b._lower);
    }
    /**
     * Gives the value by which to index (for equality).
     */
    static toKey(id) {
        if (typeof id === 'string') {
            return id.toLowerCase();
        }
        return id._lower;
    }
}
export class ExtensionIdentifierSet {
    get size() {
        return this._set.size;
    }
    constructor(iterable) {
        this._set = new Set();
        if (iterable) {
            for (const value of iterable) {
                this.add(value);
            }
        }
    }
    add(id) {
        this._set.add(ExtensionIdentifier.toKey(id));
    }
    delete(extensionId) {
        return this._set.delete(ExtensionIdentifier.toKey(extensionId));
    }
    has(id) {
        return this._set.has(ExtensionIdentifier.toKey(id));
    }
}
export class ExtensionIdentifierMap {
    constructor() {
        this._map = new Map();
    }
    clear() {
        this._map.clear();
    }
    delete(id) {
        this._map.delete(ExtensionIdentifier.toKey(id));
    }
    get(id) {
        return this._map.get(ExtensionIdentifier.toKey(id));
    }
    has(id) {
        return this._map.has(ExtensionIdentifier.toKey(id));
    }
    set(id, value) {
        this._map.set(ExtensionIdentifier.toKey(id), value);
    }
    values() {
        return this._map.values();
    }
    forEach(callbackfn) {
        this._map.forEach(callbackfn);
    }
    [Symbol.iterator]() {
        return this._map[Symbol.iterator]();
    }
}
export function isApplicationScopedExtension(manifest) {
    return isLanguagePackExtension(manifest);
}
export function isLanguagePackExtension(manifest) {
    return manifest.contributes && manifest.contributes.localizations ? manifest.contributes.localizations.length > 0 : false;
}
export function isAuthenticationProviderExtension(manifest) {
    return manifest.contributes && manifest.contributes.authentication ? manifest.contributes.authentication.length > 0 : false;
}
export function isResolverExtension(manifest, remoteAuthority) {
    if (remoteAuthority) {
        const activationEvent = `onResolveRemoteAuthority:${getRemoteName(remoteAuthority)}`;
        return !!manifest.activationEvents?.includes(activationEvent);
    }
    return false;
}
export function parseApiProposals(enabledApiProposals) {
    return enabledApiProposals.map(proposal => {
        const [proposalName, version] = proposal.split('@');
        return { proposalName, version: version ? parseInt(version) : undefined };
    });
}
export function parseEnabledApiProposalNames(enabledApiProposals) {
    return enabledApiProposals.map(proposal => proposal.split('@')[0]);
}
export const IBuiltinExtensionsScannerService = createDecorator('IBuiltinExtensionsScannerService');
