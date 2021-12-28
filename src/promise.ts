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

export interface PromiseWithLock<T> extends Promise<T> {
  readonly __lockValue: boolean
  unlock: () => void
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

export interface WpOptions {
  wrap?: boolean
  lock?: string | LockSwitchHook | SyncRefHandle
  syncRefHandle?: SyncRefHandle
  manualUnlock?: boolean
}

const emptyPromise = () => {
  const ep = Promise.resolve(undefined)
  return Object.assign(ep, {
    then(...args: Parameters<typeof Promise.prototype.then>) {
      const [onfulfilled] = args
      // if then has be called by Promise.all, let ite pass
      if (args.length === 2 && typeof onfulfilled === 'function') {
        return onfulfilled(undefined)
      }
      return ep
    },
    catch: (onrejected?: ((reason: any) => unknown) | null | undefined) => ep,
    finally: () => ep
  })

}
const lockCtx: Record<string, boolean> = {}

type WpReturn<T> = PromiseWithLock<T | undefined | [null, T] | [Error, undefined]>
type WpPromise<T> = Promise<T> | (() => Promise<T>)

function wrapPromise<T>(this: any, promise: WpPromise<T>, wrap?: boolean): WpReturn<T>
function wrapPromise<T>(this: any, promise: WpPromise<T>, options?: WpOptions): WpReturn<T>
function wrapPromise<T>(this: any, promise: WpPromise<T>, wrapOrOptions?: boolean | WpOptions) {
  const contextType = checkContext(this)
  const isReactiveIns = contextType !== 'unknown'
  const context = isReactiveIns ? this : lockCtx
  const stateKey = contextType === 'react' ? 'state' : ''
  const contextState = stateKey ? context[stateKey] : context
  const { wrap, lock, syncRefHandle, manualUnlock }: WpOptions = typeof wrapOrOptions === 'boolean' ? { wrap: wrapOrOptions } : { ...wrapOrOptions }

  let lockSwitchHook: LockSwitchHook | undefined = undefined
  let lockRefHandle: SyncRefHandle | undefined = undefined
  let lockKey: string[] = []
  let needLock = false
  let ignoreLock = false

  const has = (val: unknown, key: string) => !!val && hasOwnProperty.call(val, key)
  const isObj = (obj: unknown) => objType(obj) === 'Object'

  const getValue = (obj: any, path: string[]) => {
    let result = false
    if (obj && isObj(obj) && Array.isArray(path) && path.length) {
      let curObj = obj
      for (let i = 0; i < path.length; i++) {
        const key = path[i]
        if (typeof curObj !== 'object' || !has(curObj, key)) {
          break
        }
        curObj = curObj[key]
        i === path.length - 1 &&
          (result = (typeof curObj === 'boolean') ? curObj : false)
      }
    }
    return result
  }
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

  const stateLock = (bool: boolean) => {
    if (lockKey.length) {
      // if not reactive instance, save lock key as string, no need to structure nested object
      isReactiveIns ? setValue<boolean>(contextState, lockKey, bool) : (lockCtx[lock as string] = bool)
      return
    }
    if (lockRefHandle) lockRefHandle[0][lockRefHandle[1]] = bool
    if (lockSwitchHook) lockSwitchHook(bool)
  }

  const checkLock = () => {
    // use refHandle if contextState not update sync
    if (lockRefHandle) return lockRefHandle[0][lockRefHandle[1]]
    if (!isReactiveIns && typeof lock === 'string') return contextState[lock]
    return getValue(contextState, lockKey)
  }

  if (lock) {
    const isRefHandle = (val: unknown): val is SyncRefHandle =>
      Array.isArray(val) && val.length === 2
    if (typeof lock === 'string') {
      lockKey = lock.split('.')
    } else if (isRefHandle(lock)) {
      lockRefHandle = lock
    } else if (typeof lock === 'function') {
      lockSwitchHook = lock
      if (isRefHandle(syncRefHandle)) {
        lockRefHandle = syncRefHandle
      }
    }
    needLock = lockKey.length > 0 || !!lockRefHandle || !!lockSwitchHook
    needLock && (ignoreLock = checkLock())
  }

  let corePromsie: Promise<T | undefined> | Promise<[null, T] | [Error, undefined]>

  // if promise is a function, here need to call it in promise.then to use locking check to prevent next call
  if (typeof promise === 'function') {
    corePromsie = ignoreLock ? emptyPromise() : wrap ? awaitWrapper<T>(promise()) : promise()
  } else {
    corePromsie = wrap ? awaitWrapper<T>(promise) : promise
  }

  const unlock = () => stateLock(false)

  Object.defineProperties(corePromsie, {
    '__lockValue': { get: checkLock },
    unlock: { value: unlock }
  })
 
  if (needLock && !ignoreLock) {
    stateLock(true)
    !manualUnlock && corePromsie.finally(unlock)
  }

  return corePromsie as PromiseWithLock<T>
}

type WP = typeof wrapPromise & { _checkLockKey: (key: string) => boolean }

export const wp = Object.defineProperty(wrapPromise, '_checkLockKey', { value: (key: string) => lockCtx[key] }) as WP

export const wpVuePlugin = {
  install(appOrVue: any, key = '$wp') {
    if (appOrVue.config && 'globalProperties' in appOrVue.config) {
      appOrVue.config.globalProperties[key] = wp
    } else {
      appOrVue.prototype[key] = wp
    }
  }
}