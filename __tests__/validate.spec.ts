/* eslint-env node, jest */
import { ChinaIdCardValid, formulaValidate } from '../src'

describe('#ChinaIdCardValid', function () {
  it('should return `true` if the chinese IDcard is valid', function () {
    expect(ChinaIdCardValid('110101199003071532')).toBe(true)
  })
  it('should return `false` if the chinese IDcard is invalid', function () {
    expect(ChinaIdCardValid('110101199003071533')).toBe(false)
  })
})

describe('#formulaValidate', function () {
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
