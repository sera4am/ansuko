declare global {
    interface Array<T> {
        notMap(predicate: (item: T) => boolean): boolean[];
        notFilter(predicate: (item: T) => boolean): T[];
    }
}
declare const ansukoPrototypePlugin: (ansuko: any) => void;
export default ansukoPrototypePlugin;
