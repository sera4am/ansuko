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
- No more `JSON.stringify("string")` returning `"\"string\""`
- No more `castArray(null)` returning `[null]`
- No more unsafe `JSON.parse()` without try-catch
- No more verbose `a == b ? a : defaultValue` patterns

## Key Features

### Enhanced lodash Functions

- **`isEmpty`** - Check if empty (numbers and booleans are NOT empty)
- **`castArray`** - Convert to array, returns `[]` for null/undefined

### Value Handling

- **`valueOr`** - Get value or default with Promise/function support
- **`equalsOr`** - Compare and fallback with intuitive nil handling
- **`changes`** - Track object differences for DB updates

### Type Conversion

- **`toNumber`** - Parse numbers with comma support, returns `null` for invalid
- **`boolIf`** - Safe boolean conversion with fallback

### JSON Processing

- **`parseJSON`** - Safe JSON/JSON5 parsing without try-catch
- **`jsonStringify`** - Stringify only valid objects, prevents accidental string wrapping

### Japanese Text

- **`kanaToFull`**, **`kanaToHira`**, **`hiraToKana`** - Japanese character conversion
- **`toHalfWidth`** - Full-width to half-width conversion
- **`isValidStr`** - Non-empty string validation

### Utilities

- **`waited`** - Delay execution by N animation frames

## Documentation

For detailed information, see:

- **[API Reference](./API.md)** - Complete API documentation with examples
- **[Usage Guide](./Guide.md)** - Real-world examples and patterns

## TypeScript Support

Full TypeScript support with type definitions included. All functions are fully typed with generic support.

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