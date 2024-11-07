/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const variablePageSize = 100;
export var ProxyKernelState;
(function (ProxyKernelState) {
    ProxyKernelState[ProxyKernelState["Disconnected"] = 1] = "Disconnected";
    ProxyKernelState[ProxyKernelState["Connected"] = 2] = "Connected";
    ProxyKernelState[ProxyKernelState["Initializing"] = 3] = "Initializing";
})(ProxyKernelState || (ProxyKernelState = {}));
export const INotebookKernelService = createDecorator('INotebookKernelService');
export const INotebookKernelHistoryService = createDecorator('INotebookKernelHistoryService');
