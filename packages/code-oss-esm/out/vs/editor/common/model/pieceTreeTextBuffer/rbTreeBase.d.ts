import { Piece, PieceTreeBase } from './pieceTreeBase.js';
export declare class TreeNode {
    parent: TreeNode;
    left: TreeNode;
    right: TreeNode;
    color: NodeColor;
    piece: Piece;
    size_left: number;
    lf_left: number;
    constructor(piece: Piece, color: NodeColor);
    next(): TreeNode;
    prev(): TreeNode;
    detach(): void;
}
export declare const enum NodeColor {
    Black = 0,
    Red = 1
}
export declare const SENTINEL: TreeNode;
export declare function leftest(node: TreeNode): TreeNode;
export declare function righttest(node: TreeNode): TreeNode;
export declare function leftRotate(tree: PieceTreeBase, x: TreeNode): void;
export declare function rightRotate(tree: PieceTreeBase, y: TreeNode): void;
export declare function rbDelete(tree: PieceTreeBase, z: TreeNode): void;
export declare function fixInsert(tree: PieceTreeBase, x: TreeNode): void;
export declare function updateTreeMetadata(tree: PieceTreeBase, x: TreeNode, delta: number, lineFeedCntDelta: number): void;
export declare function recomputeTreeMetadata(tree: PieceTreeBase, x: TreeNode): void;
