import * as monarchCommon from './monarchCommon.js';
import { IMonarchLanguage } from './monarchTypes.js';
/**
 * Compiles a json description function into json where all regular expressions,
 * case matches etc, are compiled and all include rules are expanded.
 * We also compile the bracket definitions, supply defaults, and do many sanity checks.
 * If the 'jsonStrict' parameter is 'false', we allow at certain locations
 * regular expression objects and functions that get called during lexing.
 * (Currently we have no samples that need this so perhaps we should always have
 * jsonStrict to true).
 */
export declare function compile(languageId: string, json: IMonarchLanguage): monarchCommon.ILexer;
