const { hasOwnProperty, toString } = Object.prototype

export const objType = (val: unknown) => {
  const typeKeys = toString.call(val).match(/^\[object (.*)\]$/)
  return typeKeys ? typeKeys[1] : ''
}
/**
 * wrap promise and handle reject or err by return an array like [error, undefined]
 * @param promise promise
 * @returns Promise<[K, undefined] | [null, T]>
 */
export async function awaitWrapper<T, K = Error> (promise: Promise<T>): Promise<[K, undefined] | [null, T]> {
  try {
    const data: T = await promise;
    return [null, data];
  } catch (err) {
    return [err as K, undefined];
  }
}

export type SyncRefHandle = [Record<string, boolean>, string]
export type LockSwitchHook = (val: boolean) => unknown

export interface LockMethod<T> {
  (key: string): PromiseWithLock<T>
  (syncRefHandle: SyncRefHandle): PromiseWithLock<T>
  (
    switchHook: LockSwitchHook,
    syncRefHandle?: [Record<string, boolean>, string]
  ): PromiseWithLock<T>
}

export interface PromiseWithLock<T> extends Promise<T> {
  lock: LockMethod<T>
}

export type ContextType = 'react' | 'vue' | 'unknown'

function checkContext(context?: any): ContextType {
  if (!context) return 'unknown'
  if (context._isVue || (context.$ && context.$.vnode)) {
    return 'vue'
  } else if ('setState' in context) {
    return 'react'
  }
  return 'unknown'
}
/**
 * wrap promise with lock, support reactive environment like react or vue
 * @param promise promise
 * @param wrap whether use awaitWrap to wrap result
 */
const lockCtx = {}
export function wpl<T>(this: any, promise: Promise<T>, wrap?: boolean) {

  const contextType = checkContext(this)
  const isReactiveIns = contextType !== 'unknown'
  const context = isReactiveIns ? this : lockCtx
  const stateKey = isReactiveIns ? contextType === 'react' ? 'state' : '' : '$_ES_UTILS_KEYS'
  const contextState = stateKey ? context[stateKey] : context

  const has = (val: unknown, key: string) => hasOwnProperty.call(val, key)
  const isObj = (obj: unknown) => toString.call(obj) === '[object Object]'

  const setValue = <T>(obj: any, path: string[], value: T) => {
    // if vue2 and path[0] not defined, do nothing
    if (contextType === 'vue' && context.$set && !has(obj, path[0])) return

    const { $set = (o: any, key: string, val: unknown) => { o[key] = val } } = context
    const isStateRect = contextType === 'react'
    const originObj = isStateRect ? { ...obj } : obj
    let curObj = originObj
    let canSet = false
    for (let i = 0; i < path.length; i++) {
      const key = path[i]
      const keyExist = hasOwnProperty.call(curObj, key)
      if (i === path.length - 1) {
        const isBool = typeof curObj[key] === 'boolean'
        canSet = !keyExist || isBool
        canSet && $set(curObj, key, value)
      } else {
        !keyExist && $set(curObj, key, {})
        if (!isObj(curObj[key])) break
        isStateRect && (curObj[key] = { ...curObj[key] })
        curObj = curObj[key]
      }
    }
    // trigger setState when run in react class component
    isStateRect && canSet && context.setState({ [path[0]]: originObj[path[0]] })
  }

  const stateLock = (bool: boolean) => {
    if (lockKey.length) return setValue<boolean>(contextState, lockKey, bool)
    if (lockRefHandle) lockRefHandle[0][lockRefHandle[1]] = bool
    if (lockSwitchHook) lockSwitchHook(bool)
  }

  let lockSwitchHook: LockSwitchHook
  let lockRefHandle: SyncRefHandle
  let lockKey: string[] = []

  const proxyPromise: PromiseWithLock<T> = Object.assign(promise, {
    lock: <HT extends LockSwitchHook>(
      keyOrHookOrHandle: string | HT | SyncRefHandle,
      syncRefHandle?: SyncRefHandle
    ) => {
      const isRefHandle = (val: unknown): val is SyncRefHandle =>
        Array.isArray(val) && val.length === 2
      if (typeof keyOrHookOrHandle === 'string') {
        lockKey = keyOrHookOrHandle.split('.')
      } else if (isRefHandle(keyOrHookOrHandle)) {
        lockRefHandle = keyOrHookOrHandle
      } else if (typeof keyOrHookOrHandle === 'function') {
        lockSwitchHook = keyOrHookOrHandle
        if (isRefHandle(syncRefHandle)) {
          lockRefHandle = syncRefHandle
        }
      }
      return proxyPromise
    }
  })
  stateLock(true)
  proxyPromise.finally(() => stateLock(false))
  return wrap ? proxyPromise : awaitWrapper(proxyPromise)
}