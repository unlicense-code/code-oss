import { ThemeIcon, IconIdentifier } from '../../../base/common/themables.js';
import { Event } from '../../../base/common/event.js';
import { IJSONSchema } from '../../../base/common/jsonSchema.js';
import { URI } from '../../../base/common/uri.js';
export declare const Extensions: {
    IconContribution: string;
};
export type IconDefaults = ThemeIcon | IconDefinition;
export interface IconDefinition {
    readonly font?: IconFontContribution;
    readonly fontCharacter: string;
}
export interface IconContribution {
    readonly id: string;
    description: string | undefined;
    readonly deprecationMessage?: string;
    readonly defaults: IconDefaults;
}
export declare namespace IconContribution {
    function getDefinition(contribution: IconContribution, registry: IIconRegistry): IconDefinition | undefined;
}
export interface IconFontContribution {
    readonly id: string;
    readonly definition: IconFontDefinition;
}
export interface IconFontDefinition {
    readonly weight?: string;
    readonly style?: string;
    readonly src: IconFontSource[];
}
export declare namespace IconFontDefinition {
    function toJSONObject(iconFont: IconFontDefinition): any;
    function fromJSONObject(json: any): IconFontDefinition | undefined;
}
export interface IconFontSource {
    readonly location: URI;
    readonly format: string;
}
export interface IIconRegistry {
    readonly onDidChange: Event<void>;
    /**
     * Register a icon to the registry.
     * @param id The icon id
     * @param defaults The default values
     * @param description The description
     */
    registerIcon(id: IconIdentifier, defaults: IconDefaults, description?: string): ThemeIcon;
    /**
     * Deregister a icon from the registry.
     */
    deregisterIcon(id: IconIdentifier): void;
    /**
     * Get all icon contributions
     */
    getIcons(): IconContribution[];
    /**
     * Get the icon for the given id
     */
    getIcon(id: IconIdentifier): IconContribution | undefined;
    /**
     * JSON schema for an object to assign icon values to one of the icon contributions.
     */
    getIconSchema(): IJSONSchema;
    /**
     * JSON schema to for a reference to a icon contribution.
     */
    getIconReferenceSchema(): IJSONSchema;
    /**
     * Register a icon font to the registry.
     * @param id The icon font id
     * @param definition The icon font definition
     */
    registerIconFont(id: string, definition: IconFontDefinition): IconFontDefinition;
    /**
     * Deregister an icon font to the registry.
     */
    deregisterIconFont(id: string): void;
    /**
     * Get the icon font for the given id
     */
    getIconFont(id: string): IconFontDefinition | undefined;
}
export declare function registerIcon(id: string, defaults: IconDefaults, description: string, deprecationMessage?: string): ThemeIcon;
export declare function getIconRegistry(): IIconRegistry;
export declare const iconsSchemaId = "vscode://schemas/icons";
export declare const widgetClose: ThemeIcon;
export declare const gotoPreviousLocation: ThemeIcon;
export declare const gotoNextLocation: ThemeIcon;
export declare const syncing: ThemeIcon;
export declare const spinningLoading: ThemeIcon;
