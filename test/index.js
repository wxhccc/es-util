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

  describe('#object-array', function () {
    describe('#mapToObject', function () {
      const { mapToObject } = esUtil
      const objectArray = [
        { key: 'a', value: 'b', name: 'afsfsdfe' },
        { key: 'a1', value: 'b1', name: 'afssdfsfe' },
        { key: 'a2', value: 'b2', name: 'afsfgege' }
      ]
      it('should return an object which key and value come from the provide object array', function () {
        assert.deepStrictEqual(mapToObject(objectArray), { a: 'b', a1: 'b1', a2: 'b2' })
      })
    })
  })

  describe('#value-string-switch', function () {
    describe('#byte-string', function () {
      describe('#byteStringify', function () {
        const { byteStringify } = esUtil
        it('should return `1.2 KB` if run byteStringify(1234)', function () {
          assert.equal(byteStringify(1234), '1.2 KB')
        })
        it('should return `-1.20 KB` if run byteStringify(-1234, { precision: 2 })', function () {
          assert.equal(byteStringify(-1234, { precision: 2 }), '-1.21 KB')
        })
        it('should return `0.001 MB` if run byteStringify(1234, { unitLvl: \'M\', precision: 3 })', function () {
          assert.equal(byteStringify(1234, { unitLvl: 'M', precision: 3 }), '0.001 MB')
        })
        it('should return an object `{ value: \'1.234\', unit: \'KB\'}` if run byteStringify(1234, { detail: true, standard: \'metric\', precision: 3 })', function () {
          assert.deepStrictEqual(byteStringify(1234, { detail: true, standard: 'metric', precision: 3 }), { value: '1.234', unit: 'kB' })
        })
        
      })
      
    })
  })
  
})