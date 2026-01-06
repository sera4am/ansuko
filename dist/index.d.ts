import _ from "lodash";
/**
 * 非空文字列かを判定します。null/undefined/空文字はfalse。
 * Checks if the value is a non-empty string.
 * @param str - 判定する値 / Value to check
 * @returns 非空文字列ならtrue / true if non-empty string
 * @example isValidStr('hello') // true
 * @example isValidStr('') // false
 * @category Type Guards
 */
declare const isValidStr: (str: unknown) => str is string;
/**
 * 値を取得し、null/undefined/空ならデフォルト値を返します。関数・Promiseを自動判定。
 * Returns value or default; supports functions and Promises.
 * @param value - 値または関数 / Value or thunk
 * @param els - デフォルト値または関数 / Default or thunk
 * @returns 値またはデフォルト / Value or default
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
 * 値が空か判定します。数値/booleanは空としません。
 * Checks emptiness; numbers/booleans are NOT empty.
 * @param value - 判定対象 / Value to check
 * @returns 空ならtrue / true if empty
 * @example isEmpty(0) // false
 * @example isEmpty([]) // true
 * @category Core Functions
 */
declare const isEmpty: (value: unknown) => boolean;
/**
 * 文字列を数値に変換（全角・カンマ対応）。無効時はnull。
 * Converts to number (full-width/comma aware). Returns null on invalid.
 * @param value - 変換する値 / Value to convert
 * @returns 数値またはnull / number or null
 * @example toNumber('1,234.5') // 1234.5
 * @example toNumber('１２３') // 123
 * @example toNumber('abc') // null
 * @category Core Functions
 */
declare const toNumber: (value: unknown) => number | null;
declare const toBool: (value: unknown, undetected?: boolean | null) => MaybePromise<boolean | null>;
/**
 * 真偽値へ安全に変換。数値は0判定、それ以外はデフォルト。
 * Safely converts to boolean; numbers use zero check; otherwise default.
 * @param value - 値 / Value
 * @param defaultValue - デフォルト / Default (false)
 * @returns boolean
 * @example boolIf(1) // true
 * @example boolIf('x', true) // true
 * @category Core Functions
 */
declare const boolIf: (value: unknown, defaultValue?: boolean) => boolean;
/**
 * 指定フレーム後に関数を実行。requestAnimationFrameベース。
 * Runs a function after N frames using requestAnimationFrame.
 * @param func - 実行関数 / Function to run
 * @param frameCount - 待機フレーム数 / Frames to wait (default 0)
 * @example waited(() => doMeasure(), 1)
 * @example waited(startAnimation, 2)
 * @category Core Functions
 */
declare const waited: (func: () => void, frameCount?: number) => void;
/**
 * 2値を比較し、一致すれば値、異なればデフォルト。null/undefinedは同値扱い。Promise対応。
 * Compares two values; if equal returns value, else default. Nil is equal. Promise-aware.
 * @param param1 - 値1 / First value
 * @param param2 - 値2 / Second value
 * @param els - デフォルト / Default
 * @returns 値またはデフォルト / Value or default (sync or Promise)
 * @example equalsOr('a','a','d') // 'a'
 * @example await equalsOr(fetchStatus(),'ok','ng')
 * @example equalsOr(null, undefined, 'd') // null
 * @category Promise Utilities
 */
declare const equalsOr: <T, E>(...args: any[]) => MaybePromise<T | E | null>;
/**
 * JSON/JSON5を安全にパース。失敗時はnull。オブジェクトはそのまま返す。
 * Safely parses JSON/JSON5; returns null on error; passes objects through.
 * @param str - 文字列またはオブジェクト / String or object
 * @returns パース結果またはnull / Parsed object or null
 * @example parseJSON('{"a":1}') // {a:1}
 * @example parseJSON('{a:1}') // {a:1} (JSON5)
 * @category Conversion
 */
declare const parseJSON: <T = any>(str: string | object) => T | null;
/**
 * オブジェクト/配列のみJSON文字列化。文字列や数値はnullを返す。
 * Stringifies objects/arrays; returns null for strings/numbers.
 * @param obj - 対象 / Target object
 * @returns JSON文字列またはnull / JSON string or null
 * @example jsonStringify({a:1}) // '{"a":1}'
 * @example jsonStringify('{a:1}') // '{"a":1}' (normalize)
 * @category Conversion
 */
declare const jsonStringify: <T = any>(obj: T) => string | null;
/**
 * 値を配列化。null/undefinedは空配列。lodashの[null]問題を解消。
 * Casts value to array; nil becomes [] (not [null]).
 * @param value - 値 / Value
 * @returns 配列 / Array
 * @example castArray(1) // [1]
 * @example castArray(null) // []
 * @category Array Utilities
 */
declare const castArray: <T>(value: T | T[] | null | undefined) => T[];
/**
 * 2オブジェクトの差分を取得。ディープパス対応。keyExcludesで除外モード。
 * Returns diff between objects; supports deep paths. keyExcludes to invert keys.
 * @param sourceValue - 元 / Source
 * @param currentValue - 現在 / Current
 * @param keys - チェックするキー / Keys (deep paths ok)
 * @param options - { keyExcludes } キー除外モード（トップレベルのみ） / exclude mode (top-level only)
 * @param finallyCallback - finally用 / Finally callback
 * @param notEmptyCallback - 差分あり時のコールバック / Called when diff not empty
 * @returns 差分オブジェクト / Diff object
 * @example changes(o1,o2,['name','profile.bio'])
 * @example changes(orig, curr, ['id','created_at'], { keyExcludes:true }) // excludes those keys (top-level only)
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
 * 配列のネスト深さを返します。非配列は0、空配列は1。
 * Returns nesting depth of arrays. Non-array: 0; empty array: 1.
 * @param ary - 配列 / Array
 * @returns 深さ / Depth
 * @example arrayDepth([1]) // 1
 * @example arrayDepth([[1],[2]]) // 2
 * @example arrayDepth([[[1]]]) // 3
 * @example arrayDepth([[1,2], [[3],[4,5]]]) // 2 (最小深さを採用)
 * @example arrayDepth([]) // 1
 * @example arrayDepth('not array') // 0
 * @category Array Utilities
 */
declare const arrayDepth: (ary: unknown) => number;
/**
 * ansukoにプラグインを適用します。lodashインスタンスを拡張。
 * Extends ansuko with a plugin; returns augmented instance.
 * @param plugin - 拡張関数 / Plugin function
 * @returns 拡張済みインスタンス / Extended instance
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
