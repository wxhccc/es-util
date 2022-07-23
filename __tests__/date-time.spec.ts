/* eslint-env node, jest */
import { secondsToDuration } from '../src'

describe('#secondsToDuration', function () {
  it('should return {h: 3429, m: 21, s: 18} if run secondsToDuration(12345678)', function () {
    expect(secondsToDuration(12345678)).toStrictEqual({ h: 3429, m: 21, s: 18 })
  })
  it(`should return { d: 142, h: 21, m: 21, s: 18 } if run secondsToDuration(12345678, 'd')`, function () {
    expect(secondsToDuration(12345678, 'd')).toStrictEqual({
      d: 142,
      h: 21,
      m: 21,
      s: 18
    })
  })
})
