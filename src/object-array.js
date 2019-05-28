// translate object array to key-value map object
export function mapToObject (objectArray, keyProp = 'key', valueProp = 'value') {
  let result = {}
  Array.isArray(objectArray) && keyProp && valueProp
  && [keyProp, valueProp].every(val => ['string', 'function'].includes(typeof val)) 
  && objectArray.forEach(item => {
    const key = typeof keyProp === 'string' ? item[keyProp] : keyProp(item)
    const value = typeof valueProp === 'string' ? item[valueProp] : valueProp(item)
    key && ['string', 'number'].includes(typeof key) && (result[key] = value)
  })
  return result
}
// checkout values form object as an array
export function checkoutBy (object, keys, mergeFn) {
  if (!(object instanceof Object)) return []
  if (Array.isArray(keys)) {
    return keys.map(item => (object[item]))
  } else if (keys && keys instanceof Object) {
    return Object.keys(keys).map(item => 
      (object[item] instanceof Object && keys[item] instanceof Object)
        ? (mergeFn ? mergeFn({}, object[item], keys[item]) : Object.assign({}, object[item], keys[item]))
        : (keys[item] || object[item])
    )
  }
  return Object.values(object)
}

/*** pick and rename object values ***/
export function pickRenameKeys (object, keysMap) {
  if (!object || !(object instanceof Object) || !keysMap || !(keysMap instanceof Object)) return
  let result = {}
  for (let i in object) {
    keysMap[i] && (result[keysMap[i]] = object[i])
  }
  return result
}