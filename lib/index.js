'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var hasOwnProperty = Object.prototype.hasOwnProperty;
function createNode(children, value) {
    var _a;
    if (value === void 0) { value = []; }
    return _a = {}, _a[children] = value, _a;
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
function array2tree(array, options) {
    var _a;
    if (options === void 0) { options = {}; }
    var _b = Object.assign({
        primaryKey: 'id',
        parentKey: 'pid',
        childrenKey: 'children',
        createRoot: false,
        parentRefKey: false
    }, options), id = _b.primaryKey, pid = _b.parentKey, children = _b.childrenKey, createRoot = _b.createRoot, parentRefKey = _b.parentRefKey;
    var pRefKey = parentRefKey && (typeof parentRefKey === 'string' ? parentRefKey : '_parent');
    var nodeMap = {};
    var treeNodes = [];
    Array.isArray(array) && array.forEach(function (item) {
        var _a;
        !hasOwnProperty.call(nodeMap, item[id]) && (nodeMap[item[id]] = Object.assign({}, item, createNode(children)));
        hasOwnProperty.call(nodeMap, item[pid]) && nodeMap[item[pid]][children].push(Object.assign(nodeMap[item[id]], pRefKey ? (_a = {}, _a[pRefKey] = nodeMap[item[pid]], _a) : {}));
        !item[pid] && treeNodes.push(nodeMap[item[id]]);
    });
    if (typeof createRoot === 'function') {
        return createRoot(treeNodes);
    }
    else if (createRoot) {
        return _a = {}, _a[children] = treeNodes, _a;
    }
    return treeNodes;
}
function nodeChildFilter(node, childrenKey) {
    var newNode = {};
    for (var i in node) {
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
function tree2array(tree, options) {
    if (options === void 0) { options = {}; }
    var _a = Object.assign({
        hasParentKey: true,
        primaryKey: 'id',
        parentKey: 'pid',
        childrenKey: 'children',
        returnObject: false
    }, options), id = _a.primaryKey, pid = _a.parentKey, children = _a.childrenKey, hasParentKey = _a.hasParentKey, returnObject = _a.returnObject;
    var nodes = returnObject ? {} : [];
    if (!Array.isArray(tree) && typeof tree !== 'object')
        return nodes;
    function getNode(node, parentId, root) {
        var _a;
        if (root === void 0) { root = false; }
        var baseNode = hasParentKey ? {} : (_a = {}, _a[pid] = parentId, _a);
        if (!root) {
            var newNode = Object.assign(baseNode, nodeChildFilter(node, children));
            returnObject ? (nodes[node[id]] = newNode) : nodes.push(newNode);
        }
        if (Array.isArray(node[children]) && node[children].length) {
            node[children].forEach(function (childNode) { return getNode(childNode, node[id]); });
        }
    }
    var rootTree = Array.isArray(tree) ? createNode(children, tree) : tree;
    getNode(rootTree, null, true);
    return nodes;
}

/* 身份证正则 */
var idCardReg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
/* 身份证合法性验证 */
function ChinaIdCardValid(idNo) {
    var idNumber = idNo.toString().toUpperCase();
    var provCodes = ['11', '12', '13', '14', '15', '21', '22', '23', '31', '32', '33', '34', '35', '36', '37', '41', '42', '43', '44', '45', '46', '50', '51', '52', '53', '54', '61', '62', '63', '64', '65', '71', '81', '82', '91'];
    var lastCodeCheck = function () {
        if (idNumber.length === 18) {
            var chars = idNumber.split('');
            // ∑(ai×Wi)(mod 11)
            // 加权因子
            var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            // 校验位
            var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
            var sum = 0;
            var ai = 0;
            var wi = 0;
            for (var i = 0; i < 17; i++) {
                ai = parseInt(chars[i]);
                wi = factor[i];
                sum += ai * wi;
            }
            var last = parity[sum % 11];
            return last.toString() === chars[17];
        }
        return true;
    };
    return idCardReg.test(idNumber) && provCodes.includes(idNumber.substr(0, 2)) && lastCodeCheck();
}
// 公式验证函数
function formulaValidate(string, variables) {
    string = string.replace(/\s/g, ''); // 剔除空白符
    var sc = /[+\-*/]{2,}/; // 错误情况，运算符连续
    var eb = /\(\)/; // 空括号
    var sl = /\([+\-*/]/; // 错误情况，(后面是运算符
    var bs = /[+\-*/]\)/; // 错误情况，)前面是运算符
    var bns = /[^+\-*/]\(/; // 错误情况，(前面不是运算符
    var blns = /\)[^+\-*/]/; // 错误情况，)后面不是运算符
    var bmatch = function () {
        var stack = [];
        for (var i = 0, item = void 0; i < string.length; i++) {
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
    var varInList = function (vars) {
        var tmpStr = string.replace(/[()+\-*/]{1,}/g, '`');
        var array = tmpStr.split('`');
        return array.every(function (item) { return (!/[A-Z]/i.test(item) || vars.includes(item)); });
    };
    return !sc.test(string) && !eb.test(string) && !sl.test(string) && !bs.test(string) && !bns.test(string) && !blns.test(string) && bmatch() && (!Array.isArray(variables) || varInList(variables));
}

function mapToObject(objectArray, keyProp, valueProp) {
    if (keyProp === void 0) { keyProp = 'key'; }
    if (valueProp === void 0) { valueProp = 'value'; }
    var result = {};
    Array.isArray(objectArray) && keyProp && valueProp
        && [keyProp, valueProp].every(function (val) { return ['string', 'function'].includes(typeof val); })
        && objectArray.forEach(function (item, index) {
            var key = typeof keyProp === 'string' ? item[keyProp] : keyProp(item, index);
            var value = typeof valueProp === 'string' ? item[valueProp] : valueProp(item, index);
            ['string', 'number'].includes(typeof key) && (result[key] = value);
        });
    return result;
}
function checkoutBy(object, keys, mergeFn) {
    if (!(object instanceof Object))
        return [];
    if (Array.isArray(keys)) {
        return keys.map(function (item) { return (object[item]); });
    }
    else if (keys && keys instanceof Object) {
        return Object.keys(keys).map(function (item) {
            return (object[item] instanceof Object && keys[item] instanceof Object)
                ? (mergeFn ? mergeFn({}, object[item], keys[item]) : Object.assign({}, object[item], keys[item]))
                : (keys[item] || object[item]);
        });
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
    var result = {};
    for (var i in object) {
        (i in keysMap) && (result[keysMap[i]] = object[i]);
    }
    return result;
}

//
var configCreater = function (standard, unit) {
    var unitMap = {
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
    var standBase = { metric: 1000, iec: 1024, jedec: 1024 };
    return {
        base: standBase[standard] || standBase['jedec'],
        unitMap: unitMap[unit] || Object.values(unitMap)
    };
};
// translate byte num to string
function byteStringify(byteNum, options) {
    var opts = Object.assign({
        standard: 'jedec',
        unitLvl: 'auto',
        precision: 1,
        detail: false
    }, options);
    var standard = opts.standard, unitLvl = opts.unitLvl, precision = opts.precision, detail = opts.detail;
    var byteNumber = parseFloat(byteNum);
    if (!Number.isFinite(byteNumber))
        return;
    var negative = byteNumber < 0 ? -1 : 1;
    byteNumber = Math.abs(byteNumber);
    var _a = configCreater(standard, unitLvl), base = _a.base, unitMap = _a.unitMap;
    var getValue = function (value) { return Number.isInteger(value) ? value : value.toFixed(precision); };
    var resUnit = '';
    var resValue = 0;
    if (!Array.isArray(unitMap)) {
        var maxValue = Math.pow(base, unitMap.expMax);
        resUnit = unitMap.units[standard];
        var value = byteNumber / maxValue;
        resValue = getValue(value * negative);
    }
    else {
        unitMap.some(function (item) {
            var maxValue = Math.pow(base, item.expMax);
            var value = byteNumber / maxValue;
            if (value > base)
                return false;
            resUnit = item.units[standard];
            resValue = getValue(value * negative);
            return true;
        });
    }
    return detail ? { value: resValue, unit: resUnit } : resValue + " " + resUnit;
}
// translate string to byte num
function byteParse(byteStr, options) {
    if (options === void 0) { options = {}; }
}

/**
 * Camelize a hyphen-delimited or undercore string.
 * 短横线转驼峰
 */
var camelizeRE = /[-_](\w)/g;
function camelize(string) {
    return string.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; });
}
var hyphenateRE = /\B([A-Z])/g;
/**
 * Hyphenate or undercore a camelCase string.
 * 驼峰转短横线
 */
function hyphenate(string) {
    return string.replace(hyphenateRE, '-$1').toLowerCase();
}
function camel2snake(string) {
    return string.replace(hyphenateRE, '_$1').toLowerCase();
}

exports.array2tree = array2tree;
exports.tree2array = tree2array;
exports.ChinaIdCardValid = ChinaIdCardValid;
exports.formulaValidate = formulaValidate;
exports.mapToObject = mapToObject;
exports.checkoutBy = checkoutBy;
exports.pickRenameKeys = pickRenameKeys;
exports.byteStringify = byteStringify;
exports.byteParse = byteParse;
exports.camelize = camelize;
exports.hyphenate = hyphenate;
exports.camel2snake = camel2snake;
