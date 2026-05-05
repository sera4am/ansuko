import lodash from "lodash";
/**
 * Checks if the value is a non-empty string. null/undefined/empty string -> false.
 * @param str - Value to check
 * @returns true if non-empty string
 * @example isValidStr('hello') // true
 * @example isValidStr('') // false
 * @category Type Guards
 */
declare const isValidStr: (str: unknown) => str is string;
/**
 * Returns value or a default. Detects functions and Promises automatically.
 * @param value - Value or thunk
 * @param els - Default value or thunk
 * @returns Value or default
 * @example valueOr('v','d') // 'v'
 * @example valueOr(asyncFetch(), 'fallback') // Promise resolves to fetched or fallback
 * @example await valueOr(() => cache.get(id), () => api.fetch(id))
 * @category Promise Utilities
 */
type MaybePromise<T> = T | Promise<T>;
type MaybeFunction<T> = T | (() => MaybePromise<T>);
declare const valueOr: <T, E>(value: MaybeFunction<MaybePromise<T | null | undefined>>, els?: E | (() => MaybePromise<E>)) => MaybePromise<T | E | undefined | null>;
declare const emptyOr: <T, E>(value: MaybeFunction<MaybePromise<T | null | undefined>>, els?: E | ((val: T | null | undefined) => MaybePromise<E>)) => MaybePromise<T | E | undefined | null>;
/**
 * Ensures that all given paths exist on the resolved value; otherwise returns a default.
 * Supports functions and Promises.
 * @param value - Object or thunk
 * @param paths - Paths to check
 * @param els - Default value or thunk receiving the resolved value
 * @returns Value or default
 * @example await hasOr(fetchUser(), ['profile.name','id'], null)
 * @example hasOr({a:{b:1}}, 'a.b', {}) // returns original object
 * @category Promise Utilities
 */
declare const hasOr: <T, E>(value: MaybeFunction<MaybePromise<T | null | undefined>>, paths: string | string[], els?: E | ((val: T | null | undefined) => MaybePromise<E>)) => MaybePromise<T | E | undefined | null>;
/**
 * Checks emptiness with intuitive rules: numbers and booleans are NOT empty.
 * @param value - Value to check
 * @returns true if empty
 * @example isEmpty(0) // false
 * @example isEmpty([]) // true
 * @category Core Functions
 */
declare const isEmpty: (value: unknown) => boolean;
/**
 * Converts a value to number (full-width and comma aware). Returns null when invalid.
 * Optionally rounds using Number.toFixed when `toFixed` is provided.
 * @param value - Value to convert
 * @param toFixed - Fraction digits to round to (uses Number.toFixed)
 * @returns number or null
 * @example toNumber('1,234.5') // 1234.5
 * @example toNumber('1,234.56', 1) // 1234.6
 * @example toNumber('１２３') // 123
 * @example toNumber('abc') // null
 * @category Core Functions
 */
declare const toNumber: (value: unknown, toFixed?: unknown) => number | null;
/**
 * Converts various inputs to boolean. Numbers: 0 -> false, non-zero -> true.
 * Strings: 'true'|'t'|'y'|'yes'|'ok' -> true; 'false'|'f'|'n'|'no'|'ng' -> false.
 * If a function or Promise is provided, it will be resolved recursively.
 * Returns the `undetected` fallback when the value cannot be interpreted (default null).
 * @param value - Value, thunk, or Promise
 * @param undetected - Fallback when value cannot be interpreted (default null)
 * @returns boolean or null (sync or Promise)
 * @category Core Functions
 */
declare const toBool: (value: unknown, undetected?: boolean | null) => MaybePromise<boolean | null>;
/**
 * Safely converts to boolean; numbers use zero check; otherwise returns the provided default.
 * @param value - Value
 * @param defaultValue - Default when value is not number/boolean (false)
 * @returns boolean
 * @example boolIf(1) // true
 * @example boolIf('x', true) // true
 * @category Core Functions
 */
declare const boolIf: (value: unknown, defaultValue?: boolean) => boolean;
/**
 * Runs a function after N frames using requestAnimationFrame.
 * @param func - Function to run
 * @param frameCount - Frames to wait (default 0)
 * @example waited(() => doMeasure(), 1)
 * @example waited(startAnimation, 2)
 * @category Core Functions
 */
declare const waited: (func: () => void, frameCount?: number) => void;
/**
 * Compares two values; if equal returns the value, otherwise returns the default.
 * null and undefined are considered equal. Promise-aware.
 * @param param1 - First value (or thunk/promise)
 * @param param2 - Second value (or thunk/promise)
 * @param els - Default value (or thunk)
 * @returns Value or default (sync or Promise)
 * @example equalsOr('a','a','d') // 'a'
 * @example await equalsOr(fetchStatus(),'ok','ng')
 * @example equalsOr(null, undefined, 'd') // null
 * @category Promise Utilities
 */
declare const equalsOr: <T, E>(...args: any[]) => MaybePromise<T | E | null>;
/**
 * Safely parses JSON/JSON5; returns null on error; passes objects through.
 * @param str - String or object
 * @returns Parsed object or null
 * @example parseJSON('{"a":1}') // {a:1}
 * @example parseJSON('{a:1}') // {a:1} (JSON5)
 * @category Conversion
 */
declare const parseJSON: <T = any>(str: string | object | null | undefined) => T | null;
/**
 * Stringifies objects/arrays; returns null for strings or numbers.
 * @param obj - Target object
 * @param replacer — A function that transforms the results.
 * @param space - Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @returns JSON string or null
 * @example jsonStringify({a:1}) // '{"a":1}'
 * @example jsonStringify('{a:1}') // '{"a":1}' (normalize)
 * @category Conversion
 */
declare const jsonStringify: <T = any>(obj: T, replacer?: ((this: any, key: string, value: any) => any) | undefined, space?: string | number | undefined) => string | null;
/**
 * Casts value to array; null/undefined become [] (not [null]).
 * @param value - Value
 * @returns Array
 * @example castArray(1) // [1]
 * @example castArray(null) // []
 * @category Array Utilities
 */
declare const castArray: <T>(value: T | T[] | null | undefined) => T[];
/**
 * Computes differences between two objects. Supports deep paths. When `keyExcludes` is true,
 * the provided keys are excluded (top-level only) from diffing.
 * @param sourceValue - Source object
 * @param currentValue - Current object
 * @param keys - Keys to check (deep paths allowed)
 * @param options - { keyExcludes } to treat keys as excludes (top-level only)
 * @param finallyCallback - Called after diff computation (always if notEmptyCallback returned truthy)
 * @param notEmptyCallback - Called only when diff is not empty
 * @returns Diff object
 * @example changes(o1,o2,['name','profile.bio'])
 * @example changes(orig, curr, ['id','created_at'], { keyExcludes:true })
 * @example await changes(a,b,['x'],{}, async diff => save(diff))
 * @example changes(
 *   { profile:{ tags:['a','b'] } },
 *   { profile:{ tags:['a','c'] } },
 *   ['profile.tags[1]']
 * ) // => { profile:{ tags:{ 1:'c' } } }
 * @category Object Utilities
 */
declare const changes: <T extends Record<string, any>, E extends Record<string, any>>(sourceValue: T, currentValue: E, keys?: string[], options?: ChangesOptions, finallyCallback?: ChangesAfterFinallyCallback<Record<string, any>>, notEmptyCallback?: ChangesAfterCallback<Record<string, any>>) => Record<string, any>;
declare const strWrap: (value: string, wrapper: string, whenInvalid?: any) => string | null | undefined;
/**
 * Executes a function and returns undefined if an error occurs.
 * For functions returning a Promise, returns undefined if the Promise is rejected.
 *
 * @template T - The return type of the function
 * @param fn - The function to execute
 * @returns The result of the function execution, or undefined on error
 *
 * @example
 * // Synchronous function
 * swallow(() => data.remove() )
 * // => undefined (error ignored)
 *
 * @example
 * // Asynchronous function
 * const data = await swallow(async () => await fetchData());
 * // => data or undefined
 */
declare const swallow: <T>(fn: () => T) => T extends Promise<infer U> ? Promise<U | undefined> : T | undefined;
/**
 * Maps over an array, treating errors as undefined.
 * When compact is true, filters out undefined results (errors).
 *
 * @template T - The array element type
 * @template U - The function return type
 * @param array - The array to process
 * @param fn - The function to apply to each element
 * @param compact - If true, filters out undefined results (errors) from the output
 * @returns Array of results, or Promise of results for async functions
 *
 * @example
 * // Keep errors as undefined
 * const results = swallowMap(items, item => processItem(item));
 * // => [result1, undefined, result3, ...]
 *
 * @example
 * // Filter out errors (compact)
 * const results = swallowMap(items, item => processItem(item), true);
 * // => [result1, result3, ...]
 *
 * @example
 * // Async processing
 * const data = await swallowMap(urls, async url => await fetch(url), true);
 * // => array of successful responses only
 */
declare const swallowMap: <T, U>(array: T[] | undefined | null, fn: (item: T, index: number) => U, compact?: boolean) => U extends Promise<infer V> ? Promise<V[]> : U[];
/**
 * Returns nesting depth of arrays. Non-array: 0; empty array: 1. Uses minimum depth for mixed nesting.
 * @param ary - Array
 * @returns Depth
 * @example arrayDepth([1]) // 1
 * @example arrayDepth([[1],[2]]) // 2
 * @example arrayDepth([[[1]]]) // 3
 * @example arrayDepth([[1,2], [[3],[4,5]]]) // 2 (uses minimum depth)
 * @example arrayDepth([]) // 1
 * @example arrayDepth('not array') // 0
 * @category Array Utilities
 */
declare const arrayDepth: (ary: unknown) => number;
/**
 * Extends ansuko with a plugin and returns the augmented instance.
 * @param plugin - Plugin function
 * @returns Extended instance
 * @example const extended = lodash.extend(jaPlugin)
 * @category Core Functions
 */
declare const extend: <T extends AnsukoType, E>(this: T, plugin: (a: T) => T & E) => T & E;
export type ChangesOptions = {
    keyExcludes?: boolean;
};
type ChangesAfterCallback<T> = (value: T) => any | Promise<any>;
type ChangesAfterFinallyCallback<T> = (value: T, res: any) => any | Promise<any>;
export interface AnsukoType {
    extend: typeof extend;
    isValidStr: typeof isValidStr;
    valueOr: typeof valueOr;
    emptyOr: typeof emptyOr;
    hasOr: typeof hasOr;
    toBool: typeof toBool;
    boolIf: typeof boolIf;
    waited: typeof waited;
    equalsOr: typeof equalsOr;
    parseJSON: typeof parseJSON;
    jsonStringify: typeof jsonStringify;
    changes: typeof changes;
    swallow: typeof swallow;
    swallowMap: typeof swallowMap;
    arrayDepth: typeof arrayDepth;
    strWrap: typeof strWrap;
    isEmpty: typeof isEmpty;
    toNumber: typeof toNumber;
    castArray: typeof castArray;
    isEmptyOrg: typeof lodash.isEmpty;
    toNumberOrg: typeof lodash.toNumber;
    castArrayOrg: typeof lodash.castArray;
    add: typeof lodash.add;
    after: typeof lodash.after;
    ary: typeof lodash.ary;
    assign: typeof lodash.assign;
    assignIn: typeof lodash.assignIn;
    assignInWith: typeof lodash.assignInWith;
    assignWith: typeof lodash.assignWith;
    at: typeof lodash.at;
    attempt: typeof lodash.attempt;
    before: typeof lodash.before;
    bind: typeof lodash.bind;
    bindAll: typeof lodash.bindAll;
    bindKey: typeof lodash.bindKey;
    camelCase: typeof lodash.camelCase;
    capitalize: typeof lodash.capitalize;
    ceil: typeof lodash.ceil;
    chain: typeof lodash.chain;
    chunk: typeof lodash.chunk;
    clamp: typeof lodash.clamp;
    clone: typeof lodash.clone;
    cloneDeep: typeof lodash.cloneDeep;
    cloneDeepWith: typeof lodash.cloneDeepWith;
    cloneWith: typeof lodash.cloneWith;
    compact: typeof lodash.compact;
    concat: typeof lodash.concat;
    cond: typeof lodash.cond;
    conforms: typeof lodash.conforms;
    conformsTo: typeof lodash.conformsTo;
    constant: typeof lodash.constant;
    countBy: typeof lodash.countBy;
    create: typeof lodash.create;
    curry: typeof lodash.curry;
    curryRight: typeof lodash.curryRight;
    debounce: typeof lodash.debounce;
    deburr: typeof lodash.deburr;
    defaultTo: typeof lodash.defaultTo;
    defaults: typeof lodash.defaults;
    defaultsDeep: typeof lodash.defaultsDeep;
    defer: typeof lodash.defer;
    delay: typeof lodash.delay;
    difference: typeof lodash.difference;
    differenceBy: typeof lodash.differenceBy;
    differenceWith: typeof lodash.differenceWith;
    divide: typeof lodash.divide;
    drop: typeof lodash.drop;
    dropRight: typeof lodash.dropRight;
    dropRightWhile: typeof lodash.dropRightWhile;
    dropWhile: typeof lodash.dropWhile;
    each: typeof lodash.each;
    eachRight: typeof lodash.eachRight;
    endsWith: typeof lodash.endsWith;
    entries: typeof lodash.entries;
    entriesIn: typeof lodash.entriesIn;
    eq: typeof lodash.eq;
    escape: typeof lodash.escape;
    escapeRegExp: typeof lodash.escapeRegExp;
    every: typeof lodash.every;
    extendWith: typeof lodash.extendWith;
    fill: typeof lodash.fill;
    filter: typeof lodash.filter;
    find: typeof lodash.find;
    findIndex: typeof lodash.findIndex;
    findKey: typeof lodash.findKey;
    findLast: typeof lodash.findLast;
    findLastIndex: typeof lodash.findLastIndex;
    findLastKey: typeof lodash.findLastKey;
    first: typeof lodash.first;
    flatMap: typeof lodash.flatMap;
    flatMapDeep: typeof lodash.flatMapDeep;
    flatMapDepth: typeof lodash.flatMapDepth;
    flatten: typeof lodash.flatten;
    flattenDeep: typeof lodash.flattenDeep;
    flattenDepth: typeof lodash.flattenDepth;
    flip: typeof lodash.flip;
    floor: typeof lodash.floor;
    flow: typeof lodash.flow;
    flowRight: typeof lodash.flowRight;
    forEach: typeof lodash.forEach;
    forEachRight: typeof lodash.forEachRight;
    forIn: typeof lodash.forIn;
    forInRight: typeof lodash.forInRight;
    forOwn: typeof lodash.forOwn;
    forOwnRight: typeof lodash.forOwnRight;
    fromPairs: typeof lodash.fromPairs;
    functions: typeof lodash.functions;
    functionsIn: typeof lodash.functionsIn;
    get: typeof lodash.get;
    groupBy: typeof lodash.groupBy;
    gt: typeof lodash.gt;
    gte: typeof lodash.gte;
    has: typeof lodash.has;
    hasIn: typeof lodash.hasIn;
    head: typeof lodash.head;
    identity: typeof lodash.identity;
    inRange: typeof lodash.inRange;
    includes: typeof lodash.includes;
    indexOf: typeof lodash.indexOf;
    initial: typeof lodash.initial;
    intersection: typeof lodash.intersection;
    intersectionBy: typeof lodash.intersectionBy;
    intersectionWith: typeof lodash.intersectionWith;
    invert: typeof lodash.invert;
    invertBy: typeof lodash.invertBy;
    invoke: typeof lodash.invoke;
    invokeMap: typeof lodash.invokeMap;
    isArguments: typeof lodash.isArguments;
    isArray: typeof lodash.isArray;
    isArrayBuffer: typeof lodash.isArrayBuffer;
    isArrayLike: typeof lodash.isArrayLike;
    isArrayLikeObject: typeof lodash.isArrayLikeObject;
    isBoolean: typeof lodash.isBoolean;
    isBuffer: typeof lodash.isBuffer;
    isDate: typeof lodash.isDate;
    isElement: typeof lodash.isElement;
    isEqual: typeof lodash.isEqual;
    isEqualWith: typeof lodash.isEqualWith;
    isError: typeof lodash.isError;
    isFinite: typeof lodash.isFinite;
    isFunction: typeof lodash.isFunction;
    isInteger: typeof lodash.isInteger;
    isLength: typeof lodash.isLength;
    isMap: typeof lodash.isMap;
    isMatch: typeof lodash.isMatch;
    isMatchWith: typeof lodash.isMatchWith;
    isNaN: typeof lodash.isNaN;
    isNative: typeof lodash.isNative;
    isNil: typeof lodash.isNil;
    isNull: typeof lodash.isNull;
    isNumber: typeof lodash.isNumber;
    isObject: typeof lodash.isObject;
    isObjectLike: typeof lodash.isObjectLike;
    isPlainObject: typeof lodash.isPlainObject;
    isRegExp: typeof lodash.isRegExp;
    isSafeInteger: typeof lodash.isSafeInteger;
    isSet: typeof lodash.isSet;
    isString: typeof lodash.isString;
    isSymbol: typeof lodash.isSymbol;
    isTypedArray: typeof lodash.isTypedArray;
    isUndefined: typeof lodash.isUndefined;
    isWeakMap: typeof lodash.isWeakMap;
    isWeakSet: typeof lodash.isWeakSet;
    iteratee: typeof lodash.iteratee;
    join: typeof lodash.join;
    kebabCase: typeof lodash.kebabCase;
    keyBy: typeof lodash.keyBy;
    keys: typeof lodash.keys;
    keysIn: typeof lodash.keysIn;
    last: typeof lodash.last;
    lastIndexOf: typeof lodash.lastIndexOf;
    lowerCase: typeof lodash.lowerCase;
    lowerFirst: typeof lodash.lowerFirst;
    lt: typeof lodash.lt;
    lte: typeof lodash.lte;
    map: typeof lodash.map;
    mapKeys: typeof lodash.mapKeys;
    mapValues: typeof lodash.mapValues;
    matches: typeof lodash.matches;
    matchesProperty: typeof lodash.matchesProperty;
    max: typeof lodash.max;
    maxBy: typeof lodash.maxBy;
    mean: typeof lodash.mean;
    meanBy: typeof lodash.meanBy;
    memoize: typeof lodash.memoize;
    merge: typeof lodash.merge;
    mergeWith: typeof lodash.mergeWith;
    method: typeof lodash.method;
    methodOf: typeof lodash.methodOf;
    min: typeof lodash.min;
    minBy: typeof lodash.minBy;
    mixin: typeof lodash.mixin;
    multiply: typeof lodash.multiply;
    negate: typeof lodash.negate;
    noConflict: typeof lodash.noConflict;
    noop: typeof lodash.noop;
    now: typeof lodash.now;
    nth: typeof lodash.nth;
    nthArg: typeof lodash.nthArg;
    omit: typeof lodash.omit;
    omitBy: typeof lodash.omitBy;
    once: typeof lodash.once;
    orderBy: typeof lodash.orderBy;
    over: typeof lodash.over;
    overArgs: typeof lodash.overArgs;
    overEvery: typeof lodash.overEvery;
    overSome: typeof lodash.overSome;
    pad: typeof lodash.pad;
    padEnd: typeof lodash.padEnd;
    padStart: typeof lodash.padStart;
    parseInt: typeof lodash.parseInt;
    partial: typeof lodash.partial;
    partialRight: typeof lodash.partialRight;
    partition: typeof lodash.partition;
    pick: typeof lodash.pick;
    pickBy: typeof lodash.pickBy;
    property: typeof lodash.property;
    propertyOf: typeof lodash.propertyOf;
    pull: typeof lodash.pull;
    pullAll: typeof lodash.pullAll;
    pullAllBy: typeof lodash.pullAllBy;
    pullAllWith: typeof lodash.pullAllWith;
    pullAt: typeof lodash.pullAt;
    random: typeof lodash.random;
    range: typeof lodash.range;
    rangeRight: typeof lodash.rangeRight;
    rearg: typeof lodash.rearg;
    reduce: typeof lodash.reduce;
    reduceRight: typeof lodash.reduceRight;
    reject: typeof lodash.reject;
    remove: typeof lodash.remove;
    repeat: typeof lodash.repeat;
    replace: typeof lodash.replace;
    rest: typeof lodash.rest;
    result: typeof lodash.result;
    reverse: typeof lodash.reverse;
    round: typeof lodash.round;
    runInContext: typeof lodash.runInContext;
    sample: typeof lodash.sample;
    sampleSize: typeof lodash.sampleSize;
    set: typeof lodash.set;
    setWith: typeof lodash.setWith;
    shuffle: typeof lodash.shuffle;
    size: typeof lodash.size;
    slice: typeof lodash.slice;
    snakeCase: typeof lodash.snakeCase;
    some: typeof lodash.some;
    sortBy: typeof lodash.sortBy;
    sortedIndex: typeof lodash.sortedIndex;
    sortedIndexBy: typeof lodash.sortedIndexBy;
    sortedIndexOf: typeof lodash.sortedIndexOf;
    sortedLastIndex: typeof lodash.sortedLastIndex;
    sortedLastIndexBy: typeof lodash.sortedLastIndexBy;
    sortedLastIndexOf: typeof lodash.sortedLastIndexOf;
    sortedUniq: typeof lodash.sortedUniq;
    sortedUniqBy: typeof lodash.sortedUniqBy;
    split: typeof lodash.split;
    spread: typeof lodash.spread;
    startCase: typeof lodash.startCase;
    startsWith: typeof lodash.startsWith;
    stubArray: typeof lodash.stubArray;
    stubFalse: typeof lodash.stubFalse;
    stubObject: typeof lodash.stubObject;
    stubString: typeof lodash.stubString;
    stubTrue: typeof lodash.stubTrue;
    subtract: typeof lodash.subtract;
    sum: typeof lodash.sum;
    sumBy: typeof lodash.sumBy;
    tail: typeof lodash.tail;
    take: typeof lodash.take;
    takeRight: typeof lodash.takeRight;
    takeRightWhile: typeof lodash.takeRightWhile;
    takeWhile: typeof lodash.takeWhile;
    tap: typeof lodash.tap;
    template: typeof lodash.template;
    throttle: typeof lodash.throttle;
    thru: typeof lodash.thru;
    times: typeof lodash.times;
    toArray: typeof lodash.toArray;
    toFinite: typeof lodash.toFinite;
    toInteger: typeof lodash.toInteger;
    toLength: typeof lodash.toLength;
    toLower: typeof lodash.toLower;
    toPairs: typeof lodash.toPairs;
    toPairsIn: typeof lodash.toPairsIn;
    toPath: typeof lodash.toPath;
    toPlainObject: typeof lodash.toPlainObject;
    toSafeInteger: typeof lodash.toSafeInteger;
    toString: typeof lodash.toString;
    toUpper: typeof lodash.toUpper;
    transform: typeof lodash.transform;
    trim: typeof lodash.trim;
    trimEnd: typeof lodash.trimEnd;
    trimStart: typeof lodash.trimStart;
    truncate: typeof lodash.truncate;
    unary: typeof lodash.unary;
    unescape: typeof lodash.unescape;
    union: typeof lodash.union;
    unionBy: typeof lodash.unionBy;
    unionWith: typeof lodash.unionWith;
    uniq: typeof lodash.uniq;
    uniqBy: typeof lodash.uniqBy;
    uniqWith: typeof lodash.uniqWith;
    uniqueId: typeof lodash.uniqueId;
    unset: typeof lodash.unset;
    unzip: typeof lodash.unzip;
    unzipWith: typeof lodash.unzipWith;
    update: typeof lodash.update;
    updateWith: typeof lodash.updateWith;
    upperCase: typeof lodash.upperCase;
    upperFirst: typeof lodash.upperFirst;
    values: typeof lodash.values;
    valuesIn: typeof lodash.valuesIn;
    without: typeof lodash.without;
    words: typeof lodash.words;
    wrap: typeof lodash.wrap;
    xor: typeof lodash.xor;
    xorBy: typeof lodash.xorBy;
    xorWith: typeof lodash.xorWith;
    zip: typeof lodash.zip;
    zipObject: typeof lodash.zipObject;
    zipObjectDeep: typeof lodash.zipObjectDeep;
    zipWith: typeof lodash.zipWith;
}
declare const _: AnsukoType;
export default _;
export { isEmpty, toNumber, boolIf, isValidStr, valueOr, equalsOr, waited, parseJSON, jsonStringify, castArray, changes, strWrap, swallow, swallowMap, arrayDepth, };
