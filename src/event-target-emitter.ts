import { AnyFunction } from './types'
import { isFn } from './utils'

export interface EventPayload<T = any> {
  /** method name to be listenered */
  method: string
  /** carry data */
  data?: T
  /** where the event emit from */
  originEmitterName?: string
  /** which emitter can recived the event */
  targetEmitterName?: string
}

export type WatchersMap = Map<string | symbol, Set<AnyFunction>>

export interface ConfigOptions {
  /** the name of current emitter */
  name?: string
  /** creator to return custom event handler */
  customHanlderCreator?: (
    watchers: WatchersMap
  ) => <T = any>(payload: EventPayload<T>) => void
}

export interface BindOptions {
  /** 限制消息来源 */
  limitFrom?: string
  /** 事件所在命名空间 */
  namespace?: string
}

const isStr = (val: unknown): val is string => typeof val === 'string'

export const NOMETHOD = Symbol('NOMETHOD')

/**
 * 创建emitter形式的实例，可以通过实例封装事件对象，比如websocket，得到一个更便捷的方法，具体可参考page-communicate.js文件内容
 * @param options 配置项
 * @returns
 */
export function eventTargetEmitter(options?: ConfigOptions) {
  const watchers: WatchersMap = new Map([[NOMETHOD, new Set()]])

  const { name: currentName, customHanlderCreator } = options || {}

  const customHanlder = isFn(customHanlderCreator)
    ? customHanlderCreator(watchers)
    : null

  const splitRegExp = /\|-[a-z]+-\|/

  const listenerSafeRun = (listener: AnyFunction, ...args: any[]) => {
    try {
      listener(...args)
    } catch (e) {
      console.error(e)
    }
  }
  const defaultHanlder = <T = any>(payload: EventPayload<T>) => {
    const {
      method,
      data,
      originEmitterName: from,
      targetEmitterName: to
    } = payload || []
    if (method && typeof method === 'string') {
      const matchListeners: AnyFunction[] = []
      watchers.forEach((value, key) => {
        if (typeof key === 'string' && key.startsWith(method)) {
          const [, eFrom] = key.split(splitRegExp)
          if (!eFrom || !from || eFrom === from) {
            matchListeners.push(...value)
          }
        }
      })
      if (
        matchListeners.length &&
        (!currentName || !to || currentName === to)
      ) {
        matchListeners.forEach((listener) => listenerSafeRun(listener, data))
      }
    }
    const noMethodListeners = watchers.get(NOMETHOD)
    if (noMethodListeners) {
      noMethodListeners.forEach((listener) =>
        listenerSafeRun(listener, data, payload)
      )
    }
  }

  const rootEventListener = isFn(customHanlder) ? customHanlder : defaultHanlder

  const getFullMethodName = (
    method: string | symbol,
    options?: BindOptions
  ) => {
    const { limitFrom = '', namespace = '' } = options || {}
    return (limitFrom || namespace) && typeof method === 'string'
      ? `${method}|-from-|${limitFrom}|-ns-|${namespace}`
      : method
  }

  const on = <T>(
    method: string | symbol,
    listener: (data: T) => any,
    options?: BindOptions
  ) => {
    if (typeof method === 'symbol' && method !== NOMETHOD) {
      return
    }
    const trueMethod = getFullMethodName(method, options)
    if (!watchers.has(trueMethod)) {
      watchers.set(trueMethod, new Set())
    }
    const listeners = watchers.get(trueMethod)
    listeners?.add(listener)
  }

  const off = (
    method: string | symbol,
    callback?: AnyFunction,
    options?: BindOptions
  ) => {
    if (typeof method === 'symbol' && method !== NOMETHOD) {
      return
    }
    const { namespace } = options || {}
    if (namespace && !method) {
      watchers.forEach((_value, key) => {
        if (typeof key === 'string' && key.endsWith(namespace)) {
          watchers.delete(key)
        }
      })
      return
    }
    const trueMethod = getFullMethodName(method, options)
    if (!callback) {
      watchers.delete(trueMethod)
      return
    }
    watchers.get(trueMethod)?.delete(callback)
  }

  const removeAllListeners = () => {
    watchers.clear()
  }

  const createPayload = (
    methodOrPayload: string | EventPayload,
    data?: any,
    target?: string
  ) => {
    return isStr(methodOrPayload)
      ? ({
          method: methodOrPayload,
          data,
          ...(target && isStr(target) ? { targetEmitterName: target } : {}),
          ...(currentName && isStr(currentName)
            ? { originEmitterName: currentName }
            : {})
        } as EventPayload)
      : methodOrPayload
  }

  const emit = (...args: Parameters<typeof createPayload>) => {
    const payload = createPayload(...args)
    rootEventListener(payload)
  }

  /** 获取当前所有监听方法的方法名，默认仅返回函数名，设置all为true可以返回具体来源限制和命名空间字段 */
  const getMethodNames: {
    (all?: false): string[]
    (all: true): string[][]
  } = (all?: boolean): any => {
    if (!all) {
      const result: string[][] = []
      watchers.forEach(
        (_v, key) => isStr(key) && result.push(key.split(splitRegExp))
      )
      return result
    }
    const result: string[] = []
    watchers.forEach((_v, key) => isStr(key) && result.push(key))
    return result
  }

  const getListeners = (method: string | symbol, options?: BindOptions) => {
    if (typeof method === 'symbol') {
      return method === NOMETHOD ? Array.from(watchers.get(NOMETHOD) || []) : []
    }
    const trueMethod = getFullMethodName(method, options)
    const listeners = watchers.get(trueMethod)
    return listeners ? Array.from(listeners) : []
  }

  return {
    name: currentName,
    rootEventListener,
    on,
    off,
    emit,
    createPayload,
    removeAllListeners,
    getMethodNames,
    getListeners
  }
}

export default eventTargetEmitter
