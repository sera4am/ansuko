# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For changes prior to v2.0.0, see the [git history](https://github.com/sera4am/ansuko/commits/main).

## [Unreleased]

## [2.0.5] - 2026-06-24

## [2.0.4] - 2026-05-24

## [2.0.3] - 2026-05-08

## [2.0.2] - 2026-05-08

## [2.0.1] - 2026-05-08

### Added
- Added `_.isValidEmail` for strict email format validation in core utilities.
- Added documentation and examples for `_.isValidEmail` in README files.
- Added GitHub Actions workflow (`test.yml`) to run the test suite on every push and pull request.
- Added CI test status badge and npm version badge to all README files (EN/JA/ZH).

## [2.0.1] - 2026-05-08

### Added
- `CHANGELOG.md` based on the [Keep a Changelog](https://keepachangelog.com/) format.
- `scripts/promote-changelog.sh` and an `npm version` lifecycle hook that
  promotes the `[Unreleased]` section to a versioned heading on every
  release. CHANGELOG updates are bundled into the same commit as the
  version bump automatically.
- `CLAUDE.md` documenting the release flow, plugin architecture, and
  conventions for future contributors (and for Claude Code sessions).

## [2.0.0] - 2026-05-08

### Removed (BREAKING)
- `_.extend(plugin)` API. Plugins are now loaded via side-effect imports
  (`import "ansuko/plugins/ja"`).

### Changed (BREAKING)
- Plugin loading: side-effect imports + TypeScript `declare module` merging.
  IDE autocompletion now works directly on `_` for all plugin methods —
  the previous `_.extend(plugin)` returned a new type but left the original
  `_` reference's type unchanged, so plugin methods never appeared in
  suggestions.
- `AnsukoType` now extends `Omit<LoDashStatic, "isEmpty" | "toNumber" |
  "castArray" | "extend">` instead of enumerating ~330 lodash methods by
  hand. lodash generics are preserved and `@types/lodash` updates flow
  through automatically.

### Added
- `_.__plugins: Set<string>` registry. Each plugin registers itself once
  and skips re-registration when imported from multiple modules.

### Migration

```ts
// v1
import _ from "ansuko"
import jaPlugin from "ansuko/plugins/ja"
const ansuko = _.extend(jaPlugin)
ansuko.kanaToFull("ｶﾞ")

// v2
import _ from "ansuko"
import "ansuko/plugins/ja"
_.kanaToFull("ｶﾞ")
```

If you previously chained `_.extend(a).extend(b)`, replace it with two
side-effect imports.

[Unreleased]: https://github.com/sera4am/ansuko/compare/v2.0.5...HEAD
[2.0.5]: https://github.com/sera4am/ansuko/releases/tag/v2.0.5
[2.0.4]: https://github.com/sera4am/ansuko/releases/tag/v2.0.4
[2.0.3]: https://github.com/sera4am/ansuko/releases/tag/v2.0.3
[2.0.2]: https://github.com/sera4am/ansuko/releases/tag/v2.0.2
[2.0.1]: https://github.com/sera4am/ansuko/releases/tag/v2.0.1
[2.0.1]: https://github.com/sera4am/ansuko/releases/tag/v2.0.1
[2.0.0]: https://github.com/sera4am/ansuko/releases/tag/v2.0.0
