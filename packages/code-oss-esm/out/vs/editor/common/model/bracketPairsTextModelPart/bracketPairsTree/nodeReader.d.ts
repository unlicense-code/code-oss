import { AstNode } from './ast.js';
import { Length } from './length.js';
/**
 * Allows to efficiently find a longest child at a given offset in a fixed node.
 * The requested offsets must increase monotonously.
*/
export declare class NodeReader {
    private readonly nextNodes;
    private readonly offsets;
    private readonly idxs;
    private lastOffset;
    constructor(node: AstNode);
    /**
     * Returns the longest node at `offset` that satisfies the predicate.
     * @param offset must be greater than or equal to the last offset this method has been called with!
    */
    readLongestNodeAt(offset: Length, predicate: (node: AstNode) => boolean): AstNode | undefined;
    private nextNodeAfterCurrent;
}
