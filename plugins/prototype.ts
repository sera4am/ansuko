
declare global {
    interface Array<T> {
        notMap(predicate: (item: T) => boolean): boolean[]
        notFilter(predicate: (item: T) => boolean): T[]
    }
}


const ansukoPrototypePlugin = (ansuko: any) => {
    Array.prototype.notMap = function <T>(this: T[], predicate: (item: T) => boolean): boolean[] {
        return this.map(ansuko.negate(predicate))
    }

    Array.prototype.notFilter = function <T>(this: T[], predicate: (item: T) => boolean): T[] {
        return this.filter(ansuko.negate(predicate))
    }
}

export default ansukoPrototypePlugin