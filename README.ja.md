# @sera/ansuko

lodashを拡張し、実用的で直感的な動作を提供するモダンなJavaScript/TypeScriptユーティリティライブラリ。

[English](./README.md) | [日本語](./README.ja.md)


このライブラリは、lodashの直感的でない動作を修正し、JavaScriptでよくあるイライラを解消する強力なユーティリティを追加します。


## インストール

```bash
npm install github:sera/ansuko
```

または `package.json` に追加：

```json
{
  "dependencies": {
    "@sera/ansuko": "github:sera/ansuko#main"
  }
}
```

## 基本理念

ansukoはlodashとJavascriptでよくあるイライラを解消します：

- `isEmpty(0)` が `true` を返して不用意なバグにイラ💢
- `JSON.stringify("string")` が `"\"string\""` を返してきて💢
- `castArray(null)` が `[null]` を返してきて💢
- `JSON.parse()`にtry-catchを入れることでいちいちletを書かなきゃならないことに💢
- `JSON.parse()`にObjectやパース済みJSONを食わせると文字配列で返ってくることに💢
- `toNumber` がnilも0を返してくることに💢、それでいて文字はNaNを返してくることに💢💢
- 冗長な `a == b ? a : defaultValue` パターンを可能な限りやめたい(オレオレ関数)
- mb_convert_kanaぽいjsを探して自作して捨てて三千里

## 主な機能

### lodash関数の改善

- **`isEmpty`** - 空判定（数値とbooleanがtrueにならない安心）
- **`castArray`** - 配列変換、null/undefinedは空配列を返すように

### 値の処理

- **`valueOr`** - Promise/関数をサポートして有効な値の取得、nilならelseを返す
- **`equalsOr`** - Promise/関数をサポートして一致したら結果不一致ならelseを返す
- **`changes`** - オリジナルとのkeyベースのオブジェクト差分取得

### 型変換

- **`toNumber`** - 千区切りのカンマ対応の数値パース、無効値は0でなくnullを返す
- **`boolIf`** - 安全なboolean変換とelse返し

### JSON処理

- **`parseJSON`** - try-catch不要の安全なJSON/JSON5パース
- **`jsonStringify`** - オブジェクトのみをstringify、誤った文字列ラップを防止

### 日本語テキスト処理

- **`kanaToFull`**, **`kanaToHira`**, **`hiraToKana`** - カナ・ひらがな相互変換
- **`toHalfWidth`**, **`toFullWidth`**, **`haifun`** - 全角/半角変換とハイフン正規化
- **`isValidStr`** - 非空文字列の検証

### Geo ユーティリティ（プラグイン: `@sera/ansuko/plugins/geo`）

- **`toGeoJson`** / **`toPointGeoJson`** / **`toPolygonGeoJson`** など各種GeoJSON変換
- **`unionPolygon`** - 複数Polygon/MultiPolygonのユニオン

### Prototype ユーティリティ（プラグイン: `@sera/ansuko/plugins/prototype`）

- **`Array.prototype.notMap`** - predicateの否定結果でmap
- **`Array.prototype.notFilter`** - predicateを否定してfilter

## ドキュメント

詳細は以下を参照してください：

- **[API リファレンス](./API.ja.md)** - 実例付きの完全なAPIドキュメント
- **[使用ガイド](./Guide.ja.md)** - 実践的な例とパターン

## TypeScriptサポート

型定義を含む完全なTypeScriptサポート。すべての関数はジェネリクスサポート付きで完全に型付けされています。

## なぜlodashだけでは不十分なのか？

lodashにはいくつかの直感的でない動作があります：

1. `_.isEmpty(true)` が `true` を返す - booleanが「空」？
2. `_.isEmpty(1)` が `true` を返す - 数値の1が「空」？
3. `_.castArray(null)` が `[null]` を返す - なぜnullを配列に含める？
4. `JSON.stringify("hello")` が `'"hello"'` を返す - 余計な引用符が邪魔
5. try-catchブロックなしでは安全にJSONをパースできない
6. 非同期のフォールバックパターン付きの組み込み比較機能がない

ansukoはこれらの問題を修正しつつ、lodashの優れたユーティリティとの互換性を維持しています。

## 他のライブラリ試してみた？いいのあるけど？

無駄に学習コストが高いのと、isEmptyなどは同じ動作を継承してるので結局メリットよりデメリットが高いと感じました。

## valueOr, equalsOrって三項演算子や||、??で良くない？

良くない！きっと良くない！多分良くない！
例えば 
```javascript
_.equalsOr(original, edited, onConfirmAndSave).then(onClose)
/* originalとeditedを比較して差異があればconfirm and save、等しいかconfirmAndSaveが終わったらonClose */
```
とか
```javascript
const editedData = useMemo(() => _.changes(original, edited, ["id", "created_at"], {excludeKeys: true}), [original, edited]) // 変更データのmemo(idとcreated_atを無視)
...
const _onClose = useCallbacK(async () => 
  await _.valueOr(_.isEmpty(editedData), () => onConfirmAndSave()) // editedDataがあったら確認及び保存(Promise)
  onClose()
, [editedData, onClose, onConfirmAndSave])
```
みたいに！楽になる！

## 依存関係

- `lodash` - コアユーティリティ関数
- `json5` - コメントと末尾カンマをサポートする拡張JSONパース

## ソースからのビルド

```bash
npm install
npm run build
```

これにより、コンパイルされたJavaScriptと型定義が `dist` ディレクトリに生成されます。

## 開発

Seraによって開発され、ドキュメント作成、コードレビュー、壁打ちをClaude（Anthropic）で行いました。
AIなので、ところどころ「違う違う」って思う使い方や指南しているところもあって、いずれ直そうと思います。
valueOr、equalsOrはもっと賢い使い方がある気がしますが自分自身使いこなせてないです。

## ライセンス

MIT

## 作者

Sera