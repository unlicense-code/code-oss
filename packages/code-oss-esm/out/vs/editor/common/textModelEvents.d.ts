import { IRange } from './core/range.js';
import { Selection } from './core/selection.js';
import { IModelDecoration, InjectedTextOptions } from './model.js';
/**
 * An event describing that the current language associated with a model has changed.
 */
export interface IModelLanguageChangedEvent {
    /**
     * Previous language
     */
    readonly oldLanguage: string;
    /**
     * New language
     */
    readonly newLanguage: string;
    /**
     * Source of the call that caused the event.
     */
    readonly source: string;
}
/**
 * An event describing that the language configuration associated with a model has changed.
 */
export interface IModelLanguageConfigurationChangedEvent {
}
export interface IModelContentChange {
    /**
     * The range that got replaced.
     */
    readonly range: IRange;
    /**
     * The offset of the range that got replaced.
     */
    readonly rangeOffset: number;
    /**
     * The length of the range that got replaced.
     */
    readonly rangeLength: number;
    /**
     * The new text for the range.
     */
    readonly text: string;
}
/**
 * An event describing a change in the text of a model.
 */
export interface IModelContentChangedEvent {
    /**
     * The changes are ordered from the end of the document to the beginning, so they should be safe to apply in sequence.
     */
    readonly changes: IModelContentChange[];
    /**
     * The (new) end-of-line character.
     */
    readonly eol: string;
    /**
     * The new version id the model has transitioned to.
     */
    readonly versionId: number;
    /**
     * Flag that indicates that this event was generated while undoing.
     */
    readonly isUndoing: boolean;
    /**
     * Flag that indicates that this event was generated while redoing.
     */
    readonly isRedoing: boolean;
    /**
     * Flag that indicates that all decorations were lost with this edit.
     * The model has been reset to a new value.
     */
    readonly isFlush: boolean;
    /**
     * Flag that indicates that this event describes an eol change.
     */
    readonly isEolChange: boolean;
}
/**
 * An event describing that model decorations have changed.
 */
export interface IModelDecorationsChangedEvent {
    readonly affectsMinimap: boolean;
    readonly affectsOverviewRuler: boolean;
    readonly affectsGlyphMargin: boolean;
    readonly affectsLineNumber: boolean;
}
/**
 * An event describing that some ranges of lines have been tokenized (their tokens have changed).
 * @internal
 */
export interface IModelTokensChangedEvent {
    readonly semanticTokensApplied: boolean;
    readonly ranges: {
        /**
         * The start of the range (inclusive)
         */
        readonly fromLineNumber: number;
        /**
         * The end of the range (inclusive)
         */
        readonly toLineNumber: number;
    }[];
}
export interface IModelOptionsChangedEvent {
    readonly tabSize: boolean;
    readonly indentSize: boolean;
    readonly insertSpaces: boolean;
    readonly trimAutoWhitespace: boolean;
}
/**
 * @internal
 */
export declare const enum RawContentChangedType {
    Flush = 1,
    LineChanged = 2,
    LinesDeleted = 3,
    LinesInserted = 4,
    EOLChanged = 5
}
/**
 * An event describing that a model has been reset to a new value.
 * @internal
 */
export declare class ModelRawFlush {
    readonly changeType = RawContentChangedType.Flush;
}
/**
 * Represents text injected on a line
 * @internal
 */
export declare class LineInjectedText {
    readonly ownerId: number;
    readonly lineNumber: number;
    readonly column: number;
    readonly options: InjectedTextOptions;
    readonly order: number;
    static applyInjectedText(lineText: string, injectedTexts: LineInjectedText[] | null): string;
    static fromDecorations(decorations: IModelDecoration[]): LineInjectedText[];
    constructor(ownerId: number, lineNumber: number, column: number, options: InjectedTextOptions, order: number);
    withText(text: string): LineInjectedText;
}
/**
 * An event describing that a line has changed in a model.
 * @internal
 */
export declare class ModelRawLineChanged {
    readonly changeType = RawContentChangedType.LineChanged;
    /**
     * The line that has changed.
     */
    readonly lineNumber: number;
    /**
     * The new value of the line.
     */
    readonly detail: string;
    /**
     * The injected text on the line.
     */
    readonly injectedText: LineInjectedText[] | null;
    constructor(lineNumber: number, detail: string, injectedText: LineInjectedText[] | null);
}
/**
 * An event describing that line(s) have been deleted in a model.
 * @internal
 */
export declare class ModelRawLinesDeleted {
    readonly changeType = RawContentChangedType.LinesDeleted;
    /**
     * At what line the deletion began (inclusive).
     */
    readonly fromLineNumber: number;
    /**
     * At what line the deletion stopped (inclusive).
     */
    readonly toLineNumber: number;
    constructor(fromLineNumber: number, toLineNumber: number);
}
/**
 * An event describing that line(s) have been inserted in a model.
 * @internal
 */
export declare class ModelRawLinesInserted {
    readonly changeType = RawContentChangedType.LinesInserted;
    /**
     * Before what line did the insertion begin
     */
    readonly fromLineNumber: number;
    /**
     * `toLineNumber` - `fromLineNumber` + 1 denotes the number of lines that were inserted
     */
    readonly toLineNumber: number;
    /**
     * The text that was inserted
     */
    readonly detail: string[];
    /**
     * The injected texts for every inserted line.
     */
    readonly injectedTexts: (LineInjectedText[] | null)[];
    constructor(fromLineNumber: number, toLineNumber: number, detail: string[], injectedTexts: (LineInjectedText[] | null)[]);
}
/**
 * An event describing that a model has had its EOL changed.
 * @internal
 */
export declare class ModelRawEOLChanged {
    readonly changeType = RawContentChangedType.EOLChanged;
}
/**
 * @internal
 */
export type ModelRawChange = ModelRawFlush | ModelRawLineChanged | ModelRawLinesDeleted | ModelRawLinesInserted | ModelRawEOLChanged;
/**
 * An event describing a change in the text of a model.
 * @internal
 */
export declare class ModelRawContentChangedEvent {
    readonly changes: ModelRawChange[];
    /**
     * The new version id the model has transitioned to.
     */
    readonly versionId: number;
    /**
     * Flag that indicates that this event was generated while undoing.
     */
    readonly isUndoing: boolean;
    /**
     * Flag that indicates that this event was generated while redoing.
     */
    readonly isRedoing: boolean;
    resultingSelection: Selection[] | null;
    constructor(changes: ModelRawChange[], versionId: number, isUndoing: boolean, isRedoing: boolean);
    containsEvent(type: RawContentChangedType): boolean;
    static merge(a: ModelRawContentChangedEvent, b: ModelRawContentChangedEvent): ModelRawContentChangedEvent;
}
/**
 * An event describing a change in injected text.
 * @internal
 */
export declare class ModelInjectedTextChangedEvent {
    readonly changes: ModelRawLineChanged[];
    constructor(changes: ModelRawLineChanged[]);
}
/**
 * @internal
 */
export declare class InternalModelContentChangeEvent {
    readonly rawContentChangedEvent: ModelRawContentChangedEvent;
    readonly contentChangedEvent: IModelContentChangedEvent;
    constructor(rawContentChangedEvent: ModelRawContentChangedEvent, contentChangedEvent: IModelContentChangedEvent);
    merge(other: InternalModelContentChangeEvent): InternalModelContentChangeEvent;
    private static _mergeChangeEvents;
}
