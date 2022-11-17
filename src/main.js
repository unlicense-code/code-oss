/*---------------------------------------------------------------------------------------------
 *  Copyright (c) The Unlicense. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

//@ts-check
'use strict';

/**
 * @typedef {import('./vs/base/common/product').IProductConfiguration} IProductConfiguration
 * @typedef {import('./vs/base/node/languagePacks').NLSConfiguration} NLSConfiguration
 * @typedef {import('./vs/platform/environment/common/argv').NativeParsedArgs} NativeParsedArgs
 */

// CJS Wrapper for the ESM Module
import('./server-main-esm.js');
