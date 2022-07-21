/* eslint-env node, jest */
import * as esUtil from '../'

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
