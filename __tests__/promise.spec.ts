/* eslint-env node, jest */
import { awaitWrapper, wp } from '../src'

describe('#awaitWrapper', () => {
  it('should return [null, data] when promise resolved', async () => {
    const result = await awaitWrapper(Promise.resolve(1))
    expect(result).toStrictEqual([null, 1])
  })
  it('should return [err, undefined] when promise reject or has error', async () => {
    const result = await awaitWrapper(Promise.reject(1))
    expect(result).toStrictEqual([1, undefined])
  })
})

interface Ref<T> {
  value: T
}

describe('#wp', () => {
  it('should call method twice if lock is function', () => {
    const lock = jest.fn()
    const promise = wp(Promise.resolve(1), { lock })
    expect(lock).toBeCalledWith(true)
    promise.finally(() => {
      expect(lock).toBeCalledWith(false)
    })
    return promise
  })
  it('should switch lockRefHandle value if lock is lockRefHandle', () => {
    const loading: Record<string, boolean> = { value: false }
    const promise = wp(Promise.resolve(1), { lock: [loading, 'value'] })
    expect(loading.value).toBe(true)
    promise.finally(() => {
      expect(loading.value).toBe(false)
    })
    return promise
  })
  it('test special types such as Ref for lockRefHandle', () => {
    const loading: Ref<boolean> = { value: false }
    const promise = wp(Promise.resolve(1), { lock: [loading, 'value'] })
    expect(loading.value).toBe(true)
    promise.finally(() => {
      expect(loading.value).toBe(false)
    })
    return promise
  })
  it('should return [null, data] when option wrap is true', async () => {
    const result = await wp(Promise.resolve(1), { wrap: true })
    expect(result).toStrictEqual([null, 1])
  })
  it('if offer an function to return promise, lock can prevent next call before last promise settled', async () => {
    const fn = jest.fn()
    const asyncMethod = () => Promise.resolve(1)
    const loading = { value: false }
    await Promise.all([
      wp(asyncMethod, { lock: [loading, 'value'] }).then(fn),
      wp(asyncMethod, { lock: [loading, 'value'] }).then(fn)
    ])
    expect(fn).toHaveBeenNthCalledWith(1, 1)
    expect(fn).toHaveBeenNthCalledWith(2, undefined)
  })
  it('test all options', async () => {
    const lock = jest.fn()
    const loading = { value: false }
    const promsie = wp(Promise.resolve(1), {
      wrap: true,
      lock,
      syncRefHandle: [loading, 'value']
    })
    expect(loading.value).toBe(true)
    expect(lock).toBeCalledWith(true)
    const result = await promsie
    expect(loading.value).toBe(false)
    expect(lock).toBeCalledWith(false)
    expect(result).toStrictEqual([null, 1])
  })
})
