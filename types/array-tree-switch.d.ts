export interface Node {
    [key: string]: any;
}
export interface TreeNode {
    [key: string]: any;
}
interface Options {
    primaryKey?: string;
    parentKey?: string;
    childrenKey?: string;
}
interface TreeOptions extends Options {
    createRoot?: boolean | ((nodes: TreeNode[]) => any);
    parentRefKey?: boolean | string;
}
interface NodeOptions extends Options {
    hasParentKey?: boolean;
    returnObject?: boolean;
}
declare type Tree = TreeNode[] | {
    [children: string]: TreeNode[];
};
/**
 * translate array to tree
 * @param {Array} array     the node array need to be translate
 * @param {Object} options  the options
 *  @param {string} primaryKey  the primary key of node
 *  @param {string} parentKey   the parent's key of node
 *  @param {string} childrenKey the child's key of node
 *  @param {boolean | Function} createNode  whether create root node, or function which can return root node
 *  @param {boolean | string} parentRefKey  parent reference key of node
 */
export declare function array2tree(array: Node[], options?: TreeOptions): Tree;
declare type Nodes = Node[];
declare type NodeMap = {
    [id: string]: Node;
};
/**
 * translate tree to array
 * @param {Array/Object} tree   the node tree need to be translate
 * @param {Object} options  the options
 *  @param {string} primaryKey  the primary key of tree node
 *  @param {string} parentKey   the parent's key of tree node
 *  @param {string} childrenKey the child's key of tree node
 *  @param {boolean} hasParentKey  whether create parent id in node
 *  @param {boolean} returnObject  whether return object or array
 */
export declare function tree2array(tree: Tree, options?: NodeOptions): NodeMap | Nodes;
export {};
