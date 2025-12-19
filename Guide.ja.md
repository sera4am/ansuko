# 使い方ガイド

## TypeScriptサポート

型定義を含む完全なTypeScriptサポート：

```typescript
import _ from '@sera/ansuko'
import { valueOr, isEmpty, toNumber, equalsOr, parseJSON, changes, haifun, type ChangesOptions } from '@sera/ansuko'

// 型推論が完璧に動作
const result1: string = _.valueOr(null, 'default')
const result2: number = _.toNumber('1,234') ?? 0
const result3: boolean = _.isEmpty([])

// ジェネリクスサポート
interface User { name: string; age: number }
const user = _.parseJSON<User>(jsonString)  // User | null

// オプション型
const opts: ChangesOptions = { keyExcludes: true }
const diff = _.changes(obj1, obj2, keys, opts)
```

## 実践例

### APIレスポンスの処理

try-catchやnullチェックなしで安全にAPIレスポンスを処理：

```javascript
// 従来の書き方
let status
try {
  const response = await fetch('/api/status')
  const data = await response.json()
  status = data && data.status ? data.status : 'unknown'
} catch (e) {
  status = 'error'
}

// ansukoを使った書き方
const data = await _.valueOr(fetch('/api/status').then(r => r.json()), {})
const status = _.equalsOr(data.status, 'success', 'unknown')
```

### スマートなダイアログクローズ

「未保存の変更」ダイアログをPromiseの自動処理でエレガントに：

```javascript
// 従来の書き方 - 冗長でエラーが起きやすい
const handleClose = async () => {
  if (_.isEqual(original, edited)) {
    // 変更なし、即座にクローズ
    closeDialog()
  } else {
    // 変更あり、確認ダイアログを表示
    const confirmed = await showConfirmDialog()
    if (confirmed) {
      closeDialog()
    }
  }
}

// ansukoの書き方 - シンプルで直感的
const handleClose = () => {
  // equalsOrが同期・非同期を自動で処理
  // 等しい場合: 即座にoriginalを返して(同期)クローズ
  // 異なる場合: showConfirmDialogを呼び出し(非同期)、結果を待ってクローズ
  _.equalsOr(original, edited, showConfirmDialog).then(closeDialog)
}

// さらに簡潔に
const handleClose = () => 
  _.equalsOr(original, edited, showConfirmDialog).then(closeDialog)
```

### 設定の検証

設定の処理をシンプルに：

```javascript
// 従来の書き方
const config = await loadConfig()
const timeout = config.timeout !== null && 
                config.timeout !== undefined && 
                config.timeout !== '' ? 
                config.timeout : 5000

// ansukoの書き方
const timeout = _.valueOr(loadConfig(), {timeout: 5000)).timeout
```

### 安全な配列操作

null/undefinedの処理をスッキリと：

```javascript
// 従来の書き方
const items = data.items
const processed = (items ? (Array.isArray(items) ? items : [items]) : [])
  .filter(Boolean)
  .map(process)

// ansukoの書き方
const processed = _.castArray(data.items)?.map(process) ?? []
```

### ハイフン問題の解決

もう住所を全角で入力させられた挙げ句、未知のハイフンで悩ませないためのアレ

```javascript
// 問題：ユーザーが「東京-大阪」で検索するが、DBには「東京―大阪」(別のハイフン)
const userQuery = "東京-大阪"
const dbRecord = "東京―大阪"
userQuery === dbRecord  // => false (マッチしない！)

// 解決策：比較前に正規化
const normalizedQuery = _.haifun(userQuery)
const normalizedRecord = _.haifun(dbRecord)
normalizedQuery === normalizedRecord  // => true (マッチ！)

// 正規化を使った検索
app.get('/search', (req, res) => {
  const query = _.haifun(req.query.q)
  const results = db.products.filter(p => 
    _.haifun(p.name).includes(query) ||
    _.haifun(p.sku).includes(query)
  )
  res.json(results)
})
```

### 商品コードの重複検出

異なるダッシュ文字を使った重複SKU/品番を検出：

```javascript
const products = [
  { sku: 'ABC-123-XYZ', name: 'ウィジェット A' },
  { sku: 'ABC—123—XYZ', name: 'ウィジェット B' },  // emダッシュ
  { sku: 'DEF-456', name: 'ガジェット' },
]

// 正規化したSKUで重複を検出
const normalized = products.map(p => ({
  ...p,
  normalizedSku: _.haifun(p.sku)
}))

const duplicates = _.groupBy(normalized, 'normalizedSku')
const hasDuplicates = Object.values(duplicates).some(group => group.length > 1)

// 結果：ABC-123-XYZとABC—123—XYZが重複として検出される
```

### 住所のマッチング

一貫性のないダッシュ形式の住所を比較：

```javascript
const addresses = [
  '123-4567 Tokyo',      // ハイフンマイナス
  '123−4567 Tokyo',      // マイナス記号
  '123–4567 Tokyo',      // enダッシュ
]

// 正規化して比較
const normalized = addresses.map(addr => _.haifun(addr))
// 全て '123‐4567 Tokyo' になる

// 重複を削除
const unique = _.uniqBy(
  addresses.map(addr => ({ original: addr, normalized: _.haifun(addr) })),
  'normalized'
)
```

### CSV/Excelデータのクリーニング

一貫性のない記号を含むインポートデータをクリーンアップ：

```javascript
// 混在したダッシュ文字を含むCSVインポート
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

// 全ての商品コードが統一されたダッシュを使用
```

### ディープパスを使ったデータベース更新用diff

DBに格納するデータを保持しているが、投入したくないデータも含んでおり、
単なるobject比較だけでは除去が手間。というための関数

```javascript
// DBから元データを取得
const original = await db.users.findById(userId)

// UIでユーザーがデータを編集
const edited = userFormData

// 変更されたフィールドのみ取得（ディープパス対応）
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
//   profile: { bio: '新しい自己紹介' },
//   settings: { theme: 'dark' }
// }

// lodashのsetを使ってオブジェクトに適用
const updated = _.cloneDeep(original)
Object.entries(updates).forEach(([path, value]) => {
  _.set(updated, path, value)
})

// MongoDB用（ドット記法をネイティブサポート）
await db.users.updateOne(
  { _id: userId },
  { $set: updates }  // MongoDBは自動でネストされたパスを処理
)

// SQLデータベース用、トップレベルオブジェクトを更新
await db.query(`
  UPDATE users 
  SET profile = $1, settings = $2 
  WHERE id = $3
`, [updates.profile, updates.settings, userId])
```

**主な機能：**
- **ディープパスサポート**：`'profile.bio'` でネストされた変更を追跡
- **ネストされた結果**：適用しやすい構造化オブジェクトを返す
- **データベースフレンドリー**：MongoDBのドット記法やSQL JSONカラムで動作

### センシティブなフィールドの除外

差分追跡から特定のフィールドを除外（トップレベルキーのみ）：

```javascript
// passwordとAPIキーを除いた全変更を取得
const safeChanges = _.changes(original, updated, ['password', 'apiKey', 'secret'], { 
  keyExcludes: true 
})

// センシティブでないトップレベルフィールドのみが結果に含まれる
// 注意：keyExcludesモードはトップレベルキーのみで、ディープパスには非対応

// ネストされた除外には、代わりに特定のパスを使用：
const updates = _.changes(original, updated, [
  'name',
  'email',
  'profile.bio',
  'profile.avatar'
  // profile.privateNotesを除外して、欲しいものを明示的にリスト
])
```

### デフォルト値付きフォーム検証

直感的なデフォルト値でフォームデータを検証：

```javascript
const formData = {
  name: valueOr(form.name, 'Anonymous'),
  age: toNumber(form.age) ?? 18,
  active: boolIf(form.active, false),
  email: valueOr(form.email, 'no-email@example.com')
}
```

### 安全なJSON設定

エラーなしでJSONを読み込み・保存：

```javascript
// 安全な読み込み
const config = _.parseJSON(fs.readFileSync('config.json', 'utf8')) ?? defaultConfig

// 保存用に安全にstringify
const saved = _.jsonStringify(userPreferences)
if (saved) {
  fs.writeFileSync('prefs.json', saved)
}
```

### 日本の住所フォーム正規化

日本の住所フォームで全角入力を求められるレガシー要件に対抗：

```javascript
// 問題：多くの日本のフォームが未だに全角入力を要求
// ユーザーは自然に入力：「ｱｲﾁｹﾝ ABC-1-23」
// フォームが拒否：「全角で入力してください」

// 解決策：どんな入力も受け付けて、JS側で正規化
const userInput = formField.value  // "東京都千代田区ｺｳｴﾝ町1-23"
const normalized = _.toFullWidth(userInput, 'ー')
// 結果：「東京都千代田区コウエン町１ー２ー３」

// 実際のフォームハンドラ
function handleAddressSubmit(e) {
  e.preventDefault()
  const address = _.toFullWidth(e.target.address.value, 'ー')
  const postalCode = _.toFullWidth(e.target.postalCode.value, 'ー')
  
  const errors = await _.valueOr(getValidateErrors(address, postalCode), () => api.submitAddress({address, postalCode}))
  if (errors) {
    // その他のバリデーションエラー処理
  }
}

// バリデーションエラーなし、ユーザーのストレスなし
```

**なぜこれが重要か：**
- ユーザーは自然に入力できる（コピペも動く！）
- イライラするバリデーションエラーがない
- システムが自動で正規化
- どんな入力でも対応：半角、全角、混在

**全角から半角へ（モダンシステム向け）：**

```javascript
// モダンなAPIは互換性のため半角を好む
const legacyInput = 'ｈｏｇｅ＠ｆｏｏ.ｃｏｍ'  // 古いデータベースから
const modernFormat = _.toHalfWidth(legacyInput, '-')
// 結果：'hoge@foo.com'

// インポートデータをクリーンアップ
const modernized = legacyAddresses.map(addr => ({
  ...addr,
  address: _.toHalfWidth(addr.address, '-'),
  building: _.toHalfWidth(addr.building, '-')
}))
```

### 日本語テキストの正規化

様々な日本語テキストエンコーディングを処理：

```javascript
// 異なるソースからのユーザー入力
const input1 = 'ｱｲｳｴｵ'  // 半角カタカナ
const input2 = 'あいうえお'  // ひらがな
const input3 = 'アイウエオ'  // カタカナ

// 全角カタカナに正規化
const normalized = [
  _.kanaToFull(input1),
  _.hiraToKana(input2),
  input3
]

// 全て「アイウエオ」に

// 半角に変換（レガシーシステム互換性）
_.kanaToHalf('アイウエオ')  // => 'ｱｲｳｴｵ'
_.kanaToHalf('ガギグゲゴ')  // => 'ｶﾞｷﾞｸﾞｹﾞｺﾞ' (結合文字付き)
```

## よくあるパターン

### 操作のチェーン

ansukoユーティリティを組み合わせて強力な変換：

```javascript
// JSON解析、数値フィールド抽出、デフォルト値提供
const timeout = _.toNumber(
  _.valueOr(
    _.parseJSON(configStr)?.timeout,
    '5000'
  )
) ?? 30000

// lodashとのチェーン
const validUsers = _.chain(users)
  .map(user => ({
    ...user,
    age: _.toNumber(user.age) ?? 0
  }))
  .filter(user => _.isEmpty(user.name) === false)
  .value()
```

### null可能な入力の検証

null可能性がある値の安全な処理：

```javascript
async function processUser(user) {
  const name = _.valueOr(formatName(user?.name), () => appendInvalidParameter("name"))
  const age = _.toNumber(user?.age) ?? -1
  const email = await _.equalsOr(getEmailFromApi, '', () => appendInvalidParameter("email"))
  
  if(invalidParameters) { /* ... */ }

  return { name, age, email }
}
```

### 遅延評価

不要な場合は高コスト操作を回避：

```javascript
// config.valueがnilの場合のみexpensiveCalculation()が実行される
const result = _.valueOr(
  config.value,
  () => expensiveCalculation()
)

// Promise評価 - 自動処理
const data = await _.valueOr(
  cache.get('key'),
  () => fetchFromAPI()  // キャッシュミス時のみ呼ばれる
)
```

### 条件付き更新

更新オブジェクトを動的に構築：

```javascript
const original = {
    id: 123, // 更新対象外
    createdAt: 1766230000, // 更新対象外
    uid: "data_1", // これが固有ID
    name: "test_a",
    message: "hello",
}
const edited = {
    id: 123, // 更新対象外
    createdAt: 1766230000, // 更新対象外
    updatedAt: 1766466000,
    // name: "data_1",
    message: "world",
    clickAt: 1766000000, // 更新対象外
    mode: "cache", // 更新対象外
}

const updates = _.changes(original, edited, [
    "uid", "updatedAt", "name", "message"
])

console.log(updates)
/*
  出力: {name: null, message: "world"}
*/

// もし、除外したいがわかっててそちらの列挙の方が楽なら
const updates = _.changes(original, edited, [
    "id", "createdAt", "clickAt", "mode"
], {excludeKeys: true})
/*
  出力: 上記と同じ
*/

```

### PromiseとSync処理

`valueOr`と`equalsOr`は自動的に関数及びPromiseを検出：

```javascript
// 同期 - 即座に返る
const result1 = _.valueOr('value', 'default')  // 'value'
const result2 = _.equalsOr('a', 'a', 'default')  // 'a'

// 非同期 - Promiseを返す
const result3 = await _.valueOr(asyncGetValue, asyncDefaultValue)

// 混在 - Promiseを返す
const result4 = await _.equalsOr(asyncCheck, 'expected', 'default')

```

### valueOrとequalsOrの高度なパターン

遅延評価と自動Promise処理によるスマートなフォールバックチェーン：

```javascript
// キャッシュヒット → API取得（まずキャッシュ、ミスならfetch）
const data = await _.valueOr(cache.get(key), () => api.fetch(key))

// ローカル設定 → リモート設定（ローカル優先、フォールバックでAPI結果を非同期取得）
const config = await _.valueOr(localStorage.get('config'), () => api.getConfig())

// 変更チェック → 確認と保存実行（非同期） → クローズ（変更なしなら確認と保存をスキップ）
_.equalsOr(original, edited, () => confirmAndSave()).then(doClose)
// または
const uid = original.uid // uid = データ固有ID、id = テーブルのシーケンシャル番号
const diff = _.changes(original edited, ["id", "created_at", "updated_at"], {excludeKeys: true}) // id、created_at、updated_atを除く変更データを取得
_.valueOr(!diff, () => confirmAndSave({...diff, uid})).then(onClose)

// 明晰な人向け：権限ゲート実行（拒否ならtrue、実行されたら結果を返す）
const resultOrNotAccepted = await _.valueOr(!checkPermission(), () => executeAction())
if (resultOrNotAccepted === true) {
  // 権限拒否、アクション未実行
} else {
  // アクション実行済み、結果を処理
  handleResult(resultOrNotAccepted)
}
```

**主な利点：**
- **簡潔**：複雑なロジックを1つの式で
- **遅延評価**：フォールバック関数は必要な時だけ実行
- **Promise対応**：同期と非同期をシームレスに処理
- **型安全**：戻り値の型が明確

## lodashからの移行

### isEmpty

```javascript
// lodash
if (_.isEmpty(0)) { /* 実行されるが、0は空なのか？ */ }

// ansuko
if (_.isEmpty(0)) { /* 実行されない - 正しい！ */ }
  /* 元の動作が必要なら */
if(_.isEmptyOrg(0)) { /* 実行される */}
```

### castArray

```javascript
// lodash
_.castArray(null)  // => [null] いやいや！

// ansuko
_.castArray(null)  // => [] 納得！
  /* 元の動作が必要なら */
_.castArrayOrg(null) // => [null]
```

### もうlet+try-catchは不要

```javascript
// lodashの方法
let data
try {
  data = JSON.parse(str)
} catch (e) {
  data = null
}
if(!data) { /** エラー処理 **/ }

// ansukoの方法（問題があればnullを返す、細かいエラー貰ってもユーザに説明できんしそもそもjsonをそのまま使わせないっしょ）
const data = _.parseJSON(str)
if (!data) { /** エラー処理 **/ }
```

## パフォーマンスの考慮事項

### 大きなオブジェクトでの`changes`

大きなオブジェクトには、キーを具体的に指定：

```javascript
// 良い：特定のキー
const changes = _.changes(large, updated, ['field1', 'field2'])

// 高コスト：全キーをスキャン
const changes = _.changes(large, updated, Object.keys(large), { keyExcludes: false })
```

### JSON解析

頻繁に解析するJSONは、結果をキャッシュ：

```javascript
const data = memoize(() => _.parseJSON(jsonStr))
```

### テキスト正規化

一括操作では、一度正規化してキャッシュすることを検討：

```javascript
// データベースレコードを一度正規化
const normalizedProducts = products.map(p => ({
  ...p,
  searchableName: _.haifun(p.name),
  searchableSku: _.haifun(p.sku)
}))

// その後、正規化済みフィールドで検索
const results = normalizedProducts.filter(p =>
  p.searchableName.includes(_.haifun(query))
)
```

### Reactの状態更新を待つ

状態変更がレンダリングされることを保証するため、`setTimeout`の代わりに`waited`を使用。フレームベースのタイミングは、デバイスパフォーマンスに関係なく実際のレンダリングサイクルに適応し、早すぎる実行と不要な待機の両方を排除します。

```javascript
// ❌ 従来：信頼性のないタイミング、マシン速度に依存
function handleUpdate() {
  setData(newData)
  setTimeout(() => {
    // 遅いデバイスではレンダリング完了前に実行される可能性
    // 速いデバイスでは不必要に長く待つ可能性
    scrollToElement()
  }, 100)  // 適当な数値！
}

// ✅ 改善後：実際のレンダリングを待ち、デバイスに適応
function handleUpdate() {
  setData(newData)
  _.waited(() => {
    scrollToElement()  // レンダリング後の実行が保証される
  }, 1)  // 2フレーム待機（1 RAF + もう1回）
}

// 複数の状態更新
function handleComplexUpdate() {
  setStep1(data1)
  _.waited(() => {
    setStep2(data2)
    _.waited(() => {
      triggerAnimation()
    }, 2)  // 重いレンダリング用に3フレーム待機
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

// 連鎖アニメーション
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

**`waited`が`setTimeout`より優れている理由：**
- **恣意的な遅延なし**：ミリ秒ではなくフレーム数
- **デバイス非依存**：速いマシンは無駄に待たず、遅いマシンで壊れない
- **レンダリング同期**：実際のDOM更新後に実行
- **競合状態なし**：ペイントサイクル後の実行が保証

## React統合の注意点

### なぜJSXで直接valueOr/equalsOrを使わない方がいいのか？

```tsx
// ❌ これはダメ - 問題が起きる
<InputField value={_.valueOr(user?.name, GetNameAPI)} />

// ✅ useState + useEffectを使う
const [userName, setUserName] = useState('')

useEffect(() => {
  _.valueOr(user?.name, GetNameAPI).then(setUserName)
}, [user?.name])

<InputField value={userName} />
```

理由：Reactはpropsで安定した値を期待します。Promiseを直接渡したり、レンダリング中に関数を呼び出すと、再レンダリングループや予期しない動作を引き起こす可能性があります。常に`useEffect`やカスタムフック内で値を解決してください。