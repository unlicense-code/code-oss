/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as browser from './browser.js';
import { mainWindow } from './window.js';
import * as platform from '../common/platform.js';
export var KeyboardSupport;
(function (KeyboardSupport) {
    KeyboardSupport[KeyboardSupport["Always"] = 0] = "Always";
    KeyboardSupport[KeyboardSupport["FullScreen"] = 1] = "FullScreen";
    KeyboardSupport[KeyboardSupport["None"] = 2] = "None";
})(KeyboardSupport || (KeyboardSupport = {}));
/**
 * Browser feature we can support in current platform, browser and environment.
 */
export const BrowserFeatures = {
    clipboard: {
        writeText: (platform.isNative
            || (document.queryCommandSupported && document.queryCommandSupported('copy'))
            || !!(navigator && navigator.clipboard && navigator.clipboard.writeText)),
        readText: (platform.isNative
            || !!(navigator && navigator.clipboard && navigator.clipboard.readText))
    },
    keyboard: (() => {
        if (platform.isNative || browser.isStandalone()) {
            return 0 /* KeyboardSupport.Always */;
        }
        if (navigator.keyboard || browser.isSafari) {
            return 1 /* KeyboardSupport.FullScreen */;
        }
        return 2 /* KeyboardSupport.None */;
    })(),
    // 'ontouchstart' in window always evaluates to true with typescript's modern typings. This causes `window` to be
    // `never` later in `window.navigator`. That's why we need the explicit `window as Window` cast
    touch: 'ontouchstart' in mainWindow || navigator.maxTouchPoints > 0,
    pointerEvents: mainWindow.PointerEvent && ('ontouchstart' in mainWindow || navigator.maxTouchPoints > 0)
};
