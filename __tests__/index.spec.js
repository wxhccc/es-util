/* eslint-env node, jest */
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
  describe('#mask-data', function () {
    describe('#maskData', function () {
      const { maskData } = esUtil
      it(`should return '*********' if run maskData('123456789')`, function () {
        expect(maskData('123456789')).toBe('*********')
      })
      it(`should return '123******' if run maskData('123456789', { startCharIndex: 3 })`, function () {
        expect(maskData('123456789', { startCharIndex: 3 })).toBe('123******')
      })
      it(`should return '123***789' if run maskData('123456789', { startCharIndex: 3, endCharIndex: 5 })`, function () {
        expect(maskData('123456789', { startCharIndex: 3, endCharIndex: 5 })).toBe('123***789')
      })
      it(`should return '1234567**' if run maskData('123456789', { startCharIndex: -2 })`, function () {
        expect(maskData('123456789', { startCharIndex: -2 })).toBe('1234567**')
      })
      it(`should return '123***789' if run maskData('123456789', { startCharIndex: -5, endCharIndex: -3 })`, function () {
        expect(maskData('123456789', { startCharIndex: -6, endCharIndex: -4 })).toBe('123***789')
      })
      it(`should return 'ab****34@sine.com' if run maskData('abcd1234@sine.com', { startCharIndex: 2, endCharIndex: -3, endUntil: '@' })`, function () {
        expect(maskData('abcd1234@sine.com', { startCharIndex: 2, endCharIndex: -3, endUntil: '@' })).toBe('ab****34@sine.com')
      })
      it(`should return '138****8888' if run maskData('13888888888', { mode: 'telphone' })`, function () {
        expect(maskData('13888888888', { mode: 'telphone' })).toBe('138****8888')
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
      const promise = wp(Promise.resolve(1), { lock: 'loading' })
      promise.finally(() => {
        expect(promise.__lockValue).toBe(false)
      });
      expect(promise.__lockValue).toBe(true)
      return promise
    })
    it('the _checkLockKey methods can check inner global keys', function () {
      const promise = wp(Promise.resolve(1), { lock: 'loading' })
      promise.finally(() => {
        expect(wp._checkLockKey('loading')).toBe(false)
      });
      expect(wp._checkLockKey('loading')).toBe(true)
      return promise
    })
    it('should return [null, data] when option wrap is true', async function() {
      const result = await wp(Promise.resolve(1), true);
      expect(result).toStrictEqual([null, 1])
    });
    it('if offer an function, lock can prevent next call before last promise settled', async function() {
      const fn = jest.fn()
      const asyncMethod = () => Promise.resolve(1)
      await Promise.all([
        wp(asyncMethod, { lock: 'loading' }).then(fn),
        wp(asyncMethod, { lock: 'loading' }).then(fn)
      ])
      expect(fn).toHaveBeenCalledTimes(1)
    });
    it('test manual unlock', async function() {
      const promsie = wp(Promise.resolve(1), { lock: 'loading', manualUnlock: true });
      expect(promsie.__lockValue).toBe(true)
      await promsie
      expect(promsie.__lockValue).toBe(true)
      promsie.unlock()
      expect(promsie.__lockValue).toBe(false)
    });
  })

})

describe('#optional', function () {
  describe('#safeJsonParse', function () {
    const { safeJsonParse } = esUtil
    it(`should return an { a: 1 } when pass '{"a":1}'`, function () {
      expect(safeJsonParse('{"a":1}')).toStrictEqual({ a: 1 })
    })
    it(`should return undefined when pass invalid str`, function () {
      expect(safeJsonParse('asdfdf')).toBe(undefined)
    })
    it(`should return {} when pass invalid str and faileValue`, function () {
      expect(safeJsonParse('asdfdf', {})).toStrictEqual({})
    })
  })

  describe('#isNullable', function () {
    const { isNullable } = esUtil
    it(`should return true when pass '' or null or undefined`, function () {
      expect(isNullable()).toBe(true)
      expect(isNullable(null)).toBe(true)
      expect(isNullable('')).toBe(true)
    })
    it(`should return false when pass something else`, function () {
      expect(isNullable(0)).toBe(false)
      expect(isNullable('foo')).toBe(false)
    })
  })

  describe('#filterNullable', function () {
    const { filterNullable } = esUtil
    it(`should return { a: 1 } when pass { a: 1, b: null, c: undefined }`, function () {
      expect(filterNullable({ a: 1, b: null, c: undefined })).toStrictEqual({ a: 1 })
    })
    it(`should return { a: { b: 1 } } when pass { a: { b: 1, c: undefined }, b: null } and set deep true`, function () {
      expect(filterNullable({ a: { b: 1, c: undefined }, b: null }, true)).toStrictEqual({ a: { b: 1 } })
    })
  })

  describe('#switchNullToUndefined', function () {
    const { switchNullToUndefined } = esUtil
    it(`should return { a: 1, b: undefined } when pass { a: 1, b: null }`, function () {
      expect(switchNullToUndefined({ a: 1, b: null })).toStrictEqual({ a: 1, b: undefined })
    })
  })

  describe('#formParamsSwitch', function () {
    const { formParamsSwitch } = esUtil
    it(`should return { start: '2021-12-28', end: '2021-12-30', areaId: 12, groupIds: '1,2,3,4' } when pass { dateRange: ['2021-12-28', '2021-12-30'], areaId: [1, 6, 12], groupIds: [1, 2, 3, 4] } as data and { dateRange: ['start', 'end'], areaId: 'pop', groupIds: 'join' } as switch maps`, function () {
      expect(formParamsSwitch({ dateRange: ['2021-12-28', '2021-12-30'], areaId: [1, 6, 12], groupIds: [1, 2, 3, 4] }, { dateRange: ['start', 'end'], areaId: 'pop', groupIds: 'join' })).toStrictEqual({ start: '2021-12-28', end: '2021-12-30', areaId: 12, groupIds: '1,2,3,4' })
    })

    it(`should return { start: '2021-12-28', end: '2021-12-30' } when pass { dateRange: [new Date('2021-12-28'), new Date('2021-12-30')] } as data and { dateRange: ['start', 'end', 'YYYY-MM-DD'] } as switch maps, and set dateFormat method`, function () {
      const dateFormat = (date, format) => {
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${date.getFullYear()}-${month >= 10 ? month : `0${month}`}-${day >= 10 ? day : `0${day}`}`
      }
      expect(formParamsSwitch({ dateRange: [new Date('2021-12-28'), new Date('2021-12-30')] }, { dateRange: ['start', 'end', 'YYYY-MM-DD'] }, { dateFormat })).toStrictEqual({ start: '2021-12-28', end: '2021-12-30' })
    })
  })

})

describe('#event-target-emitter', function () {
  const { eventTargetEmitter, NOMETHOD } = esUtil
  it('should return an instance contain on, off, and so on', function () {
    const instance = eventTargetEmitter()
    expect(instance).toHaveProperty('on')
    expect(instance).toHaveProperty('off')
  })
  it('method `on` can add listeners to watchers', function () {
    const { on, getListeners } = eventTargetEmitter()
    expect(getListeners('test')).toHaveLength(0)
    on('test', jest.fn())
    expect(getListeners('test')).toHaveLength(1)
  })
  it('add NOMETHOD listeners to watchers', function () {
    const { on, getListeners } = eventTargetEmitter()
    expect(getListeners(NOMETHOD)).toHaveLength(0)
    on(NOMETHOD, jest.fn())
    expect(getListeners(NOMETHOD)).toHaveLength(1)
  })
  it('same listeners can only be add by once', function () {
    const { on, getListeners } = eventTargetEmitter()
    expect(getListeners('test')).toHaveLength(0)
    const fn = jest.fn()
    on('test', fn)
    on('test', fn)
    expect(getListeners('test')).toHaveLength(1)
  })
  it('listeners can be remove by method `off`', function () {
    const { on, off, getListeners } = eventTargetEmitter()
    expect(getListeners('test')).toHaveLength(0)
    const fn = jest.fn()
    on('test', fn)
    expect(getListeners('test')).toHaveLength(1)
    off('test', fn)
    expect(getListeners('test')).toHaveLength(0)
  })
  it('listener bind fromLimit or namespace is not same witch bind nothing', function () {
    const { on, getListeners } = eventTargetEmitter()
    expect(getListeners('test')).toHaveLength(0)
    const fn = jest.fn()
    on('test', fn)
    on('test', fn, { namespace: 'ns1' })
    expect(getListeners('test')).toHaveLength(1)
    expect(getListeners('test', { namespace: 'ns1' })).toHaveLength(1)
  })

  it('listener will trigger when run emit', function () {
    const { on, emit } = eventTargetEmitter()
    const fn = jest.fn()
    on('test', fn)
    emit('test', 111)
    expect(fn).toBeCalledWith(111)
  })
  
  it('listener bind fromLimit or namespace will trigger too when method is same', function () {
    const { on, emit } = eventTargetEmitter()
    const fn = jest.fn()
    on('test', fn, { namespace: 'ns1' })
    emit('test', 111)
    expect(fn).toBeCalledWith(111)
  })
})