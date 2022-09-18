## Es Utils library

一个保护一些特定功能函数或模块的集合

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

// 示例：, array2tree
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

将平级对象数组按指定规则转换为树型结构。
使用引用关系进行转换，时间复杂度为n

**parameters:**
- **array**  {object[]} 需要转换的对象数组.
- **options**    {object}   
  - **primaryKey** {string}   数组元素项中的主键, 默认是 `'id'` 
  - **parentKey** {string}   数组元素项中的父元素, 默认是 `'pid'` 
  - **childrenKey** {string}   生成的树节点的子元素数组的key, 默认是 `'children'` 
  - **createRoot** {boolean | (nodes: TreeNode[]) => any}   是否需要创建一个根节点, 默认是 `false`, 会返回一个数组, 如果为`true` 则会返回一个对象. 你也可以传递一个函数来自定义返回节点的结构。
  - **parentRefKey** {boolean | string}  是否需要创建一个特殊属性指向当前节点的父节点, 默认是 `false`, 如果设置了字符串或者 `'true'(mean '_parent')` ,则会添加指定的属性来关联父子节点，这样可以很方便得通过子节点搜索到祖先节点。

>警告: 设置 `parentRefKey` 会让树节点变成循环引用, 这样就不能直接用 `JSON.stringify` 序列

**returns**: 节点数组，或者根节点对象

示例：

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

将树节点转换为平级结构，使用了递归处理

**parameters:**
- **tree**  {TreeNode[] | object}    需要转换的树结构数据
- **options**    {object}
  - **primaryKey** {string}   节点项的主键, 默认是 `'id'` 
  - **parentKey** {string}   当前节点的父节点的key, 默认是 `'pid'` 
  - **childrenKey** {string}   节点子元素数组的属性名, 默认是 `'children'`
  - **hasParentKey** {boolean}  节点是否有父节点字段, 默认是 `true`, 如果没有, 会创建一个新的属性

**returns**: 排平后的对象数组

示例：

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

### `treeAnalyse(tree, options, keys)`

> v2.1.0 add

分析树结构数据，生成一些便于中间处理的数据，可以通过设置keys来控制要处理的数据模块

**parameters:**
- **tree**            {TreeNode[] | object}    The tree structure need to transform.
- **options**    {object}    The options.
  - **primaryKey** {string}   the primary key of node item, default `'id'` 
  - **labelKey** {string}   the primary key of node item, default `'name'` 
  - **disabledKey** {string}   the disabled key of node item, default `'disabled'` 
  - **childrenKey** {string}   the childrenKey key of node item, default `'children'`
- **keys**        {('nodes' | 'keyNodeMap' | 'childKeysMaps' | 'disabledKeys')[]} the modules need to handle


**returns**: AnalyseTreeData

Example

```javascript
import { treeAnalyse } from '@wxhccc/es-util'

const tree = [
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

const result = array2tree(array)
console.log(result)
/* log
{
  "nodes": [
    {
      "id": 1,
      "name": "language",
      "children": [{…}, {…}]
    },
    {
      "id": 2,
      "name": "english",
      "children": []
    },
    {
      "id": 3,
      "name": "chinese",
      "children": []
    }
  ],
  "childKeysMaps": {
    "1": [2, 3]
  },
  "keyNodeMap": {
    1: {keyVlaue: 1, keyLabel: 'language', parent: undefined, children: [{…}, {…}]},
    2: {keyVlaue: 2, keyLabel: 'english', parent: {…}, children: [] },
    3: {keyVlaue: 3, keyLabel: 'chinese', parent: {…}, children: [] }
  },
  "disabledKeys": []
}
*/
```

## validate module

表单验证模块

### `ChinaIdCardValid(idCard)`

检查身份证ID是否符合规则

**parameters:**
- **idCard**            {string}    待验证的省份证号码

**returns**: boolean

示例：

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

验证计算公式是否合法，仅支持常规四则运算公式。

**parameters:**
- **formulaString**            {string}   公式字符串.
- **variables**                {string[]}    允许出现在公式里的合法变量名称数组.


**returns**: boolean

示例：

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

对象和数组相关模块

### `mapToObject(objectArray, keyProp, valueProp)`

将对象数组转换为key-value对应关系的对象，一般用于字典对象的快速匹配

**parameters:**
- **objectArray**      {object[]}    原对象数组
- **keyProp**          {string | (item: object, index: number) => string}    作为生成对象的key的数据项的属性名，默认是 `"key"`. 也可以用函数来动态返回key
  > 如果对象不包含指定的key, 或者函数返回了非字符串或数字类型的结果，则此数据项会被忽略，你也可以用此特性来过滤部分数据项.
- **valueProp**        {string | (item: object, index: number) => string}   作为生成对象的value的数据项的属性名，默认是 `"value"`. 也可以用函数来动态返回value.

**returns**: object

示例：

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

从一个配置项对象中挑出指定的项并返回为数组，常用于通用表格列的统一定义。你也可以在挑出时设定新的属性来覆盖默认属性

**parameters:**
- **object**      {object}    原配置对象.
- **keys**          {string[] | Record<string, null | object>}   `object` 对象的属性名数组. 或者传入一个对象，对象的key
  为需要挑出的属性名，对应的值如果为fasly则直接挑出默认配置，如果为对象则进行浅合并. 如果不提供此参数，则会返回 `Object.values(object)`
- **mergeFn**        {(objItem: object, newItem: any) => object}  如果浅合并无法满足需求，可以使用自定义合并逻辑，比如使用loadash的merge

**returns**: array

示例：

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

从对象中挑选指定属性和对应值，并对属性进行重命名。常用于从非标准接口数据（比如接口字段为下划线连接方式）中挑选指定的值转换为表单绑定值

**parameters:**
- **object**      {object}    原对象.
- **keysMap**          {Record<string, string>}    The `oldKey-newKey` object

**returns**: array

示例：

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

字符串转换相关模块

### `byteStringify(byteNum, options)`

字节数格式化，支持jedec，metric，iec3种形式

**parameters:**
- **byteNum**            {number}    需要格式化的字节数
- **options**    {object}    The options.
  - **standard** {string}   转换标准, 默认是 `'jedec'`, 支持 `'metric'`, `'iec'`. [Metric, IEC and JEDEC units](https://en.wikipedia.org/wiki/Gigabyte)
  - **unitLvl** {string}   转换的最大单位, 默认是 `'auto'`. 支持 `'B','K','M','G','T','P','E','Z','Y'`
  - **precision** {number}   保留的小数部分精度, 默认是 `1` 
  - **detail** {boolean}   是否需要范围完整信息对象，结构为：{ value, unit }, 默认是 `false`.


**returns**: string or object

示例：

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

> 下面3个函数从1.2.0版本后已经移除，你可以使用lodash替代
### ~~`camelize(string)`~~

### ~~`hyphenate(string)`~~

### ~~`camel2snake(string)`~~



## promise module

promise相关模块

### `awaitWrapper(promise)`

包裹promise对象，自动处理数据和捕捉错误，并返回`[null, data]` 或 `[Error, undefined]`格式的数据，通常用在async & await写法后

> ps: 和`await-to-js`包提供的功能一致，主要是减少包数量 

示例：

```javascript
import { awaitWrapper } from '@wxhccc/es-util'

const [err, data] = await awaitWrapper(Promise.resolve(1))
/*log [null, 1] */
const [err, data] = await awaitWrapper(Promise.reject())
/*log [err, undefined] */

```

### `wp(promise, [wrap])`

> 这个函数已经在v2.0版本进行重写，不再支持vue/react组件内环境的检测功能，因为现在hook写法更广泛。 

传入promise对象或者返回promise对象的函数，然后可以通过配置对象实现awaitWrapper包裹，自动设置loading状态，阻止重复调用的功能

**parameters:**
- **promise**    {Promise|() => Promise}    promise 对象或返回promise对象的函数. 使用函数形式时，配合lock/syncRefHandle, 可以实现阻止重复调用的功能
- **options**    {WrapOptions}
  - **wrap**    {boolean} 是否需要用`awaitWrapper`包裹promise对象，默认是 `false`
  - **lock**    {(bool) => void | [ref, lockKey]}
    ~~string: v2.0不监测组件实例环境，所以不再支持字符串形式的参数~~ 
    
    function: 函数形式，可以传入一个函数，例如在react hooks里，可以传入setXXX

    syncRefHandle: 形如 `[object, keyOfObject]` 的数组，会自动设置`object[keyOfObject]`的值，适用于vue3的ref形式。
  - **syncRefHandle**    {[ref, lockKey]}  如果在react中，state无法确保同步更新，所以需要锁定功能时，lock和syncRefHandle参数都需要，所以额外提供一个参数来获取同步状态。

**returns**: promise


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

事件相关模块

> v1.7.0 add

一个简单的emitter实现，如果需要更复杂功能的emitter可以搜索其他npm包

### `eventTargetEmitter(options)`

返回一个emitter实例， 包含 `on`, `off`, `emit` 等方法，可用来处理EventTarget相关逻辑

**parameters:**
- **options**    {ConfigOptions}
  - **name**    {string} 当前emitter的名称，不同浏览器窗口的应用可以用来限制数据来源
  - **customHanlderCreator**    {(watchers) => (payload) => void}  自定义事件处理逻辑创建函数，传入所有监听函数，需要返回一个函数。

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
  // 这个函数仅在接受到从page-b发送的消息时才会调用，其他页面发送时不会调用
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

同域名页面间通信方案模块

> v1.7.0 add

### `pageCommunicate(options)`

返回一个实例，可用于在同源页面间进行通信，基于`eventTargetEmitter`事件发送器，默认使用`BroadcastChannel`api 实现，如果不支持，则会降级到 `window.localStorage`方案。

```javascript
import { pageCommunicate } from '@wxhccc/es-util'

const pc = pageCommunicate()

pc.on('update-use-info', (newUserInfo) => {
  // 接受到更新消息后，更新本页面状态
})

// 某个页面上切换账号后，可以在存储到storage后向其他页面发送消息
pc.send('update-use-info', newUserInfo)
```


## raf-timer module

requestAnimationFrame计时器模块

> v2.0.0 add

### `createRAFTimer(options)`

返回一个基于requestAnimationFrame的计时器实例，可以用来替代`window.setTimout` and `window.setInterval`，有更精确的时间控制，在移动端也有更好的节电效果

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

日期时间相关模块

> v2.0.0 add

### `secondsToDuration(number, maxUnit)`

将秒数按指定格式转换为具体时间范围对象

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
