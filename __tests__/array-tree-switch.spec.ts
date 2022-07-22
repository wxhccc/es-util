/* eslint-env node, jest */
import { array2tree, tree2array } from '../src'

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
