import type { Ansuko } from "./index.d";
declare const isValidStr: (str: unknown) => str is string;
declare global {
    interface Array<T> {
        notMap(predicate: (item: T) => boolean): boolean[];
        notFilter(predicate: (item: T) => boolean): T[];
    }
}
type MaybePromise<T> = T | Promise<T>;
type MaybeFunction<T> = T | (() => MaybePromise<T>);
declare const valueOr: <T, E>(value: MaybeFunction<MaybePromise<T | null | undefined>>, els: E | (() => E)) => MaybePromise<T | E>;
declare const kanaToFull: (str: string) => string;
declare const kanaToHira: (str: unknown) => string | null;
declare const hiraToKana: (str: unknown) => string | null;
declare const isEmpty: (value: unknown) => boolean;
declare const toNumber: (value: unknown) => number | null;
declare const boolIf: (value: unknown, defaultValue?: boolean) => boolean;
declare const waited: (func: () => void, frameCount?: number) => void;
declare const equalsOr: <T, E>(...args: any[]) => MaybePromise<T | E | null>;
declare const parseJSON: <T = any>(str: string | object) => T | null;
declare const jsonStringify: <T = any>(obj: T) => string | null;
declare const castArray: <T>(value: T | T[] | null | undefined) => T[];
export type ChangesOptions = {
    keyExcludes?: boolean;
};
declare const changes: <T extends Record<string, any>, E extends Record<string, any>>(sourceValue: T, currentValue: E, keys: string[], options?: ChangesOptions) => Record<string, any>;
declare const _default: Ansuko;
export default _default;
export { isEmpty, toNumber, boolIf, kanaToFull, kanaToHira, hiraToKana, isValidStr, valueOr, equalsOr, waited, parseJSON, jsonStringify, castArray, changes, };
//# sourceMappingURL=index.d.ts.map