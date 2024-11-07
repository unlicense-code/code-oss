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
import { ILoggerService, log } from '../../../../platform/log/common/log.js';
let DelayedLogChannel = class DelayedLogChannel {
    constructor(id, name, file, loggerService) {
        this.file = file;
        this.loggerService = loggerService;
        this.logger = loggerService.createLogger(file, { name, id, hidden: true });
    }
    log(level, message) {
        this.loggerService.setVisibility(this.file, true);
        log(this.logger, level, message);
    }
};
DelayedLogChannel = __decorate([
    __param(3, ILoggerService)
], DelayedLogChannel);
export { DelayedLogChannel };
