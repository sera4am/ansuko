# Usage Guide

Practical examples and patterns for using ansuko in real-world applications.

[English](./Guide.md) | [日本語](./Guide.ja.md)

## Table of Contents

- [TypeScript Support](#typescript-support)
- [Real-world Examples](#real-world-examples)
  - [API Response Handling](#api-response-handling)
  - [Smart Dialog Closing](#smart-dialog-closing)
  - [Config Validation](#config-validation)
  - [Safe Array Operations](#safe-array-operations)
  - [Text Search and Comparison](#text-search-and-comparison)
  - [Database Updates](#database-updates)
  - [Japanese Address Forms](#japanese-address-form-normalization)
- [Common Patterns](#common-patterns)
- [Advanced Techniques](#advanced-patterns-with-valueor-and-equalsor)
- [Migration from lodash](#migration-from-lodash)
- [Performance Considerations](#performance-considerations)
- [React Integration](#react-integration-notes)

## Overview

This guide demonstrates practical uses of ansuko for common development scenarios. All examples are production-ready and battle-tested in real applications.

## TypeScript Support

Full TypeScript support with type definitions included:

```typescript
import _ from 'ansuko'
import { valueOr, isEmpty, toNumber, equalsOr, parseJSON, changes, haifun, type ChangesOptions } from 'ansuko'

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

### Smart Dialog Closing

Handle "unsaved changes" dialogs elegantly with automatic Promise handling:

```javascript
// Traditional way - verbose and error-prone
const handleClose = async () => {
  if (_.isEqual(original, edited)) {
    // No changes, close immediately
    closeDialog()
  } else {
    // Has changes, show confirmation
    const confirmed = await showConfirmDialog()
    if (confirmed) {
      closeDialog()
    }
  }
}

// ansuko way - clean and intuitive
const handleClose = () => {
  // equalsOr automatically handles both sync and async cases
  // If equal: returns original immediately (sync), then closes
  // If different: calls showConfirmDialog (async), waits for result, then closes
  _.equalsOr(original, edited, showConfirmDialog).then(closeDialog)
}

// Even more concise with inline arrow function
const handleClose = () => 
  _.equalsOr(original, edited, showConfirmDialog).then(closeDialog)
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
const processed = _.castArray(data.items)?.map(process) ?? []
```

### Text Search and Comparison

Normalize dashes/hyphens for reliable text matching:

```javascript
// Problem: user searches for "東京-大阪" but database has "東京―大阪" (different dash)
const userQuery = "東京-大阪"
const dbRecord = "東京―大阪"
userQuery === dbRecord  // => false (no match!)

// Solution: normalize before comparison
const normalizedQuery = _.haifun(userQuery)
const normalizedRecord = _.haifun(dbRecord)
normalizedQuery === normalizedRecord  // => true (match!)

// Database search with normalization
app.get('/search', (req, res) => {
  const query = _.haifun(req.query.q)
  const results = db.products.filter(p => 
    _.haifun(p.name).includes(query) ||
    _.haifun(p.sku).includes(query)
  )
  res.json(results)
})
```

### Product Code Deduplication

Detect duplicate SKUs/part numbers with different dash types:

```javascript
const products = [
  { sku: 'ABC-123-XYZ', name: 'Widget A' },
  { sku: 'ABC—123—XYZ', name: 'Widget B' },  // em dash
  { sku: 'DEF-456', name: 'Gadget' },
]

// Find duplicates by normalized SKU
const normalized = products.map(p => ({
  ...p,
  normalizedSku: _.haifun(p.sku)
}))

const duplicates = _.groupBy(normalized, 'normalizedSku')
const hasDuplicates = Object.values(duplicates).some(group => group.length > 1)

// Result: ABC-123-XYZ and ABC—123—XYZ are detected as duplicates
```

### Address Matching

Compare addresses with inconsistent dash formatting:

```javascript
const addresses = [
  '123-4567 Tokyo',      // hyphen-minus
  '123−4567 Tokyo',      // minus sign
  '123–4567 Tokyo',      // en dash
]

// Normalize for comparison
const normalized = addresses.map(addr => _.haifun(addr))
// All become: '123‐4567 Tokyo'

// Deduplicate addresses
const unique = _.uniqBy(
  addresses.map(addr => ({ original: addr, normalized: _.haifun(addr) })),
  'normalized'
)
```

### CSV/Excel Data Cleaning

Clean imported data with inconsistent punctuation:

```javascript
// CSV import with mixed dash types
const csvData = [
  { productCode: 'A-001', price: '1,000' },
  { productCode: 'A—002', price: '2,000' },  // em dash from Excel
  { productCode: 'A−003', price: '3,000' },  // minus sign
]

// Normalize during import
const cleanData = csvData.map(row => ({
  productCode: _.haifun(row.productCode),
  price: _.toNumber(row.price)
}))

// Now all product codes use consistent dashes
```

### Database Updates with Deep Paths

Track and apply only changed fields, with support for nested properties:

```javascript
// Fetch original data from DB
const original = await db.users.findById(userId)

// User edits the data in UI
const edited = userFormData

// Get only changed fields (supports deep paths)
const updates = _.changes(original, edited, [
  'name',
  'email',
  'profile.bio',
  'profile.avatar',
  'settings.theme',
  'settings.notifications.email'
])

// Result is nested structure
// {
//   profile: { bio: 'new bio' },
//   settings: { theme: 'dark' }
// }

// Apply to object using lodash set
const updated = _.cloneDeep(original)
Object.entries(updates).forEach(([path, value]) => {
  _.set(updated, path, value)
})

// Or for MongoDB (supports dot notation natively)
await db.users.updateOne(
  { _id: userId },
  { $set: updates }  // MongoDB handles nested paths automatically
)

// For SQL databases, update top-level objects
await db.query(`
  UPDATE users 
  SET profile = $1, settings = $2 
  WHERE id = $3
`, [updates.profile, updates.settings, userId])
```

**Key features:**
- **Deep path support**: Use `'profile.bio'` to track nested changes
- **Nested results**: Returns structured objects for easy application
- **Database-friendly**: Works with MongoDB's dot notation or SQL JSON columns

### Sensitive Field Exclusion

Exclude certain fields from diff tracking (top-level keys only):

```javascript
// Get all changes except password and API keys
const safeChanges = _.changes(original, updated, ['password', 'apiKey', 'secret'], { 
  keyExcludes: true 
})

// Only non-sensitive top-level fields are in the result
// Note: keyExcludes mode works with top-level keys only, not deep paths

// For nested exclusions, use specific paths instead:
const updates = _.changes(original, updated, [
  'name',
  'email',
  'profile.bio',
  'profile.avatar'
  // Explicitly list what you want, excluding profile.privateNotes
])
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

### Japanese Address Form Normalization

Combat the legacy requirement of full-width input in Japanese address forms:

```javascript
// The problem: Many Japanese forms still require full-width input
// User types naturally: "ｱｲﾁｹﾝ ABC-1-23"
// Form rejects it: "全角で入力してください" (Please enter in full-width)

// The solution: Accept any input, normalize on the client side
const userInput = formField.value  // "東京都千代田区ｺｳｴﾝ町1-23"
const normalized = _.toFullWidth(userInput, 'ー')
// Result: "東京都千代田区コウエン町１ー２ー３"

// Real-world form handler
function handleAddressSubmit(e) {
  e.preventDefault()
  const address = _.toFullWidth(e.target.address.value, 'ー')
  const postalCode = _.toFullWidth(e.target.postalCode.value, 'ー')
  
  const errors = await _.valueOr(getValidateErrors(address, postalCode), () => api.submitAddress({address, postalCode}))
  if (errors) {
    // Other validate errors handling
  }
}

// No validation errors, no user frustration
```

**Why this matters:**
- Users can type naturally (copy-paste works!)
- No frustrating validation errors
- System handles normalization automatically
- Works with any input: half-width, full-width, mixed

**Full-width to half-width (for modern systems):**

```javascript
// Modern APIs prefer half-width for compatibility
const legacyInput = 'ＡＢＣー１２３'  // From old database
const modernFormat = _.toHalfWidth(legacyInput, '-')
// Result: 'ABC-123'

// Clean up imported data
const modernized = legacyAddresses.map(addr => ({
  ...addr,
  address: _.toHalfWidth(addr.address, '-'),
  building: _.toHalfWidth(addr.building, '-')
}))
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

// Convert to half-width (legacy system compatibility)
_.kanaToHalf('アイウエオ')  // => 'ｱｲｳｴｵ'
_.kanaToHalf('ガギグゲゴ')  // => 'ｶﾞｷﾞｸﾞｹﾞｺﾞ' (with combining marks)
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
async function processUser(user) {
  const name = _.valueOr(formatName(user?.name), () => appendInvalidParameter("name"))
  const age = _.toNumber(user?.age) ?? -1
  const email = await _.equalsOr(getEmailFromApi, '', () => appendInvalidParameter("email"))
  
  if(invalidParameters) { /* ... */ }

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

// Promise evaluation - automatically handled
const data = await _.valueOr(
  cache.get('key'),
  () => fetchFromAPI()  // Only called if cache miss
)

```

### Conditional Updates

Build update objects dynamically:

```javascript
const updates = {}

if (hasChanges) {
  Object.assign(updates, _.changes(original, edited, changedKeys))
}

if (Object.keys(updates).length > 0) {
  await db.update(record, updates)
}
```

## Plugin Usage Patterns

### Loading Multiple Plugins

```typescript
import _ from 'ansuko'
import jaPlugin from 'ansuko/plugins/ja'
import geoPlugin from 'ansuko/plugins/geo'
import prototypePlugin from 'ansuko/plugins/prototype'

// Chain plugins for full functionality
const extended = _
  .extend(jaPlugin)
  .extend(geoPlugin)
  .extend(prototypePlugin)

// Now you have everything
extended.kanaToHira('アイウ')                    // Japanese
extended.toPointGeoJson([139.7, 35.6])         // Geo
[1,2,3].notFilter(n => n % 2)                   // Prototype
extended.valueOr(null, 'default')               // Core
```

### Conditional Plugin Loading

Only load plugins when needed to optimize bundle size:

```typescript
// Core app - minimal bundle
import _ from 'ansuko'

// Japanese input form - add ja plugin
if (needsJapaneseInput) {
  const jaPlugin = await import('ansuko/plugins/ja')
  _.extend(jaPlugin.default)
}

// Map view - add geo plugin
if (showingMap) {
  const geoPlugin = await import('ansuko/plugins/geo')
  _.extend(geoPlugin.default)
}
```

### Creating Custom Plugins

```typescript
// Define a custom plugin
const myPlugin = (ansuko) => {
  const customFunction = (value) => {
    // Your logic using ansuko utilities
    return ansuko.isEmpty(value) ? 'empty' : value
  }
  
  // Extend ansuko
  ansuko.customFunction = customFunction
  
  return ansuko
}

// Use your plugin
const extended = _.extend(myPlugin)
extended.customFunction(null)  // 'empty'
```

## GeoJSON Workflows

### Converting User Input to GeoJSON

```typescript
import _ from 'ansuko'
import geoPlugin from 'ansuko/plugins/geo'

const extended = _.extend(geoPlugin)

// User inputs various formats
const userInputs = [
  [139.7671, 35.6812],                    // Array
  { lat: 35.6895, lng: 139.6917 },        // Object
  '{"type":"Point","coordinates":[...]}', // JSON string
]

// Convert all to GeoJSON Point
const points = userInputs
  .map(input => extended.toPointGeoJson(input))
  .filter(Boolean)  // Remove nulls
```

### Building GeoJSON Features

```typescript
// Create a feature collection from database records
const trees = await db.trees.find({ city: 'Tokyo' })

const features = trees
  .map(tree => {
    const point = extended.toPointGeoJson([tree.lng, tree.lat])
    if (!point) return null
    
    return {
      type: 'Feature',
      geometry: point,
      properties: {
        id: tree.id,
        species: tree.species,
        height: tree.height
      }
    }
  })
  .filter(Boolean)

const featureCollection = {
  type: 'FeatureCollection',
  features
}
```

### Polygon Operations

```typescript
// Merge overlapping administrative zones
const zone1 = await db.getZonePolygon('zone-1')
const zone2 = await db.getZonePolygon('zone-2')
const zone3 = await db.getZonePolygon('zone-3')

const mergedZone = extended.unionPolygon([zone1, zone2, zone3])

// Save merged boundary
await db.boundaries.insert({
  name: 'merged-zone',
  geometry: mergedZone
})
```

## Performance Considerations

`valueOr` and `equalsOr` automatically detect Promises:

```javascript
// Synchronous - returns immediately
const result1 = _.valueOr('value', 'default')  // 'value'
const result2 = _.equalsOr('a', 'a', 'default')  // 'a'

// Asynchronous - returns Promise
const result3 = await _.valueOr(asyncGetValue(), 'default')
const result4 = await _.equalsOr(asyncCheck(), 'expected', 'default')

// Mixed - automatically becomes Promise
const result5 = await _.equalsOr(syncValue, asyncValue, 'default')
```


### Advanced Patterns with valueOr and equalsOr

Smart fallback chains with lazy evaluation and automatic Promise handling:
```javascript
// Validation → Submit (returns errors if validation fails, undefined if successful)
const errors = await _.valueOr(validate(), () => api.submit())

// Cache hit → API fetch (try cache first, fetch on miss)
const data = await _.valueOr(cache.get(key), () => api.fetch(key))

// Local config → Remote config (prefer local, fallback to API)
const config = await _.valueOr(localStorage.get('config'), () => api.getConfig())

// Check changes → Confirm and Save Execution (Asynchronous) → Close (skip confirm and save if unchanged)
_.equalsOr(original, edited, () => confirmAndSave()).then(doClose)
// or
const uid = original.uid // id = unique data identifier, id = sequential number of table
const diff = _.changes(original edited, ["id", "created_at", "updated_at"], {excludeKeys: true}) // get changed data without id, created_at, updated_at
_.valueOr(!diff, () => confirmAndSave({...diff, uid})).then(onClose)

// For the enlightened: Permission-gated execution (returns true if denied, result if executed)
const resultOrNotAccepted = await _.valueOr(!checkPermission(), () => executeAction())
if (resultOrNotAccepted === true) {
  // Permission denied, action not executed
} else {
  // Action executed, process result
  handleResult(resultOrNotAccepted)
}
```

**Key benefits:**
- **Concise**: Complex logic in a single expression
- **Lazy evaluation**: Fallback functions only run when needed
- **Promise-aware**: Handles sync and async seamlessly
- **Type-safe**: Return types are well-defined


## Migration from lodash

### isEmpty

```javascript
// lodash
if (_.isEmpty(0)) { /* runs but shouldn't */ }

// ansuko
if (_.isEmpty(0)) { /* doesn't run - correct! */ }
  /* call original if you want */
if(_.isEmptyOrg(0)) { /* run */}
```

### castArray

```javascript
// lodash
_.castArray(null)  // => [null]

// ansuko
_.castArray(null)  // => []
  /* call original if you want */
_.castArrayOrg(null) // => [null]
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
if(!data) { /** error process **/ }

// ansuko way (return null when a problem)
const data = _.parseJSON(str)
if (!data) { /** error process **/ }
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

### JSON Parsing

For frequently parsed JSON, cache the result:

```javascript
const data = memoize(() => _.parseJSON(jsonStr))
```

### Text Normalization

For bulk operations, consider normalizing once and caching:

```javascript
// Normalize database records once
const normalizedProducts = products.map(p => ({
  ...p,
  searchableName: _.haifun(p.name),
  searchableSku: _.haifun(p.sku)
}))

// Then search on pre-normalized fields
const results = normalizedProducts.filter(p =>
  p.searchableName.includes(_.haifun(query))
)
```

### Waiting for React State Updates

Use `waited` instead of `setTimeout` to ensure state changes are rendered. Frame-based timing adapts to actual rendering cycles regardless of device performance, eliminating both premature execution and unnecessary delays.


```javascript
// ❌ Before: unreliable timing, dependent on machine speed
function handleUpdate() {
  setData(newData)
  setTimeout(() => {
    // May execute before rendering completes on slow devices
    // May wait unnecessarily long on fast devices
    scrollToElement()
  }, 100)  // Arbitrary number!
}

// ✅ After: waits for actual render, adapts to device
function handleUpdate() {
  setData(newData)
  _.waited(() => {
    scrollToElement()  // guaranteed to run after render
  }, 1)  // Wait 2 frames (1 RAF + 1 more)
}

// Multiple state updates
function handleComplexUpdate() {
  setStep1(data1)
  _.waited(() => {
    setStep2(data2)
    _.waited(() => {
      triggerAnimation()
    }, 2)  // wait 2 frames for heavy render
  }, 1)
}

// DOM measurements after state change
function measureElement() {
  setExpanded(true)
  _.waited(() => {
    const height = elementRef.current.offsetHeight  // accurate measurement
    startAnimation(height)
  }, 1)
}

// Chained animations
function sequentialAnimations() {
  playAnimation1()
  _.waited(() => {
    playAnimation2()
    _.waited(() => {
      playAnimation3()
    }, 1)
  }, 1)
}
```

**Why `waited` is better than `setTimeout`:**
- **No arbitrary delays**: Frame count, not milliseconds
- **Device-independent**: Fast machines don't wait unnecessarily, slow machines don't break
- **Render-synchronized**: Executes after actual DOM updates
- **No race conditions**: Guaranteed to run after paint cycle

## React Integration Notes

### Why not use valueOr/equalsOr directly in JSX?

```tsx
// ❌ Don't do this - will cause issues
<InputField value={_.valueOr(user?.name, GetNameAPI)} />

// ✅ Use useState + useEffect instead
const [userName, setUserName] = useState('')

useEffect(() => {
  _.valueOr(user?.name, GetNameAPI).then(setUserName)
}, [user?.name])

<InputField value={userName} />
```

The issue: React expects stable values in props. If you pass a Promise directly or call functions during render, it can cause re-render loops or unexpected behavior. Always resolve values in `useEffect` or custom hooks.