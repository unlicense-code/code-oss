import { BracketKind } from '../../../languages/supports/languageBracketsConfiguration.js';
import { ITextModel } from '../../../model.js';
import { Length } from './length.js';
import { SmallImmutableSet } from './smallImmutableSet.js';
import { OpeningBracketId } from './tokenizer.js';
export declare const enum AstNodeKind {
    Text = 0,
    Bracket = 1,
    Pair = 2,
    UnexpectedClosingBracket = 3,
    List = 4
}
export type AstNode = PairAstNode | ListAstNode | BracketAstNode | InvalidBracketAstNode | TextAstNode;
/**
 * The base implementation for all AST nodes.
*/
declare abstract class BaseAstNode {
    abstract readonly kind: AstNodeKind;
    abstract readonly childrenLength: number;
    /**
     * Might return null even if {@link idx} is smaller than {@link BaseAstNode.childrenLength}.
    */
    abstract getChild(idx: number): AstNode | null;
    /**
     * Try to avoid using this property, as implementations might need to allocate the resulting array.
    */
    abstract readonly children: readonly AstNode[];
    /**
     * Represents the set of all (potentially) missing opening bracket ids in this node.
     * E.g. in `{ ] ) }` that set is {`[`, `(` }.
    */
    abstract readonly missingOpeningBracketIds: SmallImmutableSet<OpeningBracketId>;
    /**
     * In case of a list, determines the height of the (2,3) tree.
    */
    abstract readonly listHeight: number;
    protected _length: Length;
    /**
     * The length of the entire node, which should equal the sum of lengths of all children.
    */
    get length(): Length;
    constructor(length: Length);
    /**
     * @param openBracketIds The set of all opening brackets that have not yet been closed.
     */
    abstract canBeReused(openBracketIds: SmallImmutableSet<OpeningBracketId>): boolean;
    /**
     * Flattens all lists in this AST. Only for debugging.
     */
    abstract flattenLists(): AstNode;
    /**
     * Creates a deep clone.
     */
    abstract deepClone(): AstNode;
    abstract computeMinIndentation(offset: Length, textModel: ITextModel): number;
}
/**
 * Represents a bracket pair including its child (e.g. `{ ... }`).
 * Might be unclosed.
 * Immutable, if all children are immutable.
*/
export declare class PairAstNode extends BaseAstNode {
    readonly openingBracket: BracketAstNode;
    readonly child: AstNode | null;
    readonly closingBracket: BracketAstNode | null;
    readonly missingOpeningBracketIds: SmallImmutableSet<OpeningBracketId>;
    static create(openingBracket: BracketAstNode, child: AstNode | null, closingBracket: BracketAstNode | null): PairAstNode;
    get kind(): AstNodeKind.Pair;
    get listHeight(): number;
    get childrenLength(): number;
    getChild(idx: number): AstNode | null;
    /**
     * Avoid using this property, it allocates an array!
    */
    get children(): AstNode[];
    private constructor();
    canBeReused(openBracketIds: SmallImmutableSet<OpeningBracketId>): boolean;
    flattenLists(): PairAstNode;
    deepClone(): PairAstNode;
    computeMinIndentation(offset: Length, textModel: ITextModel): number;
}
export declare abstract class ListAstNode extends BaseAstNode {
    readonly listHeight: number;
    private _missingOpeningBracketIds;
    /**
     * This method uses more memory-efficient list nodes that can only store 2 or 3 children.
    */
    static create23(item1: AstNode, item2: AstNode, item3: AstNode | null, immutable?: boolean): ListAstNode;
    static create(items: AstNode[], immutable?: boolean): ListAstNode;
    static getEmpty(): ImmutableArrayListAstNode;
    get kind(): AstNodeKind.List;
    get missingOpeningBracketIds(): SmallImmutableSet<OpeningBracketId>;
    private cachedMinIndentation;
    /**
     * Use ListAstNode.create.
    */
    constructor(length: Length, listHeight: number, _missingOpeningBracketIds: SmallImmutableSet<OpeningBracketId>);
    protected throwIfImmutable(): void;
    protected abstract setChild(idx: number, child: AstNode): void;
    makeLastElementMutable(): AstNode | undefined;
    makeFirstElementMutable(): AstNode | undefined;
    canBeReused(openBracketIds: SmallImmutableSet<OpeningBracketId>): boolean;
    handleChildrenChanged(): void;
    flattenLists(): ListAstNode;
    computeMinIndentation(offset: Length, textModel: ITextModel): number;
    /**
     * Creates a shallow clone that is mutable, or itself if it is already mutable.
     */
    abstract toMutable(): ListAstNode;
    abstract appendChildOfSameHeight(node: AstNode): void;
    abstract unappendChild(): AstNode | undefined;
    abstract prependChildOfSameHeight(node: AstNode): void;
    abstract unprependChild(): AstNode | undefined;
}
/**
 * For debugging.
*/
declare class ArrayListAstNode extends ListAstNode {
    private readonly _children;
    get childrenLength(): number;
    getChild(idx: number): AstNode | null;
    protected setChild(idx: number, child: AstNode): void;
    get children(): readonly AstNode[];
    constructor(length: Length, listHeight: number, _children: AstNode[], missingOpeningBracketIds: SmallImmutableSet<OpeningBracketId>);
    deepClone(): ListAstNode;
    appendChildOfSameHeight(node: AstNode): void;
    unappendChild(): AstNode | undefined;
    prependChildOfSameHeight(node: AstNode): void;
    unprependChild(): AstNode | undefined;
    toMutable(): ListAstNode;
}
/**
 * Immutable, if all children are immutable.
*/
declare class ImmutableArrayListAstNode extends ArrayListAstNode {
    toMutable(): ListAstNode;
    protected throwIfImmutable(): void;
}
declare abstract class ImmutableLeafAstNode extends BaseAstNode {
    get listHeight(): number;
    get childrenLength(): number;
    getChild(idx: number): AstNode | null;
    get children(): readonly AstNode[];
    flattenLists(): this & AstNode;
    deepClone(): this & AstNode;
}
export declare class TextAstNode extends ImmutableLeafAstNode {
    get kind(): AstNodeKind.Text;
    get missingOpeningBracketIds(): SmallImmutableSet<OpeningBracketId>;
    canBeReused(_openedBracketIds: SmallImmutableSet<OpeningBracketId>): boolean;
    computeMinIndentation(offset: Length, textModel: ITextModel): number;
}
export declare class BracketAstNode extends ImmutableLeafAstNode {
    readonly bracketInfo: BracketKind;
    /**
     * In case of a opening bracket, this is the id of the opening bracket.
     * In case of a closing bracket, this contains the ids of all opening brackets it can close.
    */
    readonly bracketIds: SmallImmutableSet<OpeningBracketId>;
    static create(length: Length, bracketInfo: BracketKind, bracketIds: SmallImmutableSet<OpeningBracketId>): BracketAstNode;
    get kind(): AstNodeKind.Bracket;
    get missingOpeningBracketIds(): SmallImmutableSet<OpeningBracketId>;
    private constructor();
    get text(): string;
    get languageId(): string;
    canBeReused(_openedBracketIds: SmallImmutableSet<OpeningBracketId>): boolean;
    computeMinIndentation(offset: Length, textModel: ITextModel): number;
}
export declare class InvalidBracketAstNode extends ImmutableLeafAstNode {
    get kind(): AstNodeKind.UnexpectedClosingBracket;
    readonly missingOpeningBracketIds: SmallImmutableSet<OpeningBracketId>;
    constructor(closingBrackets: SmallImmutableSet<OpeningBracketId>, length: Length);
    canBeReused(openedBracketIds: SmallImmutableSet<OpeningBracketId>): boolean;
    computeMinIndentation(offset: Length, textModel: ITextModel): number;
}
export {};
