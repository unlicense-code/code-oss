/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../../../../base/common/event.js';
import { localize } from '../../../../nls.js';
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
export const IBreadcrumbsService = createDecorator('IEditorBreadcrumbsService');
export class BreadcrumbsService {
    constructor() {
        this._map = new Map();
    }
    register(group, widget) {
        if (this._map.has(group)) {
            throw new Error(`group (${group}) has already a widget`);
        }
        this._map.set(group, widget);
        return {
            dispose: () => this._map.delete(group)
        };
    }
    getWidget(group) {
        return this._map.get(group);
    }
}
registerSingleton(IBreadcrumbsService, BreadcrumbsService, 1 /* InstantiationType.Delayed */);
//#region config
export class BreadcrumbsConfig {
    constructor() {
        // internal
    }
    static { this.IsEnabled = BreadcrumbsConfig._stub('breadcrumbs.enabled'); }
    static { this.UseQuickPick = BreadcrumbsConfig._stub('breadcrumbs.useQuickPick'); }
    static { this.FilePath = BreadcrumbsConfig._stub('breadcrumbs.filePath'); }
    static { this.SymbolPath = BreadcrumbsConfig._stub('breadcrumbs.symbolPath'); }
    static { this.SymbolSortOrder = BreadcrumbsConfig._stub('breadcrumbs.symbolSortOrder'); }
    static { this.Icons = BreadcrumbsConfig._stub('breadcrumbs.icons'); }
    static { this.TitleScrollbarSizing = BreadcrumbsConfig._stub('workbench.editor.titleScrollbarSizing'); }
    static { this.FileExcludes = BreadcrumbsConfig._stub('files.exclude'); }
    static _stub(name) {
        return {
            bindTo(service) {
                const onDidChange = new Emitter();
                const listener = service.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(name)) {
                        onDidChange.fire(undefined);
                    }
                });
                return new class {
                    constructor() {
                        this.name = name;
                        this.onDidChange = onDidChange.event;
                    }
                    getValue(overrides) {
                        if (overrides) {
                            return service.getValue(name, overrides);
                        }
                        else {
                            return service.getValue(name);
                        }
                    }
                    updateValue(newValue, overrides) {
                        if (overrides) {
                            return service.updateValue(name, newValue, overrides);
                        }
                        else {
                            return service.updateValue(name, newValue);
                        }
                    }
                    dispose() {
                        listener.dispose();
                        onDidChange.dispose();
                    }
                };
            }
        };
    }
}
Registry.as(Extensions.Configuration).registerConfiguration({
    id: 'breadcrumbs',
    title: localize('title', "Breadcrumb Navigation"),
    order: 101,
    type: 'object',
    properties: {
        'breadcrumbs.enabled': {
            description: localize('enabled', "Enable/disable navigation breadcrumbs."),
            type: 'boolean',
            default: true
        },
        'breadcrumbs.filePath': {
            description: localize('filepath', "Controls whether and how file paths are shown in the breadcrumbs view."),
            type: 'string',
            default: 'on',
            enum: ['on', 'off', 'last'],
            enumDescriptions: [
                localize('filepath.on', "Show the file path in the breadcrumbs view."),
                localize('filepath.off', "Do not show the file path in the breadcrumbs view."),
                localize('filepath.last', "Only show the last element of the file path in the breadcrumbs view."),
            ]
        },
        'breadcrumbs.symbolPath': {
            description: localize('symbolpath', "Controls whether and how symbols are shown in the breadcrumbs view."),
            type: 'string',
            default: 'on',
            enum: ['on', 'off', 'last'],
            enumDescriptions: [
                localize('symbolpath.on', "Show all symbols in the breadcrumbs view."),
                localize('symbolpath.off', "Do not show symbols in the breadcrumbs view."),
                localize('symbolpath.last', "Only show the current symbol in the breadcrumbs view."),
            ]
        },
        'breadcrumbs.symbolSortOrder': {
            description: localize('symbolSortOrder', "Controls how symbols are sorted in the breadcrumbs outline view."),
            type: 'string',
            default: 'position',
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            enum: ['position', 'name', 'type'],
            enumDescriptions: [
                localize('symbolSortOrder.position', "Show symbol outline in file position order."),
                localize('symbolSortOrder.name', "Show symbol outline in alphabetical order."),
                localize('symbolSortOrder.type', "Show symbol outline in symbol type order."),
            ]
        },
        'breadcrumbs.icons': {
            description: localize('icons', "Render breadcrumb items with icons."),
            type: 'boolean',
            default: true
        },
        'breadcrumbs.showFiles': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.file', "When enabled breadcrumbs show `file`-symbols.")
        },
        'breadcrumbs.showModules': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.module', "When enabled breadcrumbs show `module`-symbols.")
        },
        'breadcrumbs.showNamespaces': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.namespace', "When enabled breadcrumbs show `namespace`-symbols.")
        },
        'breadcrumbs.showPackages': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.package', "When enabled breadcrumbs show `package`-symbols.")
        },
        'breadcrumbs.showClasses': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.class', "When enabled breadcrumbs show `class`-symbols.")
        },
        'breadcrumbs.showMethods': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.method', "When enabled breadcrumbs show `method`-symbols.")
        },
        'breadcrumbs.showProperties': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.property', "When enabled breadcrumbs show `property`-symbols.")
        },
        'breadcrumbs.showFields': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.field', "When enabled breadcrumbs show `field`-symbols.")
        },
        'breadcrumbs.showConstructors': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.constructor', "When enabled breadcrumbs show `constructor`-symbols.")
        },
        'breadcrumbs.showEnums': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.enum', "When enabled breadcrumbs show `enum`-symbols.")
        },
        'breadcrumbs.showInterfaces': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.interface', "When enabled breadcrumbs show `interface`-symbols.")
        },
        'breadcrumbs.showFunctions': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.function', "When enabled breadcrumbs show `function`-symbols.")
        },
        'breadcrumbs.showVariables': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.variable', "When enabled breadcrumbs show `variable`-symbols.")
        },
        'breadcrumbs.showConstants': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.constant', "When enabled breadcrumbs show `constant`-symbols.")
        },
        'breadcrumbs.showStrings': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.string', "When enabled breadcrumbs show `string`-symbols.")
        },
        'breadcrumbs.showNumbers': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.number', "When enabled breadcrumbs show `number`-symbols.")
        },
        'breadcrumbs.showBooleans': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.boolean', "When enabled breadcrumbs show `boolean`-symbols.")
        },
        'breadcrumbs.showArrays': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.array', "When enabled breadcrumbs show `array`-symbols.")
        },
        'breadcrumbs.showObjects': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.object', "When enabled breadcrumbs show `object`-symbols.")
        },
        'breadcrumbs.showKeys': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.key', "When enabled breadcrumbs show `key`-symbols.")
        },
        'breadcrumbs.showNull': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.null', "When enabled breadcrumbs show `null`-symbols.")
        },
        'breadcrumbs.showEnumMembers': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.enumMember', "When enabled breadcrumbs show `enumMember`-symbols.")
        },
        'breadcrumbs.showStructs': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.struct', "When enabled breadcrumbs show `struct`-symbols.")
        },
        'breadcrumbs.showEvents': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.event', "When enabled breadcrumbs show `event`-symbols.")
        },
        'breadcrumbs.showOperators': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.operator', "When enabled breadcrumbs show `operator`-symbols.")
        },
        'breadcrumbs.showTypeParameters': {
            type: 'boolean',
            default: true,
            scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            markdownDescription: localize('filteredTypes.typeParameter', "When enabled breadcrumbs show `typeParameter`-symbols.")
        }
    }
});
//#endregion
