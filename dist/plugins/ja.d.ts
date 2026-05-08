import { toHalfWidth as utilToHalfWidth, haifun } from "../util.js";
/**
 * ja プラグインが ansuko に追加するメソッド群。
 *
 * このインターフェースは下記の `declare module` ブロックで `AnsukoType` に merge され、
 * `import "ansuko/plugins/ja"` するだけで `_` の型が自動的に拡張される。
 */
export interface AnsukoJaExtension {
    kanaToFull: (str: unknown) => string | null;
    kanaToHalf: (str: unknown) => string | null;
    kanaToHira: (str: unknown) => string | null;
    hiraToKana: (str: unknown) => string | null;
    toHalfWidth: typeof utilToHalfWidth;
    toFullWidth: (value: unknown, withHaifun?: string) => string | null;
    haifun: typeof haifun;
}
declare module "../index.js" {
    interface AnsukoType extends AnsukoJaExtension {
    }
}
export {};
