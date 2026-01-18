# 使用指南

在实际应用中使用 ansuko 的实用示例和模式。

[English](./Guide.md) | [日本語](./Guide.ja.md) | [简体中文](./Guide.zh.md)

## 目录

- [TypeScript 支持](#typescript-支持)
- [实际示例](#实际示例)
  - [API 响应处理](#api-响应处理)
  - [智能对话框关闭](#智能对话框关闭)
  - [配置验证](#配置验证)
  - [安全数组操作](#安全数组操作)
  - [文本搜索和比较](#文本搜索和比较)
  - [数据库更新](#数据库更新)
  - [无需 try-catch 的错误处理](#无需-try-catch-的错误处理)
  - [日文地址表单](#日文地址表单标准化)
- [常用模式](#常用模式)
- [高级技术](#使用-valueor-和-equalsor-的高级模式)
- [从 lodash 迁移](#从-lodash-迁移)
- [性能考虑](#性能考虑)
- [React 集成](#react-集成注意事项)

## 概述

本指南演示了 ansuko 在常见开发场景中的实际用途。所有示例都已在实际应用中进行了测试。

## TypeScript 支持

完整的 TypeScript 支持，包含类型定义：

```typescript
import _ from 'ansuko'
import { valueOr, isEmpty, toNumber, equalsOr, parseJSON, changes, haifun, type ChangesOptions } from 'ansuko'

// 类型推断完美运行
const result1: string = _.valueOr(null, 'default')
const result2: number = _.toNumber('1,234') ?? 0
const result3: boolean = _.isEmpty([])

// 泛型支持
interface User { name: string; age: number }
const user = _.parseJSON<User>(jsonString)  // User | null

// 选项类型
const opts: ChangesOptions = { keyExcludes: true }
const diff = _.changes(obj1, obj2, keys, opts)
```

## 实际示例

### API 响应处理

无需 try-catch 和 null 检查即可安全处理 API 响应：

```javascript
// 之前
let status
try {
  const response = await fetch('/api/status')
  const data = await response.json()
  status = data && data.status ? data.status : 'unknown'
} catch (e) {
  status = 'error'
}

// 之后
const data = await _.valueOr(fetch('/api/status').then(r => r.json()), {})
const status = _.equalsOr(data.status, 'success', 'unknown')
```

### 智能对话框关闭

使用自动 Promise 处理优雅地处理"未保存的更改"对话框：

```javascript
// 传统方式 - 冗长且容易出错
const handleClose = async () => {
  if (_.isEqual(original, edited)) {
    // 无更改，立即关闭
    closeDialog()
  } else {
    // 有更改，显示确认
    const confirmed = await showConfirmDialog()
    if (confirmed) {
      closeDialog()
    }
  }
}

// ansuko 方式 - 简洁直观
const handleClose = () => {
  // equalsOr 自动处理同步和异步情况
  // 如果相等：立即返回 original（同步），然后关闭
  // 如果不同：调用 showConfirmDialog（异步），等待结果，然后关闭
  _.equalsOr(original, edited, showConfirmDialog).then(closeDialog)
}

// 使用内联箭头函数更简洁
const handleClose = () => 
  _.equalsOr(original, edited, showConfirmDialog).then(closeDialog)
```

### 配置验证

简化配置处理：

```javascript
// 之前
const timeout = config.timeout !== null && 
                config.timeout !== undefined && 
                config.timeout !== '' ? 
                config.timeout : 5000

// 之后
const timeout = _.valueOr(config.timeout, 5000)
```

### 安全数组操作

在集合中清理 null/undefined 处理：

```javascript
// 之前
const items = data.items
const processed = (items ? (Array.isArray(items) ? items : [items]) : [])
  .filter(Boolean)
  .map(process)

// 之后
const processed = _.castArray(data.items)?.map(process) ?? []
```

### 文本搜索和比较

标准化破折号/连字符以实现可靠的文本匹配：

```javascript
// 问题：用户搜索"东京-大阪"但数据库有"东京―大阪"（不同的破折号）
const userQuery = "东京-大阪"
const dbRecord = "东京―大阪"
userQuery === dbRecord  // => false（不匹配！）

// 解决方案：比较前标准化
const normalizedQuery = _.haifun(userQuery)
const normalizedRecord = _.haifun(dbRecord)
normalizedQuery === normalizedRecord  // => true（匹配！）

// 带标准化的数据库搜索
app.get('/search', (req, res) => {
  const query = _.haifun(req.query.q)
  const results = db.products.filter(p => 
    _.haifun(p.name).includes(query) ||
    _.haifun(p.sku).includes(query)
  )
  res.json(results)
})
```

### 产品代码去重

使用不同破折号类型检测重复的 SKU/零件号：

```javascript
const products = [
  { sku: 'ABC-123-XYZ', name: '小部件 A' },
  { sku: 'ABC—123—XYZ', name: '小部件 B' },  // 长横线
  { sku: 'DEF-456', name: '小工具' },
]

// 通过标准化的 SKU 查找重复项
const normalized = products.map(p => ({
  ...p,
  normalizedSku: _.haifun(p.sku)
}))

const duplicates = _.groupBy(normalized, 'normalizedSku')
const hasDuplicates = Object.values(duplicates).some(group => group.length > 1)

// 结果：ABC-123-XYZ 和 ABC—123—XYZ 被检测为重复项
```

### 地址匹配

比较格式不一致的地址：

```javascript
const addresses = [
  '123-4567 Tokyo',      // 连字符减号
  '123−4567 Tokyo',      // 减号
  '123–4567 Tokyo',      // 短横线
]

// 标准化以进行比较
const normalized = addresses.map(addr => _.haifun(addr))
// 全部变为：'123‐4567 Tokyo'

// 去重地址
const unique = _.uniqBy(
  addresses.map(addr => ({ original: addr, normalized: _.haifun(addr) })),
  'normalized'
)
```

### CSV/Excel 数据清洗

清理标点符号不一致的导入数据：

```javascript
// 混合破折号类型的 CSV 导入
const csvData = [
  { productCode: 'A-001', price: '1,000' },
  { productCode: 'A—002', price: '2,000' },  // Excel 的长横线
  { productCode: 'A−003', price: '3,000' },  // 减号
]

// 在导入期间标准化
const cleanData = csvData.map(row => ({
  productCode: _.haifun(row.productCode),
  price: _.toNumber(row.price)
}))

// 现在所有产品代码使用一致的破折号
```

### 带深度路径的数据库更新

跟踪并仅应用更改的字段，支持嵌套属性：

```javascript
// 从数据库获取原始数据
const original = await db.users.findById(userId)

// 用户在 UI 中编辑数据
const edited = userFormData

// 仅获取更改的字段（支持深度路径）
const updates = _.changes(original, edited, [
  'name',
  'email',
  'profile.bio',
  'profile.avatar',
  'settings.theme',
  'settings.notifications.email'
])

// 结果是嵌套结构
// {
//   profile: { bio: '新简介' },
//   settings: { theme: 'dark' }
// }

// 使用 lodash set 应用到对象
const updated = _.cloneDeep(original)
Object.entries(updates).forEach(([path, value]) => {
  _.set(updated, path, value)
})

// 或用于 MongoDB（原生支持点符号）
await db.users.updateOne(
  { _id: userId },
  { $set: updates }  // MongoDB 自动处理嵌套路径
)

// 对于 SQL 数据库，更新顶级对象
await db.query(`
  UPDATE users 
  SET profile = $1, settings = $2 
  WHERE id = $3
`, [updates.profile, updates.settings, userId])
```

**主要特性：**
- **深度路径支持：** 使用 `'profile.bio'` 跟踪嵌套更改
- **嵌套结果：** 返回结构化对象以便轻松应用
- **数据库友好：** 与 MongoDB 的点符号或 SQL JSON 列一起使用

### 敏感字段排除

从差异跟踪中排除某些字段（仅顶级键）：

```javascript
// 获取除密码和 API 密钥外的所有更改
const safeChanges = _.changes(original, updated, ['password', 'apiKey', 'secret'], { 
  keyExcludes: true 
})

// 结果中仅包含非敏感的顶级字段
// 注意：keyExcludes 模式仅适用于顶级键，不适用于深度路径

// 对于嵌套排除，请使用特定路径：
const updates = _.changes(original, updated, [
  'name',
  'email',
  'profile.bio',
  'profile.avatar'
  // 明确列出您想要的内容，排除 profile.privateNotes
])
```

### 无需 try-catch 的错误处理

使用 `swallow` 和 `swallowMap` 简化错误处理：

```javascript
// 传统的 try-catch 模式 - 冗长
async function loadUserData(userId) {
  let profile
  try {
    profile = await fetchProfile(userId)
  } catch (e) {
    console.error('加载个人资料失败：', e)
    profile = null
  }
  
  let settings
  try {
    settings = await fetchSettings(userId)
  } catch (e) {
    console.error('加载设置失败：', e)
    settings = null
  }
  
  return { profile, settings }
}

// ansuko 方式 - 简洁明了
async function loadUserData(userId) {
  const profile = await _.swallow(() => fetchProfile(userId))
  const settings = await _.swallow(() => fetchSettings(userId))
  return { profile, settings }
}

// 更好的方式：并行获取
async function loadUserData(userId) {
  const [profile, settings] = await Promise.all([
    _.swallow(() => fetchProfile(userId)),
    _.swallow(() => fetchSettings(userId))
  ])
  return { profile, settings }
}
```

**容错的批处理操作：**

```javascript
// 处理多个文件，跳过失败
const files = ['file1.json', 'file2.json', 'file3.json']

// 之前：复杂的错误处理
const results = []
for (const file of files) {
  try {
    const content = await fs.readFile(file, 'utf8')
    const parsed = _.parseJSON(content)  // 使用 ansuko 的 parseJSON
    results.push(parsed)
  } catch (e) {
    console.error(`读取 ${file} 失败：`, e)
    // 跳过失败的文件
  }
}

// 之后：使用 swallowMap 简洁处理
const results = await _.swallowMap(
  files,
  async file => {
    const content = await fs.readFile(file, 'utf8')
    return _.parseJSON(content)  // 使用 ansuko 的 parseJSON
  },
  true  // compact：过滤错误（包括读取错误）
)

// 带进度跟踪的数据迁移
const total = records.length
const migrated = await _.swallowMap(
  records,
  async (record, index) => {
    console.log(`处理中 ${index + 1}/${total}`)
    return await migrateRecord(record)
  },
  true
)
console.log(`迁移成功：${migrated.length}/${total}`)

// API 批量请求
const userIds = [1, 2, 3, 4, 5]
const users = await _.swallowMap(
  userIds,
  async id => {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  },
  true  // 仅成功的请求
)
```

**安全的可选操作：**

```javascript
// 不应使应用崩溃的清理操作
function cleanup() {
  _.swallow(() => cache.clear())
  _.swallow(() => ws.disconnect())
  _.swallow(() => analytics.track('cleanup'))
}

// 安全的属性访问
const userName = _.swallow(() => user.profile.displayName)
// 无"Cannot read property 'displayName' of undefined"错误

// 安全的 DOM 操作
const height = _.swallow(() => element.getBoundingClientRect().height)
```

### 带默认值的表单验证

使用直观的默认值验证表单数据：

```javascript
const formData = {
  name: valueOr(form.name, '匿名'),
  email: valueOr(form.email, ''),
  age: toNumber(form.age) ?? 18,
  subscribe: toBool(form.subscribe, false)
}

// 验证
if (!isValidStr(formData.email)) {
  throw new Error('需要电子邮件')
}
```

### 智能配置合并

使用惰性评估合并配置：

```javascript
const config = {
  apiUrl: _.valueOr(env.API_URL, 'https://api.example.com'),
  timeout: _.valueOr(env.TIMEOUT, () => calculateTimeout()),
  retries: _.valueOr(env.RETRIES, 3),
  features: {
    darkMode: _.toBool(env.DARK_MODE, true),
    analytics: _.toBool(env.ANALYTICS, false)
  }
}
```

## 常用模式

### 空值安全链

```javascript
// 之前
const city = user && user.address && user.address.city

// 之后
const city = _.get(user, 'address.city')
```

### 条件执行

```javascript
// 仅在数据更改时保存
const shouldSave = !_.equals(original, edited)
if (shouldSave) {
  await api.save(edited)
}

// 或使用 equalsOr
await _.equalsOr(original, edited, () => api.save(edited))
```

### 数组过滤与映射

```javascript
// 带 null 检查的安全操作
const ids = _.castArray(data.items)
  .map(item => item?.id)
  .filter(Boolean)
```

## 日文地址表单标准化

处理日文地址输入和邮政编码：

```javascript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'

const extended = _.extend(jaPlugin)

function normalizeAddress(form) {
  return {
    // 标准化邮政编码（删除破折号，转换为半角）
    postalCode: extended.toHalfWidth(form.postalCode?.replace(/-/g, '')),
    
    // 标准化地址（转换为全角）
    prefecture: extended.toFullWidth(form.prefecture),
    city: extended.toFullWidth(form.city),
    street: extended.toFullWidth(form.street),
    
    // 可选建筑物名称（片假名转换为全角）
    building: extended.kanaToFull(form.building || '')
  }
}

// 示例用法
const rawForm = {
  postalCode: '１０５−０００１',  // 全角带破折号
  prefecture: 'ﾄｳｷｮｳﾄ',          // 半角片假名
  city: 'ﾐﾅﾄｸ',                  // 半角片假名
  street: '虎ノ門１−２−３',
  building: 'ﾋﾞﾙ A'
}

const normalized = normalizeAddress(rawForm)
// {
//   postalCode: '1050001',
//   prefecture: '東京都',
//   city: '港区',
//   street: '虎ノ門１−２−３',
//   building: 'ビル A'
// }
```

### 电话号码标准化

```javascript
function normalizePhone(phone) {
  // 删除常见分隔符，转换为半角
  return extended.toHalfWidth(phone)
    .replace(/[-()（）\s]/g, '')
}

normalizePhone('０３−１２３４−５６７８')  // '0312345678'
normalizePhone('(03) 1234-5678')        // '0312345678'
```

### 姓名处理

```javascript
function normalizeName(name) {
  // 全角片假名，删除多余空格
  return extended.kanaToFull(name)
    .replace(/\s+/g, ' ')
    .trim()
}

normalizeName('ﾔﾏﾀﾞ  ﾀﾛｳ')  // '山田 太郎'
```

## GeoJSON 转换

### 将数据库记录转换为 GeoJSON

```typescript
import _ from 'ansuko'
import geoPlugin from 'ansuko/plugins/geo'

const extended = _.extend(geoPlugin)

// 将 PostGIS 查询结果转换为 GeoJSON Feature
const trees = await db.query('SELECT id, species, ST_AsGeoJSON(geom) as geom FROM trees')

const features = trees.rows
  .map(tree => {
    const geometry = _.parseJSON(tree.geom)
    if (!geometry) return null
    
    return {
      type: 'Feature',
      geometry,
      properties: {
        id: tree.id,
        species: tree.species,
        height: tree.height
      }
    }
  })
  .filter(Boolean)

const featureCollection = {
  type: 'FeatureCollection',
  features
}
```

### 多边形操作

```typescript
// 合并重叠的行政区域
const zone1 = await db.getZonePolygon('zone-1')
const zone2 = await db.getZonePolygon('zone-2')
const zone3 = await db.getZonePolygon('zone-3')

const mergedZone = extended.unionPolygon([zone1, zone2, zone3])

// 保存合并的边界
await db.boundaries.insert({
  name: 'merged-zone',
  geometry: mergedZone
})
```

## 性能考虑

`valueOr` 和 `equalsOr` 自动检测 Promise：

```javascript
// 同步 - 立即返回
const result1 = _.valueOr('value', 'default')  // 'value'
const result2 = _.equalsOr('a', 'a', 'default')  // 'a'

// 异步 - 返回 Promise
const result3 = await _.valueOr(asyncGetValue(), 'default')
const result4 = await _.equalsOr(asyncCheck(), 'expected', 'default')

// 混合 - 自动变为 Promise
const result5 = await _.equalsOr(syncValue, asyncValue, 'default')
```


### 使用 valueOr 和 equalsOr 的高级模式

带惰性求值和自动 Promise 处理的智能后备链：
```javascript
// 验证 → 提交（如果验证失败返回错误，成功返回 undefined）
const errors = await _.valueOr(validate(), () => api.submit())

// 缓存命中 → API 获取（首先尝试缓存，未命中时获取）
const data = await _.valueOr(cache.get(key), () => api.fetch(key))

// 本地配置 → 远程配置（优先本地，后备到 API）
const config = await _.valueOr(localStorage.get('config'), () => api.getConfig())

// 检查更改 → 确认并保存执行（异步）→ 关闭（如果未更改则跳过确认和保存）
_.equalsOr(original, edited, () => confirmAndSave()).then(doClose)
// 或
const uid = original.uid // id = 唯一数据标识符，id = 表的序列号
const diff = _.changes(original, edited, ["id", "created_at", "updated_at"], {excludeKeys: true}) // 获取除 id、created_at、updated_at 外的更改数据
_.valueOr(!diff, () => confirmAndSave({...diff, uid})).then(onClose)

// 对于开明者：权限门控执行（如果被拒绝返回 true，如果执行返回结果）
const resultOrNotAccepted = await _.valueOr(!checkPermission(), () => executeAction())
if (resultOrNotAccepted === true) {
  // 权限被拒绝，操作未执行
} else {
  // 操作已执行，处理结果
  handleResult(resultOrNotAccepted)
}
```

**主要优势：**
- **简洁：** 单个表达式中的复杂逻辑
- **惰性求值：** 后备函数仅在需要时运行
- **Promise 感知：** 无缝处理同步和异步
- **类型安全：** 返回类型定义良好


## 从 lodash 迁移

### isEmpty

```javascript
// lodash
if (_.isEmpty(0)) { /* 运行但不应该 */ }

// ansuko
if (_.isEmpty(0)) { /* 不运行 - 正确！ */ }
  /* 如果需要可以调用原始版本 */
if(_.isEmptyOrg(0)) { /* 运行 */}
```

### castArray

```javascript
// lodash
_.castArray(null)  // => [null]

// ansuko
_.castArray(null)  // => []
  /* 如果需要可以调用原始版本 */
_.castArrayOrg(null) // => [null]
```

### JSON 不再需要 try-catch

```javascript
// lodash 方式
let data
try {
  data = JSON.parse(str)
} catch (e) {
  data = null
}
if(!data) { /** 错误处理 **/ }

// ansuko 方式（出现问题时返回 null）
const data = _.parseJSON(str)
if (!data) { /** 错误处理 **/ }
```

### 带格式化和过滤的 JSON 导出

```javascript
// 使用美化格式导出配置
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  features: {
    darkMode: true,
    notifications: false
  }
}

// 用于配置文件的美化 JSON
const configJson = _.jsonStringify(config, null, 2)
fs.writeFileSync('config.json', configJson)

// 之前：冗长
let filtered
try {
  filtered = JSON.stringify(
    config,
    (key, value) => {
      if (key === 'apiKey' || key === 'secret') return undefined
      return value
    },
    2
  )
} catch (e) {
  filtered = null
}

// 之后：使用敏感字段过滤清理
const safeExport = _.jsonStringify(
  userData,
  (key, value) => ['password', 'apiKey', 'secret'].includes(key) ? undefined : value,
  2
)

// 在导出期间舍入数字
const report = {
  revenue: 1234567.89,
  cost: 987654.321,
  profit: 246913.569
}

const rounded = _.jsonStringify(
  report,
  (key, value) => typeof value === 'number' ? Math.round(value) : value,
  2
)
// {
//   "revenue": 1234568,
//   "cost": 987654,
//   "profit": 246914
// }
```

## 性能考虑

### 大对象的 `changes`

对于大对象，指定具体的键：

```javascript
// 好：具体的键
const changes = _.changes(large, updated, ['field1', 'field2'])

// 昂贵：扫描所有键
const changes = _.changes(large, updated, Object.keys(large), { keyExcludes: false })
```

### JSON 解析

对于频繁解析的 JSON，缓存结果：

```javascript
const data = memoize(() => _.parseJSON(jsonStr))
```

### 文本标准化

对于批量操作，考虑一次标准化并缓存：

```javascript
// 一次标准化数据库记录
const normalizedProducts = products.map(p => ({
  ...p,
  searchableName: _.haifun(p.name),
  searchableSku: _.haifun(p.sku)
}))

// 然后在预标准化的字段上搜索
const results = normalizedProducts.filter(p =>
  p.searchableName.includes(_.haifun(query))
)
```

### 等待 React 状态更新

使用 `waited` 而不是 `setTimeout` 来确保状态更改被渲染。基于帧的时间适应实际的渲染周期，无论设备性能如何，都能消除过早执行和不必要的延迟。


```javascript
// ❌ 之前：不可靠的时间，依赖于机器速度
function handleUpdate() {
  setData(newData)
  setTimeout(() => {
    // 在慢设备上可能在渲染完成之前执行
    // 在快设备上可能等待时间过长
    scrollToElement()
  }, 100)  // 任意数字！
}

// ✅ 之后：等待实际渲染，适应设备
function handleUpdate() {
  setData(newData)
  _.waited(() => {
    scrollToElement()  // 保证在渲染后运行
  }, 1)  // 等待 2 帧（1 RAF + 1 更多）
}

// 多个状态更新
function handleComplexUpdate() {
  setStep1(data1)
  _.waited(() => {
    setStep2(data2)
    _.waited(() => {
      triggerAnimation()
    }, 2)  // 等待 2 帧进行重渲染
  }, 1)
}

// 状态更改后的 DOM 测量
function measureElement() {
  setExpanded(true)
  _.waited(() => {
    const height = elementRef.current.offsetHeight  // 准确测量
    startAnimation(height)
  }, 1)
}

// 链式动画
function sequentialAnimations() {
  playAnimation1()
  _.waited(() => {
    playAnimation2()
    _.waited(() => {
      playAnimation3()
    }, 1)
  }, 1)
}
```

**为什么 `waited` 比 `setTimeout` 更好：**
- **无任意延迟：** 帧计数，而非毫秒
- **设备独立：** 快速机器不会不必要地等待，慢速机器不会出错
- **渲染同步：** 在实际 DOM 更新后执行
- **无竞态条件：** 保证在绘制周期后运行

## React 集成注意事项

### 为什么不直接在 JSX 中使用 valueOr/equalsOr？

```tsx
// ❌ 不要这样做 - 会导致问题
<InputField value={_.valueOr(user?.name, GetNameAPI)} />

// ✅ 改用 useState + useEffect
const [userName, setUserName] = useState('')

useEffect(() => {
  _.valueOr(user?.name, GetNameAPI).then(setUserName)
}, [user?.name])

<InputField value={userName} />
```

问题：React 期望 props 中的稳定值。如果直接传递 Promise 或在渲染期间调用函数，可能会导致重新渲染循环或意外行为。始终在 `useEffect` 或自定义钩子中解析值。