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
export async function awaitWrapper<T, K = Error> (promise: Promise<T>) {
  try {
    const data: T = await promise;
    return [null, data] as [null, T];
  } catch (err) {
    return [err as K, undefined] as [K, undefined];
  }
}

export type SyncRefHandle = [Record<string, boolean>, string]
export type LockSwitchHook = (val: boolean) => unknown

export interface LockMethod<T> {
  (key: string): Promise<T>
  (syncRefHandle: SyncRefHandle): Promise<T>
  (
    switchHook: LockSwitchHook,
    syncRefHandle?: [Record<string, boolean>, string]
  ): Promise<T>
}

export interface PromiseWithLock<T> extends Promise<T> {
  readonly __lockValue: boolean
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

export function wp<T>(this: any, promise: Promise<T> | (() => Promise<T>), wrap?: boolean) {

  const contextType = checkContext(this)
  const isReactiveIns = contextType !== 'unknown'
  const context = isReactiveIns ? this : lockCtx
  const stateKey = contextType === 'react' ? 'state' : ''
  const contextState = stateKey ? context[stateKey] : context

  const has = (val: unknown, key: string) => !!val && hasOwnProperty.call(val, key)
  const isObj = (obj: unknown) => objType(obj) === 'Object'

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
      const keyExist = has(curObj, key)
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

  const getValue = (obj: any, path: string[]) => {
    // use refHandle if contextState not update sync
    if (lockRefHandle) return lockRefHandle[0][lockRefHandle[1]]
    let result = false
    if (obj && isObj(obj) && Array.isArray(path)) {
      let curObj = obj
      for (let i = 0; i < path.length; i++) {
        const key = path[i]
        if (typeof curObj !== 'object' || !has(curObj, key)) {
          break
        }
        curObj = curObj[key]
        i === path.length - 1 &&
          (result = typeof curObj === 'boolean' ? curObj : false)
      }
    }
    return result
  }

  const stateLock = (bool: boolean) => {
    if (lockKey.length) return setValue<boolean>(contextState, lockKey, bool)
    if (lockRefHandle) lockRefHandle[0][lockRefHandle[1]] = bool
    if (lockSwitchHook) lockSwitchHook(bool)
  }

  const checkLock = () => getValue(contextState, lockKey)

  let lockSwitchHook: LockSwitchHook
  let lockRefHandle: SyncRefHandle
  let lockKey: string[] = []
  let corePromsie: Promise<T | undefined> | Promise<[null, T] | [Error, undefined]>
  if (typeof promise === 'function') {
    corePromsie = checkLock() ? Promise.reject<T>(new Error('you can\'t recall promise method when it\'s locking')).catch(() => undefined) : wrap ? awaitWrapper<T>(promise()) : promise()
  } else {
    corePromsie = wrap ? awaitWrapper<T>(promise) : promise
  }
  Object.defineProperties(corePromsie, {
    __lockValue: { get: checkLock },
    lock: {
      value: <HT extends LockSwitchHook>(
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
        stateLock(true)
        return corePromsie
      }
    }
  });
  
  corePromsie.finally(() => stateLock(false))
  return corePromsie as PromiseWithLock<T | [null, T] | [Error, undefined]>
}

export const wpVuePlugin = {
  install(appOrVue: any) {
    if (appOrVue.config && 'globalProperties' in appOrVue.config) {
      appOrVue.config.globalProperties.$wp = wp
    } else {
      appOrVue.prototype.$wp = wp
    }
  }
}