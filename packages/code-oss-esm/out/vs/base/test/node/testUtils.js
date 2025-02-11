/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { randomPath } from '../../common/extpath.js';
import { join } from '../../common/path.js';
import * as testUtils from '../common/testUtils.js';
export function getRandomTestPath(tmpdir, ...segments) {
    return randomPath(join(tmpdir, ...segments));
}
export var flakySuite = testUtils.flakySuite;
