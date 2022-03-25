import { AnyObject } from './types'

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
export function mapToObject (objectArray: AnyObject[], keyProp: string | PropHandler = 'key', valueProp: string | PropHandler = 'value') {
  const result: Record<string, string | number> = {};
  Array.isArray(objectArray) && keyProp && valueProp
    && [keyProp, valueProp].every(val => ['string', 'function'].includes(typeof val)) 
    && objectArray.forEach((item, index) => {
      const key = typeof keyProp === 'string' ? item[keyProp] : keyProp(item, index)
      const value = typeof valueProp === 'string' ? item[valueProp] : valueProp(item, index)
      ;['string', 'number'].includes(typeof key) && (result[key] = value)
    });
  return result
}


type MergeFn = <T>(...args: T[]) => T

const isObject = (obj: unknown): obj is AnyObject => Object.prototype.toString.call(obj) === '[object Object]'
/**
 * checkout values form object as an array
 * 
 * @param {Object} object
 * @param {string[] | Object} keys
 * @param {string} valueProp
 */
export function checkoutBy (object: AnyObject, keys?: string[] | AnyObject, mergeFn?: MergeFn) {
  if (!isObject(object)) {
    return [];
  }
  if (Array.isArray(keys)) {
    return keys.map(item => object[item]);
  } else if (keys && isObject(keys)) {
    return Object.keys(keys).map(item => 
      (isObject(object[item]) && isObject(keys[item]))
        ? (mergeFn ? mergeFn({}, (object)[item], (keys)[item]) : Object.assign({}, object[item], keys[item]))
        : (keys[item] || object[item])
    );
  }
  return Object.values(object);
}
/**
 * pick and rename object values
 * 
 * @param {Object} object
 * @param {Object} keysMap
 */

export function pickRenameKeys (object: AnyObject, keysMap: { [key: string]: string }) {
  if (!object || !isObject(object) || !keysMap || !isObject(keysMap)) {
    return;
  }
  let result: AnyObject = {};
  for (let i in object) {
    (i in keysMap) && (result[keysMap[i]] = object[i]);
  }
  return result;
}