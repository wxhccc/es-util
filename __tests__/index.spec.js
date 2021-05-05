import * as esUtil from '../'

describe('#array-tree-switch', function () {
  describe('#array2tree', function () {
    const array = [{ id: 1, pid: 0, name: 'aaaa' }, { id: 2, pid: 1, name: 'aaaa' }, { id: 3, pid: 0, name: 'aaaa' }]
    const { array2tree } = esUtil
    it('should return an array of tree structure', function () {
      expect(array2tree(array)).toStrictEqual([
        { 
          id: 1, pid: 0, name: 'aaaa', 
          children: [
            { id: 2, pid: 1, name: 'aaaa', children: [] }
          ] 
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
        id: 1, pid: 0, name: 'aaaa', 
        children: [
          { id: 2, pid: 1, name: 'aaaa', children: [] }
        ] 
      },
      { id: 3, pid: 0, name: 'aaaa', children: [] }
    ]
    const { tree2array } = esUtil
    it('should return an array without children', function () {
      expect(tree2array(treeArr)).toStrictEqual([{ id: 1, pid: 0, name: 'aaaa' }, { id: 2, pid: 1, name: 'aaaa' }, { id: 3, pid: 0, name: 'aaaa' }])
    })
    it('should return an object when options.returnObject is `true`', function () {
      expect(tree2array(treeArr, { returnObject: true })).toStrictEqual({'1': { id: 1, pid: 0, name: 'aaaa' }, '2': { id: 2, pid: 1, name: 'aaaa' }, '3':  { id: 3, pid: 0, name: 'aaaa' }})
    })
  })
  
})

describe('#validate', function () {
  describe('#ChinaIdCardValid', function () {
    const { ChinaIdCardValid } = esUtil
    it('should return `true` if the chinese IDcard is valid', function () {
      expect(ChinaIdCardValid('110101199003071532')).toBe(true)
    })
    it('should return `false` if the chinese IDcard is invalid', function () {
      expect(ChinaIdCardValid('110101199003071533')).toBe(false)
    })
  })

  describe('#formulaValidate', function () {
    const { formulaValidate } = esUtil
    it('should return `true` if the formula string is valid', function () {
      expect(formulaValidate('A+B-D*(A/E)')).toBe(true)
    })
    it('should return `false` if the formula string is invalid', function () {
      expect(formulaValidate('A+B-*D*(A/E)')).toBe(false)
    })
    it('should return `false` if the formula string contain variable not in offered variables', function () {
      expect(formulaValidate('A+B-*D*(A/E)', ['A', 'B'])).toBe(false)
    })
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
      expect(mapToObject(objectArray)).toStrictEqual({ a: 'b', a1: 'b1', a2: 'b2' })
    })
  })
  describe('#checkoutBy', function () {
    const { checkoutBy } = esUtil
    const { merge } = require('lodash')
    const object = {
      a: { key: 'a', name: 'afsfsdfe' },
      b: { key: 'a1', name: { a: 'afssdfsfe' } },
      c: { key: 'a2', name: 'afsfgege' }
    }
    it(`test \`checkoutBy(object, ['a', 'c'])\``, function () {
      expect(checkoutBy(object, ['a', 'c'])).toStrictEqual([{ key: 'a', name: 'afsfsdfe' }, { key: 'a2', name: 'afsfgege' }])
    })
    it(`test \`checkoutBy(object, {'a': null, 'b': { name: 'aaa' } })\``, function () {
      expect(checkoutBy(object, {'a': null, 'b': { name: 'aaa' } })).toStrictEqual([{ key: 'a', name: 'afsfsdfe' }, { key: 'a1', name: 'aaa' }])
    })
    it(`test \`checkoutBy(object, {'a': null, 'b': { name: { b: 'aaa' } } }, merge)\``, function () {
      expect(checkoutBy(object, {'a': null, 'b': { name: { b: 'aaa' } } }, merge)).toStrictEqual([{ key: 'a', name: 'afsfsdfe' }, { key: 'a1', name: { a: 'afssdfsfe', b: 'aaa' } }])
    })
  })
  describe('#pickRenameKeys', function () {
    const { pickRenameKeys } = esUtil
    const object = {
      a: { name: 'afsfsdfe' },
      b: 3,
      c: [123],
      d: 'aaa'
    }
    it('should return an object which keys are new keys and values are old keys values', function () {
      expect(pickRenameKeys(object, { 'a': 'a1', 'c': 'c3', 'd': 'd' })).toStrictEqual({ a1: { name: 'afsfsdfe' }, c3: [123], d: 'aaa' })
    })
  })
})

describe('#value-string-switch', function () {
  describe('#byte-string', function () {
    describe('#byteStringify', function () {
      const { byteStringify } = esUtil
      it('should return `1.2 KB` if run byteStringify(1234)', function () {
        expect(byteStringify(1234)).toBe('1.2 KB')
      })
      it('should return `-1.20 KB` if run byteStringify(-1234, { precision: 2 })', function () {
        expect(byteStringify(-1234, { precision: 2 })).toBe('-1.21 KB')
      })
      it('should return `0.001 MB` if run byteStringify(1234, { unitLvl: \'M\', precision: 3 })', function () {
        expect(byteStringify(1234, { unitLvl: 'M', precision: 3 })).toBe('0.001 MB')
      })
      it('should return an object `{ value: \'1.234\', unit: \'KB\'}` if run byteStringify(1234, { detail: true, standard: \'metric\', precision: 3 })', function () {
        expect(byteStringify(1234, { detail: true, standard: 'metric', precision: 3 })).toStrictEqual({ value: '1.234', unit: 'kB' })
      })
      
    })
    
  })
})

describe('#promise', function () {
  describe('#awaitWrapper', function () {
    const { awaitWrapper } = esUtil
    it('should return [null, data] when promise resolved', async function () {
      const result = await awaitWrapper(Promise.resolve(1));
      expect(result).toStrictEqual([null, 1])
    })
    it('should return [err, undefined] when promise reject or has error', async function() {
      const result = await awaitWrapper(Promise.reject(1));
      expect(result).toStrictEqual([1, undefined])
    });
  })

  describe('#wp', function () {
    const { wp } = esUtil
    it('should lock inner value when run in global env', function () {
      const promise = wp(Promise.resolve(1))
      promise.lock('loading').finally(() => {
        expect(promise.__lockValue).toBe(false)
      });
      expect(promise.__lockValue).toBe(true)
      return promise
    })
    it('should return [null, data] when option wrap is true', async function() {
      const result = await wp(Promise.resolve(1), true);
      expect(result).toStrictEqual([null, 1])
    });
  })

})