# ansuko

在lodash基础上扩展、提供实用且直观易懂的现代JavaScript/TypeScript工具库。

[English](./README.md) | [日本語](./README.ja.md) | [简体中文](./README.zh.md)

## 为什么选择 ansuko？

"ansuko"这个名字有多重含义：

- **アンスコ (ansuko)** - 日文中"underscore"（下划线）的缩写（アンダースコア）
- **ansuko = underscore → low dash → lodash** - 延续这个系列
- **スコ (suko)** - 日文俚语，意为"喜欢"或"最爱"

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

ansuko以直观的语法,解决了JavaScript中常见的痛点。

### 修正 lodash 的非常规行为

```typescript
// ❌ lodash（不直观）
_.isEmpty(0)           // true  - 0真的为「空」吗？
_.isEmpty(true)        // true  - true算「空」吗？
_.castArray(null)      // [null] - 为何保留null？

// ✅ ansuko（直观）
_.isEmpty(0)           // false - 数值不为空
_.isEmpty(true)        // false - 布尔值不为空
_.castArray(null)      // []    - 得到空数组
```

### 安全的 JSON 处理

```typescript
// ❌ 标准 JSON（繁琐）
JSON.stringify('hello')  // '"hello"'  - 多余的引号
JSON.parse(badJson)      // throws    - 必须用try-catch

// ✅ ansuko（简洁直观）
_.jsonStringify('hello')     // null     - 非对象不序列化
_.jsonStringify({ a: 1 })    // '{"a":1}' - 结构简洁
_.parseJSON(badJson)         // null     - 不抛异常
_.parseJSON('{ a: 1, }')     // {a:1}    - 支持JSON5！
```

### 支持Promise的回滚

```typescript
// ❌ 冗长写法
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
// ❌ 三元运算符地狱
const value = a === b ? a : (a == null && b == null ? a : defaultValue)

// ✅ ansuko（可读）
const value = _.equalsOr(a, b, defaultValue)  // null == undefined
```

## 主要特性

### 增强型lodash函数

- **`isEmpty`** - 检查是否为空（数字和布尔值不视为空）
- **`castArray`** - 转换为数组，若为null/undefined 则返回 `[]`
- 支持所有lodash函数：`size`、`isNil`、`debounce`、`isEqual`、`keys`、`values`、`has` 等

### 数值处理与流控制

- **`valueOr`** - 支持Promise和函数，获取目标值或默认值
- **`emptyOr`** - 若为空则返回null，否则应用回调或返回值
- **`hasOr`** - 检查路径是否存在，不存在则返回默认值（支持深层路径及 Promise）
- **`equalsOr`** - 支持Promise的比较与回退，具备直观的Nil处理机制
- **`changes`** - 用于数据库更新的对象差分追踪（支持 profile.tags[1]等深层路径及排除模式）`和排除模式）
- **`swallow`** - 执行函数并在报错时返回undefined（支持同步/异步）
- **`swallowMap`** - 将错误处理为undefined的数组map（支持compact模式排除错误项）

### 类型转换与验证

- **`toNumber`** - 解析包含逗号、全角字符的数字，无效时返回null
- **`toBool`** - 智能布尔值转换（支持 "yes"/"no"/"true"/"false"/数字），可配置未检测到时的行为检测处理
- **`boolIf`** - 带有回退机制的安全布尔值转换
- **`isValidStr`** - 非空字符串验证

### JSON 处理

- **`parseJSON`** - 无需try-catch的安全JSON/JSON5解析（支持注释及末尾逗号）
- **`jsonStringify`** - 仅字符串化有效对象，防止字符串被重复包裹

### 数组工具

- **`arrayDepth`** - 返回数组的嵌套深度（非数组：0，空数组：1）
- **`castArray`** - 转换为数组，nil 变为 `[]`（而非 `[null]`）

### 日语文本处理（插件：`ansuko/plugins/ja`）

- **`kanaToFull`** - 半角片假名 → 全角（例如 `ｶﾞｷﾞ` → `ガギ`）
- **`kanaToHalf`** - 全角 → 半角片假名（浊音拆分：`ガギ` → `ｶﾞｷﾞ`）
- **`kanaToHira`** - 片假名 → 平假名（自动先转换半角）
- **`hiraToKana`** - 平假名 → 片假名
- **`toHalfWidth`** - 全角 → 半角，可选连字符标准化
- **`toFullWidth`** - 半角 → 全角，可选连字符标准化
- **`haifun`** - 将各种形式的连字符统一正规化

### Geo地理空间工具（插件：`ansuko/plugins/geo`）

- **`toGeoJson`** - 具备自动检测功能的通用GeoJSON转换器（按高维到低维顺序尝试）
- **`toPointGeoJson`** - 将坐标或对象转换为Point GeoJSON
- **`toPolygonGeoJson`** - 将外环转换为Polygon（验证闭合环）
- **`toLineStringGeoJson`** - 将坐标转换为LineString（检查自相交）
- **`toMultiPointGeoJson`** - 将多个点转换为MultiPoint
- **`toMultiPolygonGeoJson`** - 将多个多边形转换为MultiPolygon
- **`toMultiLineStringGeoJson`** - 将多条线转换为MultiLineString
- **`unionPolygon`** - 将多个Polygon/MultiPolygon合并为单一几何体
- **`parseToTerraDraw`** - 将GeoJSON转换为兼容Terra Draw的Feature
- **`mZoomInterpolate`** - 将缩放对象转换为MapBox插值表达式
- **`mProps`** - 将（camelCase）属性转换为MapBox兼容格式（处理minzoom、visibility等特殊情况）

### Prototype原型扩展（插件：`ansuko/plugins/prototype`）

- **`Array.prototype.notMap`** - 使用谓词取反进行map，返回布尔数组
- **`Array.prototype.notFilter`** - 使用谓词取反进行filter（筛选不匹配的项）

### 时间工具

- **`waited`** - 延迟N个动画帧后执行（在 React/DOM 環境下比`setTimeout`更优）

## 插件架构

ansuko使用最小核心 + 插件架构来保持你的包大小小：

- **核心**（约 20KB）：在 lodash 上增强的必备工具
- **日文插件**（约 5KB）：仅在需要日文文本处理时引入
- **Geo 插件**（约 100KB，含 @turf/turf）：面向 GIS 应用
- **Prototype 插件**（约 1KB）：仅在需要扩展 Array.prototype 时引入

```typescript
// 最小打包：仅核心
import _ from 'ansuko'  // ~20KB

// 按需加入日文支持
import jaPlugin from 'ansuko/plugins/ja'
const extended = _.extend(jaPlugin)  // +5KB

// 地图类应用再挂载 GIS
import geoPlugin from 'ansuko/plugins/geo'
const full = extended.extend(geoPlugin)  // +100KB
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

// MapBox 工具
extended.mZoomInterpolate({ 10: 1, 15: 5, 20: 10 })
// => ["interpolate", ["linear"], ["zoom"], 10, 1, 15, 5, 20, 10]

extended.mProps({
  fillColor: "#ff0000",
  sourceLayer: "buildings",
  visibility: true
})
// => { "fill-color": "#ff0000", "source-layer": "buildings", "visibility": "visible" }
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

更多详细信息，请参阅：

- **[API 参考](./docs/API.zh.md)** - 包含示例的完整API文档
- **[使用指南](./docs/Guide.zh.md)** - 实际使用案例与设计模式

## 支持TypeScript 

完美支持TypeScript，包含完整的类型定义。所有函数均支持泛型，并经过严格的类型标注。

## 为什么仅有lodash还不够？

lodash很优秀，但存在一些[被社区广为诟病](https://github.com/lodash/lodash/issues)的怪癖：

### 已修正的部分

1. **`_.isEmpty(true)` 返回 `true`** - 布尔值真的为"空"吗？
2. **`_.isEmpty(1)` 返回 `true`** - 数字1怎么能为"空"呢？
3. **`_.castArray(null)` 返回 `[null]`** - 为什么要把null包含在数组里？

### lodash中没有的工具函数

4. **无安全的 JSON 解析** - 总是需要写重复的try-catch代码块
5. **无内置的比较与后备** - 代码中到处充斥着冗余的三元运算符
6. **无 Promise 感知的值解析** - 手动处理Promise逻辑非常繁琐
7. **无对象差异跟踪** - 进行数据库更新操作时往往需要引入额外库
8. **`JSON.stringify("hello")` 会添加多余引号 —— 生成 `'"hello"'`这种带引号的繁琐字符串

### 实际使用案例

```typescript
// lodash的常见写法（冗长且易错）
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

// ansuko的实现逻辑（简洁且安全）
const data = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id),
  defaultValue
)
```

ansuko在修正上述问题的同时，为现代JavaScript开发增添了强大的工具函数，并保持了与Lodash的100%兼容性。

## 依赖项

- **`lodash`** - 核心工具函数
- **`json5`** - 支持注释和末尾逗号的扩展JSON解析
- **`@turf/turf`** - 地理空间分析（用于geo插件）

## 从源代码构建

```bash
npm install
npm run build
```

执行后将在`dist`目录下生成编译后的JavaScript文件和类型定义。

## 开发相关
因为不太擅长写测试和文档，我在使用 Claude 构思的同时，也得到了一位好朋友的贴心帮助，共同完成了这份文档。

## 许可证

MIT

## 作者

Naoto Sera

---

技术无国界，开源即和平。无论世界如何变迁，愿代码始终纯粹。
