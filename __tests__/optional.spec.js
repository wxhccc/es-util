/* eslint-env node, jest */
import * as esUtil from '../dist'

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
