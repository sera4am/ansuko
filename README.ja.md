# ansuko

lodashを拡張した、実用的で直感的な動作を提供するモダンなJavaScript/TypeScriptユーティリティライブラリ。

[English](./README.md) | [日本語](./README.ja.md)

## インストール

```bash
npm install ansuko
```

または `package.json` に追加：

```json
{
  "dependencies": {
    "ansuko"
  }
}
```

## 基本思想

ansukoは直感的な動作でJavaScriptのよくある不満を解消します：

### lodashの癖を修正

```typescript
// ❌ lodash（直感的でない）
_.isEmpty(0)           // true  - 0は本当に「空」？
_.isEmpty(true)        // true  - trueは「空」？
_.castArray(null)      // [null] - なぜnullを残す？

// ✅ ansuko（直感的）
_.isEmpty(0)           // false - 数値は空ではない
_.isEmpty(true)        // false - 真偽値は空ではない
_.castArray(null)      // []    - クリーンな空配列
```

### 安全なJSON処理

```typescript
// ❌ 標準JSON（面倒）
JSON.stringify('hello')  // '"hello"'  - 余計な引用符！
JSON.parse(badJson)      // throws     - try-catchが必要

// ✅ ansuko（スムーズ）
_.jsonStringify('hello')     // null     - オブジェクトではない
_.jsonStringify({ a: 1 })    // '{"a":1}' - クリーン
_.parseJSON(badJson)         // null     - 例外なし
_.parseJSON('{ a: 1, }')     // {a:1}    - JSON5対応！
```

### Promise対応のフォールバック

```typescript
// ❌ 冗長なパターン
const data = await fetchData()
const result = data ? data : await fetchBackup()

// ✅ ansuko（簡潔）
const result = await _.valueOr(
  () => fetchData(),
  () => fetchBackup()
)
```

### スマートな比較

```typescript
// ❌ 冗長な三項演算子地獄
const value = a === b ? a : (a == null && b == null ? a : defaultValue)

// ✅ ansuko（読みやすい）
const value = _.equalsOr(a, b, defaultValue)  // null == undefined
```

## プラグインアーキテクチャ

ansukoは最小限のコア + プラグインアーキテクチャを採用し、バンドルサイズを小さく保ちます：

- **コア** (~20KB): lodashを改善する必須ユーティリティ
- **日本語プラグイン** (~5KB): 日本語テキスト処理が必要な場合のみ読み込み
- **Geoプラグイン** (~100KB、@turf/turf含む): GISアプリケーション用
- **Prototypeプラグイン** (~1KB): Array prototypeの拡張が必要な場合のみ


```typescript
// 最小バンドル - コアのみ
import _ from 'ansuko'  // ~20KB

// 必要に応じて日本語サポートを追加
import jaPlugin from 'ansuko/plugins/ja'
const extended = _.extend(jaPlugin)  // +5KB

// マッピングアプリ用にGIS機能を追加
import geoPlugin from 'ansuko/plugins/geo'
const full = extended.extend(geoPlugin)  // +100KB
```

## クイックスタート

### 基本的な使い方

```typescript
import _ from 'ansuko'

// 拡張されたlodash関数
_.isEmpty(0)           // false（lodashのようにtrueではない！）
_.isEmpty([])          // true
_.castArray(null)      // []（[null]ではない！）
_.toNumber('1,234.5')  // 1234.5

// Promise対応の値処理
const value = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id)
)

// 安全なJSONパース
const data = _.parseJSON('{ "a": 1, /* comment */ }')  // JSON5対応！

// データベース更新用のオブジェクト変更追跡
const diff = _.changes(
  original, 
  updated, 
  ['name', 'email', 'profile.bio']
)
```

### プラグインの使用

#### 日本語テキストプラグイン

```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'

const extended = _.extend(jaPlugin)

extended.kanaToFull('ｶﾞｷﾞ')              // 'ガギ'
extended.kanaToHira('アイウ')             // 'あいう'
extended.toHalfWidth('ＡＢＣー１２３', '-') // 'ABC-123'
extended.haifun('test‐data', '-')       // 'test-data'
```

#### Geoプラグイン

```typescript
import _ from 'ansuko'
import geoPlugin from 'ansuko/plugins/geo'

const extended = _.extend(geoPlugin)

// 様々な形式をGeoJSONに変換
extended.toPointGeoJson([139.7671, 35.6812])
// => { type: 'Point', coordinates: [139.7671, 35.6812] }

extended.toPointGeoJson({ lat: 35.6895, lng: 139.6917 })
// => { type: 'Point', coordinates: [139.6917, 35.6895] }

// 複数のポリゴンを結合
const unified = extended.unionPolygon([polygon1, polygon2])
```

#### Prototypeプラグイン

```typescript
import _ from 'ansuko'
import prototypePlugin from 'ansuko/plugins/prototype'

_.extend(prototypePlugin)

// Array.prototypeが拡張される
[1, 2, 3].notMap(n => n > 1)      // [true, false, false]
[1, 2, 3].notFilter(n => n % 2)   // [2]（偶数）
```

### プラグインのチェーン

```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'
import geoPlugin from 'ansuko/plugins/geo'

const extended = _
  .extend(jaPlugin)
  .extend(geoPlugin)

// 日本語とGeoユーティリティの両方が使える！
extended.kanaToHira('アイウ')
extended.toPointGeoJson([139.7, 35.6])
```

## 主な機能

### 拡張されたlodash関数

- **`isEmpty`** - 空かどうかチェック（数値と真偽値は空ではない）
- **`castArray`** - 配列に変換、null/undefinedは `[]` を返す
- すべてのlodash関数が利用可能: `size`, `isNil`, `debounce`, `isEqual`, `keys`, `values`, `has` など

### 値処理とフロー制御

- **`valueOr`** - Promise/関数対応で値またはデフォルトを取得
- **`emptyOr`** - 空ならnullを返し、それ以外はコールバックを適用または値を返す
- **`hasOr`** - パスの存在確認、なければデフォルトを返す（深いパス & Promise対応）
- **`equalsOr`** - Promise対応の比較とフォールバック、直感的なnil処理
- **`changes`** - DB更新用のオブジェクト差分追跡（`profile.tags[1]` のような深いパス & 除外モード対応）

### 型変換と検証

- **`toNumber`** - カンマ・全角対応の数値パース、無効時は `null`
- **`toBool`** - スマートな真偽値変換（"yes"/"no"/"true"/"false"/数値）、未検出時の動作を設定可能
- **`boolIf`** - フォールバック付き安全な真偽値変換
- **`isValidStr`** - 非空文字列検証

### JSON処理

- **`parseJSON`** - try-catch不要の安全なJSON/JSON5パース（コメント & 末尾カンマ対応）
- **`jsonStringify`** - 有効なオブジェクトのみを文字列化、文字列のラップを防止

### 配列ユーティリティ

- **`arrayDepth`** - 配列のネスト深さを返す（非配列: 0、空配列: 1）
- **`castArray`** - 配列に変換、nilは `[]` になる（`[null]` にならない）

### 日本語テキスト（プラグイン: `ansuko/plugins/ja`）

- **`kanaToFull`** - 半角カナ → 全角カナ（例: `ｶﾞｷﾞ` → `ガギ`）
- **`kanaToHalf`** - 全角 → 半角カナ（濁点分割: `ガギ` → `ｶﾞｷﾞ`）
- **`kanaToHira`** - カナ → ひらがな（半角は自動的に全角化）
- **`hiraToKana`** - ひらがな → カナ
- **`toHalfWidth`** - 全角 → 半角、オプションでハイフン正規化
- **`toFullWidth`** - 半角 → 全角、オプションでハイフン正規化
- **`haifun`** - 様々なハイフンを単一文字に正規化

### Geoユーティリティ（プラグイン: `ansuko/plugins/geo`）

- **`toGeoJson`** - 自動検出付きの汎用GeoJSONコンバーター（高次元から順に試行）
- **`toPointGeoJson`** - 座標/オブジェクトをPoint GeoJSONに変換
- **`toPolygonGeoJson`** - 外周リングをPolygonに変換（閉じたリングを検証）
- **`toLineStringGeoJson`** - 座標をLineStringに変換（自己交差をチェック）
- **`toMultiPointGeoJson`** - 複数の点をMultiPointに変換
- **`toMultiPolygonGeoJson`** - 複数のポリゴンをMultiPolygonに変換
- **`toMultiLineStringGeoJson`** - 複数の線をMultiLineStringに変換
- **`unionPolygon`** - 複数のPolygon/MultiPolygonを単一のジオメトリに結合
- **`parseToTerraDraw`** - GeoJSONをTerra Draw互換のフィーチャーに変換

### Prototype拡張（プラグイン: `ansuko/plugins/prototype`）

- **`Array.prototype.notMap`** - 否定された述語でmap → boolean配列
- **`Array.prototype.notFilter`** - 否定された述語でfilter（一致しない項目）

### タイミングユーティリティ

- **`waited`** - N個のアニメーションフレーム後に実行を遅延（React/DOMには `setTimeout` より良い）

## ドキュメント

詳細情報については、以下を参照してください：

- **[APIリファレンス](./API.md)** - 例付きの完全なAPIドキュメント
- **[使用ガイド](./Guide.md)** - 実際の使用例とパターン

## TypeScriptサポート

型定義を含む完全なTypeScriptサポート。すべての関数はジェネリック対応で完全に型付けされています。

## なぜlodashだけでは不十分なのか？

lodashは優れていますが、[コミュニティで批判されている](https://github.com/lodash/lodash/issues)いくつかの癖があります：

### 修正された動作

1. **`_.isEmpty(true)` が `true` を返す** - 真偽値は本当に「空」？
2. **`_.isEmpty(1)` が `true` を返す** - 数値1は「空」？
3. **`_.castArray(null)` が `[null]` を返す** - なぜnullを配列に含める？

### lodashにない追加ユーティリティ

4. **安全なJSONパースがない** - 常にtry-catchブロックが必要
5. **フォールバック付き組み込み比較がない** - 冗長な三項演算子パターンがいたるところに
6. **Promise対応の値解決がない** - 手動のPromise処理が面倒
7. **オブジェクト差分追跡がない** - DB更新に外部ライブラリが必要
8. **`JSON.stringify("hello")` が引用符を追加** - `'"hello"'` という引用符が厄介

### 実際の使用例

```typescript
// lodashでの一般的なパターン（冗長でエラーが起きやすい）
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

// ansukoでの同じロジック（簡潔で安全）
const data = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id),
  defaultValue
)
```

ansukoは、これらの問題を修正しながら、モダンなJavaScript開発のための強力なユーティリティを追加し、lodashとの **100%互換性** を維持しています。

## 依存関係

- **`lodash`** - コアユーティリティ関数
- **`json5`** - コメントと末尾カンマ対応の拡張JSONパース
- **`@turf/turf`** - 地理空間解析（geoプラグインで使用）

## ソースからのビルド

```bash
npm install
npm run build
```

これにより、`dist` ディレクトリにコンパイルされたJavaScriptと型定義が生成されます。

## 開発

Seraによって開発され、ドキュメント、コードレビュー、技術的な議論でClaude（Anthropic）の支援を受けました。

## ライセンス

MIT

## 作者

世来 直人
