# API 参考文档

ansuko 实用工具库的完整 API 文档。

[English](./API.md) | [日本語](./API.ja.md) | [简体中文](./API.zh.md)


## 目录

- [核心函数](#核心函数)
- [类型守卫与验证](#类型守卫与验证)
- [类型转换](#类型转换)
- [Promise 工具](#promise-工具)
- [错误处理](#错误处理)
- [对象工具](#对象工具)
- [数组工具](#数组工具)
- [字符串工具](#字符串工具)
- [日文工具](#日文工具插件-pluginsja)
- [地理工具](#地理工具插件-pluginsgeo)
- [插件系统](#插件系统)
- [原始 lodash 函数](#原始-lodash-函数)

---

## 核心函数
- **isEmpty(value)**  
  检查是否为空；数字/布尔值不被视为空。  
  @category 核心函数  
  @example `_.isEmpty(0) // false`

- **boolIf(value, defaultValue?)**  
  安全的布尔值转换；数字使用零值检查，其他类型使用后备值。  
  @category 核心函数  
  @example `_.boolIf('x', true) // true`

- **waited(func, frameCount?)**  
  在 N 个动画帧后运行（`requestAnimationFrame`）。  
  @category 核心函数  
  @example `_.waited(() => measure(), 1)`

- **swallow(fn)**  
  执行函数，如果发生错误则返回 undefined（同步/异步）。  
  @category 核心函数  
  @example `_.swallow(() => riskyOp()) // 出错时为 undefined`

- **swallowMap(array, fn, compact?)**  
  映射数组，将错误视为 undefined。如果 `compact` 为 true，则过滤掉错误。  
  @category 核心函数  
  @example `_.swallowMap(items, process, true) // 仅成功的结果`

- **extend(plugin)**  
  应用插件并返回扩展后的实例。  
  @category 核心函数  
  @example `const _ja = _.extend(jaPlugin)`

## 类型守卫与验证

### isValidStr(value)
仅对非空字符串返回 true。对于 null、undefined、空字符串或非字符串值返回 `false`。

**分类：** 类型守卫  
**返回值：** `boolean`

**示例：**
```typescript
_.isValidStr('hello')     // true
_.isValidStr('')          // false
_.isValidStr(null)        // false
_.isValidStr(undefined)   // false
_.isValidStr(0)           // false
_.isValidStr([])          // false
```

**使用场景：**
- 表单验证
- API 参数检查
- 安全的字符串操作

---

## 类型转换

### toNumber(value)
将值转换为数字，支持全角字符和逗号。对于无效输入返回 `null`。

**分类：** 核心函数  
**参数：**
- `value` (unknown)：要转换的值

**返回值：** `number | null`

**特性：**
- 处理全角数字：`'１２３'` → `123`
- 移除逗号：`'1,234.5'` → `1234.5`
- 对于无效输入返回 `null`（而非 `NaN`）

**示例：**
```typescript
_.toNumber('1,234')           // 1234
_.toNumber('１２３')          // 123
_.toNumber('1,234.5')         // 1234.5
_.toNumber('abc')             // null
_.toNumber(null)              // null
_.toNumber(42)                // 42
```

**使用场景：**
- 解析用户输入（表单、CSV 导入）
- 处理包含全角数字的日文文本
- 无异常的安全数值转换

---

### toBool(value, undetected?)
智能布尔值转换，可处理字符串、数字和各种布尔值表示形式。

**分类：** 核心函数  
**参数：**
- `value` (unknown)：要转换的值
- `undetected` (boolean | null = null)：当转换不明确时的返回值

**返回值：** `boolean | null | Promise<boolean | null>`

**识别的值：**
- **真值字符串：** `"true"`, `"t"`, `"y"`, `"yes"`, `"ok"`（不区分大小写）
- **假值字符串：** `"false"`, `"f"`, `"n"`, `"no"`, `"ng"`（不区分大小写）
- **数字：** `0` 为 false，其他数字为 true
- **布尔值：** 原样返回
- **函数：** 自动调用（支持 Promise）

**示例：**
```typescript
_.toBool(1)                   // true
_.toBool(0)                   // false
_.toBool('yes')               // true
_.toBool('no')                // false
_.toBool('true')              // true
_.toBool('unknown')           // null
_.toBool('unknown', false)    // false（自定义默认值）
_.toBool(null)                // false
```

**使用场景：**
- 表单复选框/开关解析
- 环境变量解析
- API 响应标准化

---

### boolIf(value, defaultValue = false)
带后备值的安全布尔值转换。仅转换实际的布尔值和数字。

**分类：** 核心函数  
**参数：**
- `value` (unknown)：要检查的值
- `defaultValue` (boolean = false)：后备值

**返回值：** `boolean`

**逻辑：**
- 如果是布尔值：返回该布尔值
- 如果是数字：返回 `!!value`（零值检查）
- 否则：返回 `defaultValue`

**示例：**
```typescript
_.boolIf(true)                // true
_.boolIf(1)                   // true
_.boolIf(0)                   // false
_.boolIf('string', true)      // true（默认值）
_.boolIf(null, false)         // false（默认值）
```

**使用场景：**
- 类型安全的布尔值强制转换
- 可选标志处理
- 避免意外的真值/假值转换

---

### parseJSON(str)
无需 try-catch 的安全 JSON/JSON5 解析。出错时返回 `null`。

**分类：** 转换  
**参数：**
- `str` (string | object)：要解析的 JSON 字符串

**返回值：** `T | null`

**特性：**
- 使用 JSON5 解析器（支持注释、尾随逗号、无引号键）
- 不抛出异常
- 已解析的对象原样返回

**示例：**
```typescript
_.parseJSON('{"a":1}')                    // {a:1}
_.parseJSON('{a:1}')                      // {a:1}（JSON5！）
_.parseJSON('{ "a": 1, /* 注释 */ }')     // {a:1}
_.parseJSON('{ "a": 1, }')                // {a:1}（尾随逗号）
_.parseJSON('invalid')                    // null
_.parseJSON({a:1})                        // {a:1}（直接传递）
```

**使用场景：**
- 加载配置文件
- 解析 API 响应
- 处理用户提供的 JSON

---

### jsonStringify(obj, replacer?, space?)
字符串化对象/数组；对于原始类型返回 `null`。标准化 JSON 字符串。

**分类：** 转换  
**参数：**
- `obj` (T)：要字符串化的对象
- `replacer` ((this: any, key: string, value: any) => any | undefined)：可选的转换函数，用于在字符串化过程中转换值
- `space` (string | number | undefined)：可选的缩进格式（空格数或字符串）

**返回值：** `string | null`

**逻辑：**
- 对象/数组：`JSON.stringify(obj, replacer, space)`
- 字符串：尝试作为 JSON5 解析，然后使用格式重新字符串化（标准化）
- 原始类型：`null`

**示例：**
```typescript
_.jsonStringify({a:1})                    // '{"a":1}'
_.jsonStringify([1,2,3])                  // '[1,2,3]'
_.jsonStringify('{a:1}')                  // '{"a":1}'（标准化）
_.jsonStringify('hello')                  // null
_.jsonStringify(42)                       // null
_.jsonStringify(null)                     // null

// 使用格式化（美化输出）
_.jsonStringify({a:1, b:2}, null, 2)
// '{
//   "a": 1,
//   "b": 2
// }'

// 使用 replacer 函数（过滤/转换值）
_.jsonStringify(
  {name: 'Alice', password: 'secret123', age: 30},
  (key, value) => key === 'password' ? undefined : value
)
// '{"name":"Alice","age":30}'

// 组合 replacer 和格式化
_.jsonStringify(
  {id: 1, value: 999.999},
  (key, value) => typeof value === 'number' ? Math.round(value) : value,
  2
)
// '{
//   "id": 1,
//   "value": 1000
// }'
```

**使用场景：**
- 安全的 JSON 序列化
- 避免 `JSON.stringify('string')` → `'"string"'` 问题
- 使用美化格式生成配置文件
- 在序列化过程中过滤敏感字段
- 在 JSON 导出期间转换值

---

## Promise 工具

### valueOr(value, elseValue)
返回值或默认值；自动检测和处理函数与 Promise。

**分类：** Promise 工具  
**参数：**
- `value` (MaybeFunction<MaybePromise<T>>)：值或 thunk 函数
- `elseValue` (E | (() => MaybePromise<E>))：默认值或 thunk

**返回值：** `MaybePromise<T | E>`

**行为：**
1. 如果 `value` 是函数，则调用它
2. 如果结果是 Promise，则等待它
3. 如果结果为 nil 或空，则使用 `elseValue`
4. 如果 `elseValue` 是函数，则调用它（惰性求值）

**示例：**
```typescript
// 简单后备
_.valueOr('value', 'default')                    // 'value'
_.valueOr(null, 'default')                       // 'default'
_.valueOr(undefined, 'default')                  // 'default'

// 惰性求值（如果值存在则不调用函数）
_.valueOr(config.timeout, () => expensiveCalculation())

// Promise 支持
await _.valueOr(
  fetch('/api').then(r => r.json()),
  { default: true }
)

// 缓存模式
await _.valueOr(
  () => cache.get(key),
  () => api.fetch(key)
)

// 函数链
await _.valueOr(
  () => localStorage.get('config'),
  () => api.getDefaultConfig()
)
```

**使用场景：**
- 缓存优先的数据加载
- 带默认值的配置验证
- 惰性后备计算
- 基于 Promise 的错误恢复

---

### equalsOr(a, b, elseValue)
比较两个值；如果不相等则返回后备值。支持 Promise。

**分类：** Promise 工具  
**参数：**
- `a` (unknown)：第一个值
- `b` (unknown)：第二个值
- `elseValue` (E | (() => MaybePromise<E>))：不相等时的后备值

**返回值：** `MaybePromise<T | E>`

**逻辑：**
1. 使用深度相等性比较 `a` 和 `b`
2. 如果相等：返回 `a`
3. 如果不相等：返回 `elseValue`（如果是函数则调用）

**示例：**
```typescript
// 简单比较
_.equalsOr('a', 'a', 'different')           // 'a'
_.equalsOr('a', 'b', 'different')           // 'different'

// 对象比较（深度）
_.equalsOr({x: 1}, {x: 1}, 'no')           // {x: 1}
_.equalsOr({x: 1}, {x: 2}, 'no')           // 'no'

// 惰性后备（仅在不相等时调用函数）
_.equalsOr(original, edited, () => showConfirmDialog())

// Promise 支持
await _.equalsOr(
  localData,
  serverData,
  () => api.sync()
)

// 编辑检测
if (_.equalsOr(before, after, true) !== true) {
  console.log('数据已更改')
}
```

**使用场景：**
- 检测未保存的更改
- 条件 API 调用
- "仅在更改时保存"逻辑
- 条件确认对话框

---

## 错误处理

### swallow(fn)
执行函数，如果发生错误则返回 undefined。支持同步和异步函数。

**分类：** 核心函数  
**参数：**
- `fn` (() => T)：要执行的函数

**返回值：** `T | undefined`（异步函数返回 `Promise<T | undefined>`）

**特性：**
- 无需 try-catch
- 支持同步和异步函数
- 出错时返回 undefined（不抛出异常）
- Promise 拒绝也变为 undefined

**示例：**
```typescript
// 同步函数
const result = _.swallow(() => riskyOperation())
// => 结果或 undefined

const data = _.swallow(() => deleteCache())
// => undefined（错误被静默处理）

// 异步函数
const user = await _.swallow(async () => await fetchUser(id))
// => 用户对象或 undefined

const response = await _.swallow(() => fetch('/api/data'))
// => Response 或 undefined

// 安全的属性访问
const value = _.swallow(() => obj.deep.nested.property)
// => 值或 undefined（无"Cannot read property"错误）

// 可选的清理操作
_.swallow(() => cache.clear())
_.swallow(() => ws.disconnect())
```

**使用场景：**
- 可能失败的可选操作
- 不应使应用崩溃的清理操作
- 调用行为不确定的第三方库
- 优雅降级

---

### swallowMap(array, fn, compact?)
映射数组，将错误视为 undefined。当 compact 为 true 时，过滤掉 undefined 结果（错误）。

**分类：** 核心函数  
**参数：**
- `array` (T[] | undefined | null)：要处理的数组
- `fn` ((item: T, index: number) => U)：应用于每个元素的函数
- `compact` (boolean = false)：如果为 true，过滤掉 undefined 结果（错误）

**返回值：** `U[]`（异步函数返回 `Promise<U[]>`）

**特性：**
- 无需数组存在性检查（处理 null/undefined）
- 单个错误不会中断整个操作
- 可选的紧凑模式用于错误过滤
- 支持同步和异步函数
- 内部使用 Promise.all 处理异步操作

**示例：**
```typescript
// 保留错误为 undefined
const results = _.swallowMap([1, 2, 3], item => {
  if (item === 2) throw new Error('fail')
  return item * 2
})
// => [2, undefined, 6]

// 过滤错误（compact）
const validResults = _.swallowMap([1, 2, 3], item => {
  if (item === 2) throw new Error('fail')
  return item * 2
}, true)
// => [2, 6]

// 异步处理
const data = await _.swallowMap(
  urls,
  async url => {
    const response = await fetch(url)
    return response.json()
  },
  true  // 仅成功的请求
)
// => 仅成功响应的数组

// 处理部分失败的项目
const results = _.swallowMap(
  items,
  item => processComplexItem(item),
  true
)
// => 仅成功处理的项目

// 安全的 null/undefined 数组
const items = _.swallowMap(maybeArray, item => process(item))
// => 如果 maybeArray 为 null/undefined 则为 []

// 容错的文件处理
const processed = await _.swallowMap(
  files,
  async file => await processFile(file),
  true
)
// => 仅成功处理的文件
```

**使用场景：**
- 可接受部分失败的批处理操作
- 数据导入/迁移（跳过无效记录）
- 向多个端点发起 API 调用
- 容错的文件处理
- 从不可靠来源解析 JSON

**模式：分离成功和失败**
```typescript
// 处理所有项目，跟踪成功和失败
const results = _.swallowMap(items, item => processItem(item))
const successes = results.filter(r => r !== undefined)
const failureCount = results.length - successes.length

console.log(`已处理：${successes.length}，失败：${failureCount}`)
```

---

## 对象工具

### changes(original, updated, keys?, options?)
检测两个对象之间的更改。支持深度路径和键排除。

**分类：** 对象工具  
**参数：**
- `original` (Record<string, any>)：原始对象
- `updated` (Record<string, any>)：更新后的对象
- `keys` (string[] | null)：要检查的键（可选）
- `options` (ChangesOptions)：可选配置
  - `keyExcludes` (boolean = false)：如果为 true，`keys` 参数被视为排除列表
  - `ignoreUndefined` (boolean = false)：如果为 true，忽略值为 undefined 的键

**返回值：** `Record<string, any> | null`

**特性：**
- **深度路径支持：** 使用点符号检查嵌套属性（例如 `'profile.bio'`）
- **嵌套结果：** 返回结构化对象以便轻松应用
- **键过滤：** 仅检查指定的键或排除某些键
- **选择性更新：** 返回仅包含已更改字段的对象

**示例：**
```typescript
// 基本用法
const orig = { name: 'John', age: 30 }
const edit = { name: 'John', age: 31 }
_.changes(orig, edit)  // { age: 31 }

// 带键过滤
const changes = _.changes(orig, edit, ['age'])  // { age: 31 }

// 深度路径
const orig = {
  profile: { bio: 'old', avatar: 'pic1.jpg' },
  settings: { theme: 'light' }
}
const edit = {
  profile: { bio: 'new', avatar: 'pic1.jpg' },
  settings: { theme: 'dark' }
}
_.changes(orig, edit, ['profile.bio', 'settings.theme'])
// { profile: { bio: 'new' }, settings: { theme: 'dark' } }

// 键排除
_.changes(orig, edit, ['id', 'created_at'], { keyExcludes: true })
// 返回除 id 和 created_at 之外的所有更改

// 忽略 undefined 值
const orig = { a: 1, b: 2 }
const edit = { a: 1, b: undefined }
_.changes(orig, edit, null, { ignoreUndefined: true })
// null（忽略 b 的更改）
```

**使用场景：**
- 数据库更新（仅更新已更改的字段）
- 表单验证（检测未保存的更改）
- 审计日志（跟踪字段级更改）
- API 负载优化（仅发送已更改的数据）

---

### equals(a, b)
深度相等性比较（使用 `lodash.isEqual`）。

**分类：** 对象工具  
**参数：**
- `a` (any)：第一个值
- `b` (any)：第二个值

**返回值：** `boolean`

**示例：**
```typescript
_.equals({a: 1}, {a: 1})           // true
_.equals([1, 2], [1, 2])           // true
_.equals({a: {b: 1}}, {a: {b: 1}}) // true
_.equals({a: 1}, {a: 2})           // false
```

---

### hasKeys(obj, keys)
检查对象是否具有所有指定的键。

**分类：** 对象工具  
**参数：**
- `obj` (object)：要检查的对象
- `keys` (string[])：必需的键

**返回值：** `boolean`

**示例：**
```typescript
_.hasKeys({a: 1, b: 2}, ['a', 'b'])     // true
_.hasKeys({a: 1}, ['a', 'b'])           // false
_.hasKeys({}, ['a'])                    // false
```

**使用场景：**
- API 响应验证
- 配置对象验证
- 类型守卫

---

## 数组工具

### castArray(value)
将值转换为数组。与 lodash 不同，将 `null`/`undefined` 转换为空数组。

**分类：** 数组工具  
**参数：**
- `value` (T | T[] | null | undefined)：要转换的值

**返回值：** `T[]`

**行为：**
- 数组：原样返回
- `null`/`undefined`：返回 `[]`（lodash 返回 `[null]`）
- 其他：包装在数组中

**示例：**
```typescript
_.castArray([1, 2, 3])     // [1, 2, 3]
_.castArray('hello')       // ['hello']
_.castArray(null)          // []（lodash：[null]）
_.castArray(undefined)     // []（lodash：[undefined]）
_.castArray(42)            // [42]
```

**使用场景：**
- 标准化可选数组参数
- API 响应处理
- 清洁的 `null` 处理

---

## 字符串工具

### haifun(str)
标准化所有类型的破折号/连字符为单一字符（`\u2010`）。

**分类：** 字符串工具  
**参数：**
- `str` (string)：要标准化的字符串

**返回值：** `string`

**处理的破折号类型：**
- 连字符减号（`-`, U+002D）
- 减号（`−`, U+2212）
- 短横线（`–`, U+2013）
- 长横线（`—`, U+2014）
- 波浪号破折号（`〜`, U+301C）
- 全角连字符减号（`－`, U+FF0D）
- 加泰罗尼亚点中点（`·`, U+00B7）
- **全部标准化为：** 连字符（`‐`, U+2010）

**示例：**
```typescript
_.haifun('ABC-123')      // 'ABC‐123'
_.haifun('ABC—123')      // 'ABC‐123'（长横线）
_.haifun('ABC–123')      // 'ABC‐123'（短横线）
_.haifun('ABC−123')      // 'ABC‐123'（减号）
_.haifun('東京-大阪')    // '東京‐大阪'

// 用于比较
const a = 'ABC-123'
const b = 'ABC—123'
a === b                  // false（不同的破折号）
_.haifun(a) === _.haifun(b)  // true（标准化后匹配）
```

**使用场景：**
- 产品代码/SKU 比较
- 地址匹配
- 搜索查询标准化
- CSV/Excel 数据清洗
- 数据库查询

---

## 日文工具（插件: `plugins/ja`）

加载日文插件以访问日文文本处理功能：

```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'

const extended = _.extend(jaPlugin)
```

### kanaToFull(str)
将半角片假名转换为全角。

**示例：**
```typescript
extended.kanaToFull('ｶﾞｷﾞ')     // 'ガギ'
extended.kanaToFull('ｱｲｳ')      // 'アイウ'
```

---

### kanaToHalf(str)
将全角片假名转换为半角（浊音符号拆分为单独的字符）。

**示例：**
```typescript
extended.kanaToHalf('ガギ')      // 'ｶﾞｷﾞ'
extended.kanaToHalf('アイウ')    // 'ｱｲｳ'
```

---

### kanaToHira(str)
将片假名转换为平假名（半角自动先转换为全角）。

**示例：**
```typescript
extended.kanaToHira('アイウ')    // 'あいう'
extended.kanaToHira('ｱｲｳ')      // 'あいう'（已处理半角）
```

---

### hiraToKana(str)
将平假名转换为片假名。

**示例：**
```typescript
extended.hiraToKana('あいう')    // 'アイウ'
```

---

### toFullWidth(value, withHaifun?)
将半角字符转换为全角；可选的连字符标准化。

**参数：**
- `value` (unknown)：输入值
- `withHaifun` (string)：如果提供，将连字符标准化为此字符

**示例：**
```typescript
extended.toFullWidth('ABC-123', 'ー')  // 'ＡＢＣー１２３'
extended.toFullWidth('abc')            // 'ａｂｃ'
extended.toFullWidth('123')            // '１２３'
```

---

### toHalfWidth(value, withHaifun?)
将全角字符转换为半角；可选的连字符标准化。

**参数：**
- `value` (unknown)：输入值
- `withHaifun` (string)：如果提供，将连字符标准化为此字符

**示例：**
```typescript
extended.toHalfWidth('ＡＢＣー１２３', '-')  // 'ABC-123'
extended.toHalfWidth('ａｂｃ')              // 'abc'
extended.toHalfWidth(' ｱｲｳ　123 ')         // ' ｱｲｳ 123 '
```

---

## 地理工具（插件: `ansuko/plugins/geo`）

加载 Geo 插件以访问 GeoJSON 转换函数：

```typescript
import _ from 'ansuko'
import geoPlugin from 'ansuko/plugins/geo'

const extended = _.extend(geoPlugin)
```

### toGeoJson(geo, type?, digit?)
通用 GeoJSON 转换器，具有自动检测功能（从高维度到低维度尝试）。

**参数：**
- `geo` (any)：输入坐标、对象或 GeoJSON
- `type` (GeomType = GeomType.auto)：目标几何类型
- `digit` (number)：舍入的小数位数

**GeomType 枚举：**
- `GeomType.auto` - 自动检测（默认）
- `GeomType.point`
- `GeomType.lineString`
- `GeomType.polygon`
- `GeomType.multiPoint`
- `GeomType.multiLineString`
- `GeomType.multiPolygon`

**示例：**
```typescript
extended.toGeoJson([139.7, 35.6], GeomType.point)
// => { type: 'Point', coordinates: [139.7, 35.6] }

extended.toGeoJson([[139.7, 35.6], [139.8, 35.7]], GeomType.lineString)
// => { type: 'LineString', coordinates: [[139.7, 35.6], [139.8, 35.7]] }
```

---

### toPointGeoJson(geo, digit?)
将坐标或对象转换为 Point GeoJSON。

**接受：**
- 数组：`[lng, lat]`
- 对象：`{ lat, lng }` 或 `{ latitude, longitude }`
- GeoJSON：Feature、FeatureCollection、Point 几何

**示例：**
```typescript
extended.toPointGeoJson([139.7671, 35.6812])
// => { type: 'Point', coordinates: [139.7671, 35.6812] }

extended.toPointGeoJson({ lat: 35.6895, lng: 139.6917 })
// => { type: 'Point', coordinates: [139.6917, 35.6895] }

// 带舍入
extended.toPointGeoJson([139.7671234, 35.6812345], 4)
// => { type: 'Point', coordinates: [139.7671, 35.6812] }
```

---

### toPolygonGeoJson(geo, digit?)
将外环转换为 Polygon GeoJSON（验证闭合环）。

**要求：**
- 第一个和最后一个坐标必须相同（闭合环）
- 最少 4 个点（包括闭合点）

**示例：**
```typescript
extended.toPolygonGeoJson([
  [139.70, 35.68],
  [139.78, 35.68],
  [139.78, 35.75],
  [139.70, 35.75],
  [139.70, 35.68]  // 必须闭合！
])
// => { type: 'Polygon', coordinates: [[...]] }
```

---

### toLineStringGeoJson(geo, digit?)
将坐标转换为 LineString（检查自相交）。

**验证：**
- 拒绝自相交线
- 最少 2 个点

**示例：**
```typescript
extended.toLineStringGeoJson([
  [139.70, 35.68],
  [139.75, 35.70],
  [139.80, 35.72]
])
// => { type: 'LineString', coordinates: [[...]] }
```

---

### toMultiPointGeoJson(geo, digit?)
将多个点转换为 MultiPoint GeoJSON。

---

### toMultiPolygonGeoJson(geo, digit?)
将多个多边形转换为 MultiPolygon GeoJSON（验证外环）。

---

### toMultiLineStringGeoJson(geo, digit?)
将多条线转换为 MultiLineString GeoJSON（检查每条线的自相交）。

---

### unionPolygon(geo, digit?)
将多个 Polygon/MultiPolygon 合并为单个 Geometry。

**返回值：** `Polygon | MultiPolygon | null`

**示例：**
```typescript
const poly1 = [[139.7, 35.6], [139.8, 35.6], [139.8, 35.7], [139.7, 35.7], [139.7, 35.6]]
const poly2 = [[139.75, 35.65], [139.85, 35.65], [139.85, 35.75], [139.75, 35.75], [139.75, 35.65]]

const unified = extended.unionPolygon([poly1, poly2])
// => 组合后的多边形或 multipolygon
```

**使用场景：**
- 合并行政边界
- 组合重叠区域
- 空间分析

---

### parseToTerraDraw(geo)
将 GeoJSON 转换为 Terra Draw 兼容的要素（带自动生成的 UUID）。

---

## 插件系统

### extend(plugin)
应用插件以扩展 ansuko 的附加功能。

**分类：** 核心函数  
**参数：**
- `plugin` ((ansuko: AnsukoType) => T)：插件函数

**返回值：** `AnsukoType & T`（扩展实例）

**用法：**
```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'
import geoPlugin from 'ansuko/plugins/geo'

// 单个插件
const withJa = _.extend(jaPlugin)
withJa.kanaToHira('アイウ')  // 'あいう'

// 多个插件（链式）
const full = _
  .extend(jaPlugin)
  .extend(geoPlugin)

full.kanaToHira('アイウ')                    // 'あいう'
full.toPointGeoJson([139.7, 35.6])         // Point 几何
```

**可用插件：**
- `jaPlugin` - 日文文本处理（`ansuko/plugins/ja`）
- `geoPlugin` - GeoJSON 工具（`ansuko/plugins/geo`）
- `prototypePlugin` - 数组原型扩展（`ansuko/plugins/prototype`）

---

## 原始 lodash 函数

ansuko 用改进的行为覆盖了一些 lodash 函数。原始版本仍然可访问：

### isEmptyOrg
原始 lodash `isEmpty`（其中数字/布尔值被视为空）。

```typescript
_.isEmptyOrg(0)      // true（原始 lodash 行为）
_.isEmpty(0)         // false（ansuko 行为）
```

---

### toNumberOrg
原始 lodash `toNumber`（基本转换，不支持全角/逗号）。

```typescript
_.toNumberOrg('1,234')    // NaN（原始 lodash）
_.toNumber('1,234')       // 1234（ansuko）
```

---

### castArrayOrg
原始 lodash `castArray`（保留数组中的 null）。

```typescript
_.castArrayOrg(null)   // [null]（原始 lodash）
_.castArray(null)      // []（ansuko）
```

---

## 所有 lodash 函数可用

除了上述增强功能外，**所有标准 lodash 函数**仍然可用：

- `_.size`, `_.isNil`, `_.debounce`, `_.throttle`
- `_.map`, `_.filter`, `_.reduce`, `_.forEach`
- `_.get`, `_.set`, `_.has`, `_.omit`, `_.pick`
- `_.keys`, `_.values`, `_.entries`
- `_.merge`, `_.cloneDeep`, `_.isEqual`
- `_.sortBy`, `_.groupBy`, `_.uniq`, `_.flatten`
- 以及 200 多个 lodash 工具

像往常一样使用 lodash：

```typescript
import _ from 'ansuko'

_.map([1, 2, 3], n => n * 2)        // [2, 4, 6]
_.get({ a: { b: 1 } }, 'a.b')       // 1
_.debounce(fn, 100)                 // 防抖函数
```