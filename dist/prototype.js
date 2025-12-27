const ansukoPrototypePlugin = (ansuko) => {
    Array.prototype.notMap = function (predicate) {
        return this.map(ansuko.negate(predicate));
    };
    Array.prototype.notFilter = function (predicate) {
        return this.filter(ansuko.negate(predicate));
    };
};
export default ansukoPrototypePlugin;
