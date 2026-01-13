# API Reference

Complete API documentation for ansuko utility library.

[English](./API.md) | [日本語](./API.ja.md) | [简体中文](./API.zh.md)


## Table of Contents

- [Core Functions](#core-functions)
- [Type Guards & Validation](#type-guards--validation)
- [Type Conversion](#type-conversion)
- [Promise Utilities](#promise-utilities)
- [Object Utilities](#object-utilities)
- [Array Utilities](#array-utilities)
- [String Utilities](#string-utilities)
- [Japanese Utilities](#japanese-utilities-plugin-pluginsja)
- [Geo Utilities](#geo-utilities-plugin-pluginsgeo)
- [Plugin System](#plugin-system)
- [Original lodash Functions](#original-lodash-functions)

---

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

## Type Guards & Validation

### isValidStr(value)
True only for non-empty strings. Returns `false` for null, undefined, empty string, or non-string values.

**Category:** Type Guards  
**Returns:** `boolean`

**Examples:**
```typescript
_.isValidStr('hello')     // true
_.isValidStr('')          // false
_.isValidStr(null)        // false
_.isValidStr(undefined)   // false
_.isValidStr(0)           // false
_.isValidStr([])          // false
```

**Use Cases:**
- Form validation
- API parameter checking
- Safe string operations

---

## Type Conversion

### toNumber(value)
Converts values to numbers with full-width and comma support. Returns `null` for invalid inputs.

**Category:** Core Functions  
**Parameters:**
- `value` (unknown): Value to convert

**Returns:** `number | null`

**Features:**
- Handles full-width numbers: `'１２３'` → `123`
- Removes commas: `'1,234.5'` → `1234.5`
- Returns `null` for invalid inputs (not `NaN`)

**Examples:**
```typescript
_.toNumber('1,234')           // 1234
_.toNumber('１２３')          // 123
_.toNumber('1,234.5')         // 1234.5
_.toNumber('abc')             // null
_.toNumber(null)              // null
_.toNumber(42)                // 42
```

**Use Cases:**
- Parsing user input (forms, CSV imports)
- Handling Japanese text with full-width numbers
- Safe numeric conversions without exceptions

---

### toBool(value, undetected?)
Smart boolean conversion that handles strings, numbers, and various boolean representations.

**Category:** Core Functions  
**Parameters:**
- `value` (unknown): Value to convert
- `undetected` (boolean | null = null): Return value when conversion is ambiguous

**Returns:** `boolean | null | Promise<boolean | null>`

**Recognized Values:**
- **Truthy strings:** `"true"`, `"t"`, `"y"`, `"yes"`, `"ok"` (case-insensitive)
- **Falsy strings:** `"false"`, `"f"`, `"n"`, `"no"`, `"ng"` (case-insensitive)
- **Numbers:** `0` is false, any other number is true
- **Booleans:** Return as-is
- **Functions:** Automatically invoked (Promise-aware)

**Examples:**
```typescript
_.toBool(1)                   // true
_.toBool(0)                   // false
_.toBool('yes')               // true
_.toBool('no')                // false
_.toBool('true')              // true
_.toBool('unknown')           // null
_.toBool('unknown', false)    // false (custom default)
_.toBool(null)                // false
```

**Use Cases:**
- Form checkbox/toggle parsing
- Environment variable parsing
- API response normalization

---

### boolIf(value, defaultValue = false)
Safe boolean conversion with fallback. Only converts actual booleans and numbers.

**Category:** Core Functions  
**Parameters:**
- `value` (unknown): Value to check
- `defaultValue` (boolean = false): Fallback value

**Returns:** `boolean`

**Logic:**
- If boolean: returns the boolean
- If number: returns `!!value` (zero check)
- Otherwise: returns `defaultValue`

**Examples:**
```typescript
_.boolIf(true)                // true
_.boolIf(1)                   // true
_.boolIf(0)                   // false
_.boolIf('string', true)      // true (default)
_.boolIf(null, false)         // false (default)
```

**Use Cases:**
- Type-safe boolean coercion
- Optional flag handling
- Avoiding unexpected truthy/falsy conversions

---

### parseJSON(str)
Safe JSON/JSON5 parsing without try-catch. Returns `null` on error.

**Category:** Conversion  
**Parameters:**
- `str` (string | object): JSON string to parse

**Returns:** `T | null`

**Features:**
- Uses JSON5 parser (supports comments, trailing commas, unquoted keys)
- No exceptions thrown
- Already-parsed objects return as-is

**Examples:**
```typescript
_.parseJSON('{"a":1}')                    // {a:1}
_.parseJSON('{a:1}')                      // {a:1} (JSON5!)
_.parseJSON('{ "a": 1, /* comment */ }')  // {a:1}
_.parseJSON('{ "a": 1, }')                // {a:1} (trailing comma)
_.parseJSON('invalid')                    // null
_.parseJSON({a:1})                        // {a:1} (pass-through)
```

**Use Cases:**
- Loading config files
- Parsing API responses
- Handling user-provided JSON

---

### jsonStringify(obj, replacer?, space?)
Stringifies objects/arrays; returns `null` for primitives. Normalizes JSON strings.

**Category:** Conversion  
**Parameters:**
- `obj` (T): Object to stringify
- `replacer` ((this: any, key: string, value: any) => any | undefined): Optional function to transform values during stringification
- `space` (string | number | undefined): Optional indentation for pretty-printing (number of spaces or string)

**Returns:** `string | null`

**Logic:**
- Objects/Arrays: `JSON.stringify(obj, replacer, space)`
- Strings: Attempt to parse as JSON5, then re-stringify with formatting (normalization)
- Primitives: `null`

**Examples:**
```typescript
_.jsonStringify({a:1})                    // '{"a":1}'
_.jsonStringify([1,2,3])                  // '[1,2,3]'
_.jsonStringify('{a:1}')                  // '{"a":1}' (normalized)
_.jsonStringify('hello')                  // null
_.jsonStringify(42)                       // null
_.jsonStringify(null)                     // null

// With formatting (pretty-print)
_.jsonStringify({a:1, b:2}, null, 2)
// '{
//   "a": 1,
//   "b": 2
// }'

// With replacer function (filter/transform values)
_.jsonStringify(
  {name: 'Alice', password: 'secret123', age: 30},
  (key, value) => key === 'password' ? undefined : value
)
// '{"name":"Alice","age":30}'

// Combine replacer and formatting
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

**Use Cases:**
- Safe JSON serialization
- Avoiding `JSON.stringify('string')` → `'"string"'` issue
- Config file generation with pretty-printing
- Filtering sensitive fields during serialization
- Transforming values during JSON export

---

## Promise Utilities

### valueOr(value, elseValue)
Returns value or default; automatically detects and handles functions and Promises.

**Category:** Promise Utilities  
**Parameters:**
- `value` (MaybeFunction<MaybePromise<T>>): Value or thunk function
- `elseValue` (E | (() => MaybePromise<E>)): Default value or thunk

**Returns:** `MaybePromise<T | E>`

**Behavior:**
1. If `value` is a function, it's invoked
2. If result is a Promise, it's awaited
3. If result is nil or empty, `elseValue` is used
4. If `elseValue` is a function, it's invoked (lazy evaluation)

**Examples:**
```typescript
// Simple fallback
_.valueOr('value', 'default')                    // 'value'
_.valueOr(null, 'default')                       // 'default'
_.valueOr(undefined, 'default')                  // 'default'

// Lazy evaluation (function not called if value exists)
_.valueOr(config.timeout, () => expensiveCalculation())

// Promise support
await _.valueOr(
  fetch('/api').then(r => r.json()),
  { default: true }
)

// Cache pattern
await _.valueOr(
  () => cache.get(key),
  () => api.fetch(key)
)

// Function chaining
await _.valueOr(
  () => localStorage.get('config'),
  () => api.getDefaultConfig()
)
```

**Use Cases:**
- Cache-first data loading
- Config validation with defaults
- Lazy fallback computation
- Promise-based error recovery

---

### emptyOr(value, elseValue)
Returns `null` if value is empty, otherwise applies callback or returns value.

**Category:** Promise Utilities  
**Parameters:**
- `value` (MaybeFunction<MaybePromise<T>>): Value or thunk
- `elseValue` (E | ((val: T) => MaybePromise<E>)): Callback or default

**Returns:** `MaybePromise<T | E | null>`

**Behavior:**
- If value is nil/empty → returns `null`
- If `elseValue` is function → invokes with value
- Otherwise → returns `elseValue`

**Examples:**
```typescript
_.emptyOr('value', v => v.toUpperCase())  // 'VALUE'
_.emptyOr(null, 'default')                // null
_.emptyOr('', v => v.trim())              // null
```

**Use Cases:**
- Conditional transformations
- Null-safe operations
- Data pipeline filtering

---

### hasOr(value, paths, elseValue)
Ensures all paths exist; otherwise returns default. Supports deep paths and Promises.

**Category:** Promise Utilities  
**Parameters:**
- `value` (MaybeFunction<MaybePromise<T>>): Object or thunk
- `paths` (string | string[]): Path(s) to check (lodash path syntax)
- `elseValue` (E | ((val: T | null | undefined) => MaybePromise<E>)): Default or callback

**Returns:** `MaybePromise<T | E>`

**Behavior:**
1. Resolves value (if function/Promise)
2. Checks if all paths exist using `_.has()`
3. Returns value if all paths exist, else `elseValue`

**Examples:**
```typescript
const obj = { profile: { name: 'John', age: 30 } }

// Single path
_.hasOr(obj, 'profile.name', null)       // obj
_.hasOr(obj, 'profile.missing', null)    // null

// Multiple paths (all must exist)
_.hasOr(obj, ['profile.name', 'profile.age'], {})  // obj
_.hasOr(obj, ['profile.name', 'missing'], {})      // {}

// Promise support
await _.hasOr(
  fetchUser(),
  ['id', 'profile.name'],
  null
)

// Callback for missing paths
await _.hasOr(
  api.getConfig(),
  ['apiKey', 'endpoint'],
  () => loadDefaultConfig()
)
```

**Use Cases:**
- API response validation
- Required field checking
- Safe property access
- Config validation

---

### equalsOr(v1, v2, elseValue?)
Compares two values; if equal returns first value, else returns default. `null` and `undefined` are considered equal. Promise-aware.

**Category:** Promise Utilities  
**Parameters:**
- `v1` (T | (() => MaybePromise<T>)): First value or thunk
- `v2` (E | (() => MaybePromise<E>)): Second value or thunk
- `elseValue` (D): Default value (optional)

**Returns:** `MaybePromise<T | E | D>`

**Special Behavior:**
- `null == undefined` (treated as equal)
- Automatic Promise detection and resolution
- Lazy evaluation for function parameters

**Examples:**
```typescript
// Simple comparison
_.equalsOr('a', 'a', 'default')          // 'a'
_.equalsOr('a', 'b', 'default')          // 'default'

// Nil handling
_.equalsOr(null, undefined, 'default')   // null (they're equal!)
_.equalsOr(null, 'value', 'default')     // 'default'

// Promise support
await _.equalsOr(
  fetchStatus(),
  'success',
  'failed'
)

// Dialog pattern (sync if unchanged, async if changed)
_.equalsOr(original, edited, showConfirmDialog)
  .then(closeDialog)

// Conditional save
await _.equalsOr(
  original,
  edited,
  () => confirmAndSave()  // Only called if different
)
```

**Use Cases:**
- Conditional saves (skip if unchanged)
- Status checking with fallback
- Confirmation dialogs
- Change detection

---

## Object Utilities

### changes(source, current, keys, options?, finallyCallback?, notEmptyCallback?)
Returns diff between objects; supports deep paths and callbacks. Useful for tracking database updates.

**Category:** Object Utilities  
**Parameters:**
- `source` (T): Original object
- `current` (E): Updated object
- `keys` (string[]): Keys to check (supports deep paths like `'profile.bio'`)
- `options` (ChangesOptions): `{ keyExcludes?: boolean }`
- `finallyCallback` ((diff, res) => any | Promise<any>): Called after diff is complete
- `notEmptyCallback` ((diff) => any | Promise<any>): Called only if diff is non-empty

**Returns:** `Record<string, any>`

**Modes:**
1. **Include mode** (default): Only check specified keys
2. **Exclude mode** (`keyExcludes: true`): Check all keys EXCEPT specified (top-level only)

**Deep Path Support:**
- `'profile.bio'` - nested property
- `'settings.theme'` - multiple levels
- `'profile.tags[1]'` - array index (returns as `{ profile: { tags: { 1: 'value' } } }`)

**Examples:**
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

// Include mode - only specified keys
_.changes(original, updated, ['name', 'email', 'profile.bio'])
// => { email: 'newemail@example.com', profile: { bio: 'Updated bio' } }

// Exclude mode - all except specified (top-level only)
_.changes(original, updated, ['password', 'apiKey'], { keyExcludes: true })
// => { name: 'John', email: 'newemail@example.com', profile: {...} }

// With callbacks
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

// Array index changes
_.changes(
  { tags: ['a', 'b', 'c'] },
  { tags: ['a', 'x', 'c'] },
  ['tags[1]']
)
// => { tags: { 1: 'x' } }
```

**Use Cases:**
- Database update optimization (only changed fields)
- Audit logging
- Form dirty checking
- API request payloads

**Important Notes:**
- `keyExcludes` mode only works with top-level keys
- Deep paths (with `.` or `[`) in `keyExcludes` mode will trigger a warning
- For nested exclusions, use include mode with explicit paths

---

## Array Utilities

### castArray(value)
Converts value to array. `null`/`undefined` becomes `[]` (not `[null]` like lodash).

**Category:** Array Utilities  
**Parameters:**
- `value` (T | T[] | null | undefined): Value to convert

**Returns:** `T[]`

**Behavior:**
- Already an array → return as-is
- `null`/`undefined` → `[]`
- Any other value → `[value]`

**Examples:**
```typescript
_.castArray(1)                // [1]
_.castArray([1, 2])           // [1, 2]
_.castArray(null)             // [] (not [null]!)
_.castArray(undefined)        // []
_.castArray('string')         // ['string']
```

**Use Cases:**
- Normalizing API responses
- Ensuring array type for `.map()`, `.filter()`
- Cleaning up optional parameters

---

### arrayDepth(array)
Returns nesting depth of arrays. Non-array: 0, empty array: 1.

**Category:** Array Utilities  
**Parameters:**
- `array` (unknown): Array to check

**Returns:** `number`

**Logic:**
- Non-array → `0`
- Empty array `[]` → `1`
- Recursively checks minimum depth of elements

**Examples:**
```typescript
_.arrayDepth('not array')     // 0
_.arrayDepth([])              // 1
_.arrayDepth([1, 2, 3])       // 1
_.arrayDepth([[1], [2]])      // 2
_.arrayDepth([[[1]]])         // 3
_.arrayDepth([[1, 2], [[3], [4, 5]]])  // 2 (minimum depth)
```

**Use Cases:**
- GeoJSON coordinate validation
- Nested array processing
- Data structure verification

---

### Array.prototype.notMap(predicate)
Maps with negated predicate result (returns boolean array).

**Category:** Array Utilities  
**Parameters:**
- `predicate` ((item: T) => boolean): Test function

**Returns:** `boolean[]`

**Note:** Requires prototype plugin (`ansuko/plugins/prototype`)

**Examples:**
```typescript
import _ from 'ansuko'
import prototypePlugin from 'ansuko/plugins/prototype'

_.extend(prototypePlugin)

[1, 2, 3].notMap(n => n > 1)     // [true, false, false]
[1, 2, 3].notMap(n => n % 2)     // [false, true, false]
['a', '', 'b'].notMap(s => !!s)  // [false, true, false]
```

**Use Cases:**
- Inverse boolean logic
- Validation result arrays
- Filter preparation

---

### Array.prototype.notFilter(predicate)
Filters by negated predicate (items that do NOT match).

**Category:** Array Utilities  
**Parameters:**
- `predicate` ((item: T) => boolean): Test function

**Returns:** `T[]`

**Note:** Requires prototype plugin (`ansuko/plugins/prototype`)

**Examples:**
```typescript
[1, 2, 3].notFilter(n => n % 2 === 0)  // [1, 3] (odd numbers)
[1, 2, 3].notFilter(n => n > 2)        // [1, 2]
['a', '', 'b'].notFilter(s => s === '') // ['a', 'b']
```

**Use Cases:**
- Exclusion filtering
- Removing unwanted items
- Inverse selection

---

## String Utilities

### haifun(text, replacement?, expandInterpretation?)
Normalizes diverse hyphen/dash characters to a single character.

**Category:** String Utilities  
**Parameters:**
- `text` (string): Input text
- `replacement` (string = '‐'): Target hyphen character
- `expandInterpretation` (boolean = true): Include extended Unicode hyphens

**Recognized Characters:**
- Hyphen-minus: `-` (U+002D)
- En dash: `–` (U+2013)
- Em dash: `—` (U+2014)
- Minus sign: `−` (U+2212)
- Hyphen: `‐` (U+2010)
- And many more Unicode variants

**Examples:**
```typescript
_.haifun('ABC—123−XYZ', '-')     // 'ABC-123-XYZ'
_.haifun('東京－大阪')           // '東京‐大阪'
_.haifun('test‐data', '-')       // 'test-data'
```

**Use Cases:**
- Address normalization
- SKU/product code matching
- Postal code comparison
- Database search optimization

---

## Japanese Utilities (plugin: `ansuko/plugins/ja`)

Load the Japanese plugin to access these functions:

```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'

const extended = _.extend(jaPlugin)
```

### kanaToFull(str)
Converts half-width katakana to full-width.

**Examples:**
```typescript
extended.kanaToFull('ｶﾞｷﾞ')     // 'ガギ'
extended.kanaToFull('ｱｲｳ')      // 'アイウ'
```

---

### kanaToHalf(str)
Converts full-width katakana to half-width (dakuten marks split into separate characters).

**Examples:**
```typescript
extended.kanaToHalf('ガギ')      // 'ｶﾞｷﾞ'
extended.kanaToHalf('アイウ')    // 'ｱｲｳ'
```

---

### kanaToHira(str)
Converts katakana to hiragana (half-width is automatically converted to full-width first).

**Examples:**
```typescript
extended.kanaToHira('アイウ')    // 'あいう'
extended.kanaToHira('ｱｲｳ')      // 'あいう' (half-width handled)
```

---

### hiraToKana(str)
Converts hiragana to katakana.

**Examples:**
```typescript
extended.hiraToKana('あいう')    // 'アイウ'
```

---

### toFullWidth(value, withHaifun?)
Converts half-width characters to full-width; optional hyphen normalization.

**Parameters:**
- `value` (unknown): Input value
- `withHaifun` (string): If provided, normalizes hyphens to this character

**Examples:**
```typescript
extended.toFullWidth('ABC-123', 'ー')  // 'ＡＢＣー１２３'
extended.toFullWidth('abc')            // 'ａｂｃ'
extended.toFullWidth('123')            // '１２３'
```

---

### toHalfWidth(value, withHaifun?)
Converts full-width characters to half-width; optional hyphen normalization.

**Parameters:**
- `value` (unknown): Input value
- `withHaifun` (string): If provided, normalizes hyphens to this character

**Examples:**
```typescript
extended.toHalfWidth('ＡＢＣー１２３', '-')  // 'ABC-123'
extended.toHalfWidth('ａｂｃ')              // 'abc'
extended.toHalfWidth(' ｱｲｳ　123 ')         // ' ｱｲｳ 123 '
```

---

## Geo Utilities (plugin: `ansuko/plugins/geo`)

Load the Geo plugin to access GeoJSON conversion functions:

```typescript
import _ from 'ansuko'
import geoPlugin from 'ansuko/plugins/geo'

const extended = _.extend(geoPlugin)
```

### toGeoJson(geo, type?, digit?)
Universal GeoJSON converter with auto-detection (tries dimensions from high to low).

**Parameters:**
- `geo` (any): Input coordinates, object, or GeoJSON
- `type` (GeomType = GeomType.auto): Target geometry type
- `digit` (number): Decimal places for rounding

**GeomType enum:**
- `GeomType.auto` - Auto-detect (default)
- `GeomType.point`
- `GeomType.lineString`
- `GeomType.polygon`
- `GeomType.multiPoint`
- `GeomType.multiLineString`
- `GeomType.multiPolygon`

**Examples:**
```typescript
extended.toGeoJson([139.7, 35.6], GeomType.point)
// => { type: 'Point', coordinates: [139.7, 35.6] }

extended.toGeoJson([[139.7, 35.6], [139.8, 35.7]], GeomType.lineString)
// => { type: 'LineString', coordinates: [[139.7, 35.6], [139.8, 35.7]] }
```

---

### toPointGeoJson(geo, digit?)
Converts coordinates or object to Point GeoJSON.

**Accepts:**
- Array: `[lng, lat]`
- Object: `{ lat, lng }` or `{ latitude, longitude }`
- GeoJSON: Feature, FeatureCollection, Point geometry

**Examples:**
```typescript
extended.toPointGeoJson([139.7671, 35.6812])
// => { type: 'Point', coordinates: [139.7671, 35.6812] }

extended.toPointGeoJson({ lat: 35.6895, lng: 139.6917 })
// => { type: 'Point', coordinates: [139.6917, 35.6895] }

// With rounding
extended.toPointGeoJson([139.7671234, 35.6812345], 4)
// => { type: 'Point', coordinates: [139.7671, 35.6812] }
```

---

### toPolygonGeoJson(geo, digit?)
Converts outer ring to Polygon GeoJSON (validates closed ring).

**Requirements:**
- First and last coordinates must be identical (closed ring)
- Minimum 4 points (including closing point)

**Examples:**
```typescript
extended.toPolygonGeoJson([
  [139.70, 35.68],
  [139.78, 35.68],
  [139.78, 35.75],
  [139.70, 35.75],
  [139.70, 35.68]  // Must close!
])
// => { type: 'Polygon', coordinates: [[...]] }
```

---

### toLineStringGeoJson(geo, digit?)
Converts coordinates to LineString (checks for self-intersection).

**Validation:**
- Rejects self-intersecting lines
- Minimum 2 points

**Examples:**
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
Converts multiple points to MultiPoint GeoJSON.

---

### toMultiPolygonGeoJson(geo, digit?)
Converts multiple polygons to MultiPolygon GeoJSON (validates outer rings).

---

### toMultiLineStringGeoJson(geo, digit?)
Converts multiple lines to MultiLineString GeoJSON (checks self-intersection per line).

---

### unionPolygon(geo, digit?)
Unions multiple Polygon/MultiPolygon into single Geometry.

**Returns:** `Polygon | MultiPolygon | null`

**Examples:**
```typescript
const poly1 = [[139.7, 35.6], [139.8, 35.6], [139.8, 35.7], [139.7, 35.7], [139.7, 35.6]]
const poly2 = [[139.75, 35.65], [139.85, 35.65], [139.85, 35.75], [139.75, 35.75], [139.75, 35.65]]

const unified = extended.unionPolygon([poly1, poly2])
// => Combined polygon or multipolygon
```

**Use Cases:**
- Merging administrative boundaries
- Combining overlapping zones
- Spatial analysis

---

### parseToTerraDraw(geo)
Converts GeoJSON to Terra Draw compatible features (with auto-generated UUIDs).

---

## Plugin System

### extend(plugin)
Apply a plugin to extend ansuko with additional functionality.

**Category:** Core Functions  
**Parameters:**
- `plugin` ((ansuko: AnsukoType) => T): Plugin function

**Returns:** `AnsukoType & T` (extended instance)

**Usage:**
```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'
import geoPlugin from 'ansuko/plugins/geo'

// Single plugin
const withJa = _.extend(jaPlugin)
withJa.kanaToHira('アイウ')  // 'あいう'

// Multiple plugins (chaining)
const full = _
  .extend(jaPlugin)
  .extend(geoPlugin)

full.kanaToHira('アイウ')                    // 'あいう'
full.toPointGeoJson([139.7, 35.6])         // Point geometry
```

**Available Plugins:**
- `jaPlugin` - Japanese text processing (`ansuko/plugins/ja`)
- `geoPlugin` - GeoJSON utilities (`ansuko/plugins/geo`)
- `prototypePlugin` - Array prototype extensions (`ansuko/plugins/prototype`)

---

## Original lodash Functions

ansuko overrides some lodash functions with improved behaviors. Original versions remain accessible:

### isEmptyOrg
Original lodash `isEmpty` (where numbers/booleans are considered empty).

```typescript
_.isEmptyOrg(0)      // true (original lodash behavior)
_.isEmpty(0)         // false (ansuko behavior)
```

---

### toNumberOrg
Original lodash `toNumber` (basic conversion without full-width/comma support).

```typescript
_.toNumberOrg('1,234')    // NaN (original lodash)
_.toNumber('1,234')       // 1234 (ansuko)
```

---

### castArrayOrg
Original lodash `castArray` (keeps null in array).

```typescript
_.castArrayOrg(null)   // [null] (original lodash)
_.castArray(null)      // [] (ansuko)
```

---

## All lodash Functions Available

In addition to the enhanced functions above, **all standard lodash functions** remain available:

- `_.size`, `_.isNil`, `_.debounce`, `_.throttle`
- `_.map`, `_.filter`, `_.reduce`, `_.forEach`
- `_.get`, `_.set`, `_.has`, `_.omit`, `_.pick`
- `_.keys`, `_.values`, `_.entries`
- `_.merge`, `_.cloneDeep`, `_.isEqual`
- `_.sortBy`, `_.groupBy`, `_.uniq`, `_.flatten`
- And 200+ more lodash utilities

Simply use them as you normally would with lodash:

```typescript
import _ from 'ansuko'

_.map([1, 2, 3], n => n * 2)        // [2, 4, 6]
_.get({ a: { b: 1 } }, 'a.b')       // 1
_.debounce(fn, 100)                 // debounced function
```