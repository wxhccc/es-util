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

  var _Object$prototype = Object.prototype,
      hasOwnProperty = _Object$prototype.hasOwnProperty,
      propertyIsEnumerable = _Object$prototype.propertyIsEnumerable;

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
  } // translate tree to array

  function tree2array(tree) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var nodes = [];
    if (!Array.isArray(tree) && _typeof(tree) !== 'object') return nodes;

    var _Object$assign2 = Object.assign({
      hasParentKey: true,
      primaryKey: 'id',
      parentKey: 'pid',
      childrenKey: 'children'
    }, options),
        id = _Object$assign2.primaryKey,
        pid = _Object$assign2.parentKey,
        children = _Object$assign2.childrenKey,
        hasParentKey = _Object$assign2.hasParentKey;

    function getNode(node, parentId, root) {
      var baseNode = hasParentKey ? {} : _defineProperty({}, pid, parentId);

      if (!root) {
        propertyIsEnumerable.call(node, children) && Object.defineProperty(node, children, {
          enumerable: false
        });
        nodes.push(Object.assign(baseNode, node));
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

  exports.array2tree = array2tree;
  exports.tree2array = tree2array;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
