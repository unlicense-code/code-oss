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
var ViewGpuContext_1;
import * as nls from '../../../nls.js';
import { addDisposableListener, getActiveWindow } from '../../../base/browser/dom.js';
import { createFastDomNode } from '../../../base/browser/fastDomNode.js';
import { BugIndicatingError } from '../../../base/common/errors.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { observableValue, runOnChange } from '../../../base/common/observable.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { TextureAtlas } from './atlas/textureAtlas.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { INotificationService, Severity } from '../../../platform/notification/common/notification.js';
import { GPULifecycle } from './gpuDisposable.js';
import { ensureNonNullable, observeDevicePixelDimensions } from './gpuUtils.js';
import { RectangleRenderer } from './rectangleRenderer.js';
var GpuRenderLimits;
(function (GpuRenderLimits) {
    GpuRenderLimits[GpuRenderLimits["maxGpuLines"] = 3000] = "maxGpuLines";
    GpuRenderLimits[GpuRenderLimits["maxGpuCols"] = 200] = "maxGpuCols";
})(GpuRenderLimits || (GpuRenderLimits = {}));
let ViewGpuContext = class ViewGpuContext extends Disposable {
    static { ViewGpuContext_1 = this; }
    /**
     * The shared texture atlas to use across all views.
     *
     * @throws if called before the GPU device is resolved
     */
    static get atlas() {
        if (!ViewGpuContext_1._atlas) {
            throw new BugIndicatingError('Cannot call ViewGpuContext.textureAtlas before device is resolved');
        }
        return ViewGpuContext_1._atlas;
    }
    /**
     * The shared texture atlas to use across all views. This is a convenience alias for
     * {@link ViewGpuContext.atlas}.
     *
     * @throws if called before the GPU device is resolved
     */
    get atlas() {
        return ViewGpuContext_1.atlas;
    }
    constructor(context, _instantiationService, _notificationService, configurationService) {
        super();
        this._instantiationService = _instantiationService;
        this._notificationService = _notificationService;
        this.configurationService = configurationService;
        /**
         * The temporary hard cap for lines rendered by the GPU renderer. This can be removed once more
         * dynamic allocation is implemented in https://github.com/microsoft/vscode/issues/227091
         */
        this.maxGpuLines = 3000 /* GpuRenderLimits.maxGpuLines */;
        /**
         * The temporary hard cap for line columns rendered by the GPU renderer. This can be removed
         * once more dynamic allocation is implemented in https://github.com/microsoft/vscode/issues/227108
         */
        this.maxGpuCols = 200 /* GpuRenderLimits.maxGpuCols */;
        this.canvas = createFastDomNode(document.createElement('canvas'));
        this.canvas.setClassName('editorCanvas');
        this.ctx = ensureNonNullable(this.canvas.domNode.getContext('webgpu'));
        this.device = GPULifecycle.requestDevice((message) => {
            const choices = [{
                    label: nls.localize('editor.dom.render', "Use DOM-based rendering"),
                    run: () => this.configurationService.updateValue('editor.experimentalGpuAcceleration', 'off'),
                }];
            this._notificationService.prompt(Severity.Warning, message, choices);
        }).then(ref => this._register(ref).object);
        this.device.then(device => {
            if (!ViewGpuContext_1._atlas) {
                ViewGpuContext_1._atlas = this._instantiationService.createInstance(TextureAtlas, device.limits.maxTextureDimension2D, undefined);
                runOnChange(this.devicePixelRatio, () => ViewGpuContext_1.atlas.clear());
            }
        });
        this.rectangleRenderer = this._instantiationService.createInstance(RectangleRenderer, context, this.canvas.domNode, this.ctx, this.device);
        const dprObs = observableValue(this, getActiveWindow().devicePixelRatio);
        this._register(addDisposableListener(getActiveWindow(), 'resize', () => {
            dprObs.set(getActiveWindow().devicePixelRatio, undefined);
        }));
        this.devicePixelRatio = dprObs;
        const canvasDevicePixelDimensions = observableValue(this, { width: this.canvas.domNode.width, height: this.canvas.domNode.height });
        this._register(observeDevicePixelDimensions(this.canvas.domNode, getActiveWindow(), (width, height) => {
            this.canvas.domNode.width = width;
            this.canvas.domNode.height = height;
            canvasDevicePixelDimensions.set({ width, height }, undefined);
        }));
        this.canvasDevicePixelDimensions = canvasDevicePixelDimensions;
    }
    /**
     * This method determines which lines can be and are allowed to be rendered using the GPU
     * renderer. Eventually this should trend all lines, except maybe exceptional cases like
     * decorations that use class names.
     */
    static canRender(options, viewportData, lineNumber) {
        const data = viewportData.getViewLineRenderingData(lineNumber);
        if (data.containsRTL ||
            data.maxColumn > 200 /* GpuRenderLimits.maxGpuCols */ ||
            data.continuesWithWrappedLine ||
            data.inlineDecorations.length > 0 ||
            lineNumber >= 3000 /* GpuRenderLimits.maxGpuLines */) {
            return false;
        }
        return true;
    }
    /**
     * Like {@link canRender} but returned detailed information about why the line cannot be rendered.
     */
    static canRenderDetailed(options, viewportData, lineNumber) {
        const data = viewportData.getViewLineRenderingData(lineNumber);
        const reasons = [];
        if (data.containsRTL) {
            reasons.push('containsRTL');
        }
        if (data.maxColumn > 200 /* GpuRenderLimits.maxGpuCols */) {
            reasons.push('maxColumn > maxGpuCols');
        }
        if (data.continuesWithWrappedLine) {
            reasons.push('continuesWithWrappedLine');
        }
        if (data.inlineDecorations.length > 0) {
            reasons.push('inlineDecorations > 0');
        }
        if (lineNumber >= 3000 /* GpuRenderLimits.maxGpuLines */) {
            reasons.push('lineNumber >= maxGpuLines');
        }
        return reasons;
    }
};
ViewGpuContext = ViewGpuContext_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, INotificationService),
    __param(3, IConfigurationService)
], ViewGpuContext);
export { ViewGpuContext };
