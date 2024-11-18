/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class InlineEdit {
    constructor(edit, isCollapsed, renderExplicitly, commands, inlineCompletion) {
        this.edit = edit;
        this.isCollapsed = isCollapsed;
        this.renderExplicitly = renderExplicitly;
        this.commands = commands;
        this.inlineCompletion = inlineCompletion;
    }
    get range() {
        return this.edit.range;
    }
    get text() {
        return this.edit.text;
    }
    equals(other) {
        return this.edit.equals(other.edit)
            && this.isCollapsed === other.isCollapsed
            && this.renderExplicitly === other.renderExplicitly
            && this.inlineCompletion === other.inlineCompletion;
    }
}
