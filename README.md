# ansuko

[![CI](https://img.shields.io/github/actions/workflow/status/sera4am/ansuko/ci.yml?branch=main)](https://github.com/sera4am/ansuko/actions/workflows/ci.yml)

A modern JavaScript/TypeScript utility library that extends lodash with practical, intuitive behaviors.

[English](./README.md) | [日本語](./README.ja.md)

## Why ansuko?

The name "ansuko" comes from multiple meanings:

- **アンスコ (ansuko)** - Japanese abbreviation for "underscore" (アンダースコア)
- **ansuko = underscore → low dash → lodash** - Continuing the lineage
- **スコ (suko)** - Japanese slang meaning "like" or "favorite"

This library fixes lodash's unintuitive behaviors and adds powerful utilities that eliminate common JavaScript frustrations.

## Installation

```bash
npm install ansuko
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "ansuko"
  }
}
```

## Core Philosophy

ansuko eliminates common JavaScript frustrations with intuitive behaviors:

### Fixed lodash Quirks

```typescript
// ❌ lodash (unintuitive)
_.isEmpty(0)           // true  - Is 0 really "empty"?
_.isEmpty(true)        // true  - Is true "empty"?
_.castArray(null)      // [null] - Why keep null?

// ✅ ansuko (intuitive)
_.isEmpty(0)           // false - Numbers are not empty
_.isEmpty(true)        // false - Booleans are not empty
_.castArray(null)      // []    - Clean empty array
```

### Safe JSON Handling

```typescript
// ❌ Standard JSON (annoying)
JSON.stringify('hello')  // '"hello"'  - Extra quotes!
JSON.parse(badJson)      // throws     - Need try-catch

// ✅ ansuko (smooth)
_.jsonStringify('hello')     // null     - Not an object
_.jsonStringify({ a: 1 })    // '{"a":1}' - Clean
_.parseJSON(badJson)         // null     - No exceptions
_.parseJSON('{ a: 1, }')     // {a:1}    - JSON5 support!
```

### Promise-Aware Fallbacks

```typescript
// ❌ Verbose pattern
const data = await fetchData()
const result = data ? data : await fetchBackup()

// ✅ ansuko (concise)
const result = await _.valueOr(
  () => fetchData(),
  () => fetchBackup()
)
```

### Smart Comparisons

```typescript
// ❌ Verbose ternary hell
const value = a === b ? a : (a == null && b == null ? a : defaultValue)

// ✅ ansuko (readable)
const value = _.equalsOr(a, b, defaultValue)  // null == undefined
```

## Key Features

### Enhanced lodash Functions

- **`isEmpty`** - Check if empty (numbers and booleans are NOT empty)
- **`castArray`** - Convert to array, returns `[]` for null/undefined
- All lodash functions remain available: `size`, `isNil`, `debounce`, `isEqual`, `keys`, `values`, `has`, etc.

### Value Handling & Control Flow

- **`valueOr`** - Get value or default with Promise/function support
- **`emptyOr`** - Return null if empty, otherwise apply callback or return value
- **`hasOr`** - Check if paths exist, return default if missing (supports deep paths & Promises)
- **`equalsOr`** - Compare and fallback with intuitive nil handling (Promises supported)
- **`changes`** - Track object differences for DB updates (supports deep paths like `profile.tags[1]` & excludes mode)

### Type Conversion & Validation

- **`toNumber`** - Parse numbers with comma/full-width support, returns `null` for invalid
- **`toBool`** - Smart boolean conversion ("yes"/"no"/"true"/"false"/numbers) with configurable undetected handling
- **`boolIf`** - Safe boolean conversion with fallback
- **`isValidStr`** - Non-empty string validation

### JSON Processing

- **`parseJSON`** - Safe JSON/JSON5 parsing without try-catch (supports comments & trailing commas)
- **`jsonStringify`** - Stringify only valid objects, prevents accidental string wrapping

### Array Utilities

- **`arrayDepth`** - Returns nesting depth of arrays (non-array: 0, empty array: 1)
- **`castArray`** - Convert to array, nil becomes `[]` (not `[null]`)

### Japanese Text (plugin: `ansuko/plugins/ja`)

- **`kanaToFull`** - Half-width katakana → Full-width (e.g., `ｶﾞｷﾞ` → `ガギ`)
- **`kanaToHalf`** - Full-width → Half-width katakana (dakuten splits: `ガギ` → `ｶﾞｷﾞ`)
- **`kanaToHira`** - Katakana → Hiragana (auto-converts half-width first)
- **`hiraToKana`** - Hiragana → Katakana
- **`toHalfWidth`** - Full-width → Half-width with optional hyphen normalization
- **`toFullWidth`** - Half-width → Full-width with optional hyphen normalization
- **`haifun`** - Normalize various hyphens to single character

### Geo Utilities (plugin: `ansuko/plugins/geo`)

- **`toGeoJson`** - Universal GeoJSON converter with auto-detection (tries dimensions from high to low)
- **`toPointGeoJson`** - Convert coords/object to Point GeoJSON
- **`toPolygonGeoJson`** - Convert outer ring to Polygon (validates closed ring)
- **`toLineStringGeoJson`** - Convert coords to LineString (checks self-intersection)
- **`toMultiPointGeoJson`** - Convert multiple points to MultiPoint
- **`toMultiPolygonGeoJson`** - Convert multiple polygons to MultiPolygon
- **`toMultiLineStringGeoJson`** - Convert multiple lines to MultiLineString
- **`unionPolygon`** - Union multiple Polygon/MultiPolygon into single geometry
- **`parseToTerraDraw`** - Convert GeoJSON to Terra Draw compatible features

### Prototype Extensions (plugin: `ansuko/plugins/prototype`)

- **`Array.prototype.notMap`** - Map with negated predicate → boolean array
- **`Array.prototype.notFilter`** - Filter by negated predicate (items that do NOT match)

### Timing Utilities

- **`waited`** - Delay execution by N animation frames (better than `setTimeout` for React/DOM)

## Plugin Architecture

ansuko uses a minimal core + plugin architecture to keep your bundle size small:

- **Core** (~20KB): Essential utilities that improve lodash
- **Japanese plugin** (~5KB): Only load if you need Japanese text processing
- **Geo plugin** (~100KB with @turf/turf): Only load for GIS applications
- **Prototype plugin** (~1KB): Only load if you want Array prototype extensions

This means you only pay for what you use!

```typescript
// Minimal bundle - just core
import _ from 'ansuko'  // ~20KB

// Add Japanese support when needed
import jaPlugin from 'ansuko/plugins/ja'
_.extend(jaPlugin)  // +5KB

// Add GIS features for mapping apps
import geoPlugin from 'ansuko/plugins/geo'
_.extend(geoPlugin)  // +100KB
```

## Quick Start

### Basic Usage

```typescript
import _ from 'ansuko'

// Enhanced lodash functions
_.isEmpty(0)           // false (not true like lodash!)
_.isEmpty([])          // true
_.castArray(null)      // [] (not [null]!)
_.toNumber('1,234.5')  // 1234.5

// Value handling with Promise support
const value = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id)
)

// Safe JSON parsing
const data = _.parseJSON('{ "a": 1, /* comment */ }')  // Works with JSON5!

// Track object changes for database updates
const diff = _.changes(
  original, 
  updated, 
  ['name', 'email', 'profile.bio']
)
```

### Using Plugins

#### Japanese Text Plugin

```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'

_.extend(jaPlugin)

_.kanaToFull('ｶﾞｷﾞ')              // 'ガギ'
_.kanaToHira('アイウ')             // 'あいう'
_.toHalfWidth('ＡＢＣー１２３', '-') // 'ABC-123'
_.haifun('test‐data', '-')       // 'test-data'
```

#### Geo Plugin

```typescript
import _ from 'ansuko'
import geoPlugin from 'ansuko/plugins/geo'

const extended = _.extend(geoPlugin)

// Convert various formats to GeoJSON
extended.toPointGeoJson([139.7671, 35.6812])
// => { type: 'Point', coordinates: [139.7671, 35.6812] }

extended.toPointGeoJson({ lat: 35.6895, lng: 139.6917 })
// => { type: 'Point', coordinates: [139.6917, 35.6895] }

// Union multiple polygons
const unified = extended.unionPolygon([polygon1, polygon2])
```

#### Prototype Plugin

```typescript
import _ from 'ansuko'
import prototypePlugin from 'ansuko/plugins/prototype'

_.extend(prototypePlugin)

// Now Array.prototype is extended
[1, 2, 3].notMap(n => n > 1)      // [true, false, false]
[1, 2, 3].notFilter(n => n % 2)   // [2] (even numbers)
```

### Chaining Plugins

```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'
import geoPlugin from 'ansuko/plugins/geo'

const extended = _
  .extend(jaPlugin)
  .extend(geoPlugin)

// Now you have both Japanese and Geo utilities!
extended.kanaToHira('アイウ')
extended.toPointGeoJson([139.7, 35.6])
```

## Documentation

For detailed information, see:

- **[API Reference](./docs/API.md)** - Complete API documentation with examples
- **[Usage Guide](./docs/Guide.md)** - Real-world examples and patterns

## TypeScript Support

Full TypeScript support with type definitions included. All functions are fully typed with generic support.

## Why not just use lodash?

lodash is excellent, but has some quirks that have been [criticized by the community](https://github.com/lodash/lodash/issues):

### Fixed Behaviors

1. **`_.isEmpty(true)` returns `true`** - Is a boolean really "empty"?
2. **`_.isEmpty(1)` returns `true`** - Is the number 1 "empty"?
3. **`_.castArray(null)` returns `[null]`** - Why include null in the array?

### Added Utilities Missing in lodash

4. **No safe JSON parsing** - Always need try-catch blocks
5. **No built-in comparison with fallback** - Verbose ternary patterns everywhere
6. **No Promise-aware value resolution** - Manual Promise handling gets messy
7. **No object diff tracking** - Need external libs for DB updates
8. **`JSON.stringify("hello")` adds quotes** - Those `'"hello"'` quotes are annoying

### Real-World Example

```typescript
// Common pattern with lodash (verbose & error-prone)
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

// Same logic with ansuko (concise & safe)
const data = await _.valueOr(
  () => cache.get(id),
  () => api.fetch(id),
  defaultValue
)
```

ansuko maintains **100% compatibility** with lodash while fixing these issues and adding powerful utilities for modern JavaScript development.

## Dependencies

- **`lodash`** - Core utility functions
- **`json5`** - Enhanced JSON parsing with comments and trailing commas support
- **`@turf/turf`** - Geospatial analysis (used by geo plugin)

## Building from Source

```bash
npm install
npm run build
```

This will generate the compiled JavaScript and type definitions in the `dist` directory.

## Development
Developed by Sera with assistance from Claude (Anthropic) for documentation, code review, and technical discussions.

## License

MIT

## Author

Naoto Sera