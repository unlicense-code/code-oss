/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { importAMDNodeModule, resolveAmdNodeModulePath } from '../../../amdX.js';
import { WindowIntervalTimer } from '../../../base/browser/dom.js';
import { mainWindow } from '../../../base/browser/window.js';
import { memoize } from '../../../base/common/decorators.js';
import { IProductService } from '../../product/common/productService.js';
import { AbstractSignService } from '../common/abstractSignService.js';
const KEY_SIZE = 32;
const IV_SIZE = 16;
const STEP_SIZE = KEY_SIZE + IV_SIZE;
let SignService = class SignService extends AbstractSignService {
    constructor(productService) {
        super();
        this.productService = productService;
    }
    getValidator() {
        return this.vsda().then(vsda => {
            const v = new vsda.validator();
            return {
                createNewMessage: arg => v.createNewMessage(arg),
                validate: arg => v.validate(arg),
                dispose: () => v.free(),
            };
        });
    }
    signValue(arg) {
        return this.vsda().then(vsda => vsda.sign(arg));
    }
    async vsda() {
        const checkInterval = new WindowIntervalTimer();
        let [wasm] = await Promise.all([
            this.getWasmBytes(),
            new Promise((resolve, reject) => {
                importAMDNodeModule('vsda', 'rust/web/vsda.js').then(() => resolve(), reject);
                // todo@connor4312: there seems to be a bug(?) in vscode-loader with
                // require() not resolving in web once the script loads, so check manually
                checkInterval.cancelAndSet(() => {
                    if (typeof vsda_web !== 'undefined') {
                        resolve();
                    }
                }, 50, mainWindow);
            }).finally(() => checkInterval.dispose()),
        ]);
        const keyBytes = new TextEncoder().encode(this.productService.serverLicense?.join('\n') || '');
        for (let i = 0; i + STEP_SIZE < keyBytes.length; i += STEP_SIZE) {
            const key = await crypto.subtle.importKey('raw', keyBytes.slice(i + IV_SIZE, i + IV_SIZE + KEY_SIZE), { name: 'AES-CBC' }, false, ['decrypt']);
            wasm = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: keyBytes.slice(i, i + IV_SIZE) }, key, wasm);
        }
        await vsda_web.default(wasm);
        return vsda_web;
    }
    async getWasmBytes() {
        const url = resolveAmdNodeModulePath('vsda', 'rust/web/vsda_bg.wasm');
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('error loading vsda');
        }
        return response.arrayBuffer();
    }
};
__decorate([
    memoize
], SignService.prototype, "vsda", null);
SignService = __decorate([
    __param(0, IProductService)
], SignService);
export { SignService };
