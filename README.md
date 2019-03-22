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

## object-array module

### `mapToObject(objectArray, keyProp, valueProp)`

create an object from an object array.

**parameters:**
- **objectArray**      {Array}    The source object array.
- **keyProp**          {String/Function}    The property of array item be used for key, or the function to create object key, default `"key"`.
  > if array item not contain key or function not return a string/number，the item will ignore.
- **valueProp**        {String/Function}    The property of array item be used for value, or the function to create object value, default `"value"`.

**returns**: object

Example

```javascript
import { mapToObject } from 'es-util'

const array = [
  { key: 'a', value: 'b', name: 'afsfsdfe' },
  { key: 'a1', value: 'b1', name: 'afssdfsfe' },
  { key: 'a2', value: 'b2', name: 'afsfgege' }
]
console.log(mapToObject(array)
/* log
{ a: 'b', a1: 'b1', a2: 'b2' }
*/
console.log(mapToObject(array, item => (item.key + item.value), 'name'))
/* log
{ ab: 'afsfsdfe', a1b1: 'afssdfsfe', a2b2: 'afsfgege' }
*/
```

## value-string-switch module

### `byteStringify(byteNum, options)`

transform byte size to a string in the specified format

**parameters:**
- **byteNum**            {Number}    The size number need to transform.
- **options**    {Object}    The options.
- **options.standard** {String}   the standard used to transform, default `'jedec'`, suport `'metric'`, `'iec'`. [Metric, IEC and JEDEC units](https://en.wikipedia.org/wiki/Gigabyte)
- **options.unitLvl** {String}   the unit lvl to transform byte size, default `'auto'`. suport `'B','K','M','G','T','P','E','Z','Y'`
- **options.precision** {Number}   the precision of value, default `1` 
- **options.detail** {Boolean}   whether to return an object of detai info, default `false`.


**returns**: string or object

Example

```javascript
import { byteStringify } from 'es-util'

byteStringify(1234)
/*log '1.2 KB'*/
byteStringify(-1234, { precision: 2 })
/*log '-1.21 KB'*/
byteStringify(1234, { unitLvl: 'M', precision: 3 })
/*log '0.001 MB'*/
byteStringify(1234, { detail: true, standard: 'metric', precision: 3 })
/*log { value: '1.234', unit: 'kB' } */

```

## License
MIT