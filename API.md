# API Reference

## Core Functions
- **isEmpty(value)**  
  Checks emptiness; numbers/booleans are NOT empty.  
  @category Core Functions  
  @example `_.isEmpty(0) // false`

- **boolIf(value, defaultValue?)**  
  Safe boolean conversion; numbers use zero check, others fall back.  
  @category Core Functions  
  @example `_.boolIf('x', true) // true`

- **waited(func, frameCount?)**  
  Runs after N animation frames (`requestAnimationFrame`).  
  @category Core Functions  
  @example `_.waited(() => measure(), 1)`

- **extend(plugin)**  
  Apply a plugin and return the augmented instance.  
  @category Core Functions  
  @example `const _ja = _.extend(jaPlugin)`

## Type Guards
- **isValidStr(value)**  
  True only for non-empty strings.  
  @category Type Guards  
  @example `_.isValidStr('hello') // true`

## Conversion
- **toNumber(value)**  
  Full-width/comma aware; returns `null` on invalid.  
  @category Core Functions  
  @example `_.toNumber('1,234') // 1234`

- **parseJSON(str)**  
  Safe JSON/JSON5 parse; returns `null` on error.  
  @category Conversion  
  @example `_.parseJSON('{a:1}') // {a:1}`

- **jsonStringify(obj)**  
  Stringifies objects/arrays; strings/numbers yield `null`.  
  @category Conversion  
  @example `_.jsonStringify('{a:1}') // '{"a":1}'`

## Promise Utilities
- **valueOr(value, elseValue)**  
  Returns value or default; detects functions/Promises automatically.  
  @category Promise Utilities  
  @example `await _.valueOr(fetch('/api').then(r=>r.json()), {})`

- **equalsOr(v1, v2, elseValue?)**  
  If equal → value, else default. `null`/`undefined` are equal. Promise-aware.  
  @category Promise Utilities  
  @example `await _.equalsOr(fetchStatus(),'ok','ng')`

- **hasOr(value, paths, elseValue)**  
  Ensures all paths exist; otherwise returns default. Promise-aware.  
  @category Promise Utilities  
  @example `await _.hasOr(fetchUser(), ['profile.name','id'], null)`

## Object Utilities
- **changes(source, current, keys, options?, finallyCb?, notEmptyCb?)**  
  Diffs objects (deep paths supported). `keyExcludes` inverts top-level keys.  
  @category Object Utilities  
  @example `_.changes(o1,o2,['name','profile.bio'])`  
  @example `_.changes(orig,curr,['id'], { keyExcludes:true })`

## Array Utilities
- **castArray(value)**  
  Nil → `[]`; fixes lodash `[null]` behavior.  
  @category Array Utilities  
  @example `_.castArray(null) // []`

- **arrayDepth(array)**  
  Nesting depth; non-array `0`, empty array `1`.  
  @category Array Utilities  
  @example `_.arrayDepth([[[1]]]) // 3`

- **Array.prototype.notMap(predicate)**  
  Maps with negated predicate result (boolean array).  
  @category Array Utilities  
  @example `[1,2,3].notMap(n => n>1) // [true,false,false]`

- **Array.prototype.notFilter(predicate)**  
  Filters by negated predicate (items that do NOT match).  
  @category Array Utilities  
  @example `[1,2,3].notFilter(n => n%2===0) // [1,3]`

## String Utilities
- **haifun(text, replacement?, expandInterpretation?)**  
  Normalizes diverse hyphen/dash characters to one.  
  @category String Utilities  
  @example `_.haifun('ABC—123−XYZ','-') // 'ABC-123-XYZ'`

## Japanese Utilities (plugin: `./plugins/ja`)
- **kanaToFull(str)** — Half-width → full-width katakana.  
- **kanaToHalf(str)** — Full-width → half-width (dakuten may split).  
- **kanaToHira(str)** — Katakana → hiragana (half-width auto-expanded).  
- **hiraToKana(str)** — Hiragana → katakana.  
- **toFullWidth(value, withHaifun?)** — Half-width → full-width; optional hyphen normalize.  
- **toHalfWidth(value, withHaifun?)** — Full-width → half-width; optional hyphen normalize.  
- **haifun(...)** — (see String Utilities).  
@category Japanese Utilities  
@example `_.toFullWidth('ABC-123','ー') // 'ＡＢＣー１２３'`

## Geo Utilities (plugin: `./plugins/geo`)
- **toGeoJson(geo, type?, digit?)** — Convert input to specified Geometry (auto tries higher dims first).  
- **toPointGeoJson(geo, digit?)** — Point.  
- **toPolygonGeoJson(geo, digit?)** — Closed outer ring to Polygon.  
- **toLineStringGeoJson(geo, digit?)** — LineString (rejects self-intersection).  
- **toMultiPointGeoJson(geo, digit?)** — MultiPoint.  
- **toMultiPolygonGeoJson(geo, digit?)** — MultiPolygon (outer rings).  
- **toMultiLineStringGeoJson(geo, digit?)** — MultiLineString (self-intersection check).  
- **unionPolygon(geo, digit?)** — Union Polygon/MultiPolygon into one Geometry.  
@category Geo Utilities  
@example `toPointGeoJson({ lat:35.6812, lng:139.7671 })`

## String Normalization (Japanese-friendly)
- **haifun** — Use before comparing/searching addresses, SKUs, postal codes to remove dash variance.

---

Original lodash versions are available as `isEmptyOrg`, `toNumberOrg`, `castArrayOrg`.  
Apply plugins with `extend(jaPlugin)`, `extend(geoPlugin)`, `extend(prototypePlugin)`.