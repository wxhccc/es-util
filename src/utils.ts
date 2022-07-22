import { AnyFunction, AnyObject } from './types'

const { hasOwnProperty, toString } = Object.prototype

export const objForEch = <
  T extends { [key: string]: any },
  K extends string = Extract<keyof T, 'string'>
>(
  obj: T,
  callbackfn: (key: K, value: T[K], index: number) => void
) => {
  ;(Object.keys(obj) as K[]).forEach((key, index) =>
    callbackfn(key, obj[key], index)
  )
}

export const isFn = (fn: unknown): fn is AnyFunction => typeof fn === 'function'

export const isArr = Array.isArray

export const objToString = (obj: unknown) => toString.call(obj)

export const objType = (val: unknown) => {
  const typeKeys = objToString(val).match(/^\[object (.*)\]$/)
  return typeKeys ? typeKeys[1] : ''
}

export const isObj = (obj: unknown): obj is AnyObject =>
  objType(obj) === 'Object'

export const hasOwnProp = (obj: AnyObject, v: PropertyKey) =>
  hasOwnProperty.call(obj, v)
