import _ from "lodash";
import JSON5 from "json5";
import { toHalfWidth } from "./util.js";
const isValidStr = (str) => {
    if (_.isNil(str)) {
        return false;
    }
    if (_.isEmpty(str)) {
        return false;
    }
    return typeof str === "string";
};
const valueOr = (value, els) => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? value()
        : value;
    // Promiseかチェック
    if (resolvedValue instanceof Promise || els instanceof Promise) {
        // Promise処理ブランチ
        return Promise.resolve(resolvedValue).then(res => {
            if (_.isNil(res) || _.isEmpty(res)) {
                if (typeof els === "function") {
                    return els();
                }
                return els;
            }
            return res;
        });
    }
    else {
        // 同期処理ブランチ
        if (_.isNil(resolvedValue) || _.isEmpty(resolvedValue)) {
            if (typeof els === "function") {
                return els();
            }
            return els;
        }
        return resolvedValue;
    }
};
const hasOr = (value, paths, els) => {
    // 関数を解決
    const resolvedValue = typeof value === "function"
        ? value()
        : value;
    const pathArray = Array.isArray(paths) ? paths : [paths];
    // パスが全て存在するかチェック
    const checkPaths = (val) => {
        if (_.isNil(val) || _.isEmpty(val))
            return false;
        return pathArray.every(path => _.has(val, path));
    };
    // Promiseかチェック
    if (resolvedValue instanceof Promise || els instanceof Promise) {
        // Promise処理ブランチ
        return Promise.resolve(resolvedValue).then(res => {
            if (!checkPaths(res)) {
                if (typeof els === "function") {
                    return Promise.resolve(els(res));
                }
                return els;
            }
            return res;
        });
    }
    else {
        // 同期処理ブランチ
        if (!checkPaths(resolvedValue)) {
            if (typeof els === "function") {
                return els(resolvedValue);
            }
            return els;
        }
        return resolvedValue;
    }
};
const isEmpty = (value) => {
    if (_.isNil(value)) {
        return true;
    }
    if (_.isNumber(value)) {
        return false;
    }
    if (_.isBoolean(value)) {
        return false;
    }
    return _.isEmpty(value);
};
const toNumber = (value) => {
    if (_.isNil(value)) {
        return null;
    }
    if (_.isNumber(value)) {
        return value;
    }
    if (isEmpty(value)) {
        return null;
    }
    let v = toHalfWidth(value);
    if (typeof v === "string" && v.trim().match(/^[0-9][0-9,.]*$/)) {
        v = _.toNumber(v.trim().replace(/,/g, ""));
    }
    else {
        v = _.toNumber(v);
    }
    return _.isNaN(v) ? null : v;
};
const boolIf = (value, defaultValue = false) => {
    if (_.isBoolean(value)) {
        return value;
    }
    if (_.isNumber(value)) {
        return !!value;
    }
    return defaultValue;
};
const waited = (func, frameCount = 0) => {
    requestAnimationFrame(() => {
        if (frameCount > 0) {
            return waited(func, frameCount - 1);
        }
        func();
    });
};
const equalsOr = (...args) => {
    if (args.length === 2) {
        return valueOr(args[0], args[1]);
    }
    const [param1, param2, els] = args;
    // 関数を解決するヘルパー
    const resolveIfFunction = (val) => {
        return typeof val === "function" ? val() : val;
    };
    // Promiseが含まれているかチェック
    const p1 = resolveIfFunction(param1);
    const p2 = resolveIfFunction(param2);
    const hasPromise = (p1 instanceof Promise) || (p2 instanceof Promise) || (els instanceof Promise);
    if (hasPromise) {
        // Promise処理ブランチ
        return Promise.all([
            Promise.resolve(p1),
            Promise.resolve(p2)
        ]).then(([v1, v2]) => {
            if (_.isNil(v1) && _.isNil(v2)) {
                return null;
            }
            if (_.isEqual(v1, v2)) {
                return v1;
            }
            // elsの解決
            if (typeof els === "function") {
                return els();
            }
            return els;
        });
    }
    else {
        // 同期処理ブランチ
        if (_.isNil(p1) && _.isNil(p2)) {
            return null;
        }
        if (_.isEqual(p1, p2)) {
            return p1;
        }
        // elsの解決
        if (typeof els === "function") {
            return els();
        }
        return els;
    }
};
const parseJSON = (str) => {
    if (_.isNil(str)) {
        return null;
    }
    if (typeof str === "object") {
        return str;
    }
    try {
        return JSON5.parse(str);
    }
    catch {
        return null;
    }
};
const jsonStringify = (obj) => {
    if (_.isNil(obj)) {
        return null;
    }
    if (typeof obj === "string") {
        try {
            const j = JSON5.parse(obj);
            return JSON.stringify(j);
        }
        catch {
            return null;
        }
    }
    if (typeof obj === "object") {
        try {
            return JSON.stringify(obj);
        }
        catch {
            return null;
        }
    }
    return null;
};
const castArray = (value) => {
    if (_.isNil(value)) {
        return [];
    }
    return _.castArray(value);
};
const changes = (sourceValue, currentValue, keys, options, finallyCallback, notEmptyCallback) => {
    const diff = {};
    // keyExcludes時にdeep pathが指定されていたら警告
    if (options?.keyExcludes === true) {
        const hasDeepPath = keys.some(k => k.includes('.') || k.includes('['));
        if (hasDeepPath) {
            console.warn('[ansuko.changes] keyExcludes mode does not support deep paths. ' +
                'Keys with "." or "[" will be treated as literal property names.');
        }
    }
    const targetKeys = options?.keyExcludes === true
        ? _.difference(_.uniq([...Object.keys(sourceValue), ...Object.keys(currentValue)]), keys)
        : keys;
    for (const key of targetKeys) {
        const v1 = options?.keyExcludes === true ? sourceValue[key] : _.get(sourceValue, key);
        const v2 = options?.keyExcludes === true ? currentValue[key] : _.get(currentValue, key);
        if (_.isNil(v1) && _.isNil(v2))
            continue;
        if (_.isNil(v1) || _.isNil(v2)) {
            if (options?.keyExcludes === true) {
                diff[key] = v2 ?? null;
            }
            else {
                _.set(diff, key, v2 ?? null);
            }
            continue;
        }
        if (!_.isEqual(v1, v2)) {
            if (options?.keyExcludes === true) {
                diff[key] = v2 ?? null;
            }
            else {
                _.set(diff, key, v2 ?? null);
            }
        }
    }
    let notEmptyRes = true;
    if (!isEmpty(diff) && notEmptyCallback) {
        notEmptyRes = notEmptyCallback(diff);
        if (notEmptyRes instanceof Promise) {
            return notEmptyRes.then(async (res) => {
                res && await Promise.resolve(finallyCallback?.(diff, res));
                return diff;
            });
        }
    }
    if (finallyCallback && notEmptyRes) {
        const finallyRes = finallyCallback(diff, notEmptyRes);
        if (finallyRes instanceof Promise) {
            return finallyRes.then(() => diff);
        }
    }
    return diff;
};
const arrayDepth = (ary) => {
    if (!Array.isArray(ary)) {
        return 0;
    }
    if (_.size(ary) === 0) {
        return 1;
    }
    return 1 + Math.min(...ary.map(arrayDepth));
};
const extend = function (plugin) {
    if (typeof plugin === 'function') {
        plugin(this); // ← this が undefined になってる？
    }
    return this;
};
// Ansuko型へのキャストを外し、より安全な unknown as LoDashStatic に変更
export default {
    ..._,
    extend,
    isEmptyOrg: _.isEmpty,
    toNumberOrg: _.toNumber,
    castArrayOrg: _.castArray,
    isEmpty,
    toNumber,
    boolIf,
    isValidStr,
    valueOr,
    equalsOr,
    hasOr,
    waited,
    parseJSON,
    jsonStringify,
    castArray,
    changes,
    arrayDepth,
};
// 個別エクスポートはそのまま
export { isEmpty, toNumber, boolIf, isValidStr, valueOr, equalsOr, waited, parseJSON, jsonStringify, castArray, changes, arrayDepth, };
