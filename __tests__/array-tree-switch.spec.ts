/* eslint-env node, jest */
import { array2tree, tree2array, treeAnalyse } from '../src'

describe('#array2tree', function () {
  const array = [
    { id: 1, pid: 0, name: 'aaaa' },
    { id: 2, pid: 1, name: 'aaaa' },
    { id: 3, pid: 0, name: 'aaaa' }
  ]
  it('should return an array of tree structure', function () {
    expect(array2tree(array)).toStrictEqual([
      {
        id: 1,
        pid: 0,
        name: 'aaaa',
        children: [{ id: 2, pid: 1, name: 'aaaa', children: [] }]
      },
      { id: 3, pid: 0, name: 'aaaa', children: [] }
    ])
  })
  it(`node's '_parent' will point to it's parent node`, function () {
    const tree = array2tree(array, { parentRefKey: true })
    expect(tree[0].children[0]._parent).toBe(tree[0])
  })
  it('should work well even pid not ordered', function () {
    const unsortArray = [
      { id: 2, pid: 1, name: 'aaaa' },
      { id: 1, pid: 0, name: 'bbb' }
    ]
    expect(array2tree(unsortArray)).toStrictEqual([
      {
        id: 1,
        pid: 0,
        name: 'bbb',
        children: [{ id: 2, pid: 1, name: 'aaaa', children: [] }]
      }
    ])
  })
})

describe('#tree2array', function () {
  const treeArr = [
    {
      id: 1,
      pid: 0,
      name: 'aaaa',
      children: [{ id: 2, pid: 1, name: 'aaaa', children: [] }]
    },
    { id: 3, pid: 0, name: 'aaaa', children: [] }
  ]
  it('should return an array without children', function () {
    expect(tree2array(treeArr)).toStrictEqual([
      { id: 1, pid: 0, name: 'aaaa' },
      { id: 2, pid: 1, name: 'aaaa' },
      { id: 3, pid: 0, name: 'aaaa' }
    ])
  })
  it('should return an object when options.returnObject is `true`', function () {
    expect(tree2array(treeArr, { returnObject: true })).toStrictEqual({
      '1': { id: 1, pid: 0, name: 'aaaa' },
      '2': { id: 2, pid: 1, name: 'aaaa' },
      '3': { id: 3, pid: 0, name: 'aaaa' }
    })
  })
})

describe('#treeAnalyse', function () {
  const treeArr = [
    {
      id: 1,
      pid: 0,
      name: 'aaaa',
      children: [{ id: 2, pid: 1, name: 'aaaa', disabled: true, children: [] }]
    },
    { id: 3, pid: 0, name: 'aaaa', children: [] }
  ]
  it('should return an object contain all module data', function () {
    const result = treeAnalyse(treeArr)
    const { keyNodeMap } = result
    expect(result.nodes).toHaveLength(3)
    expect(result.childKeysMaps).toEqual({ 1: [2] })
    expect(keyNodeMap[2].parent).toBe(keyNodeMap[1])
    expect(result.disabledKeys).toEqual([2])
  })
  it(`should return part of modules when set keys`, function () {
    const result = treeAnalyse(treeArr, undefined, ['nodes', 'childKeysMaps'])
    expect(result.nodes).toHaveLength(3)
    expect(result.childKeysMaps).toEqual({ 1: [2] })
    expect(result.keyNodeMap).toEqual({})
    expect(result.disabledKeys).toHaveLength(0)
  })
  const treeArr1 = [
    {
      key: 1,
      pid: 0,
      label: 'aaaa',
      children: [
        { key: 2, pid: 1, label: 'aaaa', disabled: true, children: [] }
      ]
    }
  ]
  it('you can use options to custom node property', function () {
    const result = treeAnalyse(treeArr1, {
      primaryKey: 'key',
      labelKey: 'label'
    })
    expect(result.childKeysMaps).toEqual({ 1: [2] })
    expect(result.keyNodeMap[1].keyLabel).toBeTruthy()
    expect(result.disabledKeys).toEqual([2])
  })
})
