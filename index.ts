import _ from "lodash"
import JSON5 from "json5"
import { toHalfWidth } from "./util.js"

/**
 * 非空文字列かを判定します。null/undefined/空文字はfalse。
 * Checks if the value is a non-empty string.
 * @param str - 判定する値 / Value to check
 * @returns 非空文字列ならtrue / true if non-empty string
 * @example isValidStr('hello') // true
 * @example isValidStr('') // false
 * @category Type Guards
 */
const isValidStr = (str: unknown): str is string => {
    if (_.isNil(str)) { return false }
    if (_.isEmpty(str)) { return false }
    return typeof str === "string"
}


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
type MaybePromise<T> = T | Promise<T>
type MaybeFunction<T> = T | (() => MaybePromise<T>)

const valueOr = <T, E>(
    value: MaybeFunction<MaybePromise<T | null | undefined>>,
    els?: E | (() => MaybePromise<E>)
): MaybePromise<T | E | undefined | null> => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? (value as () => MaybePromise<T | null | undefined>)()
        : value

    // Promiseかチェック
    if (resolvedValue instanceof Promise) {
        return Promise.resolve(resolvedValue).then(res => {
            if (_.isNil(res) || isEmpty(res)) {
                if (typeof els === "function") {
                    return (els as () => E)()
                }
                return els
            }
            return res
        })
    }
    if (!_.isNil(resolvedValue) && !isEmpty(resolvedValue)) {
        return resolvedValue
    }
    if (typeof els === "function") {
        return (els as () => E)()
    }
    return els
}

const emptyOr = <T, E>(
    value: MaybeFunction<MaybePromise<T | null | undefined>>,
    els?: E | ((val: T | null | undefined) => MaybePromise<E>)
): MaybePromise<T | E | undefined | null> => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? (value as () => MaybePromise<T | null | undefined>)()
        : value

    // Promiseかチェック
    if (resolvedValue instanceof Promise) {
        return Promise.resolve(resolvedValue).then(res => {
            if (_.isNil(res) || isEmpty(res)) {
                return null
            }
            if (typeof els === "function") {
                return (els as (val: T | null | undefined) => E)(res)
            }
            return els
        })
    }
    if (_.isNil(resolvedValue) || isEmpty(resolvedValue)) {
        return null
    }
    if (typeof els === "function") {
        return (els as (val: T) => E)(resolvedValue)
    }
    return els
}


/**
 * パスが全て存在するかを確認し、無ければデフォルトを返します。関数・Promise対応。
 * Ensures paths exist; otherwise returns default. Supports functions/Promises.
 * @param value - オブジェクトまたは関数 / Object or thunk
 * @param paths - 確認するパス / Paths to check
 * @param els - デフォルトまたは関数 / Default or thunk
 * @returns 値またはデフォルト / Value or default
 * @example await hasOr(fetchUser(), ['profile.name','id'], null)
 * @example hasOr({a:{b:1}}, 'a.b', {}) // returns original object
 * @category Promise Utilities
 */
const hasOr = <T, E>(
    value: MaybeFunction<MaybePromise<T | null | undefined>>,
    paths: string | string[],
    els?: E | ((val: T | null | undefined) => MaybePromise<E>)
): MaybePromise<T | E | undefined | null> => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? (value as () => MaybePromise<T | null | undefined>)()
        : value

    const pathArray = Array.isArray(paths) ? paths : [paths]

    // パスが全て存在するかチェック
    const checkPaths = (val: any) => {
        if (_.isNil(val) || isEmpty(val)) return false
        return pathArray.every(path => _.has(val, path))
    }

    // Promiseかチェック
    if (resolvedValue instanceof Promise) {
        return Promise.resolve(resolvedValue).then(res => {
            if (!checkPaths(res)) {
                if (typeof els === "function") {
                    return (els as (val: T | null | undefined) => MaybePromise<E>)(res)
                }
                return els as E
            }
            return res as T
        })
    }
    if (!checkPaths(resolvedValue)) {
        if (typeof els === "function") {
            return (els as (val: T | null | undefined) => E)(resolvedValue)
        }
        return els as E
    }
    return resolvedValue as T
}

/**
 * 値が空か判定します。数値/booleanは空としません。
 * Checks emptiness; numbers/booleans are NOT empty.
 * @param value - 判定対象 / Value to check
 * @returns 空ならtrue / true if empty
 * @example isEmpty(0) // false
 * @example isEmpty([]) // true
 * @category Core Functions
 */
const isEmpty = (value: unknown): boolean => {
    if (_.isNil(value)) { return true }
    if (_.isNumber(value)) { return false }
    if (_.isBoolean(value)) { return false }
    return _.isEmpty(value)
}

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
const toNumber = (value: unknown): number | null => {
    if (_.isNil(value)) { return null }
    if (_.isNumber(value)) { return value as number }
    if (isEmpty(value)) { return null }
    let v: string | number | null = toHalfWidth(value as string | number)
    if (typeof v === "string" && v.trim().match(/^[0-9][0-9,.]*$/)) {
        v = _.toNumber(v.trim().replace(/,/g, ""))
    } else {
        v = _.toNumber(v)
    }
    return _.isNaN(v) ? null : v as number
}

const toBool = (value: unknown, undetected:boolean|null = null): MaybePromise<boolean|null> => {
    if (_.isNil(value)) { return false }
    if (isEmpty(value)) { return false }
    if (_.isBoolean(value)) { return value }
    if (_.isNumber(value)) { return value !== 0 }
    const n = toNumber(value)
    if (n !== null) return !!n

    if (typeof value === "string") {
        switch (value.toLowerCase()) {
            case "true":
            case "t":
            case "y":
            case "yes":
            case "ok":
                return true
            case "false":
            case "f":
            case "n":
            case "no":
            case "ng":
                return false
            default:

        }
    }
    if (typeof value === "function") {
        const r = value()
        if (r instanceof Promise) {
            return r.then(toBool)
        }
        return toBool(r)
    }
    return undetected
}

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
const boolIf = (value: unknown, defaultValue: boolean = false): boolean => {
    if (_.isBoolean(value)) { return value as boolean }
    if (_.isNumber(value)) { return !!value }
    return defaultValue
}

/**
 * 指定フレーム後に関数を実行。requestAnimationFrameベース。
 * Runs a function after N frames using requestAnimationFrame.
 * @param func - 実行関数 / Function to run
 * @param frameCount - 待機フレーム数 / Frames to wait (default 0)
 * @example waited(() => doMeasure(), 1)
 * @example waited(startAnimation, 2)
 * @category Core Functions
 */
const waited = (func: () => void, frameCount: number = 0): void => {
    requestAnimationFrame(() => {
        if (frameCount > 0) { return waited(func, frameCount - 1) }
        func()
    })
}

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
const equalsOr = <T, E>(...args: any[]): MaybePromise<T | E | null> => {
    if (args.length === 2) {
        return valueOr(args[0], args[1] as E | (() => E))
    }
    const [param1, param2, els] = args

    // 関数を解決するヘルパー
    const resolveIfFunction = <V>(val: V): V | ReturnType<V extends (...args: any[]) => any ? V : never> => {
        return typeof val === "function" ? (val as () => any)() : val
    }

    // Promiseが含まれているかチェック
    const p1 = resolveIfFunction(param1)
    const p2 = resolveIfFunction(param2)
    const hasPromise = (p1 instanceof Promise) || (p2 instanceof Promise) || (els instanceof Promise)

    if (hasPromise) {
        // Promise処理ブランチ
        return Promise.all([
            Promise.resolve(p1),
            Promise.resolve(p2)
        ]).then(([v1, v2]) => {
            if (_.isNil(v1) && _.isNil(v2)) { return null }
            if (_.isEqual(v1, v2)) {
                return v1
            }
            // elsの解決
            if (typeof els === "function") {
                return (els as () => E)()
            }
            return els
        })
    } else {
        // 同期処理ブランチ
        if (_.isNil(p1) && _.isNil(p2)) { return null }
        if (_.isEqual(p1, p2)) {
            return p1
        }
        // elsの解決
        if (typeof els === "function") {
            return (els as () => E)()
        }
        return els
    }
}

/**
 * JSON/JSON5を安全にパース。失敗時はnull。オブジェクトはそのまま返す。
 * Safely parses JSON/JSON5; returns null on error; passes objects through.
 * @param str - 文字列またはオブジェクト / String or object
 * @returns パース結果またはnull / Parsed object or null
 * @example parseJSON('{"a":1}') // {a:1}
 * @example parseJSON('{a:1}') // {a:1} (JSON5)
 * @category Conversion
 */
const parseJSON = <T = any>(str: string | object): T | null => {
    if (_.isNil(str)) { return null }
    if (typeof str === "object") {
        return str as T
    }
    try {
        return JSON5.parse(str) as T
    } catch {
        return null
    }
}

/**
 * オブジェクト/配列のみJSON文字列化。文字列や数値はnullを返す。
 * Stringifies objects/arrays; returns null for strings/numbers.
 * @param obj - 対象 / Target object
 * @returns JSON文字列またはnull / JSON string or null
 * @example jsonStringify({a:1}) // '{"a":1}'
 * @example jsonStringify('{a:1}') // '{"a":1}' (normalize)
 * @category Conversion
 */
const jsonStringify = <T = any>(obj: T): string | null => {
    if (_.isNil(obj)) { return null }
    if (typeof obj === "string") {
        try {
            const j = JSON5.parse(obj)
            return JSON.stringify(j)
        } catch {
            return null
        }
    }
    if (typeof obj === "object") {
        try {
            return JSON.stringify(obj)
        } catch {
            return null
        }
    }
    return null
}

/**
 * 値を配列化。null/undefinedは空配列。lodashの[null]問題を解消。
 * Casts value to array; nil becomes [] (not [null]).
 * @param value - 値 / Value
 * @returns 配列 / Array
 * @example castArray(1) // [1]
 * @example castArray(null) // []
 * @category Array Utilities
 */
const castArray = <T>(value: T | T[] | null | undefined): T[] => {
    if (_.isNil(value)) { return [] }
    return _.castArray(value) as T[]
}

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
const changes = <T extends Record<string, any>, E extends Record<string, any>>(
    sourceValue: T,
    currentValue: E,
    keys: string[],
    options?: ChangesOptions,
    finallyCallback?: ChangesAfterFinallyCallback<Record<string, any>>,
    notEmptyCallback?: ChangesAfterCallback<Record<string, any>>
): Record<string, any> => {
    const diff: Record<string, any> = {}

    // keyExcludes時にdeep pathが指定されていたら警告
    if (options?.keyExcludes === true) {
        const hasDeepPath = keys.some(k => k.includes('.') || k.includes('['))
        if (hasDeepPath) {
            console.warn(
                '[ansuko.changes] keyExcludes mode does not support deep paths. ' +
                'Keys with "." or "[" will be treated as literal property names.'
            )
        }
    }

    const targetKeys: string[] = options?.keyExcludes === true
        ? _.difference(
            _.uniq([...Object.keys(sourceValue), ...Object.keys(currentValue)]),
            keys
        )
        : keys

    for (const key of targetKeys) {
        const v1 = options?.keyExcludes === true ? sourceValue[key] : _.get(sourceValue, key)
        const v2 = options?.keyExcludes === true ? currentValue[key] : _.get(currentValue, key)

        if (_.isNil(v1) && _.isNil(v2)) continue
        if (_.isNil(v1) || _.isNil(v2)) {
            if (options?.keyExcludes === true) {
                diff[key] = v2 ?? null
            } else {
                _.set(diff, key, v2 ?? null)
            }
            continue
        }
        if (!_.isEqual(v1, v2)) {
            if (options?.keyExcludes === true) {
                diff[key] = v2 ?? null
            } else {
                _.set(diff, key, v2 ?? null)
            }
        }
    }

    let notEmptyRes: any = true
    if (!isEmpty(diff) && notEmptyCallback) {
        notEmptyRes = notEmptyCallback(diff)
        if (notEmptyRes instanceof Promise) {
            return notEmptyRes.then(async res => {
                res && await Promise.resolve(finallyCallback?.(diff, res))
                return diff
            })
        }
    }
    if (finallyCallback && notEmptyRes) {
        const finallyRes = finallyCallback(diff, notEmptyRes)
        if (finallyRes instanceof Promise) {
            return finallyRes.then(() => diff)
        }
    }
    return diff
}



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
const arrayDepth = (ary: unknown): number => {
    if (!Array.isArray(ary)) { return 0 }
    if (_.size(ary) === 0) { return 1 }
    return 1 + Math.min(...(ary as []).map(arrayDepth))
}

/**
 * ansukoにプラグインを適用します。lodashインスタンスを拡張。
 * Extends ansuko with a plugin; returns augmented instance.
 * @param plugin - 拡張関数 / Plugin function
 * @returns 拡張済みインスタンス / Extended instance
 * @example const extended = _.extend(jaPlugin)
 * @category Core Functions
 */
const extend = function <T>(this: any, plugin: (a: any) => T): typeof this & T {
    if (typeof plugin === 'function') {
        plugin(this)  // ← this が undefined になってる？
    }
    return this as typeof this & T
}


export type ChangesOptions = {
    keyExcludes?: boolean
}

type ChangesAfterCallback<T> = (value: T) => any | Promise<any>
type ChangesAfterFinallyCallback<T> = (value: T, res: any) => any | Promise<any>


export interface AnsukoType extends Omit<_.LoDashStatic, "castArray" | "isEmpty" | "toNumber"> {
    extend: typeof extend
    isValidStr: typeof isValidStr
    valueOr: typeof valueOr
    emptyOr: typeof emptyOr
    isEmpty: typeof isEmpty
    toNumber: typeof toNumber
    toBool: typeof toBool
    boolIf: typeof boolIf
    waited: typeof waited
    equalsOr: typeof equalsOr
    parseJSON: typeof parseJSON
    jsonStringify: typeof jsonStringify
    castArray: typeof castArray
    changes: typeof changes
    size: typeof _.size
    isNil: typeof _.isNil
    debounce: typeof _.debounce
    isEqual: typeof _.isEqual
    isBoolean: typeof _.isBoolean
    isString: typeof _.isString
    first: typeof _.first
    last: typeof _.last
    uniq: typeof _.uniq
    has: typeof _.has
    keys: typeof _.keys
    values: typeof _.values
    some: typeof _.some
    arrayDepth: typeof arrayDepth
    isEmptyOrg: typeof _.isEmpty
    toNumberOrg: typeof _.toNumber
    castArrayOrg: typeof _.castArray
}

// Ansuko型へのキャストを外し、より安全な unknown as LoDashStatic に変更
export default {
    ...(_ as any),
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
} as AnsukoType

// 個別エクスポートはそのまま
export {
    isEmpty,
    toNumber,
    boolIf,
    isValidStr,
    valueOr,
    equalsOr,
    waited,
    parseJSON,
    jsonStringify,
    castArray,
    changes,
    arrayDepth,
}