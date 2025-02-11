/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire, register } from 'node:module';
import { product, pkg } from './out/bootstrap-meta.js';
import './out/bootstrap-node.js';
import * as performance from './vs/base/common/performance.js';
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Install a hook to module resolution to map 'fs' to 'original-fs'
if (process.env['ELECTRON_RUN_AS_NODE'] || process.versions['electron']) {
	//#region Patched
	async function resolve(specifier, context, nextResolve) {
		if (specifier === 'fs') {
			return {
				format: 'builtin',
				shortCircuit: true,
				url: 'node:original-fs'
			};
		}

		// Defer to the next hook in the chain, which would be the
		// Node.js default resolve if this is the last user-specified loader.
		return nextResolve(specifier, context);
	}
	register(`data:text/javascript;base64,${Buffer.from(`export ${resolve}`).toString('base64')}`, import.meta.url);
}
// Prepare globals that are needed for running
globalThis._VSCODE_PRODUCT_JSON = { ...product };
if (process.env['VSCODE_DEV']) {
	try {
		const overrides = require('../product.overrides.json');
		Object.assign(globalThis._VSCODE_PRODUCT_JSON, overrides);
	}
	catch (error) { /* ignore */ }
}
globalThis._VSCODE_PACKAGE_JSON = { ...pkg };
globalThis._VSCODE_FILE_ROOT = __dirname;
//#region NLS helpers
export let setupNLSResult = undefined;
export function setupNLS() {
	if (!setupNLSResult) {
		setupNLSResult = doSetupNLS();
	}
	return setupNLSResult;
}
// This is the default function the bootstrap process is only about NLS
export async function doSetupNLS() {
	performance.mark('code/willLoadNls');
	let nlsConfig = undefined;
	let messagesFile;
	if (process.env['VSCODE_NLS_CONFIG']) {
		try {
			nlsConfig = JSON.parse(process.env['VSCODE_NLS_CONFIG']);

			messagesFile = nlsConfig?.languagePack?.messagesFile || nlsConfig?.defaultMessagesFile;

			globalThis._VSCODE_NLS_LANGUAGE = nlsConfig?.resolvedLanguage;
		} catch (e) {
			console.error(`Error reading VSCODE_NLS_CONFIG from environment: ${e}`);
		}
	}
	if (process.env['VSCODE_DEV'] || // no NLS support in dev mode
		!messagesFile // no NLS messages file
	) {
		return undefined;
	}

	try {
		globalThis._VSCODE_NLS_MESSAGES = JSON.parse((await fs.promises.readFile(messagesFile)).toString());
	} catch (error) {
		console.error(`Error reading NLS messages file ${messagesFile}: ${error}`);
		// Mark as corrupt: this will re-create the language pack cache next startup
		if (nlsConfig?.languagePack?.corruptMarkerFile) {
			try {
				await fs.promises.writeFile(nlsConfig.languagePack.corruptMarkerFile, 'corrupted');
			}
			catch (error) {
				console.error(`Error writing corrupted NLS marker file: ${error}`);
			}
		}
		// Fallback to the default message file to ensure english translation at least
		if (nlsConfig?.defaultMessagesFile && nlsConfig.defaultMessagesFile !== messagesFile) {
			try {
				globalThis._VSCODE_NLS_MESSAGES = JSON.parse((await fs.promises.readFile(nlsConfig.defaultMessagesFile)).toString());
			}
			catch (error) {
				console.error(`Error reading default NLS messages file ${nlsConfig.defaultMessagesFile}: ${error}`);
			}
		}
	}
	performance.mark('code/didLoadNls');
	return nlsConfig;
}
//#endregion
export async function bootstrapESM() {
	// NLS
	await setupNLS();
}
