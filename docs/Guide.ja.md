# 使用ガイド

実際のアプリケーションでansukoを使用するための実用的な例とパターン。

[English](./Guide.md) | [日本語](./Guide.ja.md)

## 目次

- [TypeScriptサポート](#typescriptサポート)
- [実用例](#実用例)
  - [APIレスポンス処理](#apiレスポンス処理)
  - [スマートダイアログクローズ](#スマートダイアログクローズ)
  - [設定のバリデーション](#設定のバリデーション)
  - [安全な配列操作](#安全な配列操作)
  - [テキスト検索と比較](#テキスト検索と比較)
  - [データベース更新](#データベース更新)
  - [日本語住所フォーム](#日本語住所フォームの正規化)
- [共通パターン](#共通パターン)
- [高度なテクニック](#valueorとequalsの高度なパターン)
- [lodashからの移行](#lodashからの移行)
- [パフォーマンスの考慮事項](#パフォーマンスの考慮事項)
- [React統合](#react統合の注意事項)

## 概要

このガイドは、一般的な開発シナリオにおけるansukoの実用的な使用方法を示します。すべての例は本番環境対応で、実際のアプリケーションで検証されています。

## TypeScriptサポート

型定義を含む完全なTypeScriptサポート:

```typescript
import _ from 'ansuko'
import { valueOr, isEmpty, toNumber, equalsOr, parseJSON, changes, haifun, type ChangesOptions } from 'ansuko'

// 型推論が完璧に機能
const result1: string = _.valueOr(null, 'default')
const result2: number = _.toNumber('1,234') ?? 0
const result3: boolean = _.isEmpty([])

// ジェネリックサポート
interface User { name: string; age: number }
const user = _.parseJSON<User>(jsonString)  // User | null

// オプション型
const opts: ChangesOptions = { keyExcludes: true }
const diff = _.changes(obj1, obj2, keys, opts)
```

## 実用例

### APIレスポンス処理

try-catchやnullチェックなしでAPIレスポンスを安全に処理:

```javascript
// Before
let status
try {
  const response = await fetch('/api/status')
  const data = await response.json()
  status = data && data.status ? data.status : 'unknown'
} catch (e) {
  status = 'error'
}

// After
const data = await _.valueOr(fetch('/api/status').then(r => r.json()), {})
const status = _.equalsOr(data.status, 'success', 'unknown')
```

### スマートダイアログクローズ

自動Promise処理で「未保存の変更」ダイアログをエレガントに処理:

```javascript
// 従来の方法 - 冗長でエラーが起きやすい
const handleClose = async () => {
  if (_.isEqual(original, edited)) {
    // 変更なし、即座にクローズ
    closeDialog()
  } else {
    // 変更あり、確認表示
    const confirmed = await showConfirmDialog()
    if (confirmed) {
      closeDialog()
    }
  }
}

// ansukoの方法 - クリーンで直感的
const handleClose = () => {
  // equalsOrは同期・非同期の両ケースを自動処理
  // 等しい場合: 即座にoriginalを返し（同期）、クローズ
  // 異なる場合: showConfirmDialogを呼び出し（非同期）、結果を待ってクローズ
  _.equalsOr(original, edited, showConfirmDialog).then(closeDialog)
}

// インラインアロー関数でさらに簡潔に
const handleClose = () => 
  _.equalsOr(original, edited, showConfirmDialog).then(closeDialog)
```

### 設定のバリデーション

設定処理を簡素化:

```javascript
// Before
const timeout = config.timeout !== null && 
                config.timeout !== undefined && 
                config.timeout !== '' ? 
                config.timeout : 5000

// After
const timeout = _.valueOr(config.timeout, 5000)
```

### 安全な配列操作

コレクション内のnull/undefined処理をクリーンアップ:

```javascript
// Before
const items = data.items
const processed = (items ? (Array.isArray(items) ? items : [items]) : [])
  .filter(Boolean)
  .map(process)

// After
const processed = _.castArray(data.items)?.map(process) ?? []
```

### テキスト検索と比較

信頼性の高いテキストマッチングのためにダッシュ/ハイフンを正規化:

```javascript
// 問題: ユーザーが"東京-大阪"で検索するが、データベースには"東京―大阪"（異なるダッシュ）
const userQuery = "東京-大阪"
const dbRecord = "東京―大阪"
userQuery === dbRecord  // => false（マッチしない！）

// 解決策: 比較前に正規化
const normalizedQuery = _.haifun(userQuery)
const normalizedRecord = _.haifun(dbRecord)
normalizedQuery === normalizedRecord  // => true（マッチ！）

// 正規化付きデータベース検索
app.get('/search', (req, res) => {
  const query = _.haifun(req.query.q)
  const results = db.products.filter(p => 
    _.haifun(p.name).includes(query) ||
    _.haifun(p.sku).includes(query)
  )
  res.json(results)
})
```

### 商品コードの重複排除

異なるダッシュタイプを持つSKU/品番の重複を検出:

```javascript
const products = [
  { sku: 'ABC-123-XYZ', name: 'Widget A' },
  { sku: 'ABC—123—XYZ', name: 'Widget B' },  // emダッシュ
  { sku: 'DEF-456', name: 'Gadget' },
]

// 正規化されたSKUで重複を検出
const normalized = products.map(p => ({
  ...p,
  normalizedSku: _.haifun(p.sku)
}))

const duplicates = _.groupBy(normalized, 'normalizedSku')
const hasDuplicates = Object.values(duplicates).some(group => group.length > 1)

// 結果: ABC-123-XYZとABC—123—XYZが重複として検出される
```

### 住所のマッチング

一貫性のないダッシュ形式の住所を比較:

```javascript
const addresses = [
  '123-4567 Tokyo',      // ハイフンマイナス
  '123−4567 Tokyo',      // マイナス記号
  '123–4567 Tokyo',      // enダッシュ
]

// 比較用に正規化
const normalized = addresses.map(addr => _.haifun(addr))
// すべて: '123‐4567 Tokyo'になる

// 住所の重複排除
const unique = _.uniqBy(
  addresses.map(addr => ({ original: addr, normalized: _.haifun(addr) })),
  'normalized'
)
```

### CSV/Excelデータのクリーニング

一貫性のない句読点を持つインポートデータをクリーンアップ:

```javascript
// 混在したダッシュタイプのCSVインポート
const csvData = [
  { productCode: 'A-001', price: '1,000' },
  { productCode: 'A—002', price: '2,000' },  // Excelからのemダッシュ
  { productCode: 'A−003', price: '3,000' },  // マイナス記号
]

// インポート時に正規化
const cleanData = csvData.map(row => ({
  productCode: _.haifun(row.productCode),
  price: _.toNumber(row.price)
}))

// これですべての商品コードが一貫したダッシュを使用
```

### 深いパスを持つデータベース更新

変更されたフィールドのみを追跡・適用し、ネストされたプロパティをサポート:

```javascript
// DBから元のデータを取得
const original = await db.users.findById(userId)

// ユーザーがUIでデータを編集
const edited = userFormData

// 変更されたフィールドのみを取得（深いパス対応）
const updates = _.changes(original, edited, [
  'name',
  'email',
  'profile.bio',
  'profile.avatar',
  'settings.theme',
  'settings.notifications.email'
])

// 結果はネストされた構造
// {
//   profile: { bio: 'new bio' },
//   settings: { theme: 'dark' }
// }

// lodash setを使用してオブジェクトに適用
const updated = _.cloneDeep(original)
Object.entries(updates).forEach(([path, value]) => {
  _.set(updated, path, value)
})

// またはMongoDB用（ドット記法をネイティブサポート）
await db.users.updateOne(
  { _id: userId },
  { $set: updates }  // MongoDBはネストされたパスを自動処理
)

// SQLデータベース用に、トップレベルオブジェクトを更新
await db.query(`
  UPDATE users 
  SET profile = $1, settings = $2 
  WHERE id = $3
`, [updates.profile, updates.settings, userId])
```

**主な機能:**
- **深いパスサポート**: ネストされた変更を追跡するために `'profile.bio'` を使用
- **ネストされた結果**: 簡単に適用できるように構造化されたオブジェクトを返す
- **データベースフレンドリー**: MongoDBのドット記法やSQL JSONカラムに対応

### 機密フィールドの除外

差分追跡から特定のフィールドを除外（トップレベルキーのみ）:

```javascript
// パスワードとAPIキーを除くすべての変更を取得
const safeChanges = _.changes(original, updated, ['password', 'apiKey', 'secret'], { 
  keyExcludes: true 
})

// 機密性のないトップレベルフィールドのみが結果に含まれる
// 注意: keyExcludesモードはトップレベルキーでのみ機能し、深いパスには対応していません

// ネストされた除外には、代わりに特定のパスを使用:
const updates = _.changes(original, updated, [
  'name',
  'email',
  'profile.bio',
  'profile.avatar'
  // profile.privateNotesを除外するために、必要なものを明示的にリスト
])
```

### デフォルト付きフォームバリデーション

直感的なデフォルトでフォームデータをバリデート:

```javascript
const formData = {
  name: valueOr(form.name, 'Anonymous'),
  age: toNumber(form.age) ?? 18,
  active: boolIf(form.active, false),
  email: valueOr(form.email, 'no-email@example.com')
}
```

### 安全なJSON設定

エラーなしでJSONを読み込み・保存:

```javascript
// 安全な読み込み
const config = _.parseJSON(fs.readFileSync('config.json', 'utf8')) ?? defaultConfig

// 保存用の安全な文字列化
const saved = _.jsonStringify(userPreferences)
if (saved) {
  fs.writeFileSync('prefs.json', saved)
}
```

### 日本語住所フォームの正規化

日本の住所フォームでの全角入力という古い要件に対抗:

```javascript
// 問題: 多くの日本のフォームは今でも全角入力を要求
// ユーザーは自然に入力: "ｱｲﾁｹﾝ ABC-1-23"
// フォームが拒否: "全角で入力してください"

// 解決策: どんな入力も受け付け、クライアント側で正規化
const handleAddressInput = (userInput) => {
  // ステップ1: すべてを全角に正規化
  const normalized = _.toFullWidth(userInput)
  
  // ステップ2: データベースに保存または送信
  return normalized
}

// 例:
handleAddressInput('ｱｲﾁｹﾝ ABC-1-23')
// => 'アイチケン　ＡＢＣ－１－２３'

// より良いユーザー体験のために:
<input 
  onChange={(e) => {
    const normalized = _.toFullWidth(e.target.value)
    setAddress(normalized)
    // フォームはリアルタイムで正規化を表示
    // ユーザーは入力方法を気にする必要なし
  }}
/>
```

### カナ入力の正規化

様々なカナ入力形式を処理:

```javascript
const input1 = 'ｱｲｳｴｵ'  // 半角カナ
const input2 = 'あいうえお'  // ひらがな
const input3 = 'アイウエオ'  // 全角カナ

// 全角カナに正規化
const normalized = [
  _.kanaToFull(input1),
  _.hiraToKana(input2),
  input3
]

// すべて: 'アイウエオ'

// 半角に変換（レガシーシステム互換性）
_.kanaToHalf('アイウエオ')  // => 'ｱｲｳｴｵ'
_.kanaToHalf('ガギグゲゴ')  // => 'ｶﾞｷﾞｸﾞｹﾞｺﾞ'（結合記号付き）
```

## 共通パターン

### 操作のチェーン

強力な変換のためにansukoユーティリティを組み合わせ:

```javascript
// JSONをパースし、数値フィールドを抽出し、デフォルトを提供
const timeout = _.toNumber(
  _.valueOr(
    _.parseJSON(configStr)?.timeout,
    '5000'
  )
) ?? 30000

// またはlodashとチェーン
const validUsers = _.chain(users)
  .map(user => ({
    ...user,
    age: _.toNumber(user.age) ?? 0
  }))
  .filter(user => _.isEmpty(user.name) === false)
  .value()
```

### nullable入力のバリデーション

潜在的にnullの値の安全な処理:

```javascript
async function processUser(user) {
  const name = _.valueOr(formatName(user?.name), () => appendInvalidParameter("name"))
  const age = _.toNumber(user?.age) ?? -1
  const email = await _.equalsOr(getEmailFromApi, '', () => appendInvalidParameter("email"))
  
  if(invalidParameters) { /* ... */ }

  return { name, age, email }
}
```

### 遅延計算

不要な場合は高価な操作を回避:

```javascript
// expensiveCalculation()はconfig.valueがnilの場合のみ実行
const result = _.valueOr(
  config.value,
  () => expensiveCalculation()
)

// Promise評価 - 自動処理
const data = await _.valueOr(
  cache.get('key'),
  () => fetchFromAPI()  // キャッシュミスの場合のみ呼ばれる
)
```

### 条件付き更新

更新オブジェクトを動的に構築:

```javascript
const updates = {}

if (hasChanges) {
  Object.assign(updates, _.changes(original, edited, changedKeys))
}

if (Object.keys(updates).length > 0) {
  await db.update(record, updates)
}
```

## プラグインの使用パターン

### 複数プラグインの読み込み

```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'
import geoPlugin from 'ansuko/plugins/geo'
import prototypePlugin from 'ansuko/plugins/prototype'

// 完全な機能のためにプラグインをチェーン
const extended = _
  .extend(jaPlugin)
  .extend(geoPlugin)
  .extend(prototypePlugin)

// すべてが使える
extended.kanaToHira('アイウ')                    // 日本語
extended.toPointGeoJson([139.7, 35.6])         // Geo
[1,2,3].notFilter(n => n % 2)                   // Prototype
extended.valueOr(null, 'default')               // コア
```

### 条件付きプラグイン読み込み

バンドルサイズを最適化するために、必要な場合のみプラグインを読み込み:

```typescript
// コアアプリ - 最小バンドル
import _ from 'ansuko'

// 日本語入力フォーム - jaプラグインを追加
if (needsJapaneseInput) {
  const jaPlugin = await import('ansuko/plugins/ja')
  _.extend(jaPlugin.default)
}

// マップビュー - geoプラグインを追加
if (showingMap) {
  const geoPlugin = await import('ansuko/plugins/geo')
  _.extend(geoPlugin.default)
}
```

### カスタムプラグインの作成

```typescript
// カスタムプラグインを定義
const myPlugin = (ansuko) => {
  const customFunction = (value) => {
    // ansukoユーティリティを使用したロジック
    return ansuko.isEmpty(value) ? 'empty' : value
  }
  
  // ansukoを拡張
  ansuko.customFunction = customFunction
  
  return ansuko
}

// プラグインを使用
const extended = _.extend(myPlugin)
extended.customFunction(null)  // 'empty'
```

## GeoJSONワークフロー

### ユーザー入力のGeoJSONへの変換

```typescript
import _ from 'ansuko'
import geoPlugin from 'ansuko/plugins/geo'

const extended = _.extend(geoPlugin)

// ユーザーが様々な形式で入力
const userInputs = [
  [139.7671, 35.6812],                    // 配列
  { lat: 35.6895, lng: 139.6917 },        // オブジェクト
  '{"type":"Point","coordinates":[...]}', // JSON文字列
]

// すべてをGeoJSON Pointに変換
const points = userInputs
  .map(input => extended.toPointGeoJson(input))
  .filter(Boolean)  // nullを削除
```

### GeoJSONフィーチャーの構築

```typescript
// データベースレコードからフィーチャーコレクションを作成
const trees = await db.trees.find({ city: 'Tokyo' })

const features = trees
  .map(tree => {
    const point = extended.toPointGeoJson([tree.lng, tree.lat])
    if (!point) return null
    
    return {
      type: 'Feature',
      geometry: point,
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

### ポリゴン操作

```typescript
// 重複する管理区域を結合
const zone1 = await db.getZonePolygon('zone-1')
const zone2 = await db.getZonePolygon('zone-2')
const zone3 = await db.getZonePolygon('zone-3')

const mergedZone = extended.unionPolygon([zone1, zone2, zone3])

// 結合された境界を保存
await db.boundaries.insert({
  name: 'merged-zone',
  geometry: mergedZone
})
```

## パフォーマンスの考慮事項

### 大きなオブジェクトでの `changes`

大きなオブジェクトの場合、キーを具体的に指定:

```javascript
// 良い: 具体的なキー
const changes = _.changes(large, updated, ['field1', 'field2'])

// 高コスト: すべてのキーをスキャン
const changes = _.changes(large, updated, Object.keys(large), { keyExcludes: false })
```

### JSONパース

頻繁にパースされるJSONの場合、結果をキャッシュ:

```javascript
const data = memoize(() => _.parseJSON(jsonStr))
```

### テキスト正規化

一括操作の場合、一度だけ正規化してキャッシュすることを検討:

```javascript
// データベースレコードを一度だけ正規化
const normalizedProducts = products.map(p => ({
  ...p,
  searchableName: _.haifun(p.name),
  searchableSku: _.haifun(p.sku)
}))

// 事前に正規化されたフィールドで検索
const results = normalizedProducts.filter(p =>
  p.searchableName.includes(_.haifun(query))
)
```

### React状態更新の待機

状態変更がレンダリングされることを保証するために、`setTimeout` の代わりに `waited` を使用します。フレームベースのタイミングはデバイスのパフォーマンスに関係なく実際のレンダリングサイクルに適応し、早すぎる実行と不要な遅延の両方を排除します。

```javascript
// ❌ Before: 信頼性の低いタイミング、マシン速度に依存
function handleUpdate() {
  setData(newData)
  setTimeout(() => {
    // 低速デバイスではレンダリング完了前に実行される可能性
    // 高速デバイスでは不必要に長く待つ可能性
    scrollToElement()
  }, 100)  // 任意の数字！
}

// ✅ After: 実際のレンダリングを待ち、デバイスに適応
function handleUpdate() {
  setData(newData)
  _.waited(() => {
    scrollToElement()  // レンダリング後に実行が保証される
  }, 1)  // 2フレーム待機（1 RAF + もう1つ）
}

// 複数の状態更新
function handleComplexUpdate() {
  setStep1(data1)
  _.waited(() => {
    setStep2(data2)
    _.waited(() => {
      triggerAnimation()
    }, 2)  // 重いレンダリングのために2フレーム待機
  }, 1)
}

// 状態変更後のDOM測定
function measureElement() {
  setExpanded(true)
  _.waited(() => {
    const height = elementRef.current.offsetHeight  // 正確な測定
    startAnimation(height)
  }, 1)
}

// チェーンされたアニメーション
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

**なぜ `waited` が `setTimeout` より優れているか:**
- **任意の遅延なし**: フレーム数、ミリ秒ではない
- **デバイス非依存**: 高速マシンは不必要に待たず、低速マシンは壊れない
- **レンダリング同期**: 実際のDOM更新後に実行
- **競合状態なし**: ペイントサイクル後の実行が保証される

## Promise vs 同期処理

`valueOr` と `equalsOr` はPromiseを自動検出:

```javascript
// 同期 - 即座に返す
const result1 = _.valueOr('value', 'default')  // 'value'
const result2 = _.equalsOr('a', 'a', 'default')  // 'a'

// 非同期 - Promiseを返す
const result3 = await _.valueOr(asyncGetValue(), 'default')
const result4 = await _.equalsOr(asyncCheck(), 'expected', 'default')

// 混在 - 自動的にPromiseになる
const result5 = await _.equalsOr(syncValue, asyncValue, 'default')
```

## valueOrとequalsOrの高度なパターン

遅延評価と自動Promise処理を持つスマートなフォールバックチェーン:

```javascript
// バリデーション → 送信（バリデーション失敗時はエラーを返し、成功時はundefined）
const errors = await _.valueOr(validate(), () => api.submit())

// キャッシュヒット → API取得（まずキャッシュを試し、ミス時に取得）
const data = await _.valueOr(cache.get(key), () => api.fetch(key))

// ローカル設定 → リモート設定（ローカルを優先、APIにフォールバック）
const config = await _.valueOr(localStorage.get('config'), () => api.getConfig())

// 変更チェック → 確認と保存実行（非同期） → クローズ（変更なしなら確認と保存をスキップ）
_.equalsOr(original, edited, () => confirmAndSave()).then(doClose)
// または
const uid = original.uid // id = 一意のデータ識別子、id = テーブルの連番
const diff = _.changes(original, edited, ["id", "created_at", "updated_at"], {excludeKeys: true}) // id、created_at、updated_atを除く変更データを取得
_.valueOr(!diff, () => confirmAndSave({...diff, uid})).then(onClose)

// 悟りを開いた者向け: 権限ゲート実行（拒否された場合trueを返し、実行された場合結果を返す）
const resultOrNotAccepted = await _.valueOr(!checkPermission(), () => executeAction())
if (resultOrNotAccepted === true) {
  // 権限拒否、アクション未実行
} else {
  // アクション実行、結果を処理
  handleResult(resultOrNotAccepted)
}
```

**主な利点:**
- **簡潔**: 単一の式で複雑なロジック
- **遅延評価**: フォールバック関数は必要な場合のみ実行
- **Promise対応**: 同期と非同期をシームレスに処理
- **型安全**: 返り値の型が明確に定義される

## lodashからの移行

### isEmpty

```javascript
// lodash
if (_.isEmpty(0)) { /* 実行されるが、すべきでない */ }

// ansuko
if (_.isEmpty(0)) { /* 実行されない - 正しい！ */ }
  /* 必要ならオリジナルを呼び出せる */
if(_.isEmptyOrg(0)) { /* 実行 */}
```

### castArray

```javascript
// lodash
_.castArray(null)  // => [null]

// ansuko
_.castArray(null)  // => []
  /* 必要ならオリジナルを呼び出せる */
_.castArrayOrg(null) // => [null]
```

### JSON用のtry-catchが不要

```javascript
// lodashの方法
let data
try {
  data = JSON.parse(str)
} catch (e) {
  data = null
}
if(!data) { /** エラー処理 **/ }

// ansukoの方法（問題がある場合nullを返す）
const data = _.parseJSON(str)
if (!data) { /** エラー処理 **/ }
```

### フォーマットとフィルタリング付きJSONエクスポート

```javascript
// 整形出力付きで設定をエクスポート
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  features: {
    darkMode: true,
    notifications: false
  }
}

// 設定ファイル用の整形出力されたJSON
const configJson = _.jsonStringify(config, null, 2)
fs.writeFileSync('config.json', configJson)

// Before: 冗長
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

// After: センシティブフィールドのフィルタリング付きでクリーン
const safeExport = _.jsonStringify(
  userData,
  (key, value) => ['password', 'apiKey', 'secret'].includes(key) ? undefined : value,
  2
)

// エクスポート時に数値を丸める
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

## React統合の注意事項

### なぜJSXでvalueOr/equalsOrを直接使用しないのか？

```tsx
// ❌ これはしないで - 問題が発生
<InputField value={_.valueOr(user?.name, GetNameAPI)} />

// ✅ 代わりにuseState + useEffectを使用
const [userName, setUserName] = useState('')

useEffect(() => {
  _.valueOr(user?.name, GetNameAPI).then(setUserName)
}, [user?.name])

<InputField value={userName} />
```

問題点: Reactはpropsで安定した値を期待します。Promiseを直接渡したり、レンダリング中に関数を呼び出すと、再レンダリングループや予期しない動作を引き起こす可能性があります。常に `useEffect` またはカスタムフックで値を解決してください。