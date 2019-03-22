(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.EsUtil = {}));
}(this, function (exports) { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  function createNode(children) {
    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    return _defineProperty({}, children, value);
  } // translate array to tree


  function array2tree(array) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _Object$assign = Object.assign({
      primaryKey: 'id',
      parentKey: 'pid',
      childrenKey: 'children',
      createRoot: false
    }, options),
        id = _Object$assign.primaryKey,
        pid = _Object$assign.parentKey,
        children = _Object$assign.childrenKey,
        createRoot = _Object$assign.createRoot;

    var nodeMap = {};
    var treeNodes = [];
    Array.isArray(array) && array.forEach(function (item) {
      !hasOwnProperty.call(nodeMap, item[id]) && (nodeMap[item[id]] = Object.assign(createNode(children), item));
      hasOwnProperty.call(nodeMap, item[pid]) && nodeMap[item[pid]][children].push(nodeMap[item[id]]);
      !item[pid] && treeNodes.push(nodeMap[item[id]]);
    });

    if (typeof createRoot === 'function') {
      return createRoot(treeNodes);
    } else if (createRoot) {
      return _defineProperty({}, children, treeNodes);
    }

    return treeNodes;
  }

  function getNoChildNode(node, childrenKey) {
    var newNode = {};

    for (var i in node) {
      i !== childrenKey && (newNode[i] = node[i]);
    }

    return newNode;
  } // translate tree to array


  function tree2array(tree) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _Object$assign2 = Object.assign({
      hasParentKey: true,
      primaryKey: 'id',
      parentKey: 'pid',
      childrenKey: 'children',
      returnObject: false
    }, options),
        id = _Object$assign2.primaryKey,
        pid = _Object$assign2.parentKey,
        children = _Object$assign2.childrenKey,
        hasParentKey = _Object$assign2.hasParentKey,
        returnObject = _Object$assign2.returnObject;

    var nodes = returnObject ? {} : [];
    if (!Array.isArray(tree) && _typeof(tree) !== 'object') return nodes;

    function getNode(node, parentId, root) {
      var baseNode = hasParentKey ? {} : _defineProperty({}, pid, parentId);

      if (!root) {
        var newNode = Object.assign(baseNode, getNoChildNode(node, children));
        returnObject ? nodes[node[id]] = newNode : nodes.push(newNode);
      }

      if (Array.isArray(node[children]) && node[children].length) {
        node[children].forEach(function (childNode) {
          return getNode(childNode, node[id]);
        });
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

    var lastCodeCheck = function lastCodeCheck() {
      if (idNumber.length === 18) {
        var chars = idNumber.split(''); // ∑(ai×Wi)(mod 11)
        // 加权因子

        var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]; // 校验位

        var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
        var sum = 0;
        var ai = 0;
        var wi = 0;

        for (var i = 0; i < 17; i++) {
          ai = chars[i];
          wi = factor[i];
          sum += ai * wi;
        }

        var last = parity[sum % 11];
        return last.toString() === chars[17];
      }

      return true;
    };

    return idCardReg.test(idNumber) && provCodes.includes(idNumber.substr(0, 2)) && lastCodeCheck();
  } // 公式验证函数

  function formulaValidate(string, variables) {
    string = string.replace(/\s/g, ''); // 剔除空白符

    var sc = /[+\-*/]{2,}/; // 错误情况，运算符连续

    var eb = /\(\)/; // 空括号

    var sl = /\([+\-*/]/; // 错误情况，(后面是运算符

    var bs = /[+\-*/]\)/; // 错误情况，)前面是运算符

    var bns = /[^+\-*/]\(/; // 错误情况，(前面不是运算符

    var blns = /\)[^+\-*/]/; // 错误情况，)后面不是运算符

    var bmatch = function bmatch() {
      // 错误情况，括号不配对
      var stack = [];

      for (var i = 0, item; i < string.length; i++) {
        item = string.charAt(i);

        if (item === '(') {
          stack.push('(');
        } else if (item === ')') {
          if (stack.length > 0) {
            stack.pop();
          } else {
            return false;
          }
        }
      }

      return !stack.length;
    };

    var varInList = function varInList(vars) {
      // 错误情况，变量没有来自“待选公式变量”
      var tmpStr = string.replace(/[()+\-*/]{1,}/g, '`');
      var array = tmpStr.split('`');
      return array.every(function (item) {
        return !/[A-Z]/i.test(item) || vars.includes(item);
      });
    };

    return !sc.test(string) && !eb.test(string) && !sl.test(string) && !bs.test(string) && !bns.test(string) && !blns.test(string) && bmatch() && (!Array.isArray(variables) || varInList(variables));
  }

  // translate array to tree
  function mapToObject(objectArray) {
    var keyProp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key';
    var valueProp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'value';
    var result = {};
    Array.isArray(objectArray) && keyProp && valueProp && [keyProp, valueProp].every(function (val) {
      return ['string', 'function'].includes(_typeof(val));
    }) && objectArray.forEach(function (item) {
      var key = typeof keyProp === 'string' ? item[keyProp] : keyProp(item);
      var value = typeof valueProp === 'string' ? item[valueProp] : valueProp(item);
      key && ['string', 'number'].includes(_typeof(key)) && (result[key] = value);
    });
    return result;
  }

  var configCreater = function configCreater(standard, unit) {
    var unitMap = {
      B: {
        expMax: 0,
        units: {
          metric: 'B',
          iec: 'B',
          jedec: 'B'
        }
      },
      K: {
        expMax: 1,
        units: {
          metric: 'kB',
          iec: 'KiB',
          jedec: 'KB'
        }
      },
      M: {
        expMax: 2,
        units: {
          metric: 'MB',
          iec: 'MiB',
          jedec: 'MB'
        }
      },
      G: {
        expMax: 3,
        units: {
          metric: 'GB',
          iec: 'GiB',
          jedec: 'GB'
        }
      },
      T: {
        expMax: 4,
        units: {
          metric: 'TB',
          iec: 'TiB',
          jedec: 'TB'
        }
      },
      P: {
        expMax: 5,
        units: {
          metric: 'PB',
          iec: 'PiB',
          jedec: 'PB'
        }
      },
      E: {
        expMax: 6,
        units: {
          metric: 'EB',
          iec: 'EiB',
          jedec: 'EB'
        }
      },
      Z: {
        expMax: 7,
        units: {
          metric: 'ZB',
          iec: 'ZiB',
          jedec: 'ZB'
        }
      },
      Y: {
        expMax: 8,
        units: {
          metric: 'YB',
          iec: 'YiB',
          jedec: 'YB'
        }
      }
    };
    var standBase = {
      metric: 1000,
      iec: 1024,
      jedec: 1024
    };
    return {
      base: standBase[standard] || standBase['jedec'],
      unitMap: unitMap[unit] || Object.values(unitMap)
    };
  }; // translate byte num to string


  function byteStringify(byteNum, options) {
    var opts = Object.assign({
      standard: 'jedec',
      unitLvl: 'auto',
      precision: 1,
      detail: false
    }, options || {});
    var standard = opts.standard,
        unitLvl = opts.unitLvl,
        precision = opts.precision,
        detail = opts.detail;
    byteNum = parseFloat(byteNum);
    if (!Number.isFinite(byteNum)) return;
    var negative = byteNum < 0 ? -1 : 1;
    byteNum = Math.abs(byteNum);

    var _configCreater = configCreater(standard, unitLvl),
        base = _configCreater.base,
        unitMap = _configCreater.unitMap;

    var getValue = function getValue(value) {
      return Number.isInteger(value) ? value : value.toFixed(precision);
    };

    var resUnit = '';
    var resValue = 0;

    if (!Array.isArray(unitMap)) {
      var maxValue = Math.pow(base, unitMap.expMax);
      resUnit = unitMap.units[standard];
      var value = byteNum / maxValue;
      resValue = getValue(value * negative);
    } else {
      unitMap.some(function (item) {
        var maxValue = Math.pow(base, item.expMax);
        var value = byteNum / maxValue;
        if (value > base) return false;
        resUnit = item.units[standard];
        resValue = getValue(value * negative);
        return true;
      });
    }

    return detail ? {
      value: resValue,
      unit: resUnit
    } : "".concat(resValue, " ").concat(resUnit);
  } // translate string to byte num

  function byteParse(byteStr) {
  }

  exports.array2tree = array2tree;
  exports.tree2array = tree2array;
  exports.ChinaIdCardValid = ChinaIdCardValid;
  exports.formulaValidate = formulaValidate;
  exports.mapToObject = mapToObject;
  exports.byteStringify = byteStringify;
  exports.byteParse = byteParse;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
