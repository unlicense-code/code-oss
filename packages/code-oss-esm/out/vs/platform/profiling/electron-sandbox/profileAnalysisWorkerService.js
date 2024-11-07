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
import { createWebWorker } from '../../../base/browser/defaultWorkerFactory.js';
import { registerSingleton } from '../../instantiation/common/extensions.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { ILogService } from '../../log/common/log.js';
import { reportSample } from '../common/profilingTelemetrySpec.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
export var ProfilingOutput;
(function (ProfilingOutput) {
    ProfilingOutput[ProfilingOutput["Failure"] = 0] = "Failure";
    ProfilingOutput[ProfilingOutput["Irrelevant"] = 1] = "Irrelevant";
    ProfilingOutput[ProfilingOutput["Interesting"] = 2] = "Interesting";
})(ProfilingOutput || (ProfilingOutput = {}));
export const IProfileAnalysisWorkerService = createDecorator('IProfileAnalysisWorkerService');
// ---- impl
let ProfileAnalysisWorkerService = class ProfileAnalysisWorkerService {
    constructor(_telemetryService, _logService) {
        this._telemetryService = _telemetryService;
        this._logService = _logService;
    }
    async _withWorker(callback) {
        const worker = createWebWorker('vs/platform/profiling/electron-sandbox/profileAnalysisWorker', 'CpuProfileAnalysisWorker');
        try {
            const r = await callback(worker.proxy);
            return r;
        }
        finally {
            worker.dispose();
        }
    }
    async analyseBottomUp(profile, callFrameClassifier, perfBaseline, sendAsErrorTelemtry) {
        return this._withWorker(async (worker) => {
            const result = await worker.$analyseBottomUp(profile);
            if (result.kind === 2 /* ProfilingOutput.Interesting */) {
                for (const sample of result.samples) {
                    reportSample({
                        sample,
                        perfBaseline,
                        source: callFrameClassifier(sample.url)
                    }, this._telemetryService, this._logService, sendAsErrorTelemtry);
                }
            }
            return result.kind;
        });
    }
    async analyseByLocation(profile, locations) {
        return this._withWorker(async (worker) => {
            const result = await worker.$analyseByUrlCategory(profile, locations);
            return result;
        });
    }
};
ProfileAnalysisWorkerService = __decorate([
    __param(0, ITelemetryService),
    __param(1, ILogService)
], ProfileAnalysisWorkerService);
registerSingleton(IProfileAnalysisWorkerService, ProfileAnalysisWorkerService, 1 /* InstantiationType.Delayed */);
