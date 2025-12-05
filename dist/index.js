import _ from "lodash";
import JSON5 from "json5";
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
    if (_.isNil(value)) {
        if (typeof els === "function") {
            return els();
        }
        return els;
    }
    if (typeof value === "function") {
        return valueOr(value(), els);
    }
    if (value instanceof Promise) {
        return value.then(res => valueOr(res, els));
    }
    if (_.isEmpty(value)) {
        if (typeof els === "function") {
            return els();
        }
        return els;
    }
    return value;
};
const kanaToFull = (str) => {
    if (!isValidStr(str)) {
        return str;
    }
    const kanaMap = {
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
    };
    const regex = new RegExp(`(${Object.keys(kanaMap).join('|')})`, 'g');
    return str.replace(regex, m => kanaMap[m]);
};
const kanaToHira = (str) => isValidStr(str) ? kanaToFull(str)
    .replace(/[\u30a1-\u30f6]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60)) : null;
const hiraToKana = (str) => isValidStr(str) ? str
    .replace(/[\u3041-\u3096]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60)) : null;
const toHalfWidth = (value) => {
    if (_.isNil(value)) {
        return null;
    }
    return String(value).split('').map(char => {
        const code = char.charCodeAt(0);
        // 全角は0xFF01～0xFF5E、半角は0x0021～0x007E
        if (code >= 0xFF01 && code <= 0xFF5E) {
            return String.fromCharCode(code - 0xFEE0);
        }
        return char;
    }).join('');
};
const isEmpty = (value) => {
    if (_.isNil(value)) {
        return true;
    }
    if (_.isNumber(value)) {
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
    if (!_.isNil(param1) && typeof param1 === "function") {
        return equalsOr(param1(), param2, els);
    }
    if (!_.isNil(param1) && (param1 instanceof Promise)) {
        return param1.then(v => equalsOr(v, param2, els));
    }
    if (!_.isNil(param2) && typeof param2 === "function") {
        return equalsOr(param1, param2(), els);
    }
    if (!_.isNil(param2) && param2 instanceof Promise) {
        return param2.then(v => equalsOr(param1, v, els));
    }
    if (_.isNil(param1) && _.isNil(param2)) {
        return null;
    }
    // 比較
    if (_.isEqual(param1, param2)) {
        return param1;
    }
    // elsの解決
    if (typeof els === "function") {
        return els();
    }
    return els;
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
    if (Array.isArray(value)) {
        return value;
    }
    return [value];
};
const changes = (sourceValue, currentValue, keys, options) => {
    const diff = {};
    const targetKeys = options?.keyExcludes === true ?
        _.uniq([...Object.keys(sourceValue), ...Object.keys(currentValue)])
            .filter(k => !keys.includes(k))
        : keys;
    for (const key of targetKeys) {
        const v1 = _.get(sourceValue, key);
        const v2 = _.get(currentValue, key);
        if (_.isNil(v1) && _.isNil(v2))
            continue;
        if (_.isNil(v1) || _.isNil(v2)) {
            diff[key] = v2 ?? null;
            continue;
        }
        if (!_.isEqual(v1, v2)) {
            diff[key] = v2 ?? null;
        }
    }
    return diff;
};
Array.prototype.notMap = function (predicate) {
    return this.map(_.negate(predicate));
};
Array.prototype.notFilter = function (predicate) {
    return this.filter(_.negate(predicate));
};
// @ts-ignore-next-line
export default {
    ..._,
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
};
// 個別エクスポートも提供
export { isEmpty, toNumber, boolIf, kanaToFull, kanaToHira, hiraToKana, isValidStr, valueOr, equalsOr, waited, parseJSON, jsonStringify, castArray, changes, };
