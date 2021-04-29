/*!
  * @wxhccc/es-util v1.2.0
  * (c) 2021 wxhccc
  * @license MIT
  */
const { hasOwnProperty, toString } = Object.prototype;
const objType = (val) => {
    const typeKeys = toString.call(val).match(/^\[object (.*)\]$/);
    return typeKeys ? typeKeys[1] : '';
};
/**
 * wrap promise and handle reject or err by return an array like [error, undefined]
 * @param promise promise
 * @returns Promise<[K, undefined] | [null, T]>
 */
async function awaitWrapper(promise) {
    try {
        const data = await promise;
        return [null, data];
    }
    catch (err) {
        return [err, undefined];
    }
}
function checkContext(context) {
    if (!context)
        return 'unknown';
    if (context._isVue || (context.$ && context.$.vnode)) {
        return 'vue';
    }
    else if ('setState' in context) {
        return 'react';
    }
    return 'unknown';
}
/**
 * wrap promise with lock, support reactive environment like react or vue
 * @param promise promise
 * @param wrap whether use awaitWrap to wrap result
 */
const lockCtx = {};
function wpl(promise, wrap) {
    const contextType = checkContext(this);
    const isReactiveIns = contextType !== 'unknown';
    const context = isReactiveIns ? this : lockCtx;
    const stateKey = isReactiveIns ? contextType === 'react' ? 'state' : '' : '$_ES_UTILS_KEYS';
    const contextState = stateKey ? context[stateKey] : context;
    const has = (val, key) => hasOwnProperty.call(val, key);
    const isObj = (obj) => toString.call(obj) === '[object Object]';
    const setValue = (obj, path, value) => {
        // if vue2 and path[0] not defined, do nothing
        if (contextType === 'vue' && context.$set && !has(obj, path[0]))
            return;
        const { $set = (o, key, val) => { o[key] = val; } } = context;
        const isStateRect = contextType === 'react';
        const originObj = isStateRect ? { ...obj } : obj;
        let curObj = originObj;
        let canSet = false;
        for (let i = 0; i < path.length; i++) {
            const key = path[i];
            const keyExist = hasOwnProperty.call(curObj, key);
            if (i === path.length - 1) {
                const isBool = typeof curObj[key] === 'boolean';
                canSet = !keyExist || isBool;
                canSet && $set(curObj, key, value);
            }
            else {
                !keyExist && $set(curObj, key, {});
                if (!isObj(curObj[key]))
                    break;
                isStateRect && (curObj[key] = { ...curObj[key] });
                curObj = curObj[key];
            }
        }
        // trigger setState when run in react class component
        isStateRect && canSet && context.setState({ [path[0]]: originObj[path[0]] });
    };
    const stateLock = (bool) => {
        if (lockKey.length)
            return setValue(contextState, lockKey, bool);
        if (lockRefHandle)
            lockRefHandle[0][lockRefHandle[1]] = bool;
        if (lockSwitchHook)
            lockSwitchHook(bool);
    };
    let lockSwitchHook;
    let lockRefHandle;
    let lockKey = [];
    const proxyPromise = Object.assign(promise, {
        lock: (keyOrHookOrHandle, syncRefHandle) => {
            const isRefHandle = (val) => Array.isArray(val) && val.length === 2;
            if (typeof keyOrHookOrHandle === 'string') {
                lockKey = keyOrHookOrHandle.split('.');
            }
            else if (isRefHandle(keyOrHookOrHandle)) {
                lockRefHandle = keyOrHookOrHandle;
            }
            else if (typeof keyOrHookOrHandle === 'function') {
                lockSwitchHook = keyOrHookOrHandle;
                if (isRefHandle(syncRefHandle)) {
                    lockRefHandle = syncRefHandle;
                }
            }
            return proxyPromise;
        }
    });
    stateLock(true);
    proxyPromise.finally(() => stateLock(false));
    return wrap ? proxyPromise : awaitWrapper(proxyPromise);
}

export { awaitWrapper, objType, wpl };
