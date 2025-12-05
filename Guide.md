# Usage Guide

## TypeScript Support

Full TypeScript support with type definitions included:

```typescript
import _ from '@sera/ansuko'
import { valueOr, isEmpty, toNumber, equalsOr, parseJSON, changes, type ChangesOptions } from '@sera/ansuko'

// Type inference works perfectly
const result1: string = _.valueOr(null, 'default')
const result2: number = _.toNumber('1,234') ?? 0
const result3: boolean = _.isEmpty([])

// Generic support
interface User { name: string; age: number }
const user = _.parseJSON<User>(jsonString)  // User | null

// Options type
const opts: ChangesOptions = { keyExcludes: true }
const diff = _.changes(obj1, obj2, keys, opts)
```

## Real-world Examples

### API Response Handling

Safely handle API responses without try-catch and null checks:

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

Simplify configuration handling:

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

Clean up null/undefined handling in collections:

```javascript
// Before
const items = data.items
const processed = (items ? (Array.isArray(items) ? items : [items]) : [])
  .filter(Boolean)
  .map(process)

// After
const processed = _.castArray(data.items).map(process)
```

### Database Updates

Track and apply only changed fields:

```javascript
// Fetch original data from DB
const original = await db.users.findById(userId)

// User edits the data in UI
const edited = userFormData

// Get only changed fields
const updates = _.changes(original, edited, Object.keys(userSchema))

// Apply minimal update query
await db.users.update(userId, updates)
```

### Sensitive Field Exclusion

Exclude certain fields from diff tracking:

```javascript
// Get all changes except password and API keys
const safeChanges = _.changes(original, updated, ['password', 'apiKey', 'secret'], { 
  keyExcludes: true 
})

// Only non-sensitive fields are in the result
```

### Form Validation with Defaults

Validate form data with intuitive defaults:

```javascript
const formData = {
  name: valueOr(form.name, 'Anonymous'),
  age: toNumber(form.age) ?? 18,
  active: boolIf(form.active, false),
  email: valueOr(form.email, 'no-email@example.com')
}
```

### Safe JSON Configuration

Load and save JSON without errors:

```javascript
// Safe load
const config = _.parseJSON(fs.readFileSync('config.json', 'utf8')) ?? defaultConfig

// Safe stringify for storage
const saved = _.jsonStringify(userPreferences)
if (saved) {
  fs.writeFileSync('prefs.json', saved)
}
```

### Japanese Text Normalization

Handle various Japanese text encodings:

```javascript
// User input from different sources
const input1 = 'ｱｲｳｴｵ'  // half-width katakana
const input2 = 'あいうえお'  // hiragana
const input3 = 'アイウエオ'  // katakana

// Normalize to full-width katakana
const normalized = [
  _.kanaToFull(input1),
  _.hiraToKana(input2),
  input3
]

// All now: 'アイウエオ'
```

## Common Patterns

### Chaining Operations

Combine ansuko utilities for powerful transformations:

```javascript
// Parse JSON, extract number field, provide default
const timeout = _.toNumber(
  _.valueOr(
    _.parseJSON(configStr)?.timeout,
    '5000'
  )
) ?? 30000

// Or chain with lodash
const validUsers = _.chain(users)
  .map(user => ({
    ...user,
    age: _.toNumber(user.age) ?? 0
  }))
  .filter(user => _.isEmpty(user.name) === false)
  .value()
```

### Validating Nullable Inputs

Safe handling of potentially null values:

```javascript
function processUser(user) {
  const name = _.valueOr(user?.name, 'Unknown')
  const age = _.toNumber(user?.age) ?? 0
  const email = _.equalsOr(user?.email, '', 'no-email@example.com')
  
  return { name, age, email }
}
```

### Lazy Computation

Avoid expensive operations when not needed:

```javascript
// expensiveCalculation() only runs if config.value is nil
const result = _.valueOr(
  config.value,
  () => expensiveCalculation()
)

// Promise evaluation
const data = await _.valueOr(
  cache.get('key'),
  () => fetchFromAPI()
)
```

### Conditional Updates

Build update objects dynamically:

```javascript
const updates = {}

if (hasChanges) {
  Object.assign(updates, _.changes(original, edited, changedKeys))
}

if (updates.count > 0) {
  await db.update(record, updates)
}
```

## Migration from lodash

### isEmpty

```javascript
// lodash
if (_.isEmpty(0)) { /* runs but shouldn't */ }

// ansuko
if (_.isEmpty(0)) { /* doesn't run - correct! */ }
```

### castArray

```javascript
// lodash
_.castArray(null)  // => [null]

// ansuko
_.castArray(null)  // => []
```

### No more try-catch for JSON

```javascript
// lodash way
let data
try {
  data = JSON.parse(str)
} catch (e) {
  data = null
}

// ansuko way
const data = _.parseJSON(str)
```

## Performance Considerations

### `changes` with Large Objects

For large objects, be specific with keys:

```javascript
// Good: specific keys
const changes = _.changes(large, updated, ['field1', 'field2'])

// Expensive: scan all keys
const changes = _.changes(large, updated, Object.keys(large), { keyExcludes: false })
```

### Promise Handling

Use async/await for Promise-aware functions:

```javascript
// Both work
const result = _.valueOr(promise, default)  // returns Promise<T> | default
const result = await _.valueOr(promise, default)  // unwraps to T | default
```

### JSON Parsing

For frequently parsed JSON, cache the result:

```javascript
const data = memoize(() => _.parseJSON(jsonStr))
```