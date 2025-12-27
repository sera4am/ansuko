import { type AnsukoType } from "./index";
import { haifun } from "./util";
export interface AnsukoJaExtension {
    kanaToFull: (str: unknown) => string | null;
    kanaToHalf: (str: unknown) => string | null;
    kanaToHira: (str: unknown) => string | null;
    hiraToKana: (str: unknown) => string | null;
    toHalfWidth: (value: unknown, withHaifun?: string) => string | null;
    toFullWidth: (value: unknown, withHaifun?: string) => string | null;
    haifun: typeof haifun;
}
declare const ansukoJaPlugin: <T extends AnsukoType>(ansuko: T) => T & AnsukoJaExtension;
export default ansukoJaPlugin;
