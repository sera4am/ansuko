# ansuko

一个现代化的 JavaScript/TypeScript 实用工具库，以实用、直观的行为扩展 lodash。

[English](./README.md) | [日本語](./README.ja.md) | [简体中文](./README.zh.md)

## 为什么选择 ansuko？

"ansuko"这个名字有多重含义：

- **アンスコ (ansuko)** - 日文中"underscore"（下划线）的缩写（アンダースコア）
- **ansuko = underscore → low dash → lodash** - 延续这个系列
- **スコ (suko)** - 日文俚语，意为"喜欢"或"最爱"

这个库修复了 lodash 的不直观行为，并添加了强大的工具来消除常见的 JavaScript 困扰。

## 安装

```bash
npm install ansuko
```

或添加到你的 `package.json`：

```json
{
  "dependencies": {
    "ansuko"
  }
}
```

## 核心理念

ansuko 通过直观的行为消除常见的 JavaScript 困扰：

### 修复 lodash 的怪异行为

```typescript
// ❌ lodash（不直观）
_.isEmpty(0)           // true  - 0 真的"空"吗？
_.isEmpty(true)        // true  - true "空"吗？
_.castArray(null)      // [null] - 为什么保留 null？

// ✅ ansuko（直观）
_.isEmpty(0)           // false - 数字不为空
_.isEmpty(true)        // false - 布尔值不为空
_.castArray(null)      // []    - 干净的空数组
```

### 安全的 JSON 处理

```typescript
// ❌ 标准 JSON（烦人）
JSON.stringify('hello')  // '"hello"'  - 额外的引号！
JSON.parse(badJson)      // 抛出错误  - 需要 try-catch

// ✅ ansuko（流畅）
_.jsonStringify('hello')     // null     - 不是对象
_.jsonStringify({ a: 1 })    // '{"a":1}' - 干净
_.parseJSON(badJson)         // null     - 无异常
_.parseJSON('{ a: 1, }')     // {a:1}    - 支持 JSON5！
```

### Promise 感知的后备

```typescript
// ❌ 冗长的模式
const data = await fetchData()
const result = data ? data : await fetchBackup()

// ✅ ansuko（简洁）
const result = await _.valueOr(
  () => fetchData(),
  () => fetchBackup()
)
```

### 智能比较

```typescript
// ❌ 冗长的三元表达式地狱
const value = a === b ? a : (a == null && b == null ? a : defaultValue)

// ✅ ansuko（可读）
const value = _.equalsOr(a, b, defaultValue)  // null == undefined
```

## 主要特性

### 增强的 lodash 函数

- **`isEmpty`** - 检查是否为空（数字和布尔值不为空）
- **`castArray`** - 转换为数组，null/undefined 返回 `[]`
- 所有 lodash 函数仍然可用：`size`、`isNil`、`debounce`、`isEqual`、`keys`、`values`、`has` 等

### 值处理与控制流

- **`valueOr`** - 获取值或默认值，支持 Promise/函数
- **`emptyOr`** - 如果为空返回 null，否则应用回调或返回值
- **`hasOr`** - 检查路径是否存在，如果缺失则返回默认值（支持深度路径和 Promise）
- **`equalsOr`** - 比较并后备，具有直观的 nil 处理（支持 Promise）
- **`changes`** - 跟踪对象差异用于数据库更新（支持深度路径如 `profile.tags[1]` 和排除模式）
- **`swallow`** - 执行函数，出错时返回 undefined（同步/异步支持）
- **`swallowMap`** - 映射数组，将错误视为 undefined（可选紧凑模式过滤错误）

### 类型转换与验证

- **`toNumber`** - 解析数字，支持逗号/全角，无效时返回 `null`
- **`toBool`** - 智能布尔值转换（"yes"/"no"/"true"/"false"/数字），可配置未检测处理
- **`boolIf`** - 带后备的安全布尔值转换
- **`isValidStr`** - 非空字符串验证

### JSON 处理

- **`parseJSON`** - 无需 try-catch 的安全 JSON/JSON5 解析（支持注释和尾随逗号）
- **`jsonStringify`** - 仅字符串化有效对象，防止意外的字符串包装

### 数组工具

- **`arrayDepth`** - 返回数组的嵌套深度（非数组：0，空数组：1）
- **`castArray`** - 转换为数组，nil 变为 `[]`（而非 `[null]`）

### 日文文本（插件：`ansuko/plugins/ja`）

- **`kanaToFull`** - 半角片假名 → 全角（例如 `ｶﾞｷﾞ` → `ガギ`）
- **`kanaToHalf`** - 全角 → 半角片假名（浊音拆分：`ガギ` → `ｶﾞｷﾞ`）
- **`kanaToHira`** - 片假名 → 平假名（自动先转换半角）
- **`hiraToKana`** - 平假名 → 片假名
- **`toHalfWidth`** - 全角 → 半角，可选连字符标准化
- **`toFullWidth`** - 半角 → 全角，可选连字符标准化
- **`haifun`** - 将各种连字符标准化为单一字符

### 地理工具（插件：`ansuko/plugins/geo`）

- **`toGeoJson`** - 通用 GeoJSON 转换器，具有自动检测功能（从高维度到低维度尝试）
- **`toPointGeoJson`** - 将坐标/对象转换为 Point GeoJSON
- **`toPolygonGeoJson`** - 将外环转换为 Polygon（验证闭合环）
- **`toLineStringGeoJson`** - 将坐标转换为 LineString（检查自相交）
- **`toMultiPointGeoJson`** - 将多个点转换为 MultiPoint
- **`toMultiPolygonGeoJson`** - 将多个多边形转换为 MultiPolygon
- **`toMultiLineStringGeoJson`** - 将多条线转换为 MultiLineString
- **`unionPolygon`** - 将多个 Polygon/MultiPolygon 合并为单个几何
- **`parseToTerraDraw`** - 将 GeoJSON 转换为 Terra Draw 兼容的要素

### 原型扩展（插件：`ansuko/plugins/prototype`）

- **`Array.prototype.notMap`** - 使用否定谓词映射 → 布尔数组
- **`Array.prototype.notFilter`** - 通过否定谓词过滤（不匹配的项）

### 时间工具

- **`waited`** - 通过 N 个动画帧延迟执行（比 `setTimeout` 更适合 React/DOM）

## 插件架构

ansuko 使用最小核心 + 插件架构来保持你的包大小小：

- **核心**（~20KB）：改进 lodash 的基本工具
- **日文插件**（~5KB）：仅在需要日文文本处理时加载
- **地理插件**（~100KB 含 @turf/turf）：仅为 GIS 应用加载
- **原型插件**（~1KB）：仅在需要数组原型扩展时加载

这意味着你只为使用的功能付费！

```typescript
// 最小包 - 仅核心
import _ from 'ansuko'  // ~20KB

// 需要时添加日文支持
import jaPlugin from 'ansuko/plugins/ja'
_.extend(jaPlugin)  // +5KB

// 为地图应用添加 GIS 功能
import geoPlugin from 'ansuko/plugins/geo'
_.extend(geoPlugin)  // +100KB
```

## 快速开始

### 基本用法

```typescript
import _ from 'ansuko'

// 增强的 lodash 函数
_.isEmpty(0)           // false（不像 lodash 那样是 true！）
_.isEmpty([])          // true
_.castArray(null)      // []（不是 [null]！）
_.toNumber('1,234.5')  // 1234.5

// 支持 Promise 的值处理
const value = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id)
)

// 安全的 JSON 解析
const data = _.parseJSON('{ "a": 1, /* 注释 */ }')  // 支持 JSON5！

// 跟踪对象更改以进行数据库更新
const diff = _.changes(
  original, 
  updated, 
  ['name', 'email', 'profile.bio']
)

// 无需 try-catch 的错误处理
const result = _.swallow(() => riskyOperation())  // 出错时为 undefined
const items = _.swallowMap([1, 2, 3], item => processItem(item), true)  // 过滤错误
```

### 使用插件

#### 日文文本插件

```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'

_.extend(jaPlugin)

_.kanaToFull('ｶﾞｷﾞ')              // 'ガギ'
_.kanaToHira('アイウ')             // 'あいう'
_.toHalfWidth('ＡＢＣー１２３', '-') // 'ABC-123'
_.haifun('test‐data', '-')       // 'test-data'
```

#### 地理插件

```typescript
import _ from 'ansuko'
import geoPlugin from 'ansuko/plugins/geo'

const extended = _.extend(geoPlugin)

// 将各种格式转换为 GeoJSON
extended.toPointGeoJson([139.7671, 35.6812])
// => { type: 'Point', coordinates: [139.7671, 35.6812] }

extended.toPointGeoJson({ lat: 35.6895, lng: 139.6917 })
// => { type: 'Point', coordinates: [139.6917, 35.6895] }

// 合并多个多边形
const unified = extended.unionPolygon([polygon1, polygon2])
```

#### 原型插件

```typescript
import _ from 'ansuko'
import prototypePlugin from 'ansuko/plugins/prototype'

_.extend(prototypePlugin)

// 现在 Array.prototype 已扩展
[1, 2, 3].notMap(n => n > 1)      // [true, false, false]
[1, 2, 3].notFilter(n => n % 2)   // [2]（偶数）
```

### 链式插件

```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'
import geoPlugin from 'ansuko/plugins/geo'

const extended = _
  .extend(jaPlugin)
  .extend(geoPlugin)

// 现在你同时拥有日文和地理工具！
extended.kanaToHira('アイウ')
extended.toPointGeoJson([139.7, 35.6])
```

## 文档

详细信息请参阅：

- **[API 参考](./docs/API.zh.md)** - 带示例的完整 API 文档
- **[使用指南](./docs/Guide.zh.md)** - 实际示例和模式

## TypeScript 支持

完整的 TypeScript 支持，包含类型定义。所有函数都完全类型化，支持泛型。

## 为什么不只使用 lodash？

lodash 很优秀，但有一些[社区批评](https://github.com/lodash/lodash/issues)的怪异行为：

### 修复的行为

1. **`_.isEmpty(true)` 返回 `true`** - 布尔值真的"空"吗？
2. **`_.isEmpty(1)` 返回 `true`** - 数字 1 "空"吗？
3. **`_.castArray(null)` 返回 `[null]`** - 为什么在数组中包含 null？

### lodash 中缺少的添加工具

4. **无安全的 JSON 解析** - 总是需要 try-catch 块
5. **无内置的比较与后备** - 到处都是冗长的三元表达式模式
6. **无 Promise 感知的值解析** - 手动 Promise 处理变得混乱
7. **无对象差异跟踪** - 需要外部库进行数据库更新
8. **`JSON.stringify("hello")` 添加引号** - 那些 `'"hello"'` 引号很烦人

### 实际示例

```typescript
// lodash 的常见模式（冗长且容易出错）
let data
try {
  const cached = cache.get(id)
  if (cached && !_.isEmpty(cached)) {
    data = cached
  } else {
    const fetched = await api.fetch(id)
    data = fetched || defaultValue
  }
} catch (e) {
  data = defaultValue
}

// ansuko 的相同逻辑（简洁且安全）
const data = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id),
  defaultValue
)
```

ansuko 保持与 lodash 的 **100% 兼容性**，同时修复这些问题并为现代 JavaScript 开发添加强大的工具。

## 依赖项

- **`lodash`** - 核心工具函数
- **`json5`** - 增强的 JSON 解析，支持注释和尾随逗号
- **`@turf/turf`** - 地理空间分析（由地理插件使用）

## 从源代码构建

```bash
npm install
npm run build
```

这将在 `dist` 目录中生成编译后的 JavaScript 和类型定义。

## 开发
由 Sera 开发，Claude（Anthropic）协助文档编写、代码审查和技术讨论。

## 许可证

MIT

## 作者

Naoto Sera

---

无论中日国际形势如何，我认为开源软件（OSS）应始终保持和平。也衷心希望您能有同样的想法。