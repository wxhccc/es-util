const { hasOwnProperty, propertyIsEnumerable } = Object.prototype
function createNode (children, value = []) {
  return { [children]: value }
}
// translate array to tree
export function array2tree (array, options = {}) {
  const { primaryKey: id, parentKey: pid, childrenKey: children, createRoot } = Object.assign({
    primaryKey: 'id',
    parentKey: 'pid',
    childrenKey: 'children',
    createRoot: false
  }, options)
  let nodeMap = {}
  let treeNodes = []
  Array.isArray(array) && array.forEach(item => {
    !hasOwnProperty.call(nodeMap, item[id]) && (nodeMap[item[id]] = Object.assign(createNode(children), item))
    hasOwnProperty.call(nodeMap, item[pid]) && nodeMap[item[pid]][children].push(nodeMap[item[id]])
    !item[pid] && treeNodes.push(nodeMap[item[id]])
  })
  if (typeof createRoot === 'function') {
    return createRoot(treeNodes)
  } else if (createRoot) {
    return { [children]: treeNodes }
  }
  return treeNodes
}

// translate tree to array
export function tree2array (tree, options = {}) {
  let nodes = []
  if (!Array.isArray(tree) && typeof tree !== 'object') return nodes
  const { primaryKey: id, parentKey: pid, childrenKey: children, hasParentKey } = Object.assign({
    hasParentKey: true,
    primaryKey: 'id',
    parentKey: 'pid',
    childrenKey: 'children'
  }, options)
  function getNode (node, parentId, root) {
    let baseNode = hasParentKey ? {} : { [pid]: parentId }
    if (!root) {
      propertyIsEnumerable.call(node, children) && Object.defineProperty(node, children, { enumerable: false })
      nodes.push(Object.assign(baseNode, node))
    }
    if (Array.isArray(node[children]) && node[children].length) {
      node[children].forEach(childNode => getNode(childNode, node[id]))
    }
  }
  const rootTree = Array.isArray(tree) ? createNode(children, tree) : tree
  getNode(rootTree, null, true)
  return nodes
}
