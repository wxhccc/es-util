/*!
  * @wxhccc/es-util v1.2.0
  * (c) 2021 wxhccc
  * @license MIT
  */
function mapToObject(objectArray, keyProp = 'key', valueProp = 'value') {
    let result = {};
    Array.isArray(objectArray) && keyProp && valueProp
        && [keyProp, valueProp].every(val => ['string', 'function'].includes(typeof val))
        && objectArray.forEach((item, index) => {
            const key = typeof keyProp === 'string' ? item[keyProp] : keyProp(item, index);
            const value = typeof valueProp === 'string' ? item[valueProp] : valueProp(item, index);
            ['string', 'number'].includes(typeof key) && (result[key] = value);
        });
    return result;
}
function checkoutBy(object, keys, mergeFn) {
    if (!(object instanceof Object))
        return [];
    if (Array.isArray(keys)) {
        return keys.map(item => (object[item]));
    }
    else if (keys && keys instanceof Object) {
        return Object.keys(keys).map(item => (object[item] instanceof Object && keys[item] instanceof Object)
            ? (mergeFn ? mergeFn({}, object[item], keys[item]) : Object.assign({}, object[item], keys[item]))
            : (keys[item] || object[item]));
    }
    return Object.values(object);
}
/**
 * pick and rename object values
 *
 * @param {Object} object
 * @param {Object} keysMap
 */
function pickRenameKeys(object, keysMap) {
    if (!object || !(object instanceof Object) || !keysMap || !(keysMap instanceof Object))
        return;
    let result = {};
    for (let i in object) {
        (i in keysMap) && (result[keysMap[i]] = object[i]);
    }
    return result;
}

export { checkoutBy, mapToObject, pickRenameKeys };
