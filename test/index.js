const assert = require('assert')
const esUtil = require('../lib/index')

describe('#array-tree-switch', function () {
  describe('#array2tree', function () {
    const array = [{ id: 1, pid: 0, name: 'aaaa' }, { id: 2, pid: 1, name: 'aaaa' }, { id: 3, pid: 0, name: 'aaaa' }]
    const { array2tree } = esUtil
    it('should return an array of tree structure', function () {
      assert.deepStrictEqual(array2tree(array), [
        { 
          id: 1, pid: 0, name: 'aaaa', 
          children: [
            { id: 2, pid: 1, name: 'aaaa', children: [] }
          ] 
        },
        { id: 3, pid: 0, name: 'aaaa', children: [] }
      ])
    })
  })

  describe('#tree2array', function () {
    const treeArr = [
      { 
        id: 1, pid: 0, name: 'aaaa', 
        children: [
          { id: 2, pid: 1, name: 'aaaa', children: [] }
        ] 
      },
      { id: 3, pid: 0, name: 'aaaa', children: [] }
    ]
    const { tree2array } = esUtil
    it('should return an array without children', function () {
      assert.deepStrictEqual(tree2array(treeArr), [{ id: 1, pid: 0, name: 'aaaa' }, { id: 2, pid: 1, name: 'aaaa' }, { id: 3, pid: 0, name: 'aaaa' }])
    })
    it('should return an object when options.returnObject is `true`', function () {
      assert.deepStrictEqual(tree2array(treeArr, { returnObject: true }), {'1': { id: 1, pid: 0, name: 'aaaa' }, '2': { id: 2, pid: 1, name: 'aaaa' }, '3':  { id: 3, pid: 0, name: 'aaaa' }})
    })
  })
  
})

describe('#validate', function () {
  describe('#ChinaIdCardValid', function () {
    const { ChinaIdCardValid } = esUtil
    it('should return `true` if the chinese IDcard is valid', function () {
      assert.equal(ChinaIdCardValid('110101199003071532'), true)
    })
    it('should return `false` if the chinese IDcard is invalid', function () {
      assert.equal(ChinaIdCardValid('110101199003071533'), false)
    })
  })

  describe('#formulaValidate', function () {
    const { formulaValidate } = esUtil
    it('should return `true` if the formula string is valid', function () {
      assert.equal(formulaValidate('A+B-D*(A/E)'), true)
    })
    it('should return `false` if the formula string is invalid', function () {
      assert.equal(formulaValidate('A+B-*D*(A/E)'), false)
    })
    it('should return `false` if the formula string contain variable not in offered variables', function () {
      assert.equal(formulaValidate('A+B-*D*(A/E)', ['A', 'B']), false)
    })
  })
  
})