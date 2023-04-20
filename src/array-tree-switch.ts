import { AnyFunction, StrOrNum } from './types'
import { hasOwnProp, isArr, isFn } from './utils'
export interface Node {
  [key: string]: any
}
export interface TreeNode {
  [key: string]: any
}
interface Options {
  /** 主键key */
  primaryKey?: string
  /** 文字key */
  labelKey?: string
  /** 父元素key */
  parentKey?: string
  /** 子元素集合key */
  childrenKey?: string
}
interface TreeOptions extends Options {
  createRoot?: boolean | ((nodes: TreeNode[]) => any)
  parentRefKey?: boolean | string
}
interface NodeOptions extends Options {
  hasParentKey?: boolean
  returnObject?: boolean
}

function createNode(children: string, value: TreeNode = []) {
  return { [children]: value }
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
export function array2tree(
  array: Node[],
  options?: TreeOptions & { createNode?: false }
): TreeNode[]
export function array2tree(
  array: Node[],
  options: TreeOptions & { createNode: true }
): { [children: string]: TreeNode[] }
export function array2tree<T = any>(
  array: Node[],
  options: TreeOptions & { createNode: AnyFunction<T> }
): T
export function array2tree(array: Node[], options = {} as TreeOptions): Tree {
  const {
    primaryKey: id,
    parentKey: pid,
    childrenKey: children,
    createRoot,
    parentRefKey
  } = {
    primaryKey: 'id',
    parentKey: 'pid',
    childrenKey: 'children',
    createRoot: false,
    parentRefKey: false,
    ...options
  }
  const pRefKey =
    parentRefKey &&
    (typeof parentRefKey === 'string' ? parentRefKey : '_parent')
  const nodeMap: { [id: string]: TreeNode } = {}
  const treeNodes: TreeNode[] = []
  if (isArr(array)) {
    const unsortChildren: Node[] = []
    const transform = (items: Node[]) => {
      items.forEach((item) => {
        if (!hasOwnProp(nodeMap, item[id])) {
          nodeMap[item[id]] = { ...item, ...createNode(children) }
        }
        if (!item[pid]) {
          treeNodes.push(nodeMap[item[id]])
        } else if (hasOwnProp(nodeMap, item[pid])) {
          nodeMap[item[pid]][children].push(
            Object.assign(
              nodeMap[item[id]],
              pRefKey ? { [pRefKey]: nodeMap[item[pid]] } : {}
            )
          )
        } else {
          unsortChildren.push(item)
        }
      })
    }
    transform(array)
    console.log(1111, unsortChildren)
    // 如果有父节点顺序在后的，再循环一次
    if (unsortChildren.length) {
      transform(unsortChildren)
    }
  }
  if (isFn(createRoot)) {
    return createRoot(treeNodes)
  } else if (createRoot) {
    return { [children]: treeNodes }
  }
  return treeNodes
}
function nodeChildFilter(node: TreeNode, childrenKey: string): Node {
  const newNode: Node = {}
  for (const i in node) {
    i !== childrenKey && (newNode[i] = node[i])
  }
  return newNode
}
type Nodes = Node[]
type NodeMap = { [id: string]: Node }
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
export function tree2array(
  tree: Tree,
  options?: NodeOptions & { returnObject?: false }
): Nodes
export function tree2array(
  tree: Tree,
  options: NodeOptions & { returnObject: true }
): NodeMap
export function tree2array(tree: Tree, options = {} as NodeOptions) {
  const {
    primaryKey: id,
    parentKey: pid,
    childrenKey: children,
    hasParentKey,
    returnObject
  } = Object.assign(
    {
      hasParentKey: true,
      primaryKey: 'id',
      parentKey: 'pid',
      childrenKey: 'children',
      returnObject: false
    },
    options
  )
  const nodes = returnObject ? ({} as NodeMap) : ([] as Nodes)
  if (!isArr(tree) && typeof tree !== 'object') return nodes
  function getNode(
    node: TreeNode,
    parentId: string | number | null,
    root = false
  ) {
    const baseNode: Node = hasParentKey ? {} : { [pid]: parentId }
    if (!root) {
      const newNode = Object.assign(baseNode, nodeChildFilter(node, children))
      returnObject
        ? ((<NodeMap>nodes)[node[id]] = newNode)
        : (<Nodes>nodes).push(newNode)
    }
    if (isArr(node[children]) && node[children].length) {
      node[children].forEach((childNode: TreeNode) =>
        getNode(childNode, node[id])
      )
    }
  }
  const rootTree = isArr(tree) ? createNode(children, tree) : tree
  getNode(rootTree, null, true)
  return nodes
}

export interface TreeKeyNode {
  keyVlaue: StrOrNum
  keyLabel?: StrOrNum
  parent?: TreeKeyNode
  children: TreeKeyNode[]
}

export interface AnalyseTreeData<T extends TreeNode = TreeNode> {
  nodes: T[]
  childKeysMaps: Record<StrOrNum, StrOrNum[]>
  keyNodeMap: Record<string, TreeKeyNode>
  disabledKeys: StrOrNum[]
}
type AnalyseTreeModule = keyof AnalyseTreeData

interface TreeAnalyseOptions extends Omit<Options, 'parentKey'> {
  disabledKey?: string
}
/**
 * 分析id唯一的树节点，得到不同结构的数据
 * @param treeData 树数据
 * @param options 配置项
 * @param keys 可指定的数据类型的key，默认返回完整数据
 * @returns
 */
export function treeAnalyse<T extends TreeNode = TreeNode>(
  treeData: T[],
  options?: TreeAnalyseOptions,
  keys?: AnalyseTreeModule[]
) {
  const result: AnalyseTreeData<T> = {
    nodes: [],
    childKeysMaps: {},
    keyNodeMap: {},
    disabledKeys: []
  }
  const moduleKeys: AnalyseTreeModule[] = Array.isArray(keys)
    ? keys
    : ['nodes', 'keyNodeMap', 'childKeysMaps', 'disabledKeys']
  const { primaryKey, labelKey, disabledKey, childrenKey } = {
    primaryKey: 'id',
    labelKey: 'name',
    childrenKey: 'children',
    disabledKey: 'disabled',
    ...options
  } as Required<TreeAnalyseOptions>
  const [hasNodes, hasCKM, hasKNM, hasDK] = (
    Object.keys(result) as AnalyseTreeModule[]
  ).map((m) => moduleKeys.includes(m))
  const readTreeData = (nodes: T[], parent?: TreeKeyNode) => {
    nodes.forEach((node) => {
      const {
        [primaryKey]: key,
        [labelKey]: label,
        [childrenKey]: children,
        [disabledKey]: disabled
      } = node
      let keyNode: TreeKeyNode | undefined = undefined
      if (hasNodes) {
        result.nodes.push(node)
      }
      if (hasKNM && key !== undefined) {
        keyNode = { keyVlaue: key, keyLabel: label, parent, children: [] }
        parent?.children.push(keyNode)
        result.keyNodeMap[key] = keyNode
      }
      if (hasDK && disabled && key !== undefined) {
        result.disabledKeys.push(key)
      }

      if (Array.isArray(children) && children.length) {
        if (hasCKM) {
          result.childKeysMaps[key] = children.map((item) => item[primaryKey])
        }
        readTreeData(children, keyNode)
      }
    })
  }
  treeData && readTreeData(treeData)
  return result
}
