import _, {LoDashStatic} from "lodash";

// index.tsに定義されている型を再定義
type MaybePromise<T> = T | Promise<T>
type MaybeFunction<T> = T | (() => MaybePromise<T>)
export type ChangesOptions = {
    keyExcludes?: boolean
}

// Ansukoインターフェースの定義 (カスタム関数のみ)
export default interface Ansuko extends LodashStatic {
    isEmpty: (value: unknown) => boolean
    toNumber: (value: unknown) => number|null
    boolIf: (value: unknown, defaultValue?: boolean) => boolean
    kanaToFull: (str: string) => string
    kanaToHira: (str: unknown) => string|null
    hiraToKana: (str: unknown) => string|null
    isValidStr: (str: unknown) => str is string
    valueOr: <T, E>(
        value: MaybeFunction<MaybePromise<T | null | undefined>>,
        els: E | (() => E)
    ) => MaybePromise<T | E>
    equalsOr: <T, E>(...args: any[]) => MaybePromise<T | E | null>
    waited: (func: () => void, frameCount?: number) => void
    parseJSON: <T = any> (str: string|object) => T|null
    jsonStringify: <T = any>(obj: T) => string|null
    castArray: <T>(value: T|T[]|null|undefined) => T[]
    changes: <T extends Record<string, any>, E extends Record<string, any>>(
        sourceValue: T,
        currentValue: E,
        keys: string[],
        options?: ChangesOptions
    ) => Record<string, any>

    // lodash標準関数はLoDashStaticに含まれているため、ここではすべて削除しました
}

// グローバルなArrayの拡張はそのまま残す
declare global {
    interface Array<T> {
        notMap(predicate: (item: T) => boolean): boolean[]
        notFilter(predicate: (item: T) => boolean): T[]
    }
}

// 最終的なモジュールエクスポートの型宣言
//declare const ansuko: Ansuko;

// 個別エクスポートの型宣言も提供
export declare function isEmpty(value: unknown): boolean;
export declare function toNumber(value: unknown): number|null;
export declare function boolIf(value: unknown, defaultValue?: boolean): boolean;
export declare function kanaToFull(str: string): string;
export declare function kanaToHira(str: unknown): string|null;
export declare function hiraToKana(str: unknown): string|null;
export declare function isValidStr(str: unknown): str is string;
export declare function valueOr<T, E>(
    value: MaybeFunction<MaybePromise<T | null | undefined>>,
    els: E | (() => E)
): MaybePromise<T | E>;
export declare function equalsOr<T, E>(...args: any[]): MaybePromise<T | E | null>;
export declare function waited(func: () => void, frameCount?: number): void;
export declare function parseJSON<T = any> (str: string|object): T|null;
export declare function jsonStringify<T = any>(obj: T): string|null;
export declare function castArray<T>(value: T|T[]|null|undefined): T[];
export declare function changes<T extends Record<string, any>, E extends Record<string, any>>(
    sourceValue: T,
    currentValue: E,
    keys: string[],
    options?: ChangesOptions
): Record<string, any>;