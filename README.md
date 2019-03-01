## Es Utils library

**es-util** is a useful methods library, contain some functions we might need in a project which based on ES


# Installation

#### npm
```shell
$ npm install es-util --save
```
#### in browser

`<script src="https://cdn.jsdelivr.net/npm/es-util/lib/index.min.js"></script>`

# Usage

#### in webpack or node

```javascript
import * as EsUtil from 'es-util'
// or import { xxx } from 'es-util'
// or const EsUtil = require('es-util')

// example, array2tree
const array = [
  { id: 1, pid: 0, name: 'language' },
  { id: 2, pid: 1, name: 'english' },
  { id: 3, pid: 1, name: 'chinese' }
]
console.log(EsUtil.array2tree)
/* log
[
  {
    id: 1,
    pid: 0,
    name: 'language',
    children: [
      {
        id: 2,
        pid: 1,
        name: 'english',
        children: []
      },
      {
        id: 3,
        pid: 1,
        name: 'chinese',
        children: []
      }
    ]
  }
]
*/
```


# API

## array-tree-switch module

### `array2tree(array, options)`

transform an array to tree structure

**parameters:**
- **array**            {Array}    The array need to transform.
- **options**    {Object}    The options.
- **options.primaryKey** {String}   the primary key of array item, default `'id'` 
- **options.parentKey** {String}   the parent key of array item, default `'pid'` 
- **options.childrenKey** {String}   the childrenKey key of tree structure node, default `'children'` 
- **options.createRoot** {Boolean/Function}   whether to create a root node, default `'false'`, will return an array, if `'true'` ,will return an object. you can pass an function as well, the transformed array will pass to function


**returns**: array or object with tree structure.

Example

```javascript
import { array2tree } from 'es-util'

const array = [
  { id: 1, parentId: 0, name: 'language' },
  { id: 2, parentId: 1, name: 'english' },
  { id: 3, parentId: 1, name: 'chinese' }
]

const tree = array2tree(array, {
  parentKey: 'parentId',
  childrenKey: 'nodes',
  createRoot: true
})
/* log
{
  nodes: [
    {
      id: 1,
      pid: 0,
      name: 'language',
      nodes: [
        {
          id: 2,
          pid: 1,
          name: 'english',
          nodes: []
        },
        {
          id: 3,
          pid: 1,
          name: 'chinese',
          nodes: []
        }
      ]
    }
  ]
}
*/
```

### `tree2array(tree, options)`

transform tree structure to an array

**parameters:**
- **tree**            {Array/Object}    The tree structure need to transform.
- **options**    {Object}    The options.
- **options.primaryKey** {String}   the primary key of node item, default `'id'` 
- **options.parentKey** {String}   the parent key of node item, default `'pid'` 
- **options.childrenKey** {String}   the childrenKey key of node item, default `'children'`
- **options.hasParentKey** {Boolean}  whether tree node has parent property, default `'true'`, if `'false'` ,will add an parent key property


**returns**: items array

Example

```javascript
import { tree2array } from 'es-util'

const tree = {
  id: 0,
  nodes: [
    {
      id: 1,
      name: 'language',
      children: [
        {
          id: 2,
          name: 'english',
          children: []
        },
        {
          id: 3,
          name: 'chinese',
          children: []
        }
      ]
    }
  ]
}

const tree = array2tree(array, {
  hasParentKey: false
})
/* log
[
  { id: 1, pid: 0, name: 'language' },
  { id: 2, pid: 1, name: 'english' },
  { id: 3, pid: 1, name: 'chinese' }
]

*/
```

## validate module

### `ChinaIdCardValid(idCard)`

Check whether the Chinese id number provided is valid

**parameters:**
- **idCard**            {String}    The IDcard number.


**returns**: boolean

Example

```javascript
import { ChinaIdCardValid } from 'es-util'


console.log(ChinaIdCardValid('[valid IDcard]')
console.log(ChinaIdCardValid('111111111111111111')
/* log
true
false
*/
```

### `formulaValidate(formulaString, variables)`

Check whether the formulaString provided is valid

**parameters:**
- **formulaString**            {String}    The formula string.
- **variables**                {Array}    The variables can appear in formula.


**returns**: boolean

Example

```javascript
import { formulaValidate } from 'es-util'


console.log(formulaValidate('A+B*(D-C/E)')
console.log(formulaValidate('A+*B/E')
console.log(formulaValidate('A+*B/E', ['A', 'B', 'C'])
/* log
true
false
false
*/
```


## License
MIT