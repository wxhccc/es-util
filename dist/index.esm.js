const { hasOwnProperty } = Object.prototype;
function createNode(children, value = []) {
    return { [children]: value };
}
/**
 * translate array to tree
 * @param {Array} array     the node array need to be translate
 * @param {Object} options  the options
 *  @param {string} primaryKey  the primary key of node
 *  @param {string} parentKey   the parent's key of node
 *  @param {string} childrenKey the child's key of node
 *  @param {boolean | Function} createNode  whether create root node, or function which can return root node
 *  @param {boolean | string} parentRefKey  parent reference key of node
 */
function array2tree(array, options = {}) {
    const { primaryKey: id, parentKey: pid, childrenKey: children, createRoot, parentRefKey } = Object.assign({
        primaryKey: 'id',
        parentKey: 'pid',
        childrenKey: 'children',
        createRoot: false,
        parentRefKey: false
    }, options);
    const pRefKey = parentRefKey && (typeof parentRefKey === 'string' ? parentRefKey : '_parent');
    let nodeMap = {};
    let treeNodes = [];
    Array.isArray(array) && array.forEach(item => {
        !hasOwnProperty.call(nodeMap, item[id]) && (nodeMap[item[id]] = Object.assign({}, item, createNode(children)));
        hasOwnProperty.call(nodeMap, item[pid]) && nodeMap[item[pid]][children].push(Object.assign(nodeMap[item[id]], pRefKey ? { [pRefKey]: nodeMap[item[pid]] } : {}));
        !item[pid] && treeNodes.push(nodeMap[item[id]]);
    });
    if (typeof createRoot === 'function') {
        return createRoot(treeNodes);
    }
    else if (createRoot) {
        return { [children]: treeNodes };
    }
    return treeNodes;
}
function nodeChildFilter(node, childrenKey) {
    let newNode = {};
    for (let i in node) {
        i !== childrenKey && (newNode[i] = node[i]);
    }
    return newNode;
}
/**
 * translate tree to array
 * @param {Array/Object} tree   the node tree need to be translate
 * @param {Object} options  the options
 *  @param {string} primaryKey  the primary key of tree node
 *  @param {string} parentKey   the parent's key of tree node
 *  @param {string} childrenKey the child's key of tree node
 *  @param {boolean} hasParentKey  whether create parent id in node
 *  @param {boolean} returnObject  whether return object or array
 */
function tree2array(tree, options = {}) {
    const { primaryKey: id, parentKey: pid, childrenKey: children, hasParentKey, returnObject } = Object.assign({
        hasParentKey: true,
        primaryKey: 'id',
        parentKey: 'pid',
        childrenKey: 'children',
        returnObject: false
    }, options);
    let nodes = returnObject ? {} : [];
    if (!Array.isArray(tree) && typeof tree !== 'object')
        return nodes;
    function getNode(node, parentId, root = false) {
        let baseNode = hasParentKey ? {} : { [pid]: parentId };
        if (!root) {
            const newNode = Object.assign(baseNode, nodeChildFilter(node, children));
            returnObject ? (nodes[node[id]] = newNode) : nodes.push(newNode);
        }
        if (Array.isArray(node[children]) && node[children].length) {
            node[children].forEach((childNode) => getNode(childNode, node[id]));
        }
    }
    const rootTree = Array.isArray(tree) ? createNode(children, tree) : tree;
    getNode(rootTree, null, true);
    return nodes;
}

/* 身份证正则 */
const idCardReg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
/* 身份证合法性验证 */
function ChinaIdCardValid(idNo) {
    const idNumber = idNo.toString().toUpperCase();
    const provCodes = ['11', '12', '13', '14', '15', '21', '22', '23', '31', '32', '33', '34', '35', '36', '37', '41', '42', '43', '44', '45', '46', '50', '51', '52', '53', '54', '61', '62', '63', '64', '65', '71', '81', '82', '91'];
    const lastCodeCheck = () => {
        if (idNumber.length === 18) {
            const chars = idNumber.split('');
            // ∑(ai×Wi)(mod 11)
            // 加权因子
            const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            // 校验位
            const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
            let sum = 0;
            let ai = 0;
            let wi = 0;
            for (let i = 0; i < 17; i++) {
                ai = parseInt(chars[i]);
                wi = factor[i];
                sum += ai * wi;
            }
            const last = parity[sum % 11];
            return last.toString() === chars[17];
        }
        return true;
    };
    return idCardReg.test(idNumber) && provCodes.includes(idNumber.substr(0, 2)) && lastCodeCheck();
}
// 公式验证函数
function formulaValidate(string, variables) {
    string = string.replace(/\s/g, ''); // 剔除空白符
    const sc = /[+\-*/]{2,}/; // 错误情况，运算符连续
    const eb = /\(\)/; // 空括号
    const sl = /\([+\-*/]/; // 错误情况，(后面是运算符
    const bs = /[+\-*/]\)/; // 错误情况，)前面是运算符
    const bns = /[^+\-*/]\(/; // 错误情况，(前面不是运算符
    const blns = /\)[^+\-*/]/; // 错误情况，)后面不是运算符
    const bmatch = () => {
        let stack = [];
        for (let i = 0, item; i < string.length; i++) {
            item = string.charAt(i);
            if (item === '(') {
                stack.push('(');
            }
            else if (item === ')') {
                if (stack.length > 0) {
                    stack.pop();
                }
                else {
                    return false;
                }
            }
        }
        return !stack.length;
    };
    // 错误情况，变量没有来自“待选公式变量”
    const varInList = (vars) => {
        const tmpStr = string.replace(/[()+\-*/]{1,}/g, '`');
        const array = tmpStr.split('`');
        return array.every(item => (!/[A-Z]/i.test(item) || vars.includes(item)));
    };
    return !sc.test(string) && !eb.test(string) && !sl.test(string) && !bs.test(string) && !bns.test(string) && !blns.test(string) && bmatch() && (!Array.isArray(variables) || varInList(variables));
}

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

//
const configCreater = (standard, unit) => {
    const unitMap = {
        B: { expMax: 0, units: { metric: 'B', iec: 'B', jedec: 'B' } },
        K: { expMax: 1, units: { metric: 'kB', iec: 'KiB', jedec: 'KB' } },
        M: { expMax: 2, units: { metric: 'MB', iec: 'MiB', jedec: 'MB' } },
        G: { expMax: 3, units: { metric: 'GB', iec: 'GiB', jedec: 'GB' } },
        T: { expMax: 4, units: { metric: 'TB', iec: 'TiB', jedec: 'TB' } },
        P: { expMax: 5, units: { metric: 'PB', iec: 'PiB', jedec: 'PB' } },
        E: { expMax: 6, units: { metric: 'EB', iec: 'EiB', jedec: 'EB' } },
        Z: { expMax: 7, units: { metric: 'ZB', iec: 'ZiB', jedec: 'ZB' } },
        Y: { expMax: 8, units: { metric: 'YB', iec: 'YiB', jedec: 'YB' } }
    };
    const standBase = { metric: 1000, iec: 1024, jedec: 1024 };
    return {
        base: standBase[standard] || standBase['jedec'],
        unitMap: unitMap[unit] || Object.values(unitMap)
    };
};
// translate byte num to string
function byteStringify(byteNum, options) {
    const opts = Object.assign({
        standard: 'jedec',
        unitLvl: 'auto',
        precision: 1,
        detail: false
    }, options);
    const { standard, unitLvl, precision, detail } = opts;
    let byteNumber = parseFloat(byteNum);
    if (!Number.isFinite(byteNumber))
        return;
    const negative = byteNumber < 0 ? -1 : 1;
    byteNumber = Math.abs(byteNumber);
    const { base, unitMap } = configCreater(standard, unitLvl);
    const getValue = (value) => Number.isInteger(value) ? value : value.toFixed(precision);
    let resUnit = '';
    let resValue = 0;
    if (!Array.isArray(unitMap)) {
        const maxValue = Math.pow(base, unitMap.expMax);
        resUnit = unitMap.units[standard];
        const value = byteNumber / maxValue;
        resValue = getValue(value * negative);
    }
    else {
        unitMap.some(item => {
            const maxValue = Math.pow(base, item.expMax);
            const value = byteNumber / maxValue;
            if (value > base)
                return false;
            resUnit = item.units[standard];
            resValue = getValue(value * negative);
            return true;
        });
    }
    return detail ? { value: resValue, unit: resUnit } : `${resValue} ${resUnit}`;
}
// translate string to byte num
function byteParse(byteStr, options = {}) {
}

async function awaitWrapper(promise) {
    try {
        const data = await promise;
        return [null, data];
    }
    catch (err) {
        return [err, undefined];
    }
}

export { ChinaIdCardValid, array2tree, awaitWrapper, byteParse, byteStringify, checkoutBy, formulaValidate, mapToObject, pickRenameKeys, tree2array };
