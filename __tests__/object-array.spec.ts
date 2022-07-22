/* eslint-env node, jest */
import { merge } from 'lodash'
import { mapToObject, checkoutBy, pickRenameKeys } from '../src'

describe('#mapToObject', function () {
  const objectArray = [
    { key: 'a', value: 'b', name: 'afsfsdfe' },
    { key: 'a1', value: 'b1', name: 'afssdfsfe' },
    { key: 'a2', value: 'b2', name: 'afsfgege' }
  ]
  it('should return an object which key and value come from the provide object array', function () {
    expect(mapToObject(objectArray)).toStrictEqual({
      a: 'b',
      a1: 'b1',
      a2: 'b2'
    })
  })
})
describe('#checkoutBy', function () {
  const object = {
    a: { key: 'a', name: 'afsfsdfe' },
    b: { key: 'a1', name: { a: 'afssdfsfe' } },
    c: { key: 'a2', name: 'afsfgege' }
  }
  it(`test \`checkoutBy(object, ['a', 'c'])\``, function () {
    expect(checkoutBy(object, ['a', 'c'])).toStrictEqual([
      { key: 'a', name: 'afsfsdfe' },
      { key: 'a2', name: 'afsfgege' }
    ])
  })
  it(`test \`checkoutBy(object, {'a': null, 'b': { name: 'aaa' } })\``, function () {
    expect(checkoutBy(object, { a: null, b: { name: 'aaa' } })).toStrictEqual([
      { key: 'a', name: 'afsfsdfe' },
      { key: 'a1', name: 'aaa' }
    ])
  })
  it(`test \`checkoutBy(object, {'a': null, 'b': { name: { b: 'aaa' } } }, merge)\``, function () {
    expect(
      checkoutBy(object, { a: null, b: { name: { b: 'aaa' } } }, merge)
    ).toStrictEqual([
      { key: 'a', name: 'afsfsdfe' },
      { key: 'a1', name: { a: 'afssdfsfe', b: 'aaa' } }
    ])
  })
})
describe('#pickRenameKeys', function () {
  const object = {
    a: { name: 'afsfsdfe' },
    b: 3,
    c: [123],
    d: 'aaa'
  }
  it('should return an object which keys are new keys and values are old keys values', function () {
    expect(pickRenameKeys(object, { a: 'a1', c: 'c3', d: 'd' })).toStrictEqual({
      a1: { name: 'afsfsdfe' },
      c3: [123],
      d: 'aaa'
    })
  })
})
