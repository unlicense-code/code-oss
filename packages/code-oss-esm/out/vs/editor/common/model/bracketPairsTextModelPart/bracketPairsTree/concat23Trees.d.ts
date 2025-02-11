import { AstNode } from './ast.js';
/**
 * Concatenates a list of (2,3) AstNode's into a single (2,3) AstNode.
 * This mutates the items of the input array!
 * If all items have the same height, this method has runtime O(items.length).
 * Otherwise, it has runtime O(items.length * max(log(items.length), items.max(i => i.height))).
*/
export declare function concat23Trees(items: AstNode[]): AstNode | null;
export declare function concat23TreesOfSameHeight(items: AstNode[], createImmutableLists?: boolean): AstNode | null;
