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

Get value or default. Handles null/undefined, supports Promise and function evaluation. **Automatically detects and handles Promises** - returns synchronously when possible, Promise when necessary.

```javascript
// Basic usage
_.valueOr(null, 'default')           // => 'default'
_.valueOr(0, 'default')              // => 0
_.valueOr('', 'default')             // => 'default'

// Lazy evaluation
_.valueOr(null, () => expensiveCalculation())  // Only called if needed

// Promise support - automatically returns Promise when needed
await _.valueOr(Promise.resolve(42), 0)        // => 42
await _.valueOr(Promise.resolve(null), 0)      // => 0

// Function support (thunks)
_.valueOr(() => 42, 'default')                 // => 42
_.valueOr(() => null, 'default')               // => 'default'

// Mixed Promise/sync - smart detection
const result1 = _.valueOr('sync', 'default')              // sync: 'sync'
const result2 = await _.valueOr(asyncFn(), 'default')     // Promise: resolved value
```

### `equalsOr(value1, value2, defaultValue?)`

Compare values and provide fallback if they don't match. Treats null and undefined as equal. **Automatically handles Promises** - returns synchronously for sync values, Promise for async values.

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

// Promise handling - automatic detection
const sync = _.equalsOr('a', 'a', 'default')              // sync: 'a'
const async = await _.equalsOr(Promise.resolve('a'), 'a', 'default')  // Promise: 'a'

// Real-world: close dialog with confirmation
const onClose = () => {
  // If no changes: immediate close (sync)
  // If changes: show confirmation dialog (async)
  _.equalsOr(original, edited, confirmDialog).then(actuallyClose)
}
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

// Supports deep paths with lodash get syntax (Warning: no deep path supported for keyExcludes mode)
_.changes(userA, userB, ['profile.bio', 'settings.theme', 'metadata.tags[0]'])
// => { 'profile': {'bio': 'new bio'}, 'settings': {'theme': 'dark'} }

// Perfect for UPDATE queries
const userChanges = _.changes(fetchedUser, editedUser, Object.keys(schema))
db.update('users', userId, userChanges)  // Only update changed fields

// Exclude sensitive fields
const changes = _.changes(original, updated, ['password', 'secret'], { keyExcludes: true })
// Returns changes in all fields except password and secret
```

## Text Normalization

### `haifun(text, replacement?, expandInterpretation?)`

Normalize various hyphen, dash, and horizontal line characters into a single consistent character. Essential for text comparison, search, and database operations where user input may contain visually similar but technically different Unicode characters.

**Parameters:**
- `text?: string` - The text to normalize
- `replacement?: string` - The character to replace with (default: `"‐"` U+2010 HYPHEN)
- `expandInterpretation?: boolean` - When `true`, also normalizes wave dashes, tildes, underscores, and dotted lines (default: `false`)

**Returns:** `string | null` - Normalized string, or `null` if input is null/undefined

**What it normalizes:**

**Base characters (always normalized):**
- ASCII hyphen-minus (`-`), en dash (`–`), em dash (`—`), horizontal bar (`―`)
- Mathematical minus (`−`), figure dash, non-breaking hyphen
- Box drawing characters (`─`, `━`, `╴`, `╶`, etc.)
- CJK characters that look like lines (一, ⼀, ㄧ, ㅡ, etc.)
- Katakana/Hangul prolonged sound marks (`ー`, `ￚ`)
- Ancient number symbols (𐄐, 𐆑)
- And 20+ other Unicode variations

**Extended characters (when `expandInterpretation: true`):**
- Wave dash and tilde (`〜`, `~`)
- Underscores (`_`, `＿`)
- Overlines/macrons (`￣`, `ˉ`)
- Dotted/dashed box drawing lines (`┄`, `┅`, `┈`, `┉`, `╌`, `╍`)
- Right arrow (`→`)

**Examples:**
```javascript
// Basic normalization
_.haifun('test-one—two―three')
// => 'test‐one‐two‐three'

// Japanese text with various dashes
_.haifun('東京ー大阪—名古屋')
// => '東京‐大阪‐名古屋'

// Mixed Unicode dashes
_.haifun('range: 2013–2024')  // en dash
// => 'range: 2013‐2024'

// Custom replacement character
_.haifun('a-b—c', '-')
// => 'a-b-c'

// Extended interpretation (includes tildes, underscores, etc.)
_.haifun('file_name〜test', '‐', true)
// => 'file‐name‐test'

// Database search normalization
const searchTerm = _.haifun(userInput)
const query = `SELECT * FROM products WHERE _.haifun(name) LIKE '%${searchTerm}%'`

// Text comparison
const normalized1 = _.haifun(text1)
const normalized2 = _.haifun(text2)
if (normalized1 === normalized2) { /* match! */ }
```

**Use cases:**
- **Search**: Normalize user queries to match database entries regardless of dash type
- **Deduplication**: Detect duplicate entries with different dash characters
- **Data import**: Clean CSV/Excel data with inconsistent dash usage
- **Address matching**: Compare addresses where dashes may vary (e.g., postal codes)
- **Product codes**: Normalize SKUs or part numbers with various dash types

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

### `toFullWidth(value, withHaifun?)`

Convert half-width characters to full-width, with optional hyphen normalization. Perfect for Japanese address forms that require full-width input.

**Parameters:**
- `value: unknown` - The value to convert
- `withHaifun?: string` - Optional replacement character for hyphens (e.g., `'ー'`)

**Process:**
1. Converts half-width katakana to full-width (using `kanaToFull`)
2. Converts half-width alphanumerics to full-width
3. Converts half-width space to full-width space
4. Optionally normalizes all hyphens to specified character

**Examples:**
```javascript
// Basic conversion
_.toFullWidth('ABC123')
// => 'ＡＢＣ１２３'

// With half-width kana
_.toFullWidth('ｱｲｳ ABC-123')
// => 'アイウ　ＡＢＣ−１２３'

// Address normalization with hyphen unification
_.toFullWidth('東京都千代田区1-2-3', 'ー')
// => '東京都千代田区１ー２ー３'

// Handle mixed input
_.toFullWidth('ｱｲﾁｹﾝ ABC-1-23', 'ー')
// => 'アイチケン　ＡＢＣー１ー２ー３'
```

**Use case - Japanese address forms:**
Many Japanese web forms require full-width input for addresses. Instead of showing validation errors, normalize user input automatically:

```javascript
// User-friendly form handling
const normalizedAddress = _.toFullWidth(userInput, 'ー')
// Accepts any input format, converts to form requirements
```

### `toHalfWidth(value, withHaifun?)`

Convert full-width characters to half-width, with optional hyphen normalization.

**Parameters:**
- `value: unknown` - The value to convert
- `withHaifun?: string` - Optional replacement character for hyphens (e.g., `'-'`)

**Process:**
1. Converts full-width alphanumerics to half-width
2. Converts full-width space to half-width space
3. Optionally normalizes all hyphens to specified character

**Examples:**
```javascript
// Basic conversion
_.toHalfWidth('ＡＢＣ１２３')
// => 'ABC123'

// With hyphen normalization
_.toHalfWidth('東京都千代田区１ー２ー３', '-')
// => '東京都千代田区1-2-3'

// Full-width space handling
_.toHalfWidth('ＡＢＣ　１２３')
// => 'ABC 123'
```

### `kanaToFull(str)`

Convert half-width katakana to full-width, including proper handling of dakuten (゛) and handakuten (゜) combining characters.

```javascript
_.kanaToFull('ｱｲｳｴｵ')  // => 'アイウエオ'
_.kanaToFull('ｶﾞｷﾞｸﾞｹﾞｺﾞ')  // => 'ガギグゲゴ' (dakuten handled correctly)
_.kanaToFull('ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ')  // => 'パピプペポ' (handakuten handled correctly)
```

### `kanaToHalf(str)`

Convert full-width katakana to half-width, properly splitting dakuten and handakuten.

**Note:** Half-width katakana uses combining characters, so output length may differ from input.

```javascript
_.kanaToHalf('アイウエオ')  // => 'ｱｲｳｴｵ'
_.kanaToHalf('ガギグゲゴ')  // => 'ｶﾞｷﾞｸﾞｹﾞｺﾞ' (2 chars per dakuten character)
_.kanaToHalf('パピプペポ')  // => 'ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ' (2 chars per handakuten character)
```

**Warning:** Half-width katakana can cause issues in legacy systems and is generally discouraged in modern applications. Use only when required for compatibility.

### `kanaToHira(str)`

Convert katakana to hiragana.

```javascript
_.kanaToHira('アイウエオ')  // => 'あいうえお'
_.kanaToHira('カタカナ')    // => 'かたかな'
```

### `hiraToKana(str)`

Convert hiragana to katakana.

```javascript
_.hiraToKana('あいうえお')  // => 'アイウエオ'
_.hiraToKana('ひらがな')    // => 'ヒラガナ'
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

Execute function after N animation frames using `requestAnimationFrame`. Eliminates the need for arbitrary `setTimeout` delays when waiting for render updates.

**Parameters:**
- `func: () => void` - Function to execute after waiting
- `frameCount?: number` - Number of **additional** frames to wait after the first `requestAnimationFrame` (default: `0`)
  - `0` = Execute on next frame (1 RAF call)
  - `1` = Execute after 2 frames (2 RAF calls)
  - `2` = Execute after 3 frames (3 RAF calls)

**Why use `waited` instead of `setTimeout`?**

Frame-based timing ensures execution happens after actual DOM updates, independent of CPU speed, preventing both race conditions and excessive waits. By specifying frame count instead of milliseconds, the timing adapts to actual rendering cycles regardless of device performance.

**This is especially valuable when waiting for framework state updates** (like React's `setState`) to be reflected in the DOM.

**Examples:**

**Examples:**
```javascript
// Basic usage - wait 1 frame
_.waited(() => {
  console.log('Executed after 1 frame')
}, 1)

// Wait for React state to render
function handleUpdate() {
  setData(newData)
  _.waited(() => {
    // Guaranteed to run after React renders
    scrollToElement()
    measureHeight()
  }, 1) // Wait 2 frames
}

// Heavy render - wait more frames
function complexUpdate() {
  setComplexState(data)
  _.waited(() => {
    // Wait 3 frames for heavy rendering
    startAnimation()
  }, 2)
}

// Immediate next frame (frameCount = 0)
_.waited(() => {
  console.log('Runs on next animation frame')
})
```

**Common use cases:**
- Waiting for React/Vue state updates to render
- DOM measurements after dynamic content changes
- Ensuring animations start after layout calculations
- Synchronizing with the browser's render cycle

**Comparison with `setTimeout`:**
```javascript
// ❌ Bad: Arbitrary delay, may be too early or too late
setTimeout(() => {
  const height = element.offsetHeight  // May be wrong!
}, 100)

// ✅ Good: Waits for actual frame
_.waited(() => {
  const height = element.offsetHeight  // Accurate!
}, 1)
```

## All lodash functions

All original lodash functions are available as well. Refer to [lodash documentation](https://lodash.com/docs) for complete reference.
