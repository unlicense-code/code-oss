/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class MockChatVariablesService {
    registerVariable(data, resolver) {
        throw new Error('Method not implemented.');
    }
    getVariable(name) {
        throw new Error('Method not implemented.');
    }
    hasVariable(name) {
        throw new Error('Method not implemented.');
    }
    getVariables() {
        throw new Error('Method not implemented.');
    }
    getDynamicVariables(sessionId) {
        return [];
    }
    async resolveVariables(prompt, attachedContextVariables, model, progress, token) {
        return {
            variables: []
        };
    }
    attachContext(name, value, location) {
        throw new Error('Method not implemented.');
    }
    resolveVariable(variableName, promptText, model, progress, token) {
        throw new Error('Method not implemented.');
    }
}
