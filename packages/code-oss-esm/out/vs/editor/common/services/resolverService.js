/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
export const ITextModelService = createDecorator('textModelService');
export function isResolvedTextEditorModel(model) {
    const candidate = model;
    return !!candidate.textEditorModel;
}
