import _, {
    add,
    after,
    ary, assign, assignIn, assignInWith, assignWith, at, attempt,
    before,
    bind, bindAll,
    bindKey, camelCase, capitalize, ceil, chain, clamp,
    clone,
    cloneDeep,
    cloneDeepWith,
    compact,
    concat, cond, conforms,
    conformsTo, constant,
    countBy, create,
    curry,
    curryRight,
    debounce, deburr, defaults, defaultsDeep, defaultTo,
    defer,
    delay,
    difference,
    differenceBy, divide,
    drop,
    dropRight,
    dropRightWhile,
    dropWhile,
    each, endsWith,
    eq, escapeRegExp,
    every,
    fill,
    filter,
    find, findKey,
    findLast, findLastKey,
    flatMap,
    flatMapDeep,
    flatMapDepth,
    flatten,
    flattenDeep,
    flattenDepth,
    flip, floor, flow, flowRight,
    forEach,
    forEachRight, forIn, forInRight, forOwn, forOwnRight,
    fromPairs, functions, functionsIn, get,
    groupBy,
    gt,
    gte, has, hasIn,
    head, identity,
    includes,
    initial, inRange,
    intersection,
    intersectionBy,
    intersectionWith, invert, invertBy, invoke,
    invokeMap,
    isArguments,
    isArray,
    isArrayBuffer,
    isArrayLike,
    isArrayLikeObject,
    isBoolean, isBuffer, isDate, isElement,
    isEqual, isEqualWith, isError, isFunction, isInteger, isLength, isMatch, isMatchWith, isNative,
    isNil, isNull, isNumber, isObject, isObjectLike, isPlainObject, isRegExp, isSafeInteger,
    isSet, isString, isSymbol, isTypedArray, isUndefined, isWeakMap, isWeakSet, iteratee, kebabCase,
    keyBy, keys, keysIn,
    last,
    lastIndexOf,
    LoDashStatic, lowerCase, lowerFirst, lt, lte,
    map, mapKeys, mapValues, matches, matchesProperty, max, maxBy, mean, meanBy,
    memoize, merge, mergeWith, method, methodOf, min, minBy, mixin, multiply,
    negate, noConflict, noop,
    now,
    nth, nthArg, omit, omitBy,
    once,
    orderBy, over,
    overArgs, overEvery, overSome, pad, padEnd, padStart,
    partial,
    partialRight,
    partition, pick, pickBy, property, propertyOf,
    pull,
    pullAll,
    pullAllBy,
    pullAt, random, range, rangeRight,
    rearg,
    reduce,
    reduceRight,
    reject,
    remove, repeat, replace,
    rest, result,
    reverse, round, runInContext,
    sample,
    sampleSize, set, setWith,
    shuffle,
    size,
    slice, snakeCase,
    some,
    sortBy,
    sortedIndex,
    sortedIndexBy,
    sortedLastIndex,
    sortedLastIndexBy,
    sortedLastIndexOf,
    sortedUniq, split,
    spread, startCase, startsWith, stubArray, stubFalse, stubObject, stubString, stubTrue, subtract, sum, sumBy,
    tail,
    take,
    takeRight,
    takeRightWhile,
    takeWhile, tap, template, templateSettings,
    throttle, thru, times, toArray, toFinite, toLength,
    toLower, toPairs, toPairsIn,
    toPath, toPlainObject, toSafeInteger, toUpper, transform, trim, trimEnd, trimStart, truncate,
    unary,
    union,
    unionBy,
    unionWith,
    uniq,
    uniqBy, uniqueId, unset,
    unzip,
    unzipWith, update, updateWith, upperFirst, values, valuesIn, VERSION,
    without, words,
    wrap,
    xor,
    xorBy,
    zip,
    zipObject,
    zipObjectDeep,
    zipWith
} from "lodash"
import JSON5 from "json5"

const isValidStr = (str: unknown): str is string => {
    if (_.isNil(str)) { return false }
    if (_.isEmpty(str)) { return false }
    return typeof str === "string"
}

type MaybePromise<T> = T | Promise<T>
type MaybeFunction<T> = T | (() => MaybePromise<T>)

const valueOr = <T, E>(
    value: MaybeFunction<MaybePromise<T | null | undefined>>,
    els: E | (() => E)
): MaybePromise<T | E> => {
    if (_.isNil(value)) {
        if (typeof els === "function") { return (els as () => E)() }
        return els
    }
    if (typeof value === "function") {
        return valueOr((value as () => MaybePromise<T | null | undefined>)(), els)
    }
    if (value instanceof Promise) {
        return value.then(res => valueOr(res, els)) as Promise<T | E>
    }
    if (_.isEmpty(value)) {
        if (typeof els === "function") {
            return (els as () => E)()
        }
        return els
    }
    return value
}

const kanaToFull = (str: string): string => {
    if (!isValidStr(str)) { return str }
    const kanaMap: Record<string, string> = {
        'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
        'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
        'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
        'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
        'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
        'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
        'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
        'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
        'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
        'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
        'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
        'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
        'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
        'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
        'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
        'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
        'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
        'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
        '｡': '。', '､': '、', 'ｰ': 'ー', '｢': '「', '｣': '」', '･': '・', '\\)': '）', '\\(': '（'
    }

    const regex = new RegExp(`(${Object.keys(kanaMap).join('|')})`, 'g')
    return str.replace(regex, m => kanaMap[m])
}

const kanaToHira = (str: unknown): string|null => isValidStr(str) ? kanaToFull(str)
    .replace(/[\u30a1-\u30f6]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60)) : null

const hiraToKana = (str: unknown): string|null => isValidStr(str) ? str
    .replace(/[\u3041-\u3096]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60)) : null

const toHalfWidth = (value: unknown): string|null => {
    if (_.isNil(value)) { return null }
    return String(value).split('').map(char => {
        const code = char.charCodeAt(0)
        // 全角は0xFF01～0xFF5E、半角は0x0021～0x007E
        if (code >= 0xFF01 && code <= 0xFF5E) {
            return String.fromCharCode(code - 0xFEE0)
        }
        return char
    }).join('')
}

const isEmpty = (value: unknown): boolean => {
    if (_.isNil(value)) { return true }
    if (_.isNumber(value)) { return false }
    return _.isEmpty(value)
}

const toNumber = (value: unknown): number|null => {
    if (_.isNil(value)) { return null }
    if (_.isNumber(value)) { return value as number }
    let v:string|number|null = toHalfWidth(value as string | number)
    if (typeof v === "string" && v.trim().match(/^[0-9][0-9,.]*$/)) {
        v = _.toNumber(v.trim().replace(/,/g, ""))
    } else {
        v = _.toNumber(v)
    }
    return _.isNaN(v) ? null : v as number
}

const boolIf = (value: unknown, defaultValue: boolean = false): boolean => {
    if (_.isBoolean(value)) { return value as boolean }
    if (_.isNumber(value)) { return !!value }
    return defaultValue
}

const waited = (func: () => void, frameCount: number = 0): void => {
    requestAnimationFrame(() => {
        if (frameCount > 0) { return waited(func, frameCount - 1) }
        func()
    })
}

const equalsOr = <T, E>(...args: any[]): MaybePromise<T | E | null> => {
    if (args.length === 2) {
        return valueOr(args[0], args[1] as E | (() => E))
    }
    const [param1, param2, els] = args
    if (!_.isNil(param1) && typeof param1 === "function") {
        return equalsOr((param1 as () => MaybePromise<T>)(), param2, els)
    }
    if (!_.isNil(param1) && (param1 instanceof Promise)) {
        return param1.then(v => equalsOr(v, param2, els))
    }
    if (!_.isNil(param2) && typeof param2 === "function") {
        return equalsOr(param1, (param2 as () => MaybePromise<T>)(), els)
    }
    if (!_.isNil(param2) && param2 instanceof Promise) {
        return param2.then(v => equalsOr(param1, v, els))
    }
    if (_.isNil(param1) && _.isNil(param2)) { return null }
    // 比較
    if (_.isEqual(param1, param2)) {
        return param1
    }
    // elsの解決
    if (typeof els === "function") {
        return (els as () => E)()
    }
    return els
}

const parseJSON = <T = any> (str: string|object): T|null => {
    if (_.isNil(str)) { return null }
    if (typeof str === "object") {
        return str as T
    }
    try {
        return JSON5.parse(str) as T
    } catch {
        return null
    }
}

const jsonStringify = <T = any>(obj: T): string|null => {
    if(_.isNil(obj)) { return null }
    if (typeof obj === "string") {
        try {
            const j = JSON5.parse(obj)
            return JSON.stringify(j)
        } catch {
            return null
        }
    }
    if (typeof obj === "object") {
        try {
            return JSON.stringify(obj)
        } catch {
            return null
        }
    }
    return null
}

const castArray = <T>(value: T|T[]|null|undefined): T[] => {
    if (_.isNil(value)) { return [] }
    if(Array.isArray(value)) { return value }
    return [value]
}

const changes = <T extends Record<string, any>, E extends Record<string, any>>(
    sourceValue: T,
    currentValue: E,
    keys: string[]
): Record<string, any> => {
    const diff: Record<string, any> = {}

    for (const key of keys) {
        const v1 = _.get(sourceValue, key)
        const v2 = _.get(currentValue, key)
        if (_.isNil(v1) && _.isNil(v2)) continue
        if (_.isNil(v1) || _.isNil(v2)) {
            diff[key] = v2 ?? null
            continue
        }
        if (!_.isEqual(v1, v2)) {
            diff[key] = v2 ?? null
        }
    }

    return diff
}

// @ts-ignore-next-line
interface Ansuko extends LoDashStatic {
    isEmpty: typeof isEmpty
    toNumber: typeof toNumber
    boolIf: typeof boolIf
    kanaToFull: typeof kanaToFull
    kanaToHira: typeof kanaToHira
    hiraToKana: typeof hiraToKana
    isValidStr: typeof isValidStr
    valueOr: typeof valueOr
    equalsOr: typeof equalsOr
    waited: typeof waited
    parseJSON: typeof parseJSON
    jsonStringify: typeof jsonStringify
    castArray: typeof castArray
    changes: typeof changes

    isNil: typeof isNil
    compact: typeof compact
    concat: typeof concat
    difference: typeof difference
    differenceBy: typeof differenceBy
    drop: typeof drop
    dropRight: typeof dropRight
    dropRightWhile: typeof dropRightWhile
    dropWhile: typeof dropWhile
    fill: typeof fill
    flatten: typeof flatten
    flattenDeep: typeof flattenDeep
    flattenDepth: typeof flattenDepth
    fromPairs: typeof fromPairs
    head: typeof head
    initial: typeof initial
    intersection: typeof intersection
    intersectionBy: typeof intersectionBy
    intersectionWith: typeof intersectionWith
    last: typeof last
    lastIndexOf: typeof lastIndexOf
    nth: typeof nth
    pull: typeof pull
    pullAll: typeof pullAll
    pullAllBy: typeof pullAllBy
    pullAt: typeof pullAt
    remove: typeof remove
    reverse: typeof reverse
    slice: typeof slice
    sortedIndex: typeof sortedIndex
    sortedIndexBy: typeof sortedIndexBy
    sortedLastIndex: typeof sortedLastIndex
    sortedLastIndexBy: typeof sortedLastIndexBy
    sortedLastIndexOf: typeof sortedLastIndexOf
    sortedUniq: typeof sortedUniq
    tail: typeof tail
    take: typeof take
    takeRight: typeof takeRight
    takeRightWhile: typeof takeRightWhile
    takeWhile: typeof takeWhile
    union: typeof union
    unionBy: typeof unionBy
    unionWith: typeof unionWith
    uniq: typeof uniq
    uniqBy: typeof uniqBy
    unzip: typeof unzip
    unzipWith: typeof unzipWith
    without: typeof without
    xor: typeof xor
    xorBy: typeof xorBy
    zip: typeof zip
    zipObject: typeof zipObject
    zipObjectDeep: typeof zipObjectDeep
    zipWith: typeof zipWith
    countBy: typeof countBy
    forEach: typeof forEach
    forEachRight: typeof forEachRight
    every: typeof every
    filter: typeof filter
    find: typeof find
    findLast: typeof findLast
    flatMap: typeof flatMap
    flatMapDeep: typeof flatMapDeep
    flatMapDepth: typeof flatMapDepth
    groupBy: typeof groupBy
    includes: typeof includes
    invokeMap: typeof invokeMap
    keyBy: typeof keyBy
    map: typeof map
    orderBY: typeof orderBy
    partition: typeof partition
    reduce: typeof reduce
    reduceRight: typeof reduceRight
    reject: typeof reject
    sample: typeof sample
    sampleSize: typeof sampleSize
    shuffle: typeof shuffle
    size: typeof size
    some: typeof some
    sortBy: typeof sortBy
    now: typeof now
    after: typeof after
    ary: typeof ary
    before: typeof before
    bind: typeof bind
    bindKey: typeof bindKey
    curry: typeof curry
    curryRight: typeof curryRight
    debounce: typeof debounce
    defer: typeof defer
    delay: typeof delay
    flip: typeof flip
    memoize: typeof memoize
    negate: typeof negate
    once: typeof once
    overArgs: typeof overArgs
    partial: typeof partial
    partialRight: typeof partialRight
    rearg: typeof rearg
    rest: typeof rest
    spread: typeof spread
    throttle: typeof throttle
    unary: typeof unary
    wrap: typeof wrap
    clone: typeof clone
    cloneDeep: typeof cloneDeep
    cloneDeepWith: typeof cloneDeepWith
    conformsTo: typeof conformsTo
    eq: typeof eq
    gt: typeof gt
    gte: typeof gte
    isArguments: typeof isArguments
    isArray: typeof isArray
    isArrayBuffer: typeof isArrayBuffer
    isArrayLike: typeof isArrayLike
    isArrayLikeObject: typeof isArrayLikeObject
    isBoolean: typeof isBoolean
    isBuffer: typeof isBuffer
    isDate: typeof isDate
    isElement: typeof isElement
    isEqual: typeof isEqual
    isEqualWith: typeof isEqualWith
    isError: typeof isError
    isFinite: typeof isFinite
    isFunction: typeof isFunction
    isInteger: typeof isInteger
    isLength: typeof isLength
    isMatch: typeof isMatch
    isMatchWith: typeof isMatchWith
    isNaN: typeof isNaN
    isNative: typeof isNative
    isNull: typeof isNull
    isNumber: typeof isNumber
    isObject: typeof isObject
    isObjectLike: typeof isObjectLike
    isPlainObject: typeof isPlainObject
    isRegExp: typeof isRegExp
    isSafeInteger: typeof isSafeInteger
    isSet: typeof isSet
    isString: typeof isString
    isSymbol: typeof isSymbol
    isTypedArray: typeof isTypedArray
    isUndefined: typeof isUndefined
    isWeakMap: typeof isWeakMap
    isWeakSet: typeof isWeakSet
    lt: typeof lt
    lte: typeof lte
    toArray: typeof toArray
    toFinite: typeof toFinite
    toLength: typeof toLength
    toPlainObject: typeof toPlainObject
    toSafeInteger: typeof toSafeInteger
    toString: typeof toString
    add: typeof add
    ceil: typeof ceil
    divide: typeof divide
    floor: typeof floor
    max: typeof max
    maxBy: typeof maxBy
    mean: typeof mean
    meanBy: typeof meanBy
    min: typeof min
    minBy: typeof minBy
    multiply: typeof multiply
    round: typeof round
    subtract: typeof subtract
    sum: typeof sum
    sumBy: typeof sumBy
    clamp: typeof clamp
    inRange: typeof inRange
    random: typeof random
    assign: typeof assign
    assignIn: typeof assignIn
    assignInWith: typeof assignInWith
    assignWith: typeof assignWith
    at: typeof at
    create: typeof create
    defaults: typeof defaults
    defaultsDeep: typeof defaultsDeep
    toPairs: typeof toPairs
    toPairsIn: typeof toPairsIn
    findKey: typeof findKey
    findLastKey: typeof findLastKey
    forIn: typeof forIn
    forInRight: typeof forInRight
    forOwn: typeof forOwn
    forOwnRight: typeof forOwnRight
    functions: typeof functions
    functionsIn: typeof functionsIn
    get: typeof get
    has: typeof has
    hasIn: typeof hasIn
    invert: typeof invert
    invertBy: typeof invertBy
    invoke: typeof invoke
    keys: typeof keys
    keysIn: typeof keysIn
    mapKeys: typeof mapKeys
    mapValues: typeof mapValues
    merge: typeof merge
    mergeWith: typeof mergeWith
    omit: typeof omit
    omitBy: typeof omitBy
    pick: typeof pick
    pickBy: typeof pickBy
    result: typeof result
    set: typeof set
    setWith: typeof setWith
    transform: typeof transform
    unset: typeof unset
    update: typeof update
    updateWith: typeof updateWith
    values: typeof values
    valuesIn: typeof valuesIn
    chain: typeof chain
    tap: typeof tap
    thru: typeof thru
    camelCase: typeof camelCase
    capitalize: typeof capitalize
    deburr: typeof deburr
    endsWith: typeof endsWith
    escapeRegExp: typeof escapeRegExp
    kebabCase: typeof kebabCase
    lowerCase: typeof lowerCase
    lowerFirst: typeof lowerFirst
    pad: typeof pad
    padEnd: typeof padEnd
    padStart: typeof padStart
    parseInt: typeof parseInt
    repeat: typeof repeat
    replace: typeof replace
    snakeCase: typeof snakeCase
    split: typeof split
    startCase: typeof startCase
    startsWith: typeof startsWith
    template: typeof template
    toLower: typeof toLower
    toUpper: typeof toUpper
    trim: typeof trim
    trimEnd: typeof trimEnd
    trimStart: typeof trimStart
    truncate: typeof truncate
    upperFirst: typeof upperFirst
    words: typeof words
    attempt: typeof attempt
    bindAll: typeof bindAll
    cond: typeof cond
    conforms: typeof conforms
    constant: typeof constant
    defaultTo: typeof defaultTo
    flow: typeof flow
    flowRight: typeof flowRight
    identity: typeof identity
    iteratee: typeof iteratee
    matches: typeof matches
    matchesProperty: typeof matchesProperty
    method: typeof method
    methodOf: typeof methodOf
    mixin: typeof mixin
    noConflict: typeof noConflict
    noop: typeof noop
    nthArg: typeof nthArg
    over: typeof over
    overEvery: typeof overEvery
    overSome: typeof overSome
    property: typeof property
    propertyOf: typeof propertyOf
    range: typeof range
    rangeRight: typeof rangeRight
    runInContext: typeof runInContext
    stubArray: typeof stubArray
    stubFalse: typeof stubFalse
    stubObject: typeof stubObject
    stubString: typeof stubString
    stubTrue: typeof stubTrue
    times: typeof times
    toPath: typeof toPath
    uniqueId: typeof uniqueId
    VERSION: typeof VERSION
    templateSettings: typeof templateSettings
}

export default {
    ...(_ as LoDashStatic),
    isEmpty,
    toNumber,
    boolIf,
    kanaToFull,
    kanaToHira,
    hiraToKana,
    isValidStr,
    valueOr,
    equalsOr,
    waited,
    parseJSON,
    jsonStringify,
    castArray,
    changes,
} as Ansuko

// 個別エクスポートも提供
export {
    isEmpty,
    toNumber,
    boolIf,
    kanaToFull,
    kanaToHira,
    hiraToKana,
    isValidStr,
    valueOr,
    equalsOr,
    waited,
    parseJSON,
    jsonStringify,
    castArray,
    changes,
}