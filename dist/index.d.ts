import {LoDashStatic, size, isNil, debounce, isEqual, last, first} from "lodash";

declare global {
    interface Array<T> {
        notMap(predicate: (item: T) => boolean): boolean[]
        notFilter(predicate: (item: T) => boolean): T[]
    }
}

type MaybePromise<T> = T | Promise<T>
type MaybeFunction<T> = T | (() => MaybePromise<T>)

export declare const isValidStr: (str: unknown) => str is string

export declare const valueOr: <T, E>(
    value: MaybeFunction<MaybePromise<T | null | undefined>>,
    els?: E | (() => E)
) => MaybePromise<T | E | undefined>

export declare const kanaToFull: (str: string) => string
export declare const kanaToHira: (str: unknown) => string | null
export declare const hiraToKana: (str: unknown) => string | null
export declare const isEmpty: (value: unknown) => boolean
export declare const toNumber: (value: unknown) => number | null
export declare const boolIf: (value: unknown, defaultValue?: boolean) => boolean
export declare const waited: (func: () => void, frameCount?: number) => void

export declare const equalsOr: <T, E>(...args: any[]) => MaybePromise<T | E | null>

export declare const parseJSON: <T = any>(str: string | object) => T | null
export declare const jsonStringify: <T = any>(obj: T) => string | null
export declare const castArray: <T>(value: T | T[] | null | undefined) => T[]

export type ChangesOptions = {
    keyExcludes?: boolean
}

export declare const changes: <T extends Record<string, any>, E extends Record<string, any>>(
    sourceValue: T,
    currentValue: E,
    keys: string[],
    options?: ChangesOptions
) => Record<string, any>

/**
 * Ansuko - Lodash の拡張ユーティリティライブラリ
 * LoDash のすべての機能 + カスタム実装関数を提供
 */
interface AnsukoType extends LoDashStatic {
    isValidStr: typeof isValidStr
    valueOr: typeof valueOr
    kanaToFull: typeof kanaToFull
    kanaToHira: typeof kanaToHira
    hiraToKana: typeof hiraToKana
    isEmpty: typeof isEmpty
    toNumber: typeof toNumber
    boolIf: typeof boolIf
    waited: typeof waited
    equalsOr: typeof equalsOr
    parseJSON: typeof parseJSON
    jsonStringify: typeof jsonStringify
    castArray: typeof castArray
    changes: typeof changes
    size: typeof size
    isNil: typeof isNil
    debounce: typeof debounce
    isEqual: typeof isEqual
    first: typeof first,
    last: typeof last
}

declare const _default: AnsukoType
export default _default
