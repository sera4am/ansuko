# @sera/ansuko

A modern JavaScript/TypeScript utility library that extends lodash with practical, intuitive behaviors.

## Why ansuko?

The name "ansuko" comes from multiple meanings:

- **アンスコ (ansuko)** - Japanese abbreviation for "underscore" (アンダースコア)
- **ansuko = underscore → low dash → lodash** - Continuing the lineage
- **スコ (suko)** - Japanese slang meaning "like" or "favorite"

This library fixes lodash's unintuitive behaviors and adds powerful utilities that eliminate common JavaScript frustrations.

## Installation

```bash
npm install github:sera/ansuko
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "@sera/ansuko": "github:sera/ansuko#main"
  }
}
```

## Core Philosophy

ansuko eliminates common JavaScript frustrations:

- No more `isEmpty(0)` returning `true`
- No more `toNumber(null)` returing `0`
- No more `castArray(null)` returning `[null]`
- No more `JSON.stringify("string")` returning `"\"string\""`
- No more unsafe `JSON.parse()` without try-catch
- No more verbose `a == b ? a : defaultValue` patterns
- No more `delete obj.<wasteKey>` after deep-merged updates — _.changes extracts only changed fields

## Key Features

### Improved `isEmpty`

Unlike lodash, `isEmpty` treats numbers and booleans as non-empty values:

```javascript
import _ from '@sera/ansuko'

// lodash behavior (unintuitive)
_.isEmpty(0)      // => true  (Why??)
_.isEmpty(false)  // => true  (Confusing!)

// ansuko behavior (intuitive)
_.isEmpty(0)      // => false (0 is a valid number)
_.isEmpty(false)  // => false (false is a valid boolean)
_.isEmpty(null)   // => true
_.isEmpty('')     // => true
_.isEmpty([])     // => true
```

### Enhanced `toNumber`

Handles comma-separated numbers, full-width characters, and returns `null` for invalid values:

```javascript
_.toNumber('1,234')       // => 1234
_.toNumber('1,234.56')    // => 1234.56
_.toNumber('１２３')      // => 123 (full-width support)
_.toNumber(null)          // => null (not NaN)
_.toNumber('invalid')     // => null (not NaN)
```

### `valueOr` - Promise-aware default values

A powerful utility for handling nullable values with Promise support:

```javascript
// Basic usage
_.valueOr(null, 'default')           // => 'default'
_.valueOr(0, 'default')              // => 0
_.valueOr('', 'default')             // => 'default'

// Lazy evaluation
_.valueOr(null, () => expensiveCalculation())  // Only called if needed

// Promise support
await _.valueOr(Promise.resolve(42), 0)        // => 42
await _.valueOr(Promise.resolve(null), 0)      // => 0

// Function support (thunks)
_.valueOr(() => 42, 'default')                 // => 42
_.valueOr(() => null, 'default')               // => 'default'
```

### `equalsOr` - Comparison with fallback

Compare values and provide fallback if they don't match. Works with Promises and functions:

```javascript
// Basic comparison
_.equalsOr(userInput, 'expected', 'default')   // => userInput if equal, else 'default'

// API validation
await _.equalsOr(fetchStatus(), 'success', 'failed')

// Config validation
_.equalsOr(config.mode, 'production', 'development')

// nil values are considered equal
_.equalsOr(null, undefined, 'default')         // => null (both are nil)

// 2-argument usage: acts as valueOr
_.equalsOr(null, 'default')                    // => 'default'
```

### Safe JSON Handling

No more try-catch blocks or accidental string stringification:

```javascript
// parseJSON - Returns null on failure, supports JSON5
_.parseJSON('{"key": "value"}')           // => {key: "value"}
_.parseJSON('{key: "value"}')             // => {key: "value"} (JSON5 support)
_.parseJSON('invalid')                    // => null (no error thrown)
_.parseJSON(null)                         // => null
_.parseJSON({already: "object"})          // => {already: "object"}

// jsonStringify - Only stringifies valid objects
_.jsonStringify({key: "value"})           // => '{"key":"value"}'
_.jsonStringify("string")                 // => null (prevents '"string"')
_.jsonStringify(123)                      // => null (only objects/arrays)
_.jsonStringify(null)                     // => null

// JSON5 strings are normalized to JSON
_.jsonStringify('{key: "value"}')         // => '{"key":"value"}'
```

### Fixed `castArray`

Returns empty array for null/undefined instead of `[null]`:

```javascript
// lodash behavior
_.castArray(null)      // => [null]  (why??)
_.castArray(undefined) // => [undefined]

// ansuko behavior
_.castArray(null)      // => []  (clean!)
_.castArray(undefined) // => []
_.castArray([1, 2])    // => [1, 2]
_.castArray(1)         // => [1]

// No more need for .filter(Boolean)
_.castArray(maybeNull).map(process)  // Just works!
```

### `changes` - Track object differences

Get only the values that have changed between two objects at specified keys. Perfect for database updates:

```javascript
// Basic usage - compare at specific keys
const original = { name: 'John', age: 30, email: 'john@example.com' }
const updated = { name: 'John', age: 31, email: 'john@example.com' }

_.changes(original, updated, ['name', 'age', 'email'])
// => { age: 31 }  (only changed values)

// Handles null/undefined differences
const before = { status: 'active', notes: null }
const after = { status: 'active', notes: undefined }

_.changes(before, after, ['status', 'notes'])
// => { notes: null }  (undefined normalized to null for DB storage)

// Supports deep paths with lodash get syntax
_.changes(userA, userB, ['profile.bio', 'settings.theme', 'metadata.tags[0]'])
// => { 'profile.bio': 'new bio', 'settings.theme': 'dark' }

// Perfect for UPDATE queries
const userChanges = _.changes(fetchedUser, editedUser, Object.keys(schema))
db.update('users', userId, userChanges)  // Only update changed fields
```

### Japanese Text Processing

Comprehensive utilities for handling Japanese text:

```javascript
// Half-width katakana to full-width
_.kanaToFull('ｱｲｳｴｵ')  // => 'アイウエオ'

// Katakana to hiragana
_.kanaToHira('アイウエオ')  // => 'あいうえお'

// Hiragana to katakana
_.hiraToKana('あいうえお')  // => 'アイウエオ'

// Full-width to half-width
_.toHalfWidth('１２３')     // => '123'
_.toHalfWidth('ＡＢＣ')     // => 'ABC'
```

### Other Utilities

```javascript
// Safe boolean conversion
_.boolIf(1, false)           // => true
_.boolIf(0, false)           // => false
_.boolIf('invalid', false)   // => false (default)

// String validation
_.isValidStr('')             // => false
_.isValidStr('hello')        // => true
_.isValidStr(null)           // => false

// Delayed execution (requestAnimationFrame)
_.waited(() => console.log('executed'), 2)  // Wait 2 frames
```

## TypeScript Support

Full TypeScript support with type definitions included:

```typescript
import _ from '@sera/ansuko'
import { valueOr, isEmpty, toNumber, equalsOr, parseJSON } from '@sera/ansuko'

// Type inference works perfectly
const result1: string = _.valueOr(null, 'default')
const result2: number = _.toNumber('1,234') ?? 0
const result3: boolean = _.isEmpty([])

// Generic support
interface User { name: string; age: number }
const user = _.parseJSON<User>(jsonString)  // User | null
```

## API Reference

### Enhanced lodash Functions

- `isEmpty(value)` - Check if a value is empty (numbers and booleans are NOT empty)
- `castArray(value)` - Convert to array, returns `[]` for null/undefined

### Number & Boolean

- `toNumber(value)` - Convert to number with comma support, returns `null` for invalid
- `boolIf(value, defaultValue)` - Safe boolean conversion

### Value Handling

- `valueOr(value, defaultValue)` - Get value or default with Promise/function support
- `equalsOr(value1, value2, defaultValue)` - Compare and fallback (or use as valueOr with 2 args)
- `changes(sourceObj, currentObj, keys)` - Get changed values at specified keys, perfect for DB updates

### JSON Utilities

- `parseJSON(str)` - Safe JSON/JSON5 parse, returns `null` on error
- `jsonStringify(obj)` - Stringify only valid objects, prevents string/number stringification

### Japanese Text

- `kanaToFull(str)` - Convert half-width katakana to full-width
- `kanaToHira(str)` - Convert katakana to hiragana
- `hiraToKana(str)` - Convert hiragana to katakana
- `toHalfWidth(value)` - Convert full-width characters to half-width
- `isValidStr(str)` - Check if value is a non-empty string

### Animation

- `waited(func, frameCount)` - Execute function after N animation frames

### All lodash functions

All original lodash functions are available as well.

## Real-world Examples

### API Response Handling

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

### Config Validation

```javascript
// Before
const timeout = config.timeout !== null &&
config.timeout !== undefined &&
config.timeout !== '' ?
    config.timeout : 5000

// After
const timeout = _.valueOr(config.timeout, 5000)
```

### Safe Array Operations

```javascript
// Before
const items = data.items
const processed = (items ? (Array.isArray(items) ? items : [items]) : [])
    .filter(Boolean)
    .map(process)

// After
const processed = _.castArray(data.items).map(process)
```

## Why not just use lodash?

lodash has some unintuitive behaviors that have been criticized by the community:

1. `_.isEmpty(true)` returns `true` - Is a boolean "empty"?
2. `_.isEmpty(1)` returns `true` - Is the number 1 "empty"?
3. `_.castArray(null)` returns `[null]` - Why include null in the array?
4. `JSON.stringify("hello")` returns `'"hello"'` - Those extra quotes are annoying
5. No safe JSON parsing without try-catch blocks
6. No built-in comparison with fallback pattern

ansuko fixes these issues while maintaining compatibility with the rest of lodash's excellent utilities.

## Dependencies

- `lodash` - Core utility functions
- `json5` - Enhanced JSON parsing with comments and trailing commas support

## Building from Source

```bash
npm install
npm run build
```

This will generate the compiled JavaScript and type definitions in the `dist` directory.

## License

MIT

## Author

Sera