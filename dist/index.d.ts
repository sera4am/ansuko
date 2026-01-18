import _ from "lodash";
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
 * @param value - Value to convert
 * @returns number or null
 * @example toNumber('1,234.5') // 1234.5
 * @example toNumber('１２３') // 123
 * @example toNumber('abc') // null
 * @category Core Functions
 */
declare const toNumber: (value: unknown) => number | null;
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
declare const parseJSON: <T = any>(str: string | object) => T | null;
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
declare const changes: <T extends Record<string, any>, E extends Record<string, any>>(sourceValue: T, currentValue: E, keys: string[], options?: ChangesOptions, finallyCallback?: ChangesAfterFinallyCallback<Record<string, any>>, notEmptyCallback?: ChangesAfterCallback<Record<string, any>>) => Record<string, any>;
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
 * @example const extended = _.extend(jaPlugin)
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
    isEmpty: typeof isEmpty;
    toNumber: typeof toNumber;
    castArray: typeof castArray;
    isEmptyOrg: typeof _.isEmpty;
    toNumberOrg: typeof _.toNumber;
    castArrayOrg: typeof _.castArray;
    add: typeof _.add;
    after: typeof _.after;
    ary: typeof _.ary;
    assign: typeof _.assign;
    assignIn: typeof _.assignIn;
    assignInWith: typeof _.assignInWith;
    assignWith: typeof _.assignWith;
    at: typeof _.at;
    attempt: typeof _.attempt;
    before: typeof _.before;
    bind: typeof _.bind;
    bindAll: typeof _.bindAll;
    bindKey: typeof _.bindKey;
    camelCase: typeof _.camelCase;
    capitalize: typeof _.capitalize;
    ceil: typeof _.ceil;
    chain: typeof _.chain;
    chunk: typeof _.chunk;
    clamp: typeof _.clamp;
    clone: typeof _.clone;
    cloneDeep: typeof _.cloneDeep;
    cloneDeepWith: typeof _.cloneDeepWith;
    cloneWith: typeof _.cloneWith;
    compact: typeof _.compact;
    concat: typeof _.concat;
    cond: typeof _.cond;
    conforms: typeof _.conforms;
    conformsTo: typeof _.conformsTo;
    constant: typeof _.constant;
    countBy: typeof _.countBy;
    create: typeof _.create;
    curry: typeof _.curry;
    curryRight: typeof _.curryRight;
    debounce: typeof _.debounce;
    deburr: typeof _.deburr;
    defaultTo: typeof _.defaultTo;
    defaults: typeof _.defaults;
    defaultsDeep: typeof _.defaultsDeep;
    defer: typeof _.defer;
    delay: typeof _.delay;
    difference: typeof _.difference;
    differenceBy: typeof _.differenceBy;
    differenceWith: typeof _.differenceWith;
    divide: typeof _.divide;
    drop: typeof _.drop;
    dropRight: typeof _.dropRight;
    dropRightWhile: typeof _.dropRightWhile;
    dropWhile: typeof _.dropWhile;
    each: typeof _.each;
    eachRight: typeof _.eachRight;
    endsWith: typeof _.endsWith;
    entries: typeof _.entries;
    entriesIn: typeof _.entriesIn;
    eq: typeof _.eq;
    escape: typeof _.escape;
    escapeRegExp: typeof _.escapeRegExp;
    every: typeof _.every;
    extendWith: typeof _.extendWith;
    fill: typeof _.fill;
    filter: typeof _.filter;
    find: typeof _.find;
    findIndex: typeof _.findIndex;
    findKey: typeof _.findKey;
    findLast: typeof _.findLast;
    findLastIndex: typeof _.findLastIndex;
    findLastKey: typeof _.findLastKey;
    first: typeof _.first;
    flatMap: typeof _.flatMap;
    flatMapDeep: typeof _.flatMapDeep;
    flatMapDepth: typeof _.flatMapDepth;
    flatten: typeof _.flatten;
    flattenDeep: typeof _.flattenDeep;
    flattenDepth: typeof _.flattenDepth;
    flip: typeof _.flip;
    floor: typeof _.floor;
    flow: typeof _.flow;
    flowRight: typeof _.flowRight;
    forEach: typeof _.forEach;
    forEachRight: typeof _.forEachRight;
    forIn: typeof _.forIn;
    forInRight: typeof _.forInRight;
    forOwn: typeof _.forOwn;
    forOwnRight: typeof _.forOwnRight;
    fromPairs: typeof _.fromPairs;
    functions: typeof _.functions;
    functionsIn: typeof _.functionsIn;
    get: typeof _.get;
    groupBy: typeof _.groupBy;
    gt: typeof _.gt;
    gte: typeof _.gte;
    has: typeof _.has;
    hasIn: typeof _.hasIn;
    head: typeof _.head;
    identity: typeof _.identity;
    inRange: typeof _.inRange;
    includes: typeof _.includes;
    indexOf: typeof _.indexOf;
    initial: typeof _.initial;
    intersection: typeof _.intersection;
    intersectionBy: typeof _.intersectionBy;
    intersectionWith: typeof _.intersectionWith;
    invert: typeof _.invert;
    invertBy: typeof _.invertBy;
    invoke: typeof _.invoke;
    invokeMap: typeof _.invokeMap;
    isArguments: typeof _.isArguments;
    isArray: typeof _.isArray;
    isArrayBuffer: typeof _.isArrayBuffer;
    isArrayLike: typeof _.isArrayLike;
    isArrayLikeObject: typeof _.isArrayLikeObject;
    isBoolean: typeof _.isBoolean;
    isBuffer: typeof _.isBuffer;
    isDate: typeof _.isDate;
    isElement: typeof _.isElement;
    isEqual: typeof _.isEqual;
    isEqualWith: typeof _.isEqualWith;
    isError: typeof _.isError;
    isFinite: typeof _.isFinite;
    isFunction: typeof _.isFunction;
    isInteger: typeof _.isInteger;
    isLength: typeof _.isLength;
    isMap: typeof _.isMap;
    isMatch: typeof _.isMatch;
    isMatchWith: typeof _.isMatchWith;
    isNaN: typeof _.isNaN;
    isNative: typeof _.isNative;
    isNil: typeof _.isNil;
    isNull: typeof _.isNull;
    isNumber: typeof _.isNumber;
    isObject: typeof _.isObject;
    isObjectLike: typeof _.isObjectLike;
    isPlainObject: typeof _.isPlainObject;
    isRegExp: typeof _.isRegExp;
    isSafeInteger: typeof _.isSafeInteger;
    isSet: typeof _.isSet;
    isString: typeof _.isString;
    isSymbol: typeof _.isSymbol;
    isTypedArray: typeof _.isTypedArray;
    isUndefined: typeof _.isUndefined;
    isWeakMap: typeof _.isWeakMap;
    isWeakSet: typeof _.isWeakSet;
    iteratee: typeof _.iteratee;
    join: typeof _.join;
    kebabCase: typeof _.kebabCase;
    keyBy: typeof _.keyBy;
    keys: typeof _.keys;
    keysIn: typeof _.keysIn;
    last: typeof _.last;
    lastIndexOf: typeof _.lastIndexOf;
    lowerCase: typeof _.lowerCase;
    lowerFirst: typeof _.lowerFirst;
    lt: typeof _.lt;
    lte: typeof _.lte;
    map: typeof _.map;
    mapKeys: typeof _.mapKeys;
    mapValues: typeof _.mapValues;
    matches: typeof _.matches;
    matchesProperty: typeof _.matchesProperty;
    max: typeof _.max;
    maxBy: typeof _.maxBy;
    mean: typeof _.mean;
    meanBy: typeof _.meanBy;
    memoize: typeof _.memoize;
    merge: typeof _.merge;
    mergeWith: typeof _.mergeWith;
    method: typeof _.method;
    methodOf: typeof _.methodOf;
    min: typeof _.min;
    minBy: typeof _.minBy;
    mixin: typeof _.mixin;
    multiply: typeof _.multiply;
    negate: typeof _.negate;
    noConflict: typeof _.noConflict;
    noop: typeof _.noop;
    now: typeof _.now;
    nth: typeof _.nth;
    nthArg: typeof _.nthArg;
    omit: typeof _.omit;
    omitBy: typeof _.omitBy;
    once: typeof _.once;
    orderBy: typeof _.orderBy;
    over: typeof _.over;
    overArgs: typeof _.overArgs;
    overEvery: typeof _.overEvery;
    overSome: typeof _.overSome;
    pad: typeof _.pad;
    padEnd: typeof _.padEnd;
    padStart: typeof _.padStart;
    parseInt: typeof _.parseInt;
    partial: typeof _.partial;
    partialRight: typeof _.partialRight;
    partition: typeof _.partition;
    pick: typeof _.pick;
    pickBy: typeof _.pickBy;
    property: typeof _.property;
    propertyOf: typeof _.propertyOf;
    pull: typeof _.pull;
    pullAll: typeof _.pullAll;
    pullAllBy: typeof _.pullAllBy;
    pullAllWith: typeof _.pullAllWith;
    pullAt: typeof _.pullAt;
    random: typeof _.random;
    range: typeof _.range;
    rangeRight: typeof _.rangeRight;
    rearg: typeof _.rearg;
    reduce: typeof _.reduce;
    reduceRight: typeof _.reduceRight;
    reject: typeof _.reject;
    remove: typeof _.remove;
    repeat: typeof _.repeat;
    replace: typeof _.replace;
    rest: typeof _.rest;
    result: typeof _.result;
    reverse: typeof _.reverse;
    round: typeof _.round;
    runInContext: typeof _.runInContext;
    sample: typeof _.sample;
    sampleSize: typeof _.sampleSize;
    set: typeof _.set;
    setWith: typeof _.setWith;
    shuffle: typeof _.shuffle;
    size: typeof _.size;
    slice: typeof _.slice;
    snakeCase: typeof _.snakeCase;
    some: typeof _.some;
    sortBy: typeof _.sortBy;
    sortedIndex: typeof _.sortedIndex;
    sortedIndexBy: typeof _.sortedIndexBy;
    sortedIndexOf: typeof _.sortedIndexOf;
    sortedLastIndex: typeof _.sortedLastIndex;
    sortedLastIndexBy: typeof _.sortedLastIndexBy;
    sortedLastIndexOf: typeof _.sortedLastIndexOf;
    sortedUniq: typeof _.sortedUniq;
    sortedUniqBy: typeof _.sortedUniqBy;
    split: typeof _.split;
    spread: typeof _.spread;
    startCase: typeof _.startCase;
    startsWith: typeof _.startsWith;
    stubArray: typeof _.stubArray;
    stubFalse: typeof _.stubFalse;
    stubObject: typeof _.stubObject;
    stubString: typeof _.stubString;
    stubTrue: typeof _.stubTrue;
    subtract: typeof _.subtract;
    sum: typeof _.sum;
    sumBy: typeof _.sumBy;
    tail: typeof _.tail;
    take: typeof _.take;
    takeRight: typeof _.takeRight;
    takeRightWhile: typeof _.takeRightWhile;
    takeWhile: typeof _.takeWhile;
    tap: typeof _.tap;
    template: typeof _.template;
    throttle: typeof _.throttle;
    thru: typeof _.thru;
    times: typeof _.times;
    toArray: typeof _.toArray;
    toFinite: typeof _.toFinite;
    toInteger: typeof _.toInteger;
    toLength: typeof _.toLength;
    toLower: typeof _.toLower;
    toPairs: typeof _.toPairs;
    toPairsIn: typeof _.toPairsIn;
    toPath: typeof _.toPath;
    toPlainObject: typeof _.toPlainObject;
    toSafeInteger: typeof _.toSafeInteger;
    toString: typeof _.toString;
    toUpper: typeof _.toUpper;
    transform: typeof _.transform;
    trim: typeof _.trim;
    trimEnd: typeof _.trimEnd;
    trimStart: typeof _.trimStart;
    truncate: typeof _.truncate;
    unary: typeof _.unary;
    unescape: typeof _.unescape;
    union: typeof _.union;
    unionBy: typeof _.unionBy;
    unionWith: typeof _.unionWith;
    uniq: typeof _.uniq;
    uniqBy: typeof _.uniqBy;
    uniqWith: typeof _.uniqWith;
    uniqueId: typeof _.uniqueId;
    unset: typeof _.unset;
    unzip: typeof _.unzip;
    unzipWith: typeof _.unzipWith;
    update: typeof _.update;
    updateWith: typeof _.updateWith;
    upperCase: typeof _.upperCase;
    upperFirst: typeof _.upperFirst;
    values: typeof _.values;
    valuesIn: typeof _.valuesIn;
    without: typeof _.without;
    words: typeof _.words;
    wrap: typeof _.wrap;
    xor: typeof _.xor;
    xorBy: typeof _.xorBy;
    xorWith: typeof _.xorWith;
    zip: typeof _.zip;
    zipObject: typeof _.zipObject;
    zipObjectDeep: typeof _.zipObjectDeep;
    zipWith: typeof _.zipWith;
}
declare const _default: AnsukoType;
export default _default;
export { isEmpty, toNumber, boolIf, isValidStr, valueOr, equalsOr, waited, parseJSON, jsonStringify, castArray, changes, swallow, swallowMap, arrayDepth, };
