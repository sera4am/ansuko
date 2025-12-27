# API リファレンス

## Core Functions
- **isEmpty(value)**  
  数値/booleanは空としない直感的な空判定。  
  @category Core Functions  
  @example `_.isEmpty(0) // false`
- **boolIf(value, defaultValue?)**  
  真偽値へ安全に変換。数値は0判定、それ以外はデフォルト。  
  @category Core Functions  
  @example `_.boolIf('x', true) // true`
- **waited(func, frameCount?)**  
  requestAnimationFrameでNフレーム後に実行。  
  @category Core Functions  
  @example `_.waited(() => measure(), 1)`
- **extend(plugin)**  
  プラグインを適用して拡張インスタンスを返す。  
  @category Core Functions  
  @example `const _ja = _.extend(jaPlugin)`

## Type Guards
- **isValidStr(value)**  
  非空文字列のみtrue。  
  @category Type Guards  
  @example `_.isValidStr('hello') // true`

## Conversion
- **toNumber(value)**  
  全角/カンマ対応の数値化。無効はnull。  
  @category Core Functions  
  @example `_.toNumber('1,234') // 1234`
- **parseJSON(str)**  
  JSON/JSON5を安全にパース（失敗時null）。  
  @category Conversion  
  @example `_.parseJSON('{a:1}') // {a:1}`
- **jsonStringify(obj)**  
  オブジェクト/配列のみstringify、文字列/数値はnull。  
  @category Conversion  
  @example `_.jsonStringify('{a:1}') // '{"a":1}'`

## Promise Utilities
- **valueOr(value, elseValue)**  
  nil/空ならデフォルト。関数・Promise自動判定。  
  @category Promise Utilities  
  @example `await _.valueOr(fetch('/api').then(r=>r.json()), {})`
- **equalsOr(v1, v2, elseValue?)**  
  等しければ値、異なればデフォルト。nil同士は等価。Promise対応。  
  @category Promise Utilities  
  @example `await _.equalsOr(fetchStatus(),'ok','ng')`
- **hasOr(value, paths, elseValue)**  
  全パス存在で値、なければデフォルト。Promise対応。  
  @category Promise Utilities  
  @example `await _.hasOr(fetchUser(), ['profile.name','id'], null)`

## Object Utilities
- **changes(source, current, keys, options?, finallyCb?, notEmptyCb?)**  
  差分取得（ディープパス可、keyExcludesはトップレベル除外）。  
  @category Object Utilities  
  @example `_.changes(o1,o2,['name','profile.bio'])`  
  @example `_.changes(orig,curr,['id'], { keyExcludes:true })`

## Array Utilities
- **castArray(value)**  
  nil→[]（lodashの[null]問題解消）。  
  @category Array Utilities  
  @example `_.castArray(null) // []`
- **arrayDepth(array)**  
  配列のネスト深さ。非配列0、空配列1。  
  @category Array Utilities  
  @example `_.arrayDepth([[[1]]]) // 3`
- **Array.prototype.notMap(predicate)**  
  predicateの否定結果をboolean配列で返す。  
  @category Array Utilities  
  @example `[1,2,3].notMap(n=>n>1) // [true,false,false]`
- **Array.prototype.notFilter(predicate)**  
  predicateを否定してfilter。  
  @category Array Utilities  
  @example `[1,2,3].notFilter(n=>n%2===0) // [1,3]`

## String Utilities
- **haifun(text, replacement?, expandInterpretation?)**  
  多様なハイフン/ダッシュを1文字に正規化。  
  @category String Utilities  
  @example `_.haifun('ABC—123−XYZ','-') // 'ABC-123-XYZ'`

## Japanese Utilities（plugin: `./plugins/ja`）
- **kanaToFull(str)** — 半角カナ→全角カナ  
- **kanaToHalf(str)** — 全角カナ→半角カナ（濁点分割の可能性）  
- **kanaToHira(str)** — カナ→ひらがな（半角は自動全角化）  
- **hiraToKana(str)** — ひらがな→カナ  
- **toFullWidth(value, withHaifun?)** — 半角→全角、ハイフン統一可  
- **toHalfWidth(value, withHaifun?)** — 全角→半角、ハイフン統一可  
- **haifun(...)** — 上記正規化関数  
@category Japanese Utilities  
@example `_.toFullWidth('ABC-123','ー') // 'ＡＢＣー１２３'`

## Geo Utilities（plugin: `./plugins/geo`）
- **toGeoJson(geo, type?, digit?)** — 入力を指定Geometryに変換（autoは高次元優先）  
- **toPointGeoJson(geo, digit?)** — Point  
- **toPolygonGeoJson(geo, digit?)** — 閉じた外周リングをPolygonに  
- **toLineStringGeoJson(geo, digit?)** — LineString（自己交差を拒否）  
- **toMultiPointGeoJson(geo, digit?)** — MultiPoint  
- **toMultiPolygonGeoJson(geo, digit?)** — 複数ポリゴンをMultiPolygonに  
- **toMultiLineStringGeoJson(geo, digit?)** — 複数線分をMultiLineStringに（自己交差チェック）  
- **unionPolygon(geo, digit?)** — Polygon/MultiPolygonをユニオン  
@category Geo Utilities  
@example `toPointGeoJson({ lat:35.6812, lng:139.7671 })`

## String Normalization（日本語向け）
- **haifun** — 住所・SKU・郵便番号などのダッシュ表記揺れを比較/検索前に正規化。

---

lodashオリジナルは `isEmptyOrg`, `toNumberOrg`, `castArrayOrg` で利用可能。  
プラグインは `extend(jaPlugin)`, `extend(geoPlugin)`, `extend(prototypePlugin)` で適用してください。