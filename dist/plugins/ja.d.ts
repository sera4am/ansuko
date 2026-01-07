import { type AnsukoType } from "../index.js";
import { toHalfWidth, haifun } from "../util.js";
export interface AnsukoJaExtension {
    kanaToFull: (str: unknown) => string | null;
    kanaToHalf: (str: unknown) => string | null;
    kanaToHira: (str: unknown) => string | null;
    hiraToKana: (str: unknown) => string | null;
    toHalfWidth: typeof toHalfWidth;
    toFullWidth: (value: unknown, withHaifun?: string) => string | null;
    haifun: typeof haifun;
}
declare const ansukoJaPlugin: <T extends AnsukoType>(ansuko: T) => T & AnsukoJaExtension;
export default ansukoJaPlugin;
