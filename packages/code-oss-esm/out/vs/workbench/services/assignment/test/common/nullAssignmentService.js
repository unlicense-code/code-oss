/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class NullWorkbenchAssignmentService {
    async getCurrentExperiments() {
        return [];
    }
    async getTreatment(name) {
        return undefined;
    }
}
