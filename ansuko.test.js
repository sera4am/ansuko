import _ from './dist/index.js'

// テストヘルパー
const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`❌ ${message}`)
    }
    console.log(`✅ ${message}`)
}

const assertEqual = (actual, expected, message) => {
    const isEqual = JSON.stringify(actual) === JSON.stringify(expected)
    if (!isEqual) {
        console.error(`Expected:`, expected)
        console.error(`Actual:`, actual)
        throw new Error(`❌ ${message}`)
    }
    console.log(`✅ ${message}`)
}

console.log('\n========== Core Functions Tests ==========\n')

// ========== isValidStr ==========
console.log('--- isValidStr ---')
assert(_.isValidStr('hello'), 'isValidStr("hello") should be true')
assert(_.isValidStr('0'), 'isValidStr("0") should be true')
assert(!_.isValidStr(''), 'isValidStr("") should be false')
assert(!_.isValidStr(null), 'isValidStr(null) should be false')
assert(!_.isValidStr(undefined), 'isValidStr(undefined) should be false')
assert(!_.isValidStr(123), 'isValidStr(123) should be false')

// ========== valueOr ==========
console.log('\n--- valueOr ---')
assertEqual(_.valueOr('value', 'default'), 'value', 'valueOr should return value when not nil')
assertEqual(_.valueOr(null, 'default'), 'default', 'valueOr should return default when null')
assertEqual(_.valueOr(undefined, 'default'), 'default', 'valueOr should return default when undefined')
assertEqual(_.valueOr('', 'default'), 'default', 'valueOr should return default when empty string')
assertEqual(_.valueOr([], 'default'), 'default', 'valueOr should return default when empty array')
assertEqual(_.valueOr(0, 'default'), "default", 'valueOr should return default when 0 value')

// Function as value
assertEqual(_.valueOr(() => 'computed', 'default'), 'computed', 'valueOr should resolve function value')
assertEqual(_.valueOr(() => null, 'default'), 'default', 'valueOr should use default when function returns null')

// Function as default
assertEqual(_.valueOr(null, () => 'lazy default'), 'lazy default', 'valueOr should resolve function default')

// ========== isEmpty ==========
console.log('\n--- isEmpty ---')
assert(_.isEmpty(null), 'isEmpty(null) should be true')
assert(_.isEmpty(undefined), 'isEmpty(undefined) should be true')
assert(_.isEmpty(''), 'isEmpty("") should be true')
assert(_.isEmpty([]), 'isEmpty([]) should be true')
assert(_.isEmpty({}), 'isEmpty({}) should be true')
assert(!_.isEmpty(0), 'isEmpty(0) should be false (number)')
assert(!_.isEmpty(-1), "isEmpty(-1) should be false (number)")
assert(!_.isEmpty(false), 'isEmpty(false) should be false (boolean)')
assert(!_.isEmpty('text'), 'isEmpty("text") should be false')
assert(!_.isEmpty([1, 2]), 'isEmpty([1,2]) should be false')
assert(!_.isEmpty({ a: 1 }), 'isEmpty({a:1}) should be false')

// ========== toNumber ==========
console.log('\n--- toNumber ---')
assertEqual(_.toNumber('123'), 123, 'toNumber("123") should be 123')
assertEqual(_.toNumber('１２３'), 123, 'toNumber("１２３") should be 123 (full-width)')
assertEqual(_.toNumber('1,234'), 1234, 'toNumber("1,234") should be 1234')
assertEqual(_.toNumber('1,234.56'), 1234.56, 'toNumber("1,234.56") should be 1234.56')
assertEqual(_.toNumber(456), 456, 'toNumber(456) should be 456')
assertEqual(_.toNumber(null), null, 'toNumber(null) should be null')
assertEqual(_.toNumber(undefined), null, 'toNumber(undefined) should be null')
assertEqual(_.toNumber('abc'), null, 'toNumber("abc") should be null')
assertEqual(_.toNumber(''), null, 'toNumber("") should be null')

// ========== boolIf ==========
console.log('\n--- boolIf ---')
assertEqual(_.boolIf(true), true, 'boolIf(true) should be true')
assertEqual(_.boolIf(false), false, 'boolIf(false) should be false')
assertEqual(_.boolIf(1), true, 'boolIf(1) should be true')
assertEqual(_.boolIf(0), false, 'boolIf(0) should be false')
assertEqual(_.boolIf('string'), false, 'boolIf("string") should be false (default)')
assertEqual(_.boolIf('string', true), true, 'boolIf("string", true) should be true (with default)')
assertEqual(_.boolIf(null), false, 'boolIf(null) should be false (default)')
assertEqual(_.boolIf(null, true), true, 'boolIf(null, true) should be true (with default)')

// ========== equalsOr ==========
console.log('\n--- equalsOr ---')
assertEqual(_.equalsOr('a', 'a', 'default'), 'a', 'equalsOr should return value when equal')
assertEqual(_.equalsOr('a', 'b', 'default'), 'default', 'equalsOr should return default when not equal')
assertEqual(_.equalsOr(null, null, 'default'), null, 'equalsOr should return null when both null')
assertEqual(_.equalsOr(null, undefined, 'default'), null, 'equalsOr should return null when both nil')
assertEqual(_.equalsOr({ a: 1 }, { a: 1 }, 'default'), { a: 1 }, 'equalsOr should deep equal objects')
assertEqual(_.equalsOr([1, 2], [1, 2], 'default'), [1, 2], 'equalsOr should deep equal arrays')

// 2-arg version (same as valueOr)
assertEqual(_.equalsOr('value', 'default'), 'value', 'equalsOr(2-arg) should work like valueOr')
assertEqual(_.equalsOr(null, 'default'), 'default', 'equalsOr(2-arg) should use default when null')

// ========== parseJSON ==========
console.log('\n--- parseJSON ---')
assertEqual(_.parseJSON('{"a":1}'), { a: 1 }, 'parseJSON should parse valid JSON')
assertEqual(_.parseJSON('{a:1}'), { a: 1 }, 'parseJSON should parse JSON5')
assertEqual(_.parseJSON('{"a":1,"b":"text"}'), { a: 1, b: "text" }, 'parseJSON should handle complex JSON')
assertEqual(_.parseJSON({ a: 1 }), { a: 1 }, 'parseJSON should return object as-is')
assertEqual(_.parseJSON('invalid'), null, 'parseJSON should return null for invalid JSON')
assertEqual(_.parseJSON(null), null, 'parseJSON should return null for null')

// ========== jsonStringify ==========
console.log('\n--- jsonStringify ---')
assertEqual(_.jsonStringify({ a: 1 }), '{"a":1}', 'jsonStringify should stringify object')
assertEqual(_.jsonStringify({ a: 1, b: "text" }), '{"a":1,"b":"text"}', 'jsonStringify should handle complex objects')
assertEqual(_.jsonStringify('{"a":1}'), '{"a":1}', 'jsonStringify should normalize JSON string')
assertEqual(_.jsonStringify('{a:1}'), '{"a":1}', 'jsonStringify should normalize JSON5 string')
assertEqual(_.jsonStringify(null), null, 'jsonStringify should return null for null')
assertEqual(_.jsonStringify(undefined), null, 'jsonStringify should return null for undefined')

// ========== castArray ==========
console.log('\n--- castArray ---')
assertEqual(_.castArray(1), [1], 'castArray(1) should be [1]')
assertEqual(_.castArray('string'), ['string'], 'castArray("string") should be ["string"]')
assertEqual(_.castArray([1, 2]), [1, 2], 'castArray([1,2]) should be [1,2]')
assertEqual(_.castArray(null), [], 'castArray(null) should be []')
assertEqual(_.castArray(undefined), [], 'castArray(undefined) should be []')
assertEqual(_.castArray({ a: 1 }), [{ a: 1 }], 'castArray({a:1}) should be [{a:1}]')

// ========== arrayDepth ==========
console.log('\n--- arrayDepth ---')
assertEqual(_.arrayDepth([1, 2, 3]), 1, 'arrayDepth([1,2,3]) should be 1')
assertEqual(_.arrayDepth([[1, 2], [3, 4]]), 2, 'arrayDepth([[1,2],[3,4]]) should be 2')
assertEqual(_.arrayDepth([[[1, 2]]]), 3, 'arrayDepth([[[1,2]]]) should be 3')
assertEqual(_.arrayDepth([[[[1]]]]), 4, 'arrayDepth([[[[1]]]]) should be 4')
assertEqual(_.arrayDepth([]), 1, 'arrayDepth([]) should be 1')
assertEqual(_.arrayDepth('not array'), 0, 'arrayDepth("not array") should be 0')
assertEqual(_.arrayDepth(null), 0, 'arrayDepth(null) should be 0')
assertEqual(_.arrayDepth([[1, 2], [[3, 4]]]), 2, 'arrayDepth (mixed) should return minimum depth')

// ========== changes ==========
console.log('\n--- changes ---')

const source1 = { a: 1, b: 2, c: 3 }
const current1 = { a: 1, b: 3, c: 3 }
const diff1 = _.changes(source1, current1, ['a', 'b', 'c'])
assertEqual(diff1, { b: 3 }, 'changes should detect changed values')

const source2 = { a: 1, b: 2 }
const current2 = { a: 1, b: 2, c: 3 }
const diff2 = _.changes(source2, current2, ['a', 'b', 'c'])
assertEqual(diff2, { c: 3 }, 'changes should detect new values')

const source3 = { a: 1, b: 2, c: 3 }
const current3 = { a: 1, b: 2 }
const diff3 = _.changes(source3, current3, ['a', 'b', 'c'])
assertEqual(diff3, { c: null }, 'changes should detect deleted values')

// Deep paths
const source4 = { user: { name: 'Alice', age: 30 } }
const current4 = { user: { name: 'Bob', age: 30 } }
const diff4 = _.changes(source4, current4, ['user.name', 'user.age'])
assertEqual(diff4, { user: { name: 'Bob' } }, 'changes should handle deep paths')

// keyExcludes mode
const source5 = { a: 1, b: 2, c: 3, d: 4 }
const current5 = { a: 1, b: 3, c: 4, d: 4 }
const diff5 = _.changes(source5, current5, ['a', 'd'], { keyExcludes: true })
assertEqual(diff5, { b: 3, c: 4 }, 'changes with keyExcludes should exclude specified keys')

// No changes
const source6 = { a: 1, b: 2 }
const current6 = { a: 1, b: 2 }
const diff6 = _.changes(source6, current6, ['a', 'b'])
assertEqual(diff6, {}, 'changes should return empty object when no changes')

// ========== Lodash passthrough ==========
console.log('\n--- Lodash passthrough ---')
assertEqual(_.size([1, 2, 3]), 3, 'lodash size should work')
assert(_.isNil(null), 'lodash isNil should work')
assert(!_.isNil('value'), 'lodash isNil should work for non-nil')
assert(_.isEqual({ a: 1 }, { a: 1 }), 'lodash isEqual should work')
assertEqual(_.first([1, 2, 3]), 1, 'lodash first should work')
assertEqual(_.last([1, 2, 3]), 3, 'lodash last should work')
assertEqual(_.uniq([1, 2, 2, 3]), [1, 2, 3], 'lodash uniq should work')
assert(_.has({ a: 1 }, 'a'), 'lodash has should work')
assertEqual(_.keys({ a: 1, b: 2 }), ['a', 'b'], 'lodash keys should work')
assertEqual(_.values({ a: 1, b: 2 }), [1, 2], 'lodash values should work')
assert(_.some([1, 2, 3], x => x > 2), 'lodash some should work')

// ========== Original lodash versions ==========
console.log('\n--- Original lodash versions ---')
assert(_.isEmptyOrg(''), 'isEmptyOrg should be original lodash isEmpty')
assert(_.isEmptyOrg(0), 'isEmptyOrg(0) should be true (original behavior)')
assertEqual(_.toNumberOrg('123'), 123, 'toNumberOrg should be original lodash toNumber')
assert(isNaN(_.toNumberOrg('abc')), 'toNumberOrg("abc") should be NaN (original behavior)')
assertEqual(_.castArrayOrg(1), [1], 'castArrayOrg should be original lodash castArray')

console.log('\n========== All Core Tests Passed! 🎉 ==========\n')