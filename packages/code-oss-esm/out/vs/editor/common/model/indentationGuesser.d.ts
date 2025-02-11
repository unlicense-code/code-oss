import { ITextBuffer } from '../model.js';
/**
 * Result for a guessIndentation
 */
export interface IGuessedIndentation {
    /**
     * If indentation is based on spaces (`insertSpaces` = true), then what is the number of spaces that make an indent?
     */
    tabSize: number;
    /**
     * Is indentation based on spaces?
     */
    insertSpaces: boolean;
}
export declare function guessIndentation(source: ITextBuffer, defaultTabSize: number, defaultInsertSpaces: boolean): IGuessedIndentation;
