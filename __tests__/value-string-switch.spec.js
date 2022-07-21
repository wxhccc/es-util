/* eslint-env node, jest */
import * as esUtil from '../dist'

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
describe('#uri-b64', function () {
  describe('#b64UriEncode', function () {
    const { b64UriEncode, b64UriDecode } = esUtil
    it(`should return \`MTIzNDU2\` if run b64UriEncode('123456')`, function () {
      expect(b64UriEncode('123456')).toBe('MTIzNDU2')
    })
    it(`should return \`123456\` if run b64UriDecode('MTIzNDU2')`, function () {
      expect(b64UriDecode('MTIzNDU2')).toBe('123456')
    })
    it(`should return \`JUUyJTk4JUI4JUUyJTk4JUI5JUUyJTk4JUJBJUUyJTk4JUJCJUUyJTk4JUJDJUUyJTk4JUJFJUUyJTk4JUJG\` if run b64UriEncode('☸☹☺☻☼☾☿')`, function () {
      expect(b64UriEncode('☸☹☺☻☼☾☿')).toBe('JUUyJTk4JUI4JUUyJTk4JUI5JUUyJTk4JUJBJUUyJTk4JUJCJUUyJTk4JUJDJUUyJTk4JUJFJUUyJTk4JUJG')
    })
    it(`should return \`☸☹☺☻☼☾☿\` if run b64UriDecode('JUUyJTk4JUI4JUUyJTk4JUI5JUUyJTk4JUJBJUUyJTk4JUJCJUUyJTk4JUJDJUUyJTk4JUJFJUUyJTk4JUJG')`, function () {
      expect(b64UriDecode('JUUyJTk4JUI4JUUyJTk4JUI5JUUyJTk4JUJBJUUyJTk4JUJCJUUyJTk4JUJDJUUyJTk4JUJFJUUyJTk4JUJG')).toBe('☸☹☺☻☼☾☿')
    })
  })
  
})
