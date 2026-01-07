import _ from "lodash";
import JSON5 from "json5";
import { toHalfWidth } from "./util.js";
/**
 * Checks if the value is a non-empty string. null/undefined/empty string -> false.
 * @param str - Value to check
 * @returns true if non-empty string
 * @example isValidStr('hello') // true
 * @example isValidStr('') // false
 * @category Type Guards
 */
const isValidStr = (str) => {
    if (_.isNil(str)) {
        return false;
    }
    if (_.isEmpty(str)) {
        return false;
    }
    return typeof str === "string";
};
const valueOr = (value, els) => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? value()
        : value;
    // Promiseかチェック
    if (resolvedValue instanceof Promise) {
        return Promise.resolve(resolvedValue).then(res => {
            if (_.isNil(res) || isEmpty(res)) {
                if (typeof els === "function") {
                    return els();
                }
                return els;
            }
            return res;
        });
    }
    if (!_.isNil(resolvedValue) && !isEmpty(resolvedValue)) {
        return resolvedValue;
    }
    if (typeof els === "function") {
        return els();
    }
    return els;
};
const emptyOr = (value, els) => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? value()
        : value;
    // Promiseかチェック
    if (resolvedValue instanceof Promise) {
        return Promise.resolve(resolvedValue).then(res => {
            if (_.isNil(res) || isEmpty(res)) {
                return null;
            }
            if (typeof els === "function") {
                return els(res);
            }
            return els;
        });
    }
    if (_.isNil(resolvedValue) || isEmpty(resolvedValue)) {
        return null;
    }
    if (typeof els === "function") {
        return els(resolvedValue);
    }
    return els;
};
/**
 * Ensures that all given paths exist on the resolved value; otherwise returns a default.
 * Supports functions and Promises.
 * @param value - Object or thunk
 * @param paths - Paths to check
 * @param els - Default value or thunk receiving the resolved value
 * @returns Value or default
 * @example await hasOr(fetchUser(), ['profile.name','id'], null)
 * @example hasOr({a:{b:1}}, 'a.b', {}) // returns original object
 * @category Promise Utilities
 */
const hasOr = (value, paths, els) => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? value()
        : value;
    const pathArray = Array.isArray(paths) ? paths : [paths];
    // パスが全て存在するかチェック
    const checkPaths = (val) => {
        if (_.isNil(val) || isEmpty(val))
            return false;
        return pathArray.every(path => _.has(val, path));
    };
    // Promiseかチェック
    if (resolvedValue instanceof Promise) {
        return Promise.resolve(resolvedValue).then(res => {
            if (!checkPaths(res)) {
                if (typeof els === "function") {
                    return els(res);
                }
                return els;
            }
            return res;
        });
    }
    if (!checkPaths(resolvedValue)) {
        if (typeof els === "function") {
            return els(resolvedValue);
        }
        return els;
    }
    return resolvedValue;
};
/**
 * Checks emptiness with intuitive rules: numbers and booleans are NOT empty.
 * @param value - Value to check
 * @returns true if empty
 * @example isEmpty(0) // false
 * @example isEmpty([]) // true
 * @category Core Functions
 */
const isEmpty = (value) => {
    if (_.isNil(value)) {
        return true;
    }
    if (_.isNumber(value)) {
        return false;
    }
    if (_.isBoolean(value)) {
        return false;
    }
    return _.isEmpty(value);
};
/**
 * Converts a value to number (full-width and comma aware). Returns null when invalid.
 * @param value - Value to convert
 * @returns number or null
 * @example toNumber('1,234.5') // 1234.5
 * @example toNumber('１２３') // 123
 * @example toNumber('abc') // null
 * @category Core Functions
 */
const toNumber = (value) => {
    if (_.isNil(value)) {
        return null;
    }
    if (_.isNumber(value)) {
        return value;
    }
    if (isEmpty(value)) {
        return null;
    }
    let v = toHalfWidth(value);
    if (typeof v === "string" && v.trim().match(/^[0-9][0-9,.]*$/)) {
        v = _.toNumber(v.trim().replace(/,/g, ""));
    }
    else {
        v = _.toNumber(v);
    }
    return _.isNaN(v) ? null : v;
};
/**
 * Converts various inputs to boolean. Numbers: 0 -> false, non-zero -> true.
 * Strings: 'true'|'t'|'y'|'yes'|'ok' -> true; 'false'|'f'|'n'|'no'|'ng' -> false.
 * If a function or Promise is provided, it will be resolved recursively.
 * Returns the `undetected` fallback when the value cannot be interpreted (default null).
 * @param value - Value, thunk, or Promise
 * @param undetected - Fallback when value cannot be interpreted (default null)
 * @returns boolean or null (sync or Promise)
 * @category Core Functions
 */
const toBool = (value, undetected = null) => {
    if (_.isNil(value)) {
        return false;
    }
    if (isEmpty(value)) {
        return false;
    }
    if (_.isBoolean(value)) {
        return value;
    }
    if (_.isNumber(value)) {
        return value !== 0;
    }
    const n = toNumber(value);
    if (n !== null)
        return !!n;
    if (typeof value === "string") {
        switch (value.toLowerCase()) {
            case "true":
            case "t":
            case "y":
            case "yes":
            case "ok":
                return true;
            case "false":
            case "f":
            case "n":
            case "no":
            case "ng":
                return false;
            default:
        }
    }
    if (typeof value === "function") {
        const r = value();
        if (r instanceof Promise) {
            return r.then(toBool);
        }
        return toBool(r);
    }
    return undetected;
};
/**
 * Safely converts to boolean; numbers use zero check; otherwise returns the provided default.
 * @param value - Value
 * @param defaultValue - Default when value is not number/boolean (false)
 * @returns boolean
 * @example boolIf(1) // true
 * @example boolIf('x', true) // true
 * @category Core Functions
 */
const boolIf = (value, defaultValue = false) => {
    if (_.isBoolean(value)) {
        return value;
    }
    if (_.isNumber(value)) {
        return !!value;
    }
    return defaultValue;
};
/**
 * Runs a function after N frames using requestAnimationFrame.
 * @param func - Function to run
 * @param frameCount - Frames to wait (default 0)
 * @example waited(() => doMeasure(), 1)
 * @example waited(startAnimation, 2)
 * @category Core Functions
 */
const waited = (func, frameCount = 0) => {
    requestAnimationFrame(() => {
        if (frameCount > 0) {
            return waited(func, frameCount - 1);
        }
        func();
    });
};
/**
 * Compares two values; if equal returns the value, otherwise returns the default.
 * null and undefined are considered equal. Promise-aware.
 * @param param1 - First value (or thunk/promise)
 * @param param2 - Second value (or thunk/promise)
 * @param els - Default value (or thunk)
 * @returns Value or default (sync or Promise)
 * @example equalsOr('a','a','d') // 'a'
 * @example await equalsOr(fetchStatus(),'ok','ng')
 * @example equalsOr(null, undefined, 'd') // null
 * @category Promise Utilities
 */
const equalsOr = (...args) => {
    if (args.length === 2) {
        return valueOr(args[0], args[1]);
    }
    const [param1, param2, els] = args;
    // 関数を解決するヘルパー
    const resolveIfFunction = (val) => {
        return typeof val === "function" ? val() : val;
    };
    // Promiseが含まれているかチェック
    const p1 = resolveIfFunction(param1);
    const p2 = resolveIfFunction(param2);
    const hasPromise = (p1 instanceof Promise) || (p2 instanceof Promise) || (els instanceof Promise);
    if (hasPromise) {
        // Promise処理ブランチ
        return Promise.all([
            Promise.resolve(p1),
            Promise.resolve(p2)
        ]).then(([v1, v2]) => {
            if (_.isNil(v1) && _.isNil(v2)) {
                return null;
            }
            if (_.isEqual(v1, v2)) {
                return v1;
            }
            // elsの解決
            if (typeof els === "function") {
                return els();
            }
            return els;
        });
    }
    else {
        // 同期処理ブランチ
        if (_.isNil(p1) && _.isNil(p2)) {
            return null;
        }
        if (_.isEqual(p1, p2)) {
            return p1;
        }
        // elsの解決
        if (typeof els === "function") {
            return els();
        }
        return els;
    }
};
/**
 * Safely parses JSON/JSON5; returns null on error; passes objects through.
 * @param str - String or object
 * @returns Parsed object or null
 * @example parseJSON('{"a":1}') // {a:1}
 * @example parseJSON('{a:1}') // {a:1} (JSON5)
 * @category Conversion
 */
const parseJSON = (str) => {
    if (_.isNil(str)) {
        return null;
    }
    if (typeof str === "object") {
        return str;
    }
    try {
        return JSON5.parse(str);
    }
    catch {
        return null;
    }
};
/**
 * Stringifies objects/arrays; returns null for strings or numbers.
 * @param obj - Target object
 * @returns JSON string or null
 * @example jsonStringify({a:1}) // '{"a":1}'
 * @example jsonStringify('{a:1}') // '{"a":1}' (normalize)
 * @category Conversion
 */
const jsonStringify = (obj) => {
    if (_.isNil(obj)) {
        return null;
    }
    if (typeof obj === "string") {
        try {
            const j = JSON5.parse(obj);
            return JSON.stringify(j);
        }
        catch {
            return null;
        }
    }
    if (typeof obj === "object") {
        try {
            return JSON.stringify(obj);
        }
        catch {
            return null;
        }
    }
    return null;
};
/**
 * Casts value to array; null/undefined become [] (not [null]).
 * @param value - Value
 * @returns Array
 * @example castArray(1) // [1]
 * @example castArray(null) // []
 * @category Array Utilities
 */
const castArray = (value) => {
    if (_.isNil(value)) {
        return [];
    }
    return _.castArray(value);
};
/**
 * Computes differences between two objects. Supports deep paths. When `keyExcludes` is true,
 * the provided keys are excluded (top-level only) from diffing.
 * @param sourceValue - Source object
 * @param currentValue - Current object
 * @param keys - Keys to check (deep paths allowed)
 * @param options - { keyExcludes } to treat keys as excludes (top-level only)
 * @param finallyCallback - Called after diff computation (always if notEmptyCallback returned truthy)
 * @param notEmptyCallback - Called only when diff is not empty
 * @returns Diff object
 * @example changes(o1,o2,['name','profile.bio'])
 * @example changes(orig, curr, ['id','created_at'], { keyExcludes:true })
 * @example await changes(a,b,['x'],{}, async diff => save(diff))
 * @example changes(
 *   { profile:{ tags:['a','b'] } },
 *   { profile:{ tags:['a','c'] } },
 *   ['profile.tags[1]']
 * ) // => { profile:{ tags:{ 1:'c' } } }
 * @category Object Utilities
 */
const changes = (sourceValue, currentValue, keys, options, finallyCallback, notEmptyCallback) => {
    const diff = {};
    // keyExcludes時にdeep pathが指定されていたら警告
    if (options?.keyExcludes === true) {
        const hasDeepPath = keys.some(k => k.includes('.') || k.includes('['));
        if (hasDeepPath) {
            console.warn('[ansuko.changes] keyExcludes mode does not support deep paths. ' +
                'Keys with "." or "[" will be treated as literal property names.');
        }
    }
    const targetKeys = options?.keyExcludes === true
        ? _.difference(_.uniq([...Object.keys(sourceValue), ...Object.keys(currentValue)]), keys)
        : keys;
    for (const key of targetKeys) {
        const v1 = options?.keyExcludes === true ? sourceValue[key] : _.get(sourceValue, key);
        const v2 = options?.keyExcludes === true ? currentValue[key] : _.get(currentValue, key);
        if (_.isNil(v1) && _.isNil(v2))
            continue;
        if (_.isNil(v1) || _.isNil(v2)) {
            if (options?.keyExcludes === true) {
                diff[key] = v2 ?? null;
            }
            else {
                _.set(diff, key, v2 ?? null);
            }
            continue;
        }
        if (!_.isEqual(v1, v2)) {
            if (options?.keyExcludes === true) {
                diff[key] = v2 ?? null;
            }
            else {
                _.set(diff, key, v2 ?? null);
            }
        }
    }
    let notEmptyRes = true;
    if (!isEmpty(diff) && notEmptyCallback) {
        notEmptyRes = notEmptyCallback(diff);
        if (notEmptyRes instanceof Promise) {
            return notEmptyRes.then(async (res) => {
                res && await Promise.resolve(finallyCallback?.(diff, res));
                return diff;
            });
        }
    }
    if (finallyCallback && notEmptyRes) {
        const finallyRes = finallyCallback(diff, notEmptyRes);
        if (finallyRes instanceof Promise) {
            return finallyRes.then(() => diff);
        }
    }
    return diff;
};
/**
 * Returns nesting depth of arrays. Non-array: 0; empty array: 1. Uses minimum depth for mixed nesting.
 * @param ary - Array
 * @returns Depth
 * @example arrayDepth([1]) // 1
 * @example arrayDepth([[1],[2]]) // 2
 * @example arrayDepth([[[1]]]) // 3
 * @example arrayDepth([[1,2], [[3],[4,5]]]) // 2 (uses minimum depth)
 * @example arrayDepth([]) // 1
 * @example arrayDepth('not array') // 0
 * @category Array Utilities
 */
const arrayDepth = (ary) => {
    if (!Array.isArray(ary)) {
        return 0;
    }
    if (_.size(ary) === 0) {
        return 1;
    }
    return 1 + Math.min(...ary.map(arrayDepth));
};
/**
 * Extends ansuko with a plugin and returns the augmented instance.
 * @param plugin - Plugin function
 * @returns Extended instance
 * @example const extended = _.extend(jaPlugin)
 * @category Core Functions
 */
const extend = function (plugin) {
    if (typeof plugin === 'function') {
        plugin(this); // ← this が undefined になってる？
    }
    return this;
};
// Ansuko型へのキャストを外し、より安全な unknown as LoDashStatic に変更
export default {
    ..._,
    extend,
    isEmptyOrg: _.isEmpty,
    toNumberOrg: _.toNumber,
    castArrayOrg: _.castArray,
    isEmpty,
    toNumber,
    toBool,
    boolIf,
    isValidStr,
    valueOr,
    equalsOr,
    emptyOr,
    hasOr,
    waited,
    parseJSON,
    jsonStringify,
    castArray,
    changes,
    arrayDepth,
};
// 個別エクスポートはそのまま
export { isEmpty, toNumber, boolIf, isValidStr, valueOr, equalsOr, waited, parseJSON, jsonStringify, castArray, changes, arrayDepth, };
