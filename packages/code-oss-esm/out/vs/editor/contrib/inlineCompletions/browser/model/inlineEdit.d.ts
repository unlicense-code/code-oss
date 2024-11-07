import { SingleTextEdit } from '../../../../common/core/textEdit.js';
import { Command } from '../../../../common/languages.js';
export declare class InlineEdit {
    readonly edit: SingleTextEdit;
    readonly isCollapsed: boolean;
    readonly renderExplicitly: boolean;
    readonly commands: readonly Command[];
    constructor(edit: SingleTextEdit, isCollapsed: boolean, renderExplicitly: boolean, commands: readonly Command[]);
    get range(): import("../../../../common/core/range.js").Range;
    get text(): string;
    equals(other: InlineEdit): boolean;
}
