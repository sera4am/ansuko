# API Reference

## Enhanced lodash Functions

### `isEmpty(value)`

Check if a value is empty. Unlike lodash, numbers and booleans are NOT considered empty.

```javascript
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

### `castArray(value)`

Convert to array. Returns empty array for null/undefined instead of `[null]`.

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

## Number & Boolean

### `toNumber(value)`

Convert to number with comma support and full-width character handling. Returns `null` for invalid values instead of `NaN`.

```javascript
_.toNumber('1,234')       // => 1234
_.toNumber('1,234.56')    // => 1234.56
_.toNumber('１２３')      // => 123 (full-width support)
_.toNumber(null)          // => null (not NaN)
_.toNumber('invalid')     // => null (not NaN)
```

### `boolIf(value, defaultValue)`

Safe boolean conversion with fallback.

```javascript
_.boolIf(1, false)           // => true
_.boolIf(0, false)           // => false
_.boolIf('invalid', false)   // => false (default)
```

## Value Handling

### `valueOr(value, defaultValue)`

Get value or default. Handles null/undefined, supports Promise and function evaluation.

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

### `equalsOr(value1, value2, defaultValue?)`

Compare values and provide fallback if they don't match. Treats null and undefined as equal. Works with Promises and functions.

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

### `changes(sourceObj, currentObj, keys, options?)`

Get only the values that have changed between two objects at specified keys. Perfect for database updates.

**Type Signature:**
```typescript
type ChangesOptions = {
    keyExcludes?: boolean
}

function changes<T extends Record<string, any>, E extends Record<string, any>>(
    sourceValue: T,
    currentValue: E,
    keys: string[],
    options?: ChangesOptions
): Record<string, any>
```

**Options:**
- `keyExcludes?: boolean` - When `true`, get changes from all keys EXCEPT specified ones (inverts the key filter)

**Examples:**
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

// Exclude sensitive fields
const changes = _.changes(original, updated, ['password', 'secret'], { keyExcludes: true })
// Returns changes in all fields except password and secret
```

## JSON Utilities

### `parseJSON(str)`

Safe JSON/JSON5 parse. Returns `null` on error, no try-catch needed.

```javascript
_.parseJSON('{"key": "value"}')           // => {key: "value"}
_.parseJSON('{key: "value"}')             // => {key: "value"} (JSON5 support)
_.parseJSON('invalid')                    // => null (no error thrown)
_.parseJSON(null)                         // => null
_.parseJSON({already: "object"})          // => {already: "object"}
```

### `jsonStringify(obj)`

Stringify only valid objects/arrays. Prevents accidental string/number stringification.

```javascript
_.jsonStringify({key: "value"})           // => '{"key":"value"}'
_.jsonStringify("string")                 // => null (prevents '"string"')
_.jsonStringify(123)                      // => null (only objects/arrays)
_.jsonStringify(null)                     // => null

// JSON5 strings are normalized to JSON
_.jsonStringify('{key: "value"}')         // => '{"key":"value"}'
```

## Japanese Text Processing

### `kanaToFull(str)`

Convert half-width katakana to full-width.

```javascript
_.kanaToFull('ｱｲｳｴｵ')  // => 'アイウエオ'
```

### `kanaToHira(str)`

Convert katakana to hiragana.

```javascript
_.kanaToHira('アイウエオ')  // => 'あいうえお'
```

### `hiraToKana(str)`

Convert hiragana to katakana.

```javascript
_.hiraToKana('あいうえお')  // => 'アイウエオ'
```

### `toHalfWidth(value)`

Convert full-width characters to half-width.

```javascript
_.toHalfWidth('１２３')     // => '123'
_.toHalfWidth('ＡＢＣ')     // => 'ABC'
```

### `isValidStr(str)`

Check if value is a non-empty string.

```javascript
_.isValidStr('')             // => false
_.isValidStr('hello')        // => true
_.isValidStr(null)           // => false
```

## Animation

### `waited(func, frameCount)`

Execute function after N animation frames using requestAnimationFrame.

```javascript
_.waited(() => console.log('executed'), 2)  // Wait 2 frames
```

## All lodash functions

All original lodash functions are available as well. Refer to [lodash documentation](https://lodash.com/docs) for complete reference.