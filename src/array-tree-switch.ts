const { hasOwnProperty } = Object.prototype;

export interface Node {
  [key: string]: any
}

export interface TreeNode {
  [key: string]: any
}

interface Options {
  primaryKey?: string,
  parentKey?: string,
  childrenKey?: string
}

interface TreeOptions extends Options {
  createRoot?: boolean | ((nodes: TreeNode[]) => any),
  parentRefKey?: boolean | string
}

interface NodeOptions extends Options {
  hasParentKey?: boolean,
  returnObject?: boolean
}

function createNode (children: string, value: TreeNode = []) {
  return { [children]: value };
}

type Tree = TreeNode[] | { [children: string]: TreeNode[] }
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
export function array2tree (array: Node[], options = {} as TreeOptions): Tree {
  const { primaryKey: id, parentKey: pid, childrenKey: children, createRoot, parentRefKey } = Object.assign({
    primaryKey: 'id',
    parentKey: 'pid',
    childrenKey: 'children',
    createRoot: false,
    parentRefKey: false
  }, options);
  const pRefKey = parentRefKey && (typeof parentRefKey === 'string' ? parentRefKey : '_parent');
  let nodeMap: { [id: string]: TreeNode } = {};
  let treeNodes: TreeNode[] = [];
  Array.isArray(array) && array.forEach(item => {
    !hasOwnProperty.call(nodeMap, item[id]) && (nodeMap[item[id]] = Object.assign({}, item, createNode(children)));
    hasOwnProperty.call(nodeMap, item[pid]) && nodeMap[item[pid]][children].push(Object.assign(nodeMap[item[id]], pRefKey ? { [pRefKey]: nodeMap[item[pid]] } : {}));
    !item[pid] && treeNodes.push(nodeMap[item[id]]);
  });
  if (typeof createRoot === 'function') {
    return createRoot(treeNodes);
  } else if (createRoot) {
    return { [children]: treeNodes };
  }
  return treeNodes;
}
function nodeChildFilter (node: TreeNode, childrenKey: string): Node {
  let newNode: Node = {};
  for(let i in node) {
    i !== childrenKey && (newNode[i] = node[i]);
  }
  return newNode;
}
type Nodes = Node[];
type NodeMap = { [id: string]: Node };
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
export function tree2array (tree: Tree, options = {} as NodeOptions) {
  const { primaryKey: id, parentKey: pid, childrenKey: children, hasParentKey, returnObject } = Object.assign({
    hasParentKey: true,
    primaryKey: 'id',
    parentKey: 'pid',
    childrenKey: 'children',
    returnObject: false
  }, options);
  let nodes = returnObject ? {} as NodeMap : [] as Nodes;
  if (!Array.isArray(tree) && typeof tree !== 'object') return nodes;
  function getNode (node: TreeNode, parentId: string | number, root = false) {
    let baseNode: Node = hasParentKey ? {} : { [pid]: parentId };
    if (!root) {
      const newNode = Object.assign(baseNode, nodeChildFilter(node, children));
      returnObject ? ((<NodeMap>nodes)[node[id]] = newNode) : (<Nodes>nodes).push(newNode);
    }
    if (Array.isArray(node[children]) && node[children].length) {
      node[children].forEach((childNode: TreeNode) => getNode(childNode, node[id]));
    }
  }
  const rootTree = Array.isArray(tree) ? createNode(children, tree) : tree;
  getNode(rootTree, null, true);
  return nodes;
}
