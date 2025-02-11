import { URI } from '../../../base/common/uri.js';
export interface ILanguageAssociation {
    readonly id: string;
    readonly mime: string;
    readonly filename?: string;
    readonly extension?: string;
    readonly filepattern?: string;
    readonly firstline?: RegExp;
}
/**
 * Associate a language to the registry (platform).
 * * **NOTE**: This association will lose over associations registered using `registerConfiguredLanguageAssociation`.
 * * **NOTE**: Use `clearPlatformLanguageAssociations` to remove all associations registered using this function.
 */
export declare function registerPlatformLanguageAssociation(association: ILanguageAssociation, warnOnOverwrite?: boolean): void;
/**
 * Associate a language to the registry (configured).
 * * **NOTE**: This association will win over associations registered using `registerPlatformLanguageAssociation`.
 * * **NOTE**: Use `clearConfiguredLanguageAssociations` to remove all associations registered using this function.
 */
export declare function registerConfiguredLanguageAssociation(association: ILanguageAssociation): void;
/**
 * Clear language associations from the registry (platform).
 */
export declare function clearPlatformLanguageAssociations(): void;
/**
 * Clear language associations from the registry (configured).
 */
export declare function clearConfiguredLanguageAssociations(): void;
/**
 * Given a file, return the best matching mime types for it
 * based on the registered language associations.
 */
export declare function getMimeTypes(resource: URI | null, firstLine?: string): string[];
/**
 * @see `getMimeTypes`
 */
export declare function getLanguageIds(resource: URI | null, firstLine?: string): string[];
