type Obj = { [key: string]: any };
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
export function mapToObject (objectArray: any[], keyProp: string | PropHandler = 'key', valueProp: string | PropHandler = 'value') {
  let result: Obj = {};
  Array.isArray(objectArray) && keyProp && valueProp
    && [keyProp, valueProp].every(val => ['string', 'function'].includes(typeof val)) 
    && objectArray.forEach((item, index) => {
      const key = typeof keyProp === 'string' ? item[keyProp] : keyProp(item, index)
      const value = typeof valueProp === 'string' ? item[valueProp] : valueProp(item, index)
      ;['string', 'number'].includes(typeof key) && (result[key] = value)
    });
  return result
}

/**
 * checkout values form object as an array
 * 
 * @param {Object} object
 * @param {string[] | Object} keys
 * @param {string} valueProp
 */
type MergeFn = <T>(...args: T[]) => T

export function checkoutBy (object: Obj, keys?: string[] | Obj, mergeFn?: MergeFn) {
  if (!(object instanceof Object)) return [];
  if (Array.isArray(keys)) {
    return keys.map(item => ((<Obj>object)[item]));
  } else if (keys && keys instanceof Object) {
    return Object.keys(keys).map(item => 
      ((<Obj>object)[item] instanceof Object && (<Obj>keys)[item] instanceof Object)
        ? (mergeFn ? mergeFn({}, (<Obj>object)[item], (<Obj>keys)[item]) : Object.assign({}, (<Obj>object)[item], (<Obj>keys)[item]))
        : ((<Obj>keys)[item] || (<Obj>object)[item])
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

export function pickRenameKeys (object: Obj, keysMap: { [key: string]: string }) {
  if (!object || !(object instanceof Object) || !keysMap || !(keysMap instanceof Object)) return;
  let result: Obj = {};
  for (let i in object) {
    (i in keysMap) && (result[keysMap[i]] = (<Obj>object)[i]);
  }
  return result;
}