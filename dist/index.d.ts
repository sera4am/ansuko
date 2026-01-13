import _ from "lodash";
/**
 * Checks if the value is a non-empty string. null/undefined/empty string -> false.
 * @param str - Value to check
 * @returns true if non-empty string
 * @example isValidStr('hello') // true
 * @example isValidStr('') // false
 * @category Type Guards
 */
declare const isValidStr: (str: unknown) => str is string;
/**
 * Returns value or a default. Detects functions and Promises automatically.
 * @param value - Value or thunk
 * @param els - Default value or thunk
 * @returns Value or default
 * @example valueOr('v','d') // 'v'
 * @example valueOr(asyncFetch(), 'fallback') // Promise resolves to fetched or fallback
 * @example await valueOr(() => cache.get(id), () => api.fetch(id))
 * @category Promise Utilities
 */
type MaybePromise<T> = T | Promise<T>;
type MaybeFunction<T> = T | (() => MaybePromise<T>);
declare const valueOr: <T, E>(value: MaybeFunction<MaybePromise<T | null | undefined>>, els?: E | (() => MaybePromise<E>)) => MaybePromise<T | E | undefined | null>;
declare const emptyOr: <T, E>(value: MaybeFunction<MaybePromise<T | null | undefined>>, els?: E | ((val: T | null | undefined) => MaybePromise<E>)) => MaybePromise<T | E | undefined | null>;
/**
 * Checks emptiness with intuitive rules: numbers and booleans are NOT empty.
 * @param value - Value to check
 * @returns true if empty
 * @example isEmpty(0) // false
 * @example isEmpty([]) // true
 * @category Core Functions
 */
declare const isEmpty: (value: unknown) => boolean;
/**
 * Converts a value to number (full-width and comma aware). Returns null when invalid.
 * @param value - Value to convert
 * @returns number or null
 * @example toNumber('1,234.5') // 1234.5
 * @example toNumber('１２３') // 123
 * @example toNumber('abc') // null
 * @category Core Functions
 */
declare const toNumber: (value: unknown) => number | null;
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
declare const toBool: (value: unknown, undetected?: boolean | null) => MaybePromise<boolean | null>;
/**
 * Safely converts to boolean; numbers use zero check; otherwise returns the provided default.
 * @param value - Value
 * @param defaultValue - Default when value is not number/boolean (false)
 * @returns boolean
 * @example boolIf(1) // true
 * @example boolIf('x', true) // true
 * @category Core Functions
 */
declare const boolIf: (value: unknown, defaultValue?: boolean) => boolean;
/**
 * Runs a function after N frames using requestAnimationFrame.
 * @param func - Function to run
 * @param frameCount - Frames to wait (default 0)
 * @example waited(() => doMeasure(), 1)
 * @example waited(startAnimation, 2)
 * @category Core Functions
 */
declare const waited: (func: () => void, frameCount?: number) => void;
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
declare const equalsOr: <T, E>(...args: any[]) => MaybePromise<T | E | null>;
/**
 * Safely parses JSON/JSON5; returns null on error; passes objects through.
 * @param str - String or object
 * @returns Parsed object or null
 * @example parseJSON('{"a":1}') // {a:1}
 * @example parseJSON('{a:1}') // {a:1} (JSON5)
 * @category Conversion
 */
declare const parseJSON: <T = any>(str: string | object) => T | null;
/**
 * Stringifies objects/arrays; returns null for strings or numbers.
 * @param obj - Target object
 * @param replacer — A function that transforms the results.
 * @param space - Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @returns JSON string or null
 * @example jsonStringify({a:1}) // '{"a":1}'
 * @example jsonStringify('{a:1}') // '{"a":1}' (normalize)
 * @category Conversion
 */
declare const jsonStringify: <T = any>(obj: T, replacer?: ((this: any, key: string, value: any) => any) | undefined, space?: string | number | undefined) => string | null;
/**
 * Casts value to array; null/undefined become [] (not [null]).
 * @param value - Value
 * @returns Array
 * @example castArray(1) // [1]
 * @example castArray(null) // []
 * @category Array Utilities
 */
declare const castArray: <T>(value: T | T[] | null | undefined) => T[];
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
declare const changes: <T extends Record<string, any>, E extends Record<string, any>>(sourceValue: T, currentValue: E, keys: string[], options?: ChangesOptions, finallyCallback?: ChangesAfterFinallyCallback<Record<string, any>>, notEmptyCallback?: ChangesAfterCallback<Record<string, any>>) => Record<string, any>;
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
declare const arrayDepth: (ary: unknown) => number;
/**
 * Extends ansuko with a plugin and returns the augmented instance.
 * @param plugin - Plugin function
 * @returns Extended instance
 * @example const extended = _.extend(jaPlugin)
 * @category Core Functions
 */
declare const extend: <T>(this: any, plugin: (a: any) => T) => any & T;
export type ChangesOptions = {
    keyExcludes?: boolean;
};
type ChangesAfterCallback<T> = (value: T) => any | Promise<any>;
type ChangesAfterFinallyCallback<T> = (value: T, res: any) => any | Promise<any>;
export interface AnsukoType extends Omit<_.LoDashStatic, "castArray" | "isEmpty" | "toNumber"> {
    extend: typeof extend;
    isValidStr: typeof isValidStr;
    valueOr: typeof valueOr;
    emptyOr: typeof emptyOr;
    isEmpty: typeof isEmpty;
    toNumber: typeof toNumber;
    toBool: typeof toBool;
    boolIf: typeof boolIf;
    waited: typeof waited;
    equalsOr: typeof equalsOr;
    parseJSON: typeof parseJSON;
    jsonStringify: typeof jsonStringify;
    castArray: typeof castArray;
    changes: typeof changes;
    size: typeof _.size;
    isNil: typeof _.isNil;
    debounce: typeof _.debounce;
    isEqual: typeof _.isEqual;
    isBoolean: typeof _.isBoolean;
    isString: typeof _.isString;
    first: typeof _.first;
    last: typeof _.last;
    uniq: typeof _.uniq;
    has: typeof _.has;
    keys: typeof _.keys;
    values: typeof _.values;
    some: typeof _.some;
    arrayDepth: typeof arrayDepth;
    isEmptyOrg: typeof _.isEmpty;
    toNumberOrg: typeof _.toNumber;
    castArrayOrg: typeof _.castArray;
}
declare const _default: AnsukoType;
export default _default;
export { isEmpty, toNumber, boolIf, isValidStr, valueOr, equalsOr, waited, parseJSON, jsonStringify, castArray, changes, arrayDepth, };
