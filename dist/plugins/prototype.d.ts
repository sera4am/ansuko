declare global {
    interface Array<T> {
        /**
         * predicateの否定結果をmapで返します。
         * Maps with negated predicate result (boolean array).
         * @param predicate - 判定関数 / Predicate
         * @returns boolean配列 / Boolean array
         * @example [1,2,3].notMap(n => n > 1) // [true,false,false]
         * @category Array Utilities
         */
        notMap(predicate: (item: T) => boolean): boolean[];
        /**
         * predicateの否定でfilterします（つまり「条件に当てはまらないもの」を取得）。
         * Filters by negated predicate (items that do NOT match).
         * @param predicate - 判定関数 / Predicate
         * @returns フィルタ結果 / Filtered items
         * @example [1,2,3].notFilter(n => n % 2 === 0) // [1,3]
         * @category Array Utilities
         */
        notFilter(predicate: (item: T) => boolean): T[];
    }
}
declare const ansukoPrototypePlugin: (ansuko: any) => void;
export default ansukoPrototypePlugin;
