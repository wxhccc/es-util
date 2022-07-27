import { AnyObject } from './types'
import { isArr, isObj } from './utils'

/**
 * translate object array to key-value map object
 *
 * @param {Object[]} objectArray
 * @param {string} keyProp
 * @param {string} valueProp
 */
interface PropHandler {
  (item: any, index: number): string
}
export function mapToObject(
  objectArray: AnyObject[],
  keyProp: string | PropHandler = 'key',
  valueProp: string | PropHandler = 'value'
) {
  const result: Record<string, string | number> = {}
  isArr(objectArray) &&
    keyProp &&
    valueProp &&
    [keyProp, valueProp].every((val) =>
      ['string', 'function'].includes(typeof val)
    ) &&
    objectArray.forEach((item, index) => {
      const key =
        typeof keyProp === 'string' ? item[keyProp] : keyProp(item, index)
      const value =
        typeof valueProp === 'string' ? item[valueProp] : valueProp(item, index)
      ;['string', 'number'].includes(typeof key) && (result[key] = value)
    })
  return result
}

type MergeFn = <T>(...args: T[]) => T

/**
 * checkout values form object as an array
 * 从对象中挑选指定的值并以数组形式返回，必要时可使用自定义属性覆盖选中对象
 * @param {Object} object
 * @param {string[] | Object} keys
 * @param {string} valueProp
 */
export function checkoutBy<
  T extends AnyObject = AnyObject,
  K extends string & keyof T = Extract<keyof T, 'string'>
>(object: T, keys?: K[] | Record<string, any>, mergeFn?: MergeFn) {
  if (!isObj(object)) {
    return []
  }
  if (isArr(keys)) {
    return keys.map((key) => object[key])
  } else if (keys && isObj(keys)) {
    return Object.keys(keys).map((key) => {
      const value = keys[key]
      return isObj(object[key]) && isObj(value)
        ? mergeFn
          ? mergeFn({}, object[key], value)
          : Object.assign({}, object[key], value)
        : value || object[key]
    })
  }
  return Object.values(object)
}
/**
 * pick and rename object values
 *
 * @param {Object} object
 * @param {Object} keysMap
 */

export function pickRenameKeys(
  object: AnyObject,
  keysMap: { [key: string]: string }
) {
  if (!object || !isObj(object) || !keysMap || !isObj(keysMap)) {
    return
  }
  const result: AnyObject = {}
  for (const i in object) {
    i in keysMap && (result[keysMap[i]] = object[i])
  }
  return result
}
