import _ from "lodash"
import JSON5 from "json5"
import { toHalfWidth } from "./util.js"


const isValidStr = (str: unknown): str is string => {
    if (_.isNil(str)) { return false }
    if (_.isEmpty(str)) { return false }
    return typeof str === "string"
}


type MaybePromise<T> = T | Promise<T>
type MaybeFunction<T> = T | (() => MaybePromise<T>)

const valueOr = <T, E>(
    value: MaybeFunction<MaybePromise<T | null | undefined>>,
    els?: E | (() => E)
): MaybePromise<T | E | undefined | null> => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? (value as () => MaybePromise<T | null | undefined>)()
        : value

    // Promiseかチェック
    if (resolvedValue instanceof Promise || els instanceof Promise) {
        // Promise処理ブランチ
        return Promise.resolve(resolvedValue).then(res => {
            if (_.isNil(res) || _.isEmpty(res)) {
                if (typeof els === "function") {
                    return (els as () => E)()
                }
                return els as any
            }
            return res as T
        })
    } else {
        // 同期処理ブランチ
        if (_.isNil(resolvedValue) || _.isEmpty(resolvedValue)) {
            if (typeof els === "function") {
                return (els as () => E)()
            }
            return els as any
        }
        return resolvedValue as T
    }
}

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
        if (_.isNil(val) || _.isEmpty(val)) return false
        return pathArray.every(path => _.has(val, path))
    }

    // Promiseかチェック
    if (resolvedValue instanceof Promise || els instanceof Promise) {
        // Promise処理ブランチ
        return Promise.resolve(resolvedValue).then(res => {
            if (!checkPaths(res)) {
                if (typeof els === "function") {
                    return Promise.resolve((els as (val: T | null | undefined) => MaybePromise<E>)(res))
                }
                return els as E
            }
            return res as T
        })
    } else {
        // 同期処理ブランチ
        if (!checkPaths(resolvedValue)) {
            if (typeof els === "function") {
                return (els as (val: T | null | undefined) => E)(resolvedValue)
            }
            return els as E
        }
        return resolvedValue as T
    }
}

const isEmpty = (value: unknown): boolean => {
    if (_.isNil(value)) { return true }
    if (_.isNumber(value)) { return false }
    if (_.isBoolean(value)) { return false }
    return _.isEmpty(value)
}

const toNumber = (value: unknown): number|null => {
    if (_.isNil(value)) { return null }
    if (_.isNumber(value)) { return value as number }
    if (isEmpty(value)) { return null }
    let v:string|number|null = toHalfWidth(value as string | number)
    if (typeof v === "string" && v.trim().match(/^[0-9][0-9,.]*$/)) {
        v = _.toNumber(v.trim().replace(/,/g, ""))
    } else {
        v = _.toNumber(v)
    }
    return _.isNaN(v) ? null : v as number
}

const boolIf = (value: unknown, defaultValue: boolean = false): boolean => {
    if (_.isBoolean(value)) { return value as boolean }
    if (_.isNumber(value)) { return !!value }
    return defaultValue
}

const waited = (func: () => void, frameCount: number = 0): void => {
    requestAnimationFrame(() => {
        if (frameCount > 0) { return waited(func, frameCount - 1) }
        func()
    })
}

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

const parseJSON = <T = any> (str: string|object): T|null => {
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

const jsonStringify = <T = any>(obj: T): string|null => {
    if(_.isNil(obj)) { return null }
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

const castArray = <T>(value: T|T[]|null|undefined): T[] => {
    if (_.isNil(value)) { return [] }
    return _.castArray(value) as T[]
}

export type ChangesOptions = {
    keyExcludes?: boolean
}

type ChangesAfterCallback<T> = (value: T) => any | Promise<any>
type ChangesAfterFinallyCallback<T> = (value: T, res: any) => any | Promise<any>


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

    let notEmptyRes:any = true
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



const arrayDepth = (ary:unknown):number => {
    if (!Array.isArray(ary)) { return 0 }
    if (_.size(ary) === 0) { return 1 }
    return 1 + Math.min(...(ary as []).map(arrayDepth))
}

const extend = function <T>(this: any, plugin: (a: any) => T): typeof this & T {
    if (typeof plugin === 'function') {
        plugin(this)  // ← this が undefined になってる？
    }
    return this as typeof this & T
}


export interface AnsukoType extends Omit<_.LoDashStatic, "castArray" | "isEmpty" | "toNumber"> {
    extend: typeof extend
    isValidStr: typeof isValidStr
    valueOr: typeof valueOr
    isEmpty: typeof isEmpty
    toNumber: typeof toNumber
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
    boolIf,
    isValidStr,
    valueOr,
    equalsOr,
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