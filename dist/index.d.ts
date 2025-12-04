import { LoDashStatic } from "lodash";
declare const isValidStr: (str: unknown) => str is string;
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
interface Ansuko extends LoDashStatic {
    isEmpty: typeof isEmpty;
    toNumber: typeof toNumber;
    boolIf: typeof boolIf;
    kanaToFull: typeof kanaToFull;
    kanaToHira: typeof kanaToHira;
    hiraToKana: typeof hiraToKana;
    isValidStr: typeof isValidStr;
    valueOr: typeof valueOr;
    equalsOr: typeof equalsOr;
    waited: typeof waited;
    parseJSON: typeof parseJSON;
    jsonStringify: typeof jsonStringify;
    castArray: typeof castArray;
}
declare const _default: Ansuko;
export default _default;
export { isEmpty, toNumber, boolIf, kanaToFull, kanaToHira, hiraToKana, isValidStr, valueOr, equalsOr, waited, parseJSON, jsonStringify, castArray, };
//# sourceMappingURL=index.d.ts.map