## Es Utils library

is a useful methods library, contain some functions you might need in a project which based on ES

> 2.0 has broken update, see module for detail

# Installation

#### npm
```shell
$ npm install @wxhccc/es-util
```
#### yarn
```shell
$ yarn add @wxhccc/es-util
```

#### in browser

`<script src="https://cdn.jsdelivr.net/npm/@wxhccc/es-util/lib/index.min.js"></script>`

# Usage

```javascript
import * as EsUtil from '@wxhccc/es-util'
// or import { xxx } from '@wxhccc/es-util'
// or const EsUtil = require('@wxhccc/es-util')

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
- **array**  {Array} (The array need to transform).
- **options**    {Object}    The options.
  - **primaryKey** {String}   the primary key of array item, default `'id'` 
  - **parentKey** {String}   the parent key of array item, default `'pid'` 
  - **childrenKey** {String}   the childrenKey key of tree structure node, default `'children'` 
  - **createRoot** {Boolean/Function}   whether to create a root node, default `'false'`, will return an array, if `'true'` ,will return an object. you can pass an function as well, the transformed array will pass to function
  - **parentRefKey** {Boolean/String}   whether to create a reference of current node's parent, default `'false'`, will do nothing. if you set it to string or `'true'(mean '_parent')` ,will use it as the object key which point to the parent node of current node.

>warning: set the `parentRefKey` will make the return tree object/array cycling, so you can't use `JSON.stringify` to stringify it

**returns**: array or object with tree structure.

Example

```javascript
import { array2tree } from '@wxhccc/es-util'

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
const tree = array2tree(array, {
  parentRefKey: true
})
/* log
[
  {
    id: 1,
    pid: 0,
    name: 'language',
    _parent: null,
    children: [
      {
        id: 2,
        pid: 1,
        name: 'english',
        children: [],
        _parent: {
          id: 1,
          pid: 0
          ...,
          _parent: ...
        }
      },
      {
        id: 3,
        pid: 1,
        name: 'chinese',
        children: [],
        _parent: {
          id: 1,
          pid: 0
          ...,
          _parent: ...
        }
      }
    ]
  }
]
*/
```

### `tree2array(tree, options)`

transform tree structure to an array

**parameters:**
- **tree**            {Array/Object}    The tree structure need to transform.
- **options**    {Object}    The options.
  - **primaryKey** {String}   the primary key of node item, default `'id'` 
  - **parentKey** {String}   the parent key of node item, default `'pid'` 
  - **childrenKey** {String}   the childrenKey key of node item, default `'children'`
  - **hasParentKey** {Boolean}  whether tree node has parent property, default `'true'`, if `'false'` ,will add an parent key property


**returns**: items array

Example

```javascript
import { tree2array } from '@wxhccc/es-util'

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
console.log(tree)
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
import { ChinaIdCardValid } from '@wxhccc/es-util'


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
import { formulaValidate } from '@wxhccc/es-util'


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
import { mapToObject } from '@wxhccc/es-util'

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

### `checkoutBy(object, keys, mergeFn)`

checkout an array from an object by gived keys, you can merge new data to object item

**parameters:**
- **object**      {Object}    The source object.
- **keys**          {Array/Object}    The properties array of `object`. or an object contains keys which you want to pick from `object` and values you want to merge to those picked values. if keys not provided, will return `Object.values(object)`
- **mergeFn**        {Function}  this method use `Object.assign` to merge values where two value are object default, you can provide custom function to merge value.

**returns**: array

Example

```javascript
import { checkoutBy } from '@wxhccc/es-util'

const configs = {
  a: { key: 1, name: 'afsfsdfe' },
  b: { key: 2, name: { a: 'afssdfsfe' } },
  c: { key: 3, name: 'afsfgege' },
  d: { key: 4 }
}
console.log(checkoutBy(configs, ['a', 'c'])
/* log
[{ key: 1, name: 'afsfsdfe' }, { key: 3, name: 'afsfgege' }]
*/
console.log(checkoutBy(configs, { a: null, b: { name: { b: 'aaa' } } })
/* log
[{ key: 1, name: 'afsfsdfe' }, { key: 2, name: { b: 'aaa' } }]
*/
const { merge } = required('lodash')
console.log(checkoutBy(configs, { d: 123, b: { name: { b: 'aaa' } } }, merge)
/* log
[123, { key: 2, name: { a: 'afssdfsfe', b: 'aaa' } }]
*/
```

### `pickRenameKeys(object, keysMap)`

pick and rename object's keys

**parameters:**
- **object**      {Object}    The source object.
- **keysMap**          {Object}    The `oldKey-newKey` object

**returns**: array

Example

```javascript
import { pickRenameKeys } from '@wxhccc/es-util'

const configs = {
  a: { name: 'afsfsdfe' },
  b: 3,
  c: [123],
  d: 'aaa'
}
console.log(pickRenameKeys(configs, { 'a': 'a1', 'c': 'c3', 'd': 'd' })
/* log
{ a1: { name: 'afsfsdfe' }, c3: [123], d: 'aaa' }
*/
```

## value-string-switch module

### `byteStringify(byteNum, options)`

transform byte size to a string in the specified format

**parameters:**
- **byteNum**            {Number}    The size number need to transform.
- **options**    {Object}    The options.
  - **standard** {String}   the standard used to transform, default `'jedec'`, suport `'metric'`, `'iec'`. [Metric, IEC and JEDEC units](https://en.wikipedia.org/wiki/Gigabyte)
  - **unitLvl** {String}   the unit lvl to transform byte size, default `'auto'`. suport `'B','K','M','G','T','P','E','Z','Y'`
  - **precision** {Number}   the precision of value, default `1` 
  - **detail** {Boolean}   whether to return an object of detai info, default `false`.


**returns**: string or object

Example

```javascript
import { byteStringify } from '@wxhccc/es-util'

byteStringify(1234)
/*log '1.2 KB'*/
byteStringify(-1234, { precision: 2 })
/*log '-1.21 KB'*/
byteStringify(1234, { unitLvl: 'M', precision: 3 })
/*log '0.001 MB'*/
byteStringify(1234, { detail: true, standard: 'metric', precision: 3 })
/*log { value: '1.234', unit: 'kB' } */

```

> these methods remove from v1.2.0  you can use lodash instead
### ~~`camelize(string)`~~

### ~~`hyphenate(string)`~~

### ~~`camel2snake(string)`~~



## promise module

### `awaitWrapper(promise)`

wrap promise with then and catch to return `[null, data]` or `[Error, undefined]`, useful async & await

Example

```javascript
import { awaitWrapper } from '@wxhccc/es-util'

const [err, data] = await awaitWrapper(Promise.resolve(1))
/*log [null, 1] */
const [err, data] = await awaitWrapper(Promise.reject())
/*log [err, undefined] */

```

### `wp(promise, [wrap])`

> this module has been refactor in v2.0，no longer support vue/react instance detection because there is no need in hooks. 

wrap promise or a function return promise with lock method to control UI or forbiden multi task at same time

**parameters:**
- **promise**    {Promise|() => Promise}    promise object or a function return promise object. when use function and lock, it can prevent second call before previous promise settled
- **options**    {boolean|WrapOptions}    shortcut of `wrap` option or full options.
  - **wrap**    {boolean} whether use `awaitWrapper` to wrap then promise.
  - **lock**    {(bool) => void | [ref, lockKey]}
    function: useful in ReactHook component, pass setXXX to method

    syncRefHandle: an array such as `[object, keyOfObject]` useful when need to lock promise when value can't be update sync, such as React
  - **syncRefHandle**    {[ref, lockKey]}  when you need function and syncRefHandle at sametime

**returns**: a extends promise object with `__lockValue` getter and `unlock` method

> ~~can be use in react and vue2/3 instance when bind this~~
> 2.0 will not bind this


#### use in react hooks

```javascript
import { wp } from '@wxhccc/es-util'

const [loading, setLoading] = useState(false)

/**
 * eg.1
 * will run setLoading(true) and run setLoading(false) after promise resettled 
 **/
const result = await wp(Promise.resolve(1), { lock: setLoading })
/**
 * eg.2
 */
const [er, data] = await wp(Promise.resolve(1), { wrap: true, lock: setLoading })
/*log [null, 1] */

/**
 * eg.3
 * will prevent second run when use syncRefHandle
 */
const loadingRef = useRef(false)

const asyncMethod = () => Promise.resolve(1)

const runTask = async () => {
  const [err, data] = await wp(asyncMethod, {  wrap: true, lock: setLoading, syncRefHandle: [loadingRef, 'current'] })
}

runTask()
runTask()
/*log [null, 1] */
/*log [null, undefined], second method call will resolve undefined immediate, but not run asyncMethod */

```

#### use in vue setup

```javascript
import { wp } from '@wxhccc/es-util'

const loading = ref(false)

/**
 * eg.1
 * will run setLoading(true) and run setLoading(false) after promise resettled 
 **/
const setLoading = (bool) => loading.value = bool
const result = await wp(Promise.resolve(1), { lock: setLoading })
/**
 * eg.2
 * lock can be syncRefHandle if ref is update sync, it's more simpler for vue
 */
const asyncMethod = () => Promise.resolve(1)

const runTask = async () => {
  const [err, data] = await wp(asyncMethod, {  wrap: true, lock: [loading, 'value'] })
}

runTask()
runTask()
/*log [null, 1] */
/*log [null, undefined], second method call will resolve undefined immediate, but not run asyncMethod */

```

## event-target-emitter module

> v1.7.0 add

this is a simple event emitter, you can find other emitter package is you need more function

### `eventTargetEmitter(options)`

return an emitter instance with `on`, `off`, `emit` and some other methods to handle with EventTarget

**parameters:**
- **options**    {ConfigOptions}
  - **name**    {string} the name of current emitter. can used to limit message received from
  - **customHanlderCreator**    {(watchers) => Function}  custome handler creator, you can handle message distribute logic as you want.

```javascript
import { eventTargetEmitter } from '@wxhccc/es-util'

/** eg.1 */
const emitter = eventTargetEmitter()

const runTaskA = () => {
  console.log('a')
}
const runTaskB = () => {
  console.log('b')
}
emitter.on('to-run-a', runTaskA)
emitter.on('to-run-b', runTaskA)

...
websocket.on('message', (task) => {
  if (task === 'a') {
    emitter.emit('to-run-a')
  } else if (task === 'b') {
    emitter.emit('to-run-b')
  }
})

/** eg.2 */
// page-a in tab 1
const emitter = eventTargetEmitter({ name: 'page-a' })

const runTask = () => {
  // this method will call when received message from page-b, but not call when received message from page-c
  console.log('do someting')
}
emitter.on('to-run-task', runTask, { limitFrom: 'page-b' })

const onStorageMessage = (payload) => {
  const payload = JSON.parse(localStorage.setItem('page-communicate'))
  emitter.emit(payload)
}

window.addEventListener('storage', onStorageMessage)

// page-b in tab 2
const { createPayload } = eventTargetEmitter({ name: 'page-b' })

const payload = createPayload('to-run-task', { a: 1 })
/**
 * payload: { method: 'to-run-task', data: { a: 1 }, originEmitterName: 'page-b' }
 */
localStorage.setItem('page-communicate', payload)

// 
```

## page-communicate module

> v1.7.0 add

### `pageCommunicate(options)`

return an instance which can used to communicate between same-origin pages, powered by `eventTargetEmitter`

this module is full realize of `eventTargetEmitter` eg.2, it use `BroadcastChannel` if it supported, otherwise will use `window.localStorage

```javascript
import { pageCommunicate } from '@wxhccc/es-util'

const pc = pageCommunicate()

pc.on('update-use-info', (newUserInfo) => {
  // update global state
})

// when one page change login account
pc.send('update-use-info', newUserInfo)
```


## raf-timer module

> v2.0.0 add

### `createRAFTimer(options)`

return an requestAnimationFrame timer instance. used to instead of window.setTimout and window.setInterval. 

```javascript
import { createRAFTimer } from '@wxhccc/es-util'

const timer = createRAFTimer()
// start timer
timer.start()

/** mock window.setTimeout, run once */
timer.addTask(() => {
  console.log('run after 1 second')
}, 1000, 1)
/** run 10 times */
timer.addTask(() => {
  console.log('run every 1 second, max 10 times')
}, 1000, 10)

const fn = () => {}
/** mock window.setInterval */
timer.addTask(fn, 1000)
/** stop task */
timer.removeTask(fn)

// you can stop timer when no task by pass options
const timer = createRAFTimer({
  autoStopWhenNoTask: true,
  autoStartWhenAddTask: true
})

```

## date-time module

> v2.0.0 add

### `secondsToDuration(number, maxUnit)`

```javascript
import { secondsToDuration } from '@wxhccc/es-util'

const detail = secondsToDuration(12345678)
/*log {h: 3429, m: 21, s: 18} */

const detail = secondsToDuration(12345678, 'd')
/*log { d: 142, h: 21, m: 21, s: 18 } */
```

parse seconds to duration detail object

## License
MIT