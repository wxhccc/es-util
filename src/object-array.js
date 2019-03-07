// translate array to tree
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
