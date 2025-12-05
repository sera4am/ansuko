import _, {LoDashStatic} from "lodash";
import {
    boolIf, castArray, changes,
    equalsOr,
    hiraToKana,
    isEmpty,
    isValidStr, jsonStringify,
    kanaToFull,
    kanaToHira, parseJSON,
    toNumber,
    valueOr,
    waited
} from "./index";

declare global {
    interface Array<T> {
        notMap(predicate: (item: T) => boolean): boolean[]
        notFilter(predicate: (item: T) => boolean): T[]
    }
}

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

    // isNil: typeof isNil
    // compact: typeof compact
    // concat: typeof concat
    // difference: typeof difference
    // differenceBy: typeof differenceBy
    // drop: typeof drop
    // dropRight: typeof dropRight
    // dropRightWhile: typeof dropRightWhile
    // dropWhile: typeof dropWhile
    // fill: typeof fill
    // flatten: typeof flatten
    // flattenDeep: typeof flattenDeep
    // flattenDepth: typeof flattenDepth
    // fromPairs: typeof fromPairs
    // head: typeof head
    // initial: typeof initial
    // intersection: typeof intersection
    // intersectionBy: typeof intersectionBy
    // intersectionWith: typeof intersectionWith
    // last: typeof last
    // lastIndexOf: typeof lastIndexOf
    // nth: typeof nth
    // pull: typeof pull
    // pullAll: typeof pullAll
    // pullAllBy: typeof pullAllBy
    // pullAt: typeof pullAt
    // remove: typeof remove
    // reverse: typeof reverse
    // slice: typeof slice
    // sortedIndex: typeof sortedIndex
    // sortedIndexBy: typeof sortedIndexBy
    // sortedLastIndex: typeof sortedLastIndex
    // sortedLastIndexBy: typeof sortedLastIndexBy
    // sortedLastIndexOf: typeof sortedLastIndexOf
    // sortedUniq: typeof sortedUniq
    // tail: typeof tail
    // take: typeof take
    // takeRight: typeof takeRight
    // takeRightWhile: typeof takeRightWhile
    // takeWhile: typeof takeWhile
    // union: typeof union
    // unionBy: typeof unionBy
    // unionWith: typeof unionWith
    // uniq: typeof uniq
    // uniqBy: typeof uniqBy
    // unzip: typeof unzip
    // unzipWith: typeof unzipWith
    // without: typeof without
    // xor: typeof xor
    // xorBy: typeof xorBy
    // zip: typeof zip
    // zipObject: typeof zipObject
    // zipObjectDeep: typeof zipObjectDeep
    // zipWith: typeof zipWith
    // countBy: typeof countBy
    // forEach: typeof forEach
    // forEachRight: typeof forEachRight
    // every: typeof every
    // filter: typeof filter
    // find: typeof find
    // findLast: typeof findLast
    // flatMap: typeof flatMap
    // flatMapDeep: typeof flatMapDeep
    // flatMapDepth: typeof flatMapDepth
    // groupBy: typeof groupBy
    // includes: typeof includes
    // invokeMap: typeof invokeMap
    // keyBy: typeof keyBy
    // map: typeof map
    // orderBY: typeof orderBy
    // partition: typeof partition
    // reduce: typeof reduce
    // reduceRight: typeof reduceRight
    // reject: typeof reject
    // sample: typeof sample
    // sampleSize: typeof sampleSize
    // shuffle: typeof shuffle
    // size: typeof size
    // some: typeof some
    // sortBy: typeof sortBy
    // now: typeof now
    // after: typeof after
    // ary: typeof ary
    // before: typeof before
    // bind: typeof bind
    // bindKey: typeof bindKey
    // curry: typeof curry
    // curryRight: typeof curryRight
    // debounce: typeof debounce
    // defer: typeof defer
    // delay: typeof delay
    // flip: typeof flip
    // memoize: typeof memoize
    // negate: typeof negate
    // once: typeof once
    // overArgs: typeof overArgs
    // partial: typeof partial
    // partialRight: typeof partialRight
    // rearg: typeof rearg
    // rest: typeof rest
    // spread: typeof spread
    // throttle: typeof throttle
    // unary: typeof unary
    // wrap: typeof wrap
    // clone: typeof clone
    // cloneDeep: typeof cloneDeep
    // cloneDeepWith: typeof cloneDeepWith
    // conformsTo: typeof conformsTo
    // eq: typeof eq
    // gt: typeof gt
    // gte: typeof gte
    // isArguments: typeof isArguments
    // isArray: typeof isArray
    // isArrayBuffer: typeof isArrayBuffer
    // isArrayLike: typeof isArrayLike
    // isArrayLikeObject: typeof isArrayLikeObject
    // isBoolean: typeof isBoolean
    // isBuffer: typeof isBuffer
    // isDate: typeof isDate
    // isElement: typeof isElement
    // isEqual: typeof isEqual
    // isEqualWith: typeof isEqualWith
    // isError: typeof isError
    // isFinite: typeof isFinite
    // isFunction: typeof isFunction
    // isInteger: typeof isInteger
    // isLength: typeof isLength
    // isMatch: typeof isMatch
    // isMatchWith: typeof isMatchWith
    // isNaN: typeof isNaN
    // isNative: typeof isNative
    // isNull: typeof isNull
    // isNumber: typeof isNumber
    // isObject: typeof isObject
    // isObjectLike: typeof isObjectLike
    // isPlainObject: typeof isPlainObject
    // isRegExp: typeof isRegExp
    // isSafeInteger: typeof isSafeInteger
    // isSet: typeof isSet
    // isString: typeof isString
    // isSymbol: typeof isSymbol
    // isTypedArray: typeof isTypedArray
    // isUndefined: typeof isUndefined
    // isWeakMap: typeof isWeakMap
    // isWeakSet: typeof isWeakSet
    // lt: typeof lt
    // lte: typeof lte
    // toArray: typeof toArray
    // toFinite: typeof toFinite
    // toLength: typeof toLength
    // toPlainObject: typeof toPlainObject
    // toSafeInteger: typeof toSafeInteger
    // toString: typeof toString
    // add: typeof add
    // ceil: typeof ceil
    // divide: typeof divide
    // floor: typeof floor
    // max: typeof max
    // maxBy: typeof maxBy
    // mean: typeof mean
    // meanBy: typeof meanBy
    // min: typeof min
    // minBy: typeof minBy
    // multiply: typeof multiply
    // round: typeof round
    // subtract: typeof subtract
    // sum: typeof sum
    // sumBy: typeof sumBy
    // clamp: typeof clamp
    // inRange: typeof inRange
    // random: typeof random
    // assign: typeof assign
    // assignIn: typeof assignIn
    // assignInWith: typeof assignInWith
    // assignWith: typeof assignWith
    // at: typeof at
    // create: typeof create
    // defaults: typeof defaults
    // defaultsDeep: typeof defaultsDeep
    // toPairs: typeof toPairs
    // toPairsIn: typeof toPairsIn
    // findKey: typeof findKey
    // findLastKey: typeof findLastKey
    // forIn: typeof forIn
    // forInRight: typeof forInRight
    // forOwn: typeof forOwn
    // forOwnRight: typeof forOwnRight
    // functions: typeof functions
    // functionsIn: typeof functionsIn
    // get: typeof get
    // has: typeof has
    // hasIn: typeof hasIn
    // invert: typeof invert
    // invertBy: typeof invertBy
    // invoke: typeof invoke
    // keys: typeof keys
    // keysIn: typeof keysIn
    // mapKeys: typeof mapKeys
    // mapValues: typeof mapValues
    // merge: typeof merge
    // mergeWith: typeof mergeWith
    // omit: typeof omit
    // omitBy: typeof omitBy
    // pick: typeof pick
    // pickBy: typeof pickBy
    // result: typeof result
    // set: typeof set
    // setWith: typeof setWith
    // transform: typeof transform
    // unset: typeof unset
    // update: typeof update
    // updateWith: typeof updateWith
    // values: typeof values
    // valuesIn: typeof valuesIn
    // chain: typeof chain
    // tap: typeof tap
    // thru: typeof thru
    // camelCase: typeof camelCase
    // capitalize: typeof capitalize
    // deburr: typeof deburr
    // endsWith: typeof endsWith
    // escapeRegExp: typeof escapeRegExp
    // kebabCase: typeof kebabCase
    // lowerCase: typeof lowerCase
    // lowerFirst: typeof lowerFirst
    // pad: typeof pad
    // padEnd: typeof padEnd
    // padStart: typeof padStart
    // parseInt: typeof parseInt
    // repeat: typeof repeat
    // replace: typeof replace
    // snakeCase: typeof snakeCase
    // split: typeof split
    // startCase: typeof startCase
    // startsWith: typeof startsWith
    // template: typeof template
    // toLower: typeof toLower
    // toUpper: typeof toUpper
    // trim: typeof trim
    // trimEnd: typeof trimEnd
    // trimStart: typeof trimStart
    // truncate: typeof truncate
    // upperFirst: typeof upperFirst
    // words: typeof words
    // attempt: typeof attempt
    // bindAll: typeof bindAll
    // cond: typeof cond
    // conforms: typeof conforms
    // constant: typeof constant
    // defaultTo: typeof defaultTo
    // flow: typeof flow
    // flowRight: typeof flowRight
    // identity: typeof identity
    // iteratee: typeof iteratee
    // matches: typeof matches
    // matchesProperty: typeof matchesProperty
    // method: typeof method
    // methodOf: typeof methodOf
    // mixin: typeof mixin
    // noConflict: typeof noConflict
    // noop: typeof noop
    // nthArg: typeof nthArg
    // over: typeof over
    // overEvery: typeof overEvery
    // overSome: typeof overSome
    // property: typeof property
    // propertyOf: typeof propertyOf
    // range: typeof range
    // rangeRight: typeof rangeRight
    // runInContext: typeof runInContext
    // stubArray: typeof stubArray
    // stubFalse: typeof stubFalse
    // stubObject: typeof stubObject
    // stubString: typeof stubString
    // stubTrue: typeof stubTrue
    // times: typeof times
    // toPath: typeof toPath
    // uniqueId: typeof uniqueId
    // VERSION: typeof VERSION
    // templateSettings: typeof templateSettings
}
