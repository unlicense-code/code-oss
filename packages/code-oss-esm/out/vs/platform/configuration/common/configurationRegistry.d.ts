import { IStringDictionary } from '../../../base/common/collections.js';
import { Event } from '../../../base/common/event.js';
import { IJSONSchema } from '../../../base/common/jsonSchema.js';
import { PolicyName } from '../../policy/common/policy.js';
export declare enum EditPresentationTypes {
    Multiline = "multilineText",
    Singleline = "singlelineText"
}
export declare const Extensions: {
    Configuration: string;
};
export interface IConfigurationDelta {
    removedDefaults?: IConfigurationDefaults[];
    removedConfigurations?: IConfigurationNode[];
    addedDefaults?: IConfigurationDefaults[];
    addedConfigurations?: IConfigurationNode[];
}
export interface IConfigurationRegistry {
    /**
     * Register a configuration to the registry.
     */
    registerConfiguration(configuration: IConfigurationNode): void;
    /**
     * Register multiple configurations to the registry.
     */
    registerConfigurations(configurations: IConfigurationNode[], validate?: boolean): void;
    /**
     * Deregister multiple configurations from the registry.
     */
    deregisterConfigurations(configurations: IConfigurationNode[]): void;
    /**
     * update the configuration registry by
     * 	- registering the configurations to add
     * 	- dereigstering the configurations to remove
     */
    updateConfigurations(configurations: {
        add: IConfigurationNode[];
        remove: IConfigurationNode[];
    }): void;
    /**
     * Register multiple default configurations to the registry.
     */
    registerDefaultConfigurations(defaultConfigurations: IConfigurationDefaults[]): void;
    /**
     * Deregister multiple default configurations from the registry.
     */
    deregisterDefaultConfigurations(defaultConfigurations: IConfigurationDefaults[]): void;
    /**
     * Bulk update of the configuration registry (default and configurations, remove and add)
     * @param delta
     */
    deltaConfiguration(delta: IConfigurationDelta): void;
    /**
     * Return the registered default configurations
     */
    getRegisteredDefaultConfigurations(): IConfigurationDefaults[];
    /**
     * Return the registered configuration defaults overrides
     */
    getConfigurationDefaultsOverrides(): Map<string, IConfigurationDefaultOverrideValue>;
    /**
     * Signal that the schema of a configuration setting has changes. It is currently only supported to change enumeration values.
     * Property or default value changes are not allowed.
     */
    notifyConfigurationSchemaUpdated(...configurations: IConfigurationNode[]): void;
    /**
     * Event that fires whenever a configuration has been
     * registered.
     */
    readonly onDidSchemaChange: Event<void>;
    /**
     * Event that fires whenever a configuration has been
     * registered.
     */
    readonly onDidUpdateConfiguration: Event<{
        properties: ReadonlySet<string>;
        defaultsOverrides?: boolean;
    }>;
    /**
     * Returns all configuration nodes contributed to this registry.
     */
    getConfigurations(): IConfigurationNode[];
    /**
     * Returns all configurations settings of all configuration nodes contributed to this registry.
     */
    getConfigurationProperties(): IStringDictionary<IRegisteredConfigurationPropertySchema>;
    /**
     * Return all configurations by policy name
     */
    getPolicyConfigurations(): Map<PolicyName, string>;
    /**
     * Returns all excluded configurations settings of all configuration nodes contributed to this registry.
     */
    getExcludedConfigurationProperties(): IStringDictionary<IRegisteredConfigurationPropertySchema>;
    /**
     * Register the identifiers for editor configurations
     */
    registerOverrideIdentifiers(identifiers: string[]): void;
}
export declare const enum ConfigurationScope {
    /**
     * Application specific configuration, which can be configured only in local user settings.
     */
    APPLICATION = 1,
    /**
     * Machine specific configuration, which can be configured only in local and remote user settings.
     */
    MACHINE = 2,
    /**
     * Window specific configuration, which can be configured in the user or workspace settings.
     */
    WINDOW = 3,
    /**
     * Resource specific configuration, which can be configured in the user, workspace or folder settings.
     */
    RESOURCE = 4,
    /**
     * Resource specific configuration that can be configured in language specific settings
     */
    LANGUAGE_OVERRIDABLE = 5,
    /**
     * Machine specific configuration that can also be configured in workspace or folder settings.
     */
    MACHINE_OVERRIDABLE = 6
}
export interface IPolicy {
    /**
     * The policy name.
     */
    readonly name: PolicyName;
    /**
     * The Code version in which this policy was introduced.
     */
    readonly minimumVersion: `${number}.${number}`;
}
export interface IConfigurationPropertySchema extends IJSONSchema {
    scope?: ConfigurationScope;
    /**
     * When restricted, value of this configuration will be read only from trusted sources.
     * For eg., If the workspace is not trusted, then the value of this configuration is not read from workspace settings file.
     */
    restricted?: boolean;
    /**
     * When `false` this property is excluded from the registry. Default is to include.
     */
    included?: boolean;
    /**
     * List of tags associated to the property.
     *  - A tag can be used for filtering
     *  - Use `experimental` tag for marking the setting as experimental.
     *  - Use `onExP` tag for marking that the default of the setting can be changed by running experiments.
     */
    tags?: string[];
    /**
     * When enabled this setting is ignored during sync and user can override this.
     */
    ignoreSync?: boolean;
    /**
     * When enabled this setting is ignored during sync and user cannot override this.
     */
    disallowSyncIgnore?: boolean;
    /**
     * Disallow extensions to contribute configuration default value for this setting.
     */
    disallowConfigurationDefault?: boolean;
    /**
     * Labels for enumeration items
     */
    enumItemLabels?: string[];
    /**
     * When specified, controls the presentation format of string settings.
     * Otherwise, the presentation format defaults to `singleline`.
     */
    editPresentation?: EditPresentationTypes;
    /**
     * When specified, gives an order number for the setting
     * within the settings editor. Otherwise, the setting is placed at the end.
     */
    order?: number;
    /**
     * When specified, this setting's value can always be overwritten by
     * a system-wide policy.
     */
    policy?: IPolicy;
}
export interface IExtensionInfo {
    id: string;
    displayName?: string;
}
export interface IConfigurationNode {
    id?: string;
    order?: number;
    type?: string | string[];
    title?: string;
    description?: string;
    properties?: IStringDictionary<IConfigurationPropertySchema>;
    allOf?: IConfigurationNode[];
    scope?: ConfigurationScope;
    extensionInfo?: IExtensionInfo;
    restrictedProperties?: string[];
}
export type ConfigurationDefaultValueSource = IExtensionInfo | Map<string, IExtensionInfo>;
export interface IConfigurationDefaults {
    overrides: IStringDictionary<any>;
    source?: IExtensionInfo;
}
export type IRegisteredConfigurationPropertySchema = IConfigurationPropertySchema & {
    defaultDefaultValue?: any;
    source?: IExtensionInfo;
    defaultValueSource?: ConfigurationDefaultValueSource;
};
export interface IConfigurationDefaultOverride {
    readonly value: any;
    readonly source?: IExtensionInfo;
}
export interface IConfigurationDefaultOverrideValue {
    readonly value: any;
    readonly source?: ConfigurationDefaultValueSource;
}
export declare const allSettings: {
    properties: IStringDictionary<IConfigurationPropertySchema>;
    patternProperties: IStringDictionary<IConfigurationPropertySchema>;
};
export declare const applicationSettings: {
    properties: IStringDictionary<IConfigurationPropertySchema>;
    patternProperties: IStringDictionary<IConfigurationPropertySchema>;
};
export declare const machineSettings: {
    properties: IStringDictionary<IConfigurationPropertySchema>;
    patternProperties: IStringDictionary<IConfigurationPropertySchema>;
};
export declare const machineOverridableSettings: {
    properties: IStringDictionary<IConfigurationPropertySchema>;
    patternProperties: IStringDictionary<IConfigurationPropertySchema>;
};
export declare const windowSettings: {
    properties: IStringDictionary<IConfigurationPropertySchema>;
    patternProperties: IStringDictionary<IConfigurationPropertySchema>;
};
export declare const resourceSettings: {
    properties: IStringDictionary<IConfigurationPropertySchema>;
    patternProperties: IStringDictionary<IConfigurationPropertySchema>;
};
export declare const resourceLanguageSettingsSchemaId = "vscode://schemas/settings/resourceLanguage";
export declare const configurationDefaultsSchemaId = "vscode://schemas/settings/configurationDefaults";
export declare const OVERRIDE_PROPERTY_PATTERN = "^(\\[([^\\]]+)\\])+$";
export declare const OVERRIDE_PROPERTY_REGEX: RegExp;
export declare function overrideIdentifiersFromKey(key: string): string[];
export declare function keyFromOverrideIdentifiers(overrideIdentifiers: string[]): string;
export declare function getDefaultValue(type: string | string[] | undefined): {} | null;
export declare function validateProperty(property: string, schema: IRegisteredConfigurationPropertySchema): string | null;
export declare function getScopes(): [string, ConfigurationScope | undefined][];
export declare function getAllConfigurationProperties(configurationNode: IConfigurationNode[]): IStringDictionary<IRegisteredConfigurationPropertySchema>;
export declare function parseScope(scope: string): ConfigurationScope;
