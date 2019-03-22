const { hasOwnProperty } = Object.prototype;
function createNode (children, value = []) {
  return { [children]: value }
}
// translate array to tree
function array2tree (array, options = {}) {
  const { primaryKey: id, parentKey: pid, childrenKey: children, createRoot } = Object.assign({
    primaryKey: 'id',
    parentKey: 'pid',
    childrenKey: 'children',
    createRoot: false
  }, options);
  let nodeMap = {};
  let treeNodes = [];
  Array.isArray(array) && array.forEach(item => {
    !hasOwnProperty.call(nodeMap, item[id]) && (nodeMap[item[id]] = Object.assign(createNode(children), item));
    hasOwnProperty.call(nodeMap, item[pid]) && nodeMap[item[pid]][children].push(nodeMap[item[id]]);
    !item[pid] && treeNodes.push(nodeMap[item[id]]);
  });
  if (typeof createRoot === 'function') {
    return createRoot(treeNodes)
  } else if (createRoot) {
    return { [children]: treeNodes }
  }
  return treeNodes
}
function getNoChildNode (node, childrenKey) {
  let newNode = {};
  for(let i in node) {
    i !== childrenKey && (newNode[i] = node[i]);
  }
  return newNode
}
// translate tree to array
function tree2array (tree, options = {}) {
  const { primaryKey: id, parentKey: pid, childrenKey: children, hasParentKey, returnObject } = Object.assign({
    hasParentKey: true,
    primaryKey: 'id',
    parentKey: 'pid',
    childrenKey: 'children',
    returnObject: false
  }, options);
  let nodes = returnObject ? {} : [];
  if (!Array.isArray(tree) && typeof tree !== 'object') return nodes
  function getNode (node, parentId, root) {
    let baseNode = hasParentKey ? {} : { [pid]: parentId };
    if (!root) {
      const newNode = Object.assign(baseNode, getNoChildNode(node, children));
      returnObject ? (nodes[node[id]] = newNode) : nodes.push(newNode);
    }
    if (Array.isArray(node[children]) && node[children].length) {
      node[children].forEach(childNode => getNode(childNode, node[id]));
    }
  }
  const rootTree = Array.isArray(tree) ? createNode(children, tree) : tree;
  getNode(rootTree, null, true);
  return nodes
}

/* 身份证正则 */
const idCardReg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
/* 身份证合法性验证 */
function ChinaIdCardValid (idNo) {
  const idNumber = idNo.toString().toUpperCase();
  const provCodes = ['11', '12', '13', '14', '15', '21', '22', '23', '31', '32', '33', '34', '35', '36', '37', '41', '42', '43', '44', '45', '46', '50', '51', '52', '53', '54', '61', '62', '63', '64', '65', '71', '81', '82', '91'];
  const lastCodeCheck = () => {
    if (idNumber.length === 18) {
      const chars = idNumber.split('');
      // ∑(ai×Wi)(mod 11)
      // 加权因子
      const factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
      // 校验位
      const parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
      let sum = 0;
      let ai = 0;
      let wi = 0;
      for (let i = 0; i < 17; i++) {
        ai = chars[i];
        wi = factor[i];
        sum += ai * wi;
      }
      const last = parity[sum % 11];
      return last.toString() === chars[17]
    }
    return true
  };
  return idCardReg.test(idNumber) && provCodes.includes(idNumber.substr(0, 2)) && lastCodeCheck()
}
// 公式验证函数
function formulaValidate (string, variables) {
  string = string.replace(/\s/g, ''); // 剔除空白符
  const sc = /[+\-*/]{2,}/; // 错误情况，运算符连续
  const eb = /\(\)/; // 空括号
  const sl = /\([+\-*/]/; // 错误情况，(后面是运算符
  const bs = /[+\-*/]\)/; // 错误情况，)前面是运算符
  const bns = /[^+\-*/]\(/; // 错误情况，(前面不是运算符
  const blns = /\)[^+\-*/]/; // 错误情况，)后面不是运算符

  const bmatch = () => { // 错误情况，括号不配对
    let stack = [];
    for (let i = 0, item; i < string.length; i++) {
      item = string.charAt(i);
      if (item === '(') {
        stack.push('(');
      } else if (item === ')') {
        if (stack.length > 0) {
          stack.pop();
        } else {
          return false
        }
      }
    }
    return !stack.length
  };
  const varInList = (vars) => { // 错误情况，变量没有来自“待选公式变量”
    const tmpStr = string.replace(/[()+\-*/]{1,}/g, '`');
    const array = tmpStr.split('`');
    return array.every(item => (!/[A-Z]/i.test(item) || vars.includes(item)))
  };
  return !sc.test(string) && !eb.test(string) && !sl.test(string) && !bs.test(string) && !bns.test(string) && !blns.test(string) && bmatch() && (!Array.isArray(variables) || varInList(variables))
}

// translate array to tree
function mapToObject (objectArray, keyProp = 'key', valueProp = 'value') {
  let result = {};
  Array.isArray(objectArray) && keyProp && valueProp
  && [keyProp, valueProp].every(val => ['string', 'function'].includes(typeof val)) 
  && objectArray.forEach(item => {
    const key = typeof keyProp === 'string' ? item[keyProp] : keyProp(item);
    const value = typeof valueProp === 'string' ? item[valueProp] : valueProp(item);
    key && ['string', 'number'].includes(typeof key) && (result[key] = value);
  });
  return result
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
  }
};
// translate byte num to string
function byteStringify (byteNum, options) {
  const opts = Object.assign({
    standard: 'jedec',
    unitLvl: 'auto', 
    precision: 1,
    detail: false
  }, options || {});
  const { standard, unitLvl, precision, detail } = opts;
  byteNum = parseFloat(byteNum);
  if (!Number.isFinite(byteNum)) return 
  const negative = byteNum < 0 ? -1 : 1;
  byteNum = Math.abs(byteNum);
  const { base, unitMap } = configCreater(standard, unitLvl);
  const getValue = value => Number.isInteger(value) ? value : value.toFixed(precision);
  let resUnit = '';
  let resValue = 0;
  if (!Array.isArray(unitMap)) {
    const maxValue = Math.pow(base, unitMap.expMax);
    resUnit = unitMap.units[standard];
    const value = byteNum / maxValue;
    resValue = getValue(value * negative); 
  } else {
    unitMap.some(item => {
      const maxValue = Math.pow(base, item.expMax);
      const value = byteNum / maxValue;
      if(value > base) return false
      resUnit = item.units[standard];
      resValue = getValue(value * negative);
      return true
    });
  }
  return detail ? { value: resValue, unit: resUnit } : `${resValue} ${resUnit}`
}
// translate string to byte num
function byteParse (byteStr, options = {}) {
  
}

export { array2tree, tree2array, ChinaIdCardValid, formulaValidate, mapToObject, byteStringify, byteParse };
