import { isArr, isFn } from './utils'

/**
 * wrap promise and handle reject or err by return an array like [error, undefined]
 * @param promise promise
 * @returns Promise<[K, undefined] | [null, T]>
 */
export async function awaitWrapper<T, K = Error>(promise: Promise<T>) {
  try {
    const data: T = await promise
    return [null, data] as [null, T]
  } catch (err) {
    return [err as K, undefined] as [K, undefined]
  }
}
export type BoolRef = { [key: string]: boolean }
/** 防止多次promise函数运行控制器，对于响应式系统，可以同时用作BoolSwitch */
export type LockRefHandle<T = BoolRef> = [T, keyof T]
/** loading等状态的切换函数 */
export type BoolSwitch = (val: boolean) => unknown

/**
 * wrap promise with lock, support reactive environment like react or vue
 * @param promise promise
 * @param wrap whether use awaitWrap to wrap result
 */

export interface WpOptions<R = BoolRef> {
  /** whether use `awaitWrapper` to wrap then promise. */
  wrap?: boolean
  /** useful in Hook / Composition Api, you can pass setXXX to method */
  lock?: BoolSwitch | LockRefHandle<R>
  /** when you need function and syncRefHandle at sametime, in react hooks */
  syncRefHandle?: LockRefHandle<R>
}

type WpReturn<T> = Promise<T | undefined>
type WpArrReturn<T> = Promise<[null, T] | [Error, undefined]>
type WpMayLockArrReturn<T> = Promise<[null, T] | [Error, undefined]>
type WpPromise<T> = Promise<T> | (() => Promise<T>)

function wrapPromise<T, R = BoolRef>(
  promise: WpPromise<T>,
  options?: WpOptions<R> & { wrap?: false }
): WpReturn<T>
function wrapPromise<T, R = BoolRef>(
  promise: Promise<T>,
  options?: WpOptions<R> & { wrap: true }
): WpArrReturn<T>
function wrapPromise<T, R = BoolRef>(
  promise: () => Promise<T>,
  options?: WpOptions<R> & { wrap: true }
): WpMayLockArrReturn<T>
function wrapPromise<T, R = BoolRef>(
  promise: WpPromise<T>,
  options?: WpOptions<R>
) {
  const { wrap, lock, syncRefHandle }: WpOptions<R> = { ...options }

  let lockSwitchHook: BoolSwitch | undefined = undefined
  let lockRefHandle: LockRefHandle | undefined = undefined
  let needLock = false
  let isLocking = false

  const stateLock = (bool: boolean) => {
    if (lockRefHandle) {
      const [ref, key] = lockRefHandle
      ref[key] = bool
    }
    if (lockSwitchHook) {
      lockSwitchHook(bool)
    }
  }
  const checkLock = () => {
    // use refHandle if state not update sync
    return lockRefHandle ? !!lockRefHandle[0][lockRefHandle[1]] : false
  }
  if (lock) {
    const isRefHandle = (val: unknown): val is LockRefHandle =>
      isArr(val) && val.length === 2
    if (isRefHandle(lock)) {
      lockRefHandle = lock
    } else if (isFn(lock)) {
      lockSwitchHook = lock
      if (isRefHandle(syncRefHandle)) {
        lockRefHandle = syncRefHandle
      }
    }
    needLock = !!(lockSwitchHook || lockRefHandle)
    needLock && (isLocking = checkLock())
  }

  let corePromsie:
    | Promise<T | undefined>
    | Promise<[null, T | undefined] | [Error, undefined]>

  // if promise is a function, here need to call it in promise.then to use locking check to prevent next call
  if (isFn(promise)) {
    const truePromise = isLocking ? Promise.resolve(undefined) : promise()
    corePromsie = wrap ? awaitWrapper<T | undefined>(truePromise) : truePromise
  } else {
    corePromsie = wrap ? awaitWrapper<T>(promise) : promise
  }

  if (corePromsie instanceof Promise && needLock && !isLocking) {
    stateLock(true)
    corePromsie.finally(() => stateLock(false))
  }

  return corePromsie
}

/** short for method `wrapPromise` */
export const wp = wrapPromise
