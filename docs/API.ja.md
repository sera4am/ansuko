# APIリファレンス

ansukoユーティリティライブラリの完全なAPIドキュメント。

[English](./API.md) | [日本語](./API.ja.md) | [简体中文](./API.zh.md)

## 目次

- [コア関数](#コア関数)
- [型ガード・バリデーション](#型ガードバリデーション)
- [型変換](#型変換)
- [Promiseユーティリティ](#promiseユーティリティ)
- [エラーハンドリング](#エラーハンドリング)
- [オブジェクトユーティリティ](#オブジェクトユーティリティ)
- [配列ユーティリティ](#配列ユーティリティ)
- [文字列ユーティリティ](#文字列ユーティリティ)
- [日本語ユーティリティ](#日本語ユーティリティ-プラグイン-pluginsja)
- [Geoユーティリティ](#geoユーティリティ-プラグイン-pluginsgeo)
- [プラグインシステム](#プラグインシステム)
- [オリジナルlodash関数](#オリジナルlodash関数)

---

## コア関数

### isEmpty(value)
空かどうかをチェックします。数値と真偽値は空ではありません。

**カテゴリ:** コア関数  
**例:** `_.isEmpty(0) // false`

---

### boolIf(value, defaultValue?)
安全な真偽値変換。数値はゼロチェック、その他はフォールバック。

**カテゴリ:** コア関数  
**例:** `_.boolIf('x', true) // true`

---

### waited(func, frameCount?)
N個のアニメーションフレーム後に実行します（`requestAnimationFrame`使用）。

**カテゴリ:** コア関数  
**例:** `_.waited(() => measure(), 1)`

---

### swallow(fn)
関数を実行し、エラーが発生した場合はundefinedを返します（同期/非同期対応）。

**カテゴリ:** コア関数  
**例:** `_.swallow(() => riskyOp()) // エラー時はundefined`

---

### swallowMap(array, fn, compact?)
配列をマップし、エラーをundefinedとして扱います。`compact`がtrueの場合、エラーを除外します。

**カテゴリ:** コア関数  
**例:** `_.swallowMap(items, process, true) // 成功した結果のみ`

---

### extend(plugin)
プラグインを適用し、拡張されたインスタンスを返します。

**カテゴリ:** コア関数  
**例:** `const _ja = _.extend(jaPlugin)`

---

## 型ガード・バリデーション

### isValidStr(value)
非空文字列の場合のみtrueを返します。null、undefined、空文字列、非文字列値の場合はfalseを返します。

**カテゴリ:** 型ガード  
**返り値:** `boolean`

**例:**
```typescript
_.isValidStr('hello')     // true
_.isValidStr('')          // false
_.isValidStr(null)        // false
_.isValidStr(undefined)   // false
_.isValidStr(0)           // false
_.isValidStr([])          // false
```

**ユースケース:**
- フォームバリデーション
- APIパラメータチェック
- 安全な文字列操作

---

## 型変換

### toNumber(value)
全角・カンマ対応で数値に変換します。無効な入力時は `null` を返します。

**カテゴリ:** コア関数  
**パラメータ:**
- `value` (unknown): 変換する値

**返り値:** `number | null`

**機能:**
- 全角数字に対応: `'１２３'` → `123`
- カンマを削除: `'1,234.5'` → `1234.5`
- 無効な入力には `null` を返す（`NaN` ではない）

**例:**
```typescript
_.toNumber('1,234')           // 1234
_.toNumber('１２３')          // 123
_.toNumber('1,234.5')         // 1234.5
_.toNumber('abc')             // null
_.toNumber(null)              // null
_.toNumber(42)                // 42
```

**ユースケース:**
- ユーザー入力のパース（フォーム、CSV取り込み）
- 全角数字を含む日本語テキストの処理
- 例外なしの安全な数値変換

---

### toBool(value, undetected?)
文字列、数値、様々な真偽値表現を処理するスマートな真偽値変換。

**カテゴリ:** コア関数  
**パラメータ:**
- `value` (unknown): 変換する値
- `undetected` (boolean | null = null): 変換が曖昧な場合の返り値

**返り値:** `boolean | null | Promise<boolean | null>`

**認識される値:**
- **真の文字列:** `"true"`, `"t"`, `"y"`, `"yes"`, `"ok"` (大文字小文字区別なし)
- **偽の文字列:** `"false"`, `"f"`, `"n"`, `"no"`, `"ng"` (大文字小文字区別なし)
- **数値:** `0` は false、その他の数値は true
- **真偽値:** そのまま返す
- **関数:** 自動的に実行（Promise対応）

**例:**
```typescript
_.toBool(1)                   // true
_.toBool(0)                   // false
_.toBool('yes')               // true
_.toBool('no')                // false
_.toBool('true')              // true
_.toBool('unknown')           // null
_.toBool('unknown', false)    // false（カスタムデフォルト）
_.toBool(null)                // false
```

**ユースケース:**
- フォームのチェックボックス・トグルのパース
- 環境変数のパース
- APIレスポンスの正規化

---

### boolIf(value, defaultValue = false)
フォールバック付きの安全な真偽値変換。実際の真偽値と数値のみを変換します。

**カテゴリ:** コア関数  
**パラメータ:**
- `value` (unknown): チェックする値
- `defaultValue` (boolean = false): フォールバック値

**返り値:** `boolean`

**ロジック:**
- 真偽値の場合: その真偽値を返す
- 数値の場合: `!!value` を返す（ゼロチェック）
- その他: `defaultValue` を返す

**例:**
```typescript
_.boolIf(true)                // true
_.boolIf(1)                   // true
_.boolIf(0)                   // false
_.boolIf('string', true)      // true（デフォルト）
_.boolIf(null, false)         // false（デフォルト）
```

**ユースケース:**
- 型安全な真偽値強制変換
- オプショナルフラグの処理
- 予期しない真偽値変換の回避

---

### parseJSON(str)
try-catch不要の安全なJSON/JSON5パース。エラー時は `null` を返します。

**カテゴリ:** 変換  
**パラメータ:**
- `str` (string | object): パースするJSON文字列

**返り値:** `T | null`

**機能:**
- JSON5パーサーを使用（コメント、末尾カンマ、引用符なしキーに対応）
- 例外を投げない
- 既にパース済みのオブジェクトはそのまま返す

**例:**
```typescript
_.parseJSON('{"a":1}')                    // {a:1}
_.parseJSON('{a:1}')                      // {a:1}（JSON5!）
_.parseJSON('{ "a": 1, /* comment */ }')  // {a:1}
_.parseJSON('{ "a": 1, }')                // {a:1}（末尾カンマ）
_.parseJSON('invalid')                    // null
_.parseJSON({a:1})                        // {a:1}（パススルー）
```

**ユースケース:**
- 設定ファイルの読み込み
- APIレスポンスのパース
- ユーザー提供のJSONの処理

---

### jsonStringify(obj, replacer?, space?)
オブジェクト/配列を文字列化します。プリミティブには `null` を返します。JSON文字列を正規化します。

**カテゴリ:** 変換  
**パラメータ:**
- `obj` (T): 文字列化するオブジェクト
- `replacer` ((this: any, key: string, value: any) => any | undefined): 文字列化中に値を変換するオプションの関数
- `space` (string | number | undefined): 整形出力のためのオプションのインデント（スペース数または文字列）

**返り値:** `string | null`

**ロジック:**
- オブジェクト/配列: `JSON.stringify(obj, replacer, space)`
- 文字列: JSON5としてパースを試行し、フォーマット付きで再文字列化（正規化）
- プリミティブ: `null`

**例:**
```typescript
_.jsonStringify({a:1})                    // '{"a":1}'
_.jsonStringify([1,2,3])                  // '[1,2,3]'
_.jsonStringify('{a:1}')                  // '{"a":1}'（正規化）
_.jsonStringify('hello')                  // null
_.jsonStringify(42)                       // null
_.jsonStringify(null)                     // null

// フォーマット付き（整形出力）
_.jsonStringify({a:1, b:2}, null, 2)
// '{
//   "a": 1,
//   "b": 2
// }'

// replacer関数で値をフィルタ・変換
_.jsonStringify(
  {name: 'Alice', password: 'secret123', age: 30},
  (key, value) => key === 'password' ? undefined : value
)
// '{"name":"Alice","age":30}'

// replacerとフォーマットを組み合わせ
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

**ユースケース:**
- 安全なJSONシリアライゼーション
- `JSON.stringify('string')` → `'"string"'` 問題の回避
- 整形出力付き設定ファイル生成
- シリアライゼーション時のセンシティブフィールドのフィルタリング
- JSONエクスポート時の値の変換

---

## Promiseユーティリティ

### valueOr(value, elseValue)
値またはデフォルトを返します。関数とPromiseを自動的に検出・処理します。

**カテゴリ:** Promiseユーティリティ  
**パラメータ:**
- `value` (MaybeFunction<MaybePromise<T>>): 値またはサンク関数
- `elseValue` (E | (() => MaybePromise<E>)): デフォルト値またはサンク

**返り値:** `MaybePromise<T | E>`

**動作:**
1. `value` が関数の場合、実行される
2. 結果がPromiseの場合、awaitされる
3. 結果がnilまたは空の場合、`elseValue` が使用される
4. `elseValue` が関数の場合、実行される（遅延評価）

**例:**
```typescript
// シンプルなフォールバック
_.valueOr('value', 'default')                    // 'value'
_.valueOr(null, 'default')                       // 'default'
_.valueOr(undefined, 'default')                  // 'default'

// 遅延評価（値が存在する場合、関数は呼ばれない）
_.valueOr(config.timeout, () => expensiveCalculation())

// Promise対応
await _.valueOr(
  fetch('/api').then(r => r.json()),
  { default: true }
)

// キャッシュパターン
await _.valueOr(
  () => cache.get(key),
  () => api.fetch(key)
)

// 関数チェーン
await _.valueOr(
  () => localStorage.get('config'),
  () => api.getDefaultConfig()
)
```

**ユースケース:**
- キャッシュファーストのデータ読み込み
- デフォルト値付き設定のバリデーション
- 遅延フォールバック計算
- Promise基盤のエラー回復

---

### emptyOr(value, elseValue)
値が空の場合 `null` を返し、それ以外はコールバックを適用または値を返します。

**カテゴリ:** Promiseユーティリティ  
**パラメータ:**
- `value` (MaybeFunction<MaybePromise<T>>): 値またはサンク
- `elseValue` (E | ((val: T) => MaybePromise<E>)): コールバックまたはデフォルト

**返り値:** `MaybePromise<T | E | null>`

**動作:**
- 値がnil/空の場合 → `null` を返す
- `elseValue` が関数の場合 → 値を渡して実行
- それ以外 → `elseValue` を返す

**例:**
```typescript
_.emptyOr('value', v => v.toUpperCase())  // 'VALUE'
_.emptyOr(null, 'default')                // null
_.emptyOr('', v => v.trim())              // null
```

**ユースケース:**
- 条件付き変換
- null安全な操作
- データパイプラインのフィルタリング

---

### hasOr(value, paths, elseValue)
すべてのパスが存在することを確認します。存在しない場合はデフォルトを返します。深いパスとPromiseに対応。

**カテゴリ:** Promiseユーティリティ  
**パラメータ:**
- `value` (MaybeFunction<MaybePromise<T>>): オブジェクトまたはサンク
- `paths` (string | string[]): チェックするパス（lodashパス構文）
- `elseValue` (E | ((val: T | null | undefined) => MaybePromise<E>)): デフォルトまたはコールバック

**返り値:** `MaybePromise<T | E>`

**動作:**
1. 値を解決（関数/Promiseの場合）
2. `_.has()` を使用してすべてのパスが存在するかチェック
3. すべてのパスが存在する場合は値を返し、それ以外は `elseValue`

**例:**
```typescript
const obj = { profile: { name: 'John', age: 30 } }

// 単一パス
_.hasOr(obj, 'profile.name', null)       // obj
_.hasOr(obj, 'profile.missing', null)    // null

// 複数パス（すべて存在する必要がある）
_.hasOr(obj, ['profile.name', 'profile.age'], {})  // obj
_.hasOr(obj, ['profile.name', 'missing'], {})      // {}

// Promise対応
await _.hasOr(
  fetchUser(),
  ['id', 'profile.name'],
  null
)

// パスが欠落している場合のコールバック
await _.hasOr(
  api.getConfig(),
  ['apiKey', 'endpoint'],
  () => loadDefaultConfig()
)
```

**ユースケース:**
- APIレスポンスのバリデーション
- 必須フィールドのチェック
- 安全なプロパティアクセス
- 設定のバリデーション

---

### equalsOr(v1, v2, elseValue?)
2つの値を比較します。等しい場合は最初の値を返し、異なる場合はデフォルトを返します。`null` と `undefined` は等しいとみなされます。Promise対応。

**カテゴリ:** Promiseユーティリティ  
**パラメータ:**
- `v1` (T | (() => MaybePromise<T>)): 最初の値またはサンク
- `v2` (E | (() => MaybePromise<E>)): 2番目の値またはサンク
- `elseValue` (D): デフォルト値（オプション）

**返り値:** `MaybePromise<T | E | D>`

**特別な動作:**
- `null == undefined`（等しいとみなされる）
- 自動的なPromise検出と解決
- 関数パラメータの遅延評価

**例:**
```typescript
// シンプルな比較
_.equalsOr('a', 'a', 'default')          // 'a'
_.equalsOr('a', 'b', 'default')          // 'default'

// nil処理
_.equalsOr(null, undefined, 'default')   // null（等しい！）
_.equalsOr(null, 'value', 'default')     // 'default'

// Promise対応
await _.equalsOr(
  fetchStatus(),
  'success',
  'failed'
)

// ダイアログパターン（変更なしなら同期、変更ありなら非同期）
_.equalsOr(original, edited, showConfirmDialog)
  .then(closeDialog)

// 条件付き保存
await _.equalsOr(
  original,
  edited,
  () => confirmAndSave()  // 異なる場合のみ呼ばれる
)
```

**ユースケース:**
- 条件付き保存（変更なしならスキップ）
- フォールバック付きステータスチェック
- 確認ダイアログ
- 変更検出

---

## エラーハンドリング

### swallow(fn)
関数を実行し、エラーが発生した場合はundefinedを返します。同期・非同期どちらの関数にも対応。

**カテゴリ:** コア関数  
**パラメータ:**
- `fn` (() => T): 実行する関数

**返り値:** `T | undefined`（非同期関数の場合は `Promise<T | undefined>`）

**特徴:**
- try-catchが不要
- 同期・非同期両方の関数に対応
- エラー時はundefinedを返す（例外を投げない）
- Promiseのrejectもundefinedになる

**例:**
```typescript
// 同期関数
const result = _.swallow(() => riskyOperation())
// => 結果 または undefined

const data = _.swallow(() => deleteCache())
// => undefined（エラーは静かに処理される）

// 非同期関数
const user = await _.swallow(async () => await fetchUser(id))
// => userオブジェクト または undefined

const response = await _.swallow(() => fetch('/api/data'))
// => Response または undefined

// 安全なプロパティアクセス
const value = _.swallow(() => obj.deep.nested.property)
// => 値 または undefined（"Cannot read property" エラーなし）

// オプションのクリーンアップ処理
_.swallow(() => cache.clear())
_.swallow(() => ws.disconnect())
```

**ユースケース:**
- 失敗しても構わないオプション処理
- アプリをクラッシュさせたくないクリーンアップ処理
- 挙動が不確実なサードパーティライブラリの呼び出し
- グレースフルデグラデーション

---

### swallowMap(array, fn, compact?)
配列をマップし、エラーをundefinedとして扱います。compactがtrueの場合、undefined結果（エラー）を除外します。

**カテゴリ:** コア関数  
**パラメータ:**
- `array` (T[] | undefined | null): 処理する配列
- `fn` ((item: T, index: number) => U): 各要素に適用する関数
- `compact` (boolean = false): trueの場合、undefined結果（エラー）を除外

**返り値:** `U[]`（非同期関数の場合は `Promise<U[]>`）

**特徴:**
- 配列の存在チェック不要（null/undefinedを処理）
- 個別のエラーで全体の処理が止まらない
- compactモードでオプションのエラーフィルタリング
- 同期・非同期両方の関数に対応
- 非同期処理には内部でPromise.allを使用

**例:**
```typescript
// エラーをundefinedとして保持
const results = _.swallowMap([1, 2, 3], item => {
  if (item === 2) throw new Error('fail')
  return item * 2
})
// => [2, undefined, 6]

// エラーを除外（compact）
const validResults = _.swallowMap([1, 2, 3], item => {
  if (item === 2) throw new Error('fail')
  return item * 2
}, true)
// => [2, 6]

// 非同期処理
const data = await _.swallowMap(
  urls,
  async url => {
    const response = await fetch(url)
    return response.json()
  },
  true  // 成功したfetchのみ
)
// => 成功したレスポンスの配列のみ

// 一部失敗するアイテムの処理
const results = _.swallowMap(
  items,
  item => processComplexItem(item),
  true
)
// => 成功した処理結果のみ

// null/undefined配列の安全な処理
const items = _.swallowMap(maybeArray, item => process(item))
// => maybeArrayがnull/undefinedの場合は []

// エラー許容のファイル処理
const processed = await _.swallowMap(
  files,
  async file => await processFile(file),
  true
)
// => 成功したファイルのみ
```

**ユースケース:**
- 一部の失敗が許容されるバッチ処理
- データインポート/マイグレーション（無効なレコードをスキップ）
- 複数エンドポイントへのAPI呼び出し
- エラー許容のファイル処理
- 信頼できないソースからのJSON解析

**パターン: 成功と失敗を分ける**
```typescript
// すべてのアイテムを処理し、成功と失敗の両方を追跡
const results = _.swallowMap(items, item => processItem(item))
const successes = results.filter(r => r !== undefined)
const failureCount = results.length - successes.length

console.log(`処理完了: ${successes.length}, 失敗: ${failureCount}`)
```

---

## オブジェクトユーティリティ

### changes(source, current, keys, options?, finallyCallback?, notEmptyCallback?)
オブジェクト間の差分を返します。深いパスとコールバックに対応。データベース更新の追跡に便利です。

**カテゴリ:** オブジェクトユーティリティ  
**パラメータ:**
- `source` (T): 元のオブジェクト
- `current` (E): 更新されたオブジェクト
- `keys` (string[]): チェックするキー（`'profile.bio'` のような深いパスに対応）
- `options` (ChangesOptions): `{ keyExcludes?: boolean }`
- `finallyCallback` ((diff, res) => any | Promise<any>): 差分処理完了後に呼ばれる
- `notEmptyCallback` ((diff) => any | Promise<any>): 差分が空でない場合のみ呼ばれる

**返り値:** `Record<string, any>`

**モード:**
1. **インクルードモード**（デフォルト）: 指定されたキーのみチェック
2. **エクスクルードモード** (`keyExcludes: true`): 指定されたキー以外をすべてチェック（トップレベルのみ）

**深いパスのサポート:**
- `'profile.bio'` - ネストされたプロパティ
- `'settings.theme'` - 複数レベル
- `'profile.tags[1]'` - 配列インデックス（`{ profile: { tags: { 1: 'value' } } }` として返される）

**例:**
```typescript
const original = {
  name: 'John',
  email: 'john@example.com',
  profile: { bio: 'Hello', avatar: 'pic1.jpg' }
}

const updated = {
  name: 'John',
  email: 'newemail@example.com',
  profile: { bio: 'Updated bio', avatar: 'pic1.jpg' }
}

// インクルードモード - 指定されたキーのみ
_.changes(original, updated, ['name', 'email', 'profile.bio'])
// => { email: 'newemail@example.com', profile: { bio: 'Updated bio' } }

// エクスクルードモード - 指定されたキー以外すべて（トップレベルのみ）
_.changes(original, updated, ['password', 'apiKey'], { keyExcludes: true })
// => { name: 'John', email: 'newemail@example.com', profile: {...} }

// コールバック付き
_.changes(
  original,
  updated,
  ['name', 'email'],
  {},
  async (diff, res) => console.log('Finally:', diff),
  async (diff) => {
    await db.update(userId, diff)
    return true
  }
)

// 配列インデックスの変更
_.changes(
  { tags: ['a', 'b', 'c'] },
  { tags: ['a', 'x', 'c'] },
  ['tags[1]']
)
// => { tags: { 1: 'x' } }
```

**ユースケース:**
- データベース更新の最適化（変更されたフィールドのみ）
- 監査ログ
- フォームのダーティチェック
- APIリクエストペイロード

**重要な注意事項:**
- `keyExcludes` モードはトップレベルのキーでのみ動作
- `keyExcludes` モードで深いパス（`.` または `[` を含む）を使用すると警告が出る
- ネストされた除外には、明示的なパスを使用したインクルードモードを使用

---

## 配列ユーティリティ

### castArray(value)
値を配列に変換します。`null`/`undefined` は `[]` になります（lodashの `[null]` ではありません）。

**カテゴリ:** 配列ユーティリティ  
**パラメータ:**
- `value` (T | T[] | null | undefined): 変換する値

**返り値:** `T[]`

**動作:**
- 既に配列 → そのまま返す
- `null`/`undefined` → `[]`
- その他の値 → `[value]`

**例:**
```typescript
_.castArray(1)                // [1]
_.castArray([1, 2])           // [1, 2]
_.castArray(null)             // []（[null]ではない！）
_.castArray(undefined)        // []
_.castArray('string')         // ['string']
```

**ユースケース:**
- APIレスポンスの正規化
- `.map()`、`.filter()` 用の配列型の保証
- オプショナルパラメータのクリーンアップ

---

### arrayDepth(array)
配列のネスト深さを返します。非配列: 0、空配列: 1。

**カテゴリ:** 配列ユーティリティ  
**パラメータ:**
- `array` (unknown): チェックする配列

**返り値:** `number`

**ロジック:**
- 非配列 → `0`
- 空配列 `[]` → `1`
- 要素の最小深さを再帰的にチェック

**例:**
```typescript
_.arrayDepth('not array')     // 0
_.arrayDepth([])              // 1
_.arrayDepth([1, 2, 3])       // 1
_.arrayDepth([[1], [2]])      // 2
_.arrayDepth([[[1]]])         // 3
_.arrayDepth([[1, 2], [[3], [4, 5]]])  // 2（最小深さ）
```

**ユースケース:**
- GeoJSON座標のバリデーション
- ネストされた配列の処理
- データ構造の検証

---

### Array.prototype.notMap(predicate)
否定された述語の結果でmapします（boolean配列を返す）。

**カテゴリ:** 配列ユーティリティ  
**パラメータ:**
- `predicate` ((item: T) => boolean): テスト関数

**返り値:** `boolean[]`

**注意:** prototypeプラグイン（`ansuko/plugins/prototype`）が必要

**例:**
```typescript
import _ from 'ansuko'
import prototypePlugin from 'ansuko/plugins/prototype'

_.extend(prototypePlugin)

[1, 2, 3].notMap(n => n > 1)     // [true, false, false]
[1, 2, 3].notMap(n => n % 2)     // [false, true, false]
['a', '', 'b'].notMap(s => !!s)  // [false, true, false]
```

**ユースケース:**
- 逆の真偽値ロジック
- バリデーション結果配列
- フィルタの準備

---

### Array.prototype.notFilter(predicate)
否定された述語でフィルタします（一致しない項目）。

**カテゴリ:** 配列ユーティリティ  
**パラメータ:**
- `predicate` ((item: T) => boolean): テスト関数

**返り値:** `T[]`

**注意:** prototypeプラグイン（`ansuko/plugins/prototype`）が必要

**例:**
```typescript
[1, 2, 3].notFilter(n => n % 2 === 0)  // [1, 3]（奇数）
[1, 2, 3].notFilter(n => n > 2)        // [1, 2]
['a', '', 'b'].notFilter(s => s === '') // ['a', 'b']
```

**ユースケース:**
- 除外フィルタリング
- 不要な項目の削除
- 逆選択

---

## 文字列ユーティリティ

### haifun(text, replacement?, expandInterpretation?)
多様なハイフン/ダッシュ文字を単一の文字に正規化します。

**カテゴリ:** 文字列ユーティリティ  
**パラメータ:**
- `text` (string): 入力テキスト
- `replacement` (string = '‐'): ターゲットハイフン文字
- `expandInterpretation` (boolean = true): 拡張Unicodeハイフンを含める

**認識される文字:**
- ハイフンマイナス: `-` (U+002D)
- Enダッシュ: `–` (U+2013)
- Emダッシュ: `—` (U+2014)
- マイナス記号: `−` (U+2212)
- ハイフン: `‐` (U+2010)
- その他多数のUnicode変種

**例:**
```typescript
_.haifun('ABC—123−XYZ', '-')     // 'ABC-123-XYZ'
_.haifun('東京－大阪')           // '東京‐大阪'
_.haifun('test‐data', '-')       // 'test-data'
```

**ユースケース:**
- 住所の正規化
- SKU/商品コードのマッチング
- 郵便番号の比較
- データベース検索の最適化

---

## 日本語ユーティリティ (プラグイン: `ansuko/plugins/ja`)

日本語プラグインをロードしてこれらの関数にアクセス:

```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'

const extended = _.extend(jaPlugin)
```

### kanaToFull(str)
半角カナを全角カナに変換します。

**例:**
```typescript
extended.kanaToFull('ｶﾞｷﾞ')     // 'ガギ'
extended.kanaToFull('ｱｲｳ')      // 'アイウ'
```

---

### kanaToHalf(str)
全角カナを半角カナに変換します（濁点は別文字に分割されます）。

**例:**
```typescript
extended.kanaToHalf('ガギ')      // 'ｶﾞｷﾞ'
extended.kanaToHalf('アイウ')    // 'ｱｲｳ'
```

---

### kanaToHira(str)
カナをひらがなに変換します（半角は自動的に全角に変換されます）。

**例:**
```typescript
extended.kanaToHira('アイウ')    // 'あいう'
extended.kanaToHira('ｱｲｳ')      // 'あいう'（半角処理済み）
```

---

### hiraToKana(str)
ひらがなをカナに変換します。

**例:**
```typescript
extended.hiraToKana('あいう')    // 'アイウ'
```

---

### toFullWidth(value, withHaifun?)
半角文字を全角に変換します。オプションでハイフンの正規化も可能。

**パラメータ:**
- `value` (unknown): 入力値
- `withHaifun` (string): 指定した場合、ハイフンをこの文字に正規化

**例:**
```typescript
extended.toFullWidth('ABC-123', 'ー')  // 'ＡＢＣー１２３'
extended.toFullWidth('abc')            // 'ａｂｃ'
extended.toFullWidth('123')            // '１２３'
```

---

### toHalfWidth(value, withHaifun?)
全角文字を半角に変換します。オプションでハイフンの正規化も可能。

**パラメータ:**
- `value` (unknown): 入力値
- `withHaifun` (string): 指定した場合、ハイフンをこの文字に正規化

**例:**
```typescript
extended.toHalfWidth('ＡＢＣー１２３', '-')  // 'ABC-123'
extended.toHalfWidth('ａｂｃ')              // 'abc'
extended.toHalfWidth(' ｱｲｳ　123 ')         // ' ｱｲｳ 123 '
```

---

## Geoユーティリティ (プラグイン: `ansuko/plugins/geo`)

GeoプラグインをロードしてGeoJSON変換関数にアクセス:

```typescript
import _ from 'ansuko'
import geoPlugin from 'ansuko/plugins/geo'

const extended = _.extend(geoPlugin)
```

### toGeoJson(geo, type?, digit?)
自動検出付きの汎用GeoJSONコンバーター（高次元から順に試行）。

**パラメータ:**
- `geo` (any): 入力座標、オブジェクト、またはGeoJSON
- `type` (GeomType = GeomType.auto): ターゲットジオメトリタイプ
- `digit` (number): 丸める小数点以下桁数

**GeomType列挙型:**
- `GeomType.auto` - 自動検出（デフォルト）
- `GeomType.point`
- `GeomType.lineString`
- `GeomType.polygon`
- `GeomType.multiPoint`
- `GeomType.multiLineString`
- `GeomType.multiPolygon`

**例:**
```typescript
extended.toGeoJson([139.7, 35.6], GeomType.point)
// => { type: 'Point', coordinates: [139.7, 35.6] }

extended.toGeoJson([[139.7, 35.6], [139.8, 35.7]], GeomType.lineString)
// => { type: 'LineString', coordinates: [[139.7, 35.6], [139.8, 35.7]] }
```

---

### toPointGeoJson(geo, digit?)
座標またはオブジェクトをPoint GeoJSONに変換します。

**受け付ける形式:**
- 配列: `[lng, lat]`
- オブジェクト: `{ lat, lng }` または `{ latitude, longitude }`
- GeoJSON: Feature、FeatureCollection、Point geometry

**例:**
```typescript
extended.toPointGeoJson([139.7671, 35.6812])
// => { type: 'Point', coordinates: [139.7671, 35.6812] }

extended.toPointGeoJson({ lat: 35.6895, lng: 139.6917 })
// => { type: 'Point', coordinates: [139.6917, 35.6895] }

// 丸め処理付き
extended.toPointGeoJson([139.7671234, 35.6812345], 4)
// => { type: 'Point', coordinates: [139.7671, 35.6812] }
```

---

### toPolygonGeoJson(geo, digit?)
外周リングをPolygon GeoJSONに変換します（閉じたリングを検証）。

**要件:**
- 最初と最後の座標が同一である必要がある（閉じたリング）
- 最低4点（閉じる点を含む）

**例:**
```typescript
extended.toPolygonGeoJson([
  [139.70, 35.68],
  [139.78, 35.68],
  [139.78, 35.75],
  [139.70, 35.75],
  [139.70, 35.68]  // 閉じる必要がある！
])
// => { type: 'Polygon', coordinates: [[...]] }
```

---

### toLineStringGeoJson(geo, digit?)
座標をLineStringに変換します（自己交差をチェック）。

**検証:**
- 自己交差する線を拒否
- 最低2点

**例:**
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
複数の点をMultiPoint GeoJSONに変換します。

---

### toMultiPolygonGeoJson(geo, digit?)
複数のポリゴンをMultiPolygon GeoJSONに変換します（外周リングを検証）。

---

### toMultiLineStringGeoJson(geo, digit?)
複数の線をMultiLineString GeoJSONに変換します（各線の自己交差をチェック）。

---

### unionPolygon(geo, digit?)
複数のPolygon/MultiPolygonを単一のGeometryに結合します。

**返り値:** `Polygon | MultiPolygon | null`

**例:**
```typescript
const poly1 = [[139.7, 35.6], [139.8, 35.6], [139.8, 35.7], [139.7, 35.7], [139.7, 35.6]]
const poly2 = [[139.75, 35.65], [139.85, 35.65], [139.85, 35.75], [139.75, 35.75], [139.75, 35.65]]

const unified = extended.unionPolygon([poly1, poly2])
// => 結合されたポリゴンまたはマルチポリゴン
```

**ユースケース:**
- 行政境界の結合
- 重複ゾーンの結合
- 空間解析

---

### parseToTerraDraw(geo)
GeoJSONをTerra Draw互換のフィーチャーに変換します（自動生成されたUUID付き）。

---

### mZoomInterpolate(zoomValues, type?)
シンプルなオブジェクトマッピングからMapBoxのズーム補間式を作成します。
`{10: 1, 15: 5, 20: 10}` をMapBoxの補間配列形式に変換します。

**パラメータ:**
- `zoomValues` (Record<number, number>): ズームレベルと値のマッピングオブジェクト
- `type` (string = "linear"): 補間タイプ: "linear"、"exponential"、または "cubic-bezier"

**戻り値:** MapBox補間式配列

**例:**
```typescript
extended.mZoomInterpolate({ 10: 1, 15: 5, 20: 10 })
// => ["interpolate", ["linear"], ["zoom"], 10, 1, 15, 5, 20, 10]

extended.mZoomInterpolate({ 12: 0.5, 18: 2 }, "exponential")
// => ["interpolate", ["exponential"], ["zoom"], 12, 0.5, 18, 2]

// MapBox(互換)レイヤーで使用
map.addLayer({
  id: "buildings",
  type: "fill",
  paint: {
    "fill-opacity": extended.mZoomInterpolate({ 10: 0.3, 15: 0.8 })
  }
})
```

**なぜ使うのか？**
MapBox style specificationのネイティブ構文は冗長で読みにくい:
```typescript
// ❌ 読みにくい
["interpolate", ["linear"], ["zoom"], 10, 1, 15, 5, 20, 10]

// ✅ 明確で直感的
mZoomInterpolate({ 10: 1, 15: 5, 20: 10 })
```

---

### mProps(properties, excludeKeys?)
camelCaseプロパティをMapBox互換形式に変換します。
minzoom、maxzoom、tileSize、クラスタープロパティなどの特殊ケースを処理し、
visibilityのブール値を "visible"/"none" に変換します。ネストされたオブジェクトと配列を再帰的に処理します。

**パラメータ:**
- `properties` (Record<string, any>): camelCaseプロパティを持つオブジェクト
- `excludeKeys` (string[] = []): 変換から除外するキー（元のキーと値を保持）

**戻り値:** MapBox互換の変換されたプロパティオブジェクト

**例:**
```typescript
extended.mProps({
  fillColor: "#ff0000",
  fillOpacity: 0.5,
  sourceLayer: "buildings"
})
// => { "fill-color": "#ff0000", "fill-opacity": 0.5, "source-layer": "buildings" }

extended.mProps({ visibility: true })
// => { visibility: "visible" }

extended.mProps({ minZoom: 10, maxZoom: 20 })
// => { minzoom: 10, maxzoom: 20 }

// ネストされたオブジェクトも機能
extended.mProps({
  id: "buildings",
  type: "fill",
  sourceLayer: "buildings",
  paint: {
    fillColor: "#ff0000",
    fillOpacity: 0.5
  }
})
// => {
//   id: "buildings",
//   type: "fill",
//   "source-layer": "buildings",
//   paint: {
//     "fill-color": "#ff0000",
//     "fill-opacity": 0.5
//   }
// }
```

**特殊な変換:**
- `minZoom/maxZoom` → `minzoom/maxzoom` (小文字)
- `tileSize` → `tileSize` (保持)
- `clusterRadius/clusterMaxZoom/clusterMinPoints/clusterProperties` → camelCaseで保持
- `lineMetrics` → camelCaseで保持
- `sourceLayer` → `source-layer` (kebab-case)
- `visibility: true/false` → `visibility: "visible"/"none"`
- その他のプロパティ → kebab-case

**なぜ使うのか？**
MapBox style specificationはkebab-caseプロパティを要求しますが、JavaScriptでは扱いにくい:
```typescript
// ❌ 面倒 - キーを引用符で囲む必要があり、IDEの自動補完も効かない
{
  "fill-color": "#ff0000",
  "source-layer": "buildings"
}

// ✅ 自然なJavaScript
mProps({
  fillColor: "#ff0000",
  sourceLayer: "buildings"
})
```

---

## プラグインシステム

### extend(plugin)
ansukoに追加機能を拡張するプラグインを適用します。

**カテゴリ:** コア関数  
**パラメータ:**
- `plugin` ((ansuko: AnsukoType) => T): プラグイン関数

**返り値:** `AnsukoType & T`（拡張されたインスタンス）

**使用方法:**
```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'
import geoPlugin from 'ansuko/plugins/geo'

// 単一プラグイン
const withJa = _.extend(jaPlugin)
withJa.kanaToHira('アイウ')  // 'あいう'

// 複数プラグイン（チェーン）
const full = _
  .extend(jaPlugin)
  .extend(geoPlugin)

full.kanaToHira('アイウ')                    // 'あいう'
full.toPointGeoJson([139.7, 35.6])         // Pointジオメトリ
```

**利用可能なプラグイン:**
- `jaPlugin` - 日本語テキスト処理（`ansuko/plugins/ja`）
- `geoPlugin` - GeoJSONユーティリティ（`ansuko/plugins/geo`）
- `prototypePlugin` - Array prototypeの拡張（`ansuko/plugins/prototype`）

---

## オリジナルlodash関数

ansukoはいくつかのlodash関数を改善された動作で上書きしています。オリジナル版も引き続きアクセス可能です:

### isEmptyOrg
オリジナルのlodash `isEmpty`（数値/真偽値が空とみなされる）。

```typescript
_.isEmptyOrg(0)      // true（オリジナルlodashの動作）
_.isEmpty(0)         // false（ansukoの動作）
```

---

### toNumberOrg
オリジナルのlodash `toNumber`（全角/カンマ対応なしの基本変換）。

```typescript
_.toNumberOrg('1,234')    // NaN（オリジナルlodash）
_.toNumber('1,234')       // 1234（ansuko）
```

---

### castArrayOrg
オリジナルのlodash `castArray`（nullを配列に保持）。

```typescript
_.castArrayOrg(null)   // [null]（オリジナルlodash）
_.castArray(null)      // []（ansuko）
```

---

## すべてのlodash関数が利用可能

上記の拡張関数に加えて、**すべての標準lodash関数**が引き続き利用可能です:

- `_.size`, `_.isNil`, `_.debounce`, `_.throttle`
- `_.map`, `_.filter`, `_.reduce`, `_.forEach`
- `_.get`, `_.set`, `_.has`, `_.omit`, `_.pick`
- `_.keys`, `_.values`, `_.entries`
- `_.merge`, `_.cloneDeep`, `_.isEqual`
- `_.sortBy`, `_.groupBy`, `_.uniq`, `_.flatten`
- その他200以上のlodashユーティリティ

lodashと同様に単純に使用できます:

```typescript
import _ from 'ansuko'

_.map([1, 2, 3], n => n * 2)        // [2, 4, 6]
_.get({ a: { b: 1 } }, 'a.b')       // 1
_.debounce(fn, 100)                 // デバウンス関数
```