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
const kanaToFull = (str) => {
    if (!isValidStr(str)) {
        return null;
    }
    const regex = new RegExp(`(${Object.keys(kanaMap).join('|')})`, 'g');
    return str.replace(regex, m => kanaMap[m]);
};
const kanaToHalf = (str) => {
    if (!isValidStr(str)) {
        return null;
    }
    const reverseMap = _.invert(kanaMap);
    const sortedKeys = Object.keys(reverseMap)
        .sort((v1, v2) => _.size(v2) - _.size(v1));
    const regex = new RegExp(`(${sortedKeys.join('|')})`, 'g');
    return str.replace(regex, m => reverseMap[m]);
};
const kanaToHira = (str) => {
    if (!isValidStr(str)) {
        return null;
    }
    return kanaToFull(str)?.replace(/[\u30a1-\u30f6]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60)) ?? null;
};
const hiraToKana = (str) => {
    if (!isValidStr(str)) {
        return null;
    }
    return str.replace(/[\u3041-\u3096]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60)) ?? null;
};
const toHalfWidth = (value, withHaifun) => {
    if (_.isNil(value)) {
        return null;
    }
    const str = String(value).split('').map(char => {
        const code = char.charCodeAt(0);
        // スペース
        if (code === 0x3000) {
            return '\u0020'; // 全角スペース
        }
        // 全角は0xFF01～0xFF5E、半角は0x0021～0x007E
        if (code >= 0xFF01 && code <= 0xFF5E) {
            return String.fromCharCode(code - 0xFEE0);
        }
        return char;
    }).join('');
    return withHaifun ? haifun(str, withHaifun) : str;
};
const toFullWidth = (value, withHaifun) => {
    if (_.isNil(value)) {
        return null;
    }
    const withFullKana = kanaToFull(String(value));
    if (_.isNil(withFullKana)) {
        return null;
    }
    const str = withFullKana.split('').map(char => {
        const code = char.charCodeAt(0);
        // スペース
        if (code === 0x0020) {
            return '\u3000'; // 全角スペース
        }
        // 全角は0xFF01～0xFF5E、半角は0x0021～0x007E
        if (code >= 0x0021 && code <= 0x007E) {
            return String.fromCharCode(code + 0xFEE0);
        }
        return char;
    }).join('');
    return withHaifun ? haifun(str, withHaifun) : str;
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
const changes = (sourceValue, currentValue, keys, options) => {
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
    return diff;
};
const escapeForCharClass = (s) => s.replace(/[\]\-\\\^]/g, '\\$&');
const haifun = (text, replacement = "‐", expandInterpretation = false) => {
    const base = [
        "\u002D", // - (HYPHEN-MINUS: ASCII標準のハイフン/マイナス)
        "\u02D7", // ˗ (MODIFIER LETTER MINUS SIGN: 音韻記号のマイナス)
        "\u1173", // ᅳ (HANGUL JUNGSEONG EU: ハングルの母音字母)
        "\u1B78", // ᭸ (BALINESE LETTER U: バリ文字の母音記号)
        "\u2010", // ‐ (HYPHEN: 改行可能なハイフン)
        "\u2011", // ‑ (NON-BREAKING HYPHEN: 改行不可のハイフン)
        "\u2012", // ‒ (FIGURE DASH: 数字幅のダッシュ)
        "\u2013", // – (EN DASH: 欧文の範囲表示用ダッシュ)
        "\u2014", // — (EM DASH: 欧文の区切り用長ダッシュ)
        "\u2015", // ― (HORIZONTAL BAR: 和文の水平線/ダッシュ)
        "\u2043", // ⁃ (HYPHEN BULLET: 箇条書き用ハイフン)
        "\u207B", // ⁻ (SUPERSCRIPT MINUS: 上付きマイナス)
        "\u2212", // − (MINUS SIGN: 数学用マイナス記号)
        "\u25AC", // ▬ (BLACK RECTANGLE: 黒い矩形)
        "\u2500", // ─ (BOX DRAWINGS LIGHT HORIZONTAL: 罫線素片)
        "\u2501", // ━ (BOX DRAWINGS HEAVY HORIZONTAL: 太罫線素片)
        "\u2574", // ╴ (BOX DRAWINGS LIGHT LEFT: 左向き罫線)
        "\u2576", // ╶ (BOX DRAWINGS LIGHT RIGHT: 右向き罫線)
        "\u257C", // ╼ (BOX DRAWINGS LIGHT LEFT AND HEAVY RIGHT: 左軽右重罫線)
        "\u257A", // ╺ (BOX DRAWINGS HEAVY LEFT AND LIGHT RIGHT: 左重右軽罫線)
        "\u257E", // ╾ (BOX DRAWINGS HEAVY LEFT: 左向き太罫線)
        "\u2796", // ➖ (HEAVY MINUS SIGN: 太字マイナス記号)
        "\u2F00", // ⼀ (KANGXI RADICAL ONE: 康熙部首の一)
        "\u30FC", // ー (KATAKANA-HIRAGANA PROLONGED SOUND MARK: 長音記号)
        "\u3127", // ㄧ (BOPOMOFO LETTER I: 注音符号のイ)
        "\u3161", // ㅡ (HANGUL LETTER EU: ハングル互換字母)
        "\u3192", // ㆒ (IDEOGRAPHIC ANNOTATION ONE MARK: 漢数字注釈の一)
        "\u31D0", // ㇐ (CJK STROKE H: CJK筆画の横)
        "\u4E00", // 一 (CJK UNIFIED IDEOGRAPH-4E00: 漢字の一)
        "\u4EA0", // 亠 (CJK UNIFIED IDEOGRAPH-4EA0: 漢字の亠/なべぶた)
        "\uFE58", // ﹘ (SMALL EM DASH: 小字形の長ダッシュ)
        "\uFE63", // ﹣ (SMALL HYPHEN-MINUS: 小字形のハイフン)
        "\uFF0D", // − (FULL WIDTH HYPHEN-MINUS: 全角ハイフンマイナス)
        "\uFF70", // ｰ (HALF WIDTH KATAKANA-HIRAGANA PROLONGED SOUND MARK: 半角長音)
        "\uFFDA", // ￚ (HALFWIDTH HANGUL LETTER EU: 半角ハングル字母)
        "\u10110", // 𐄐 (AEGEAN NUMBER TEN: エーゲ数字の10)
        "\u10191", // 𐆑 (ROMAN UNCIA SIGN: ローマ数字のウンキア記号)
        "\u1680", //   (OGHAM SPACE MARK: オガム文字の空白記号)
    ];
    const ex = [
        "\u2192", // → (RIGHTWARDS ARROW: 右向き矢印)
        "\u2504", // ┄ (BOX DRAWINGS LIGHT TRIPLE DASH HORIZONTAL: 3点鎖線)
        "\u2505", // ┅ (BOX DRAWINGS HEAVY TRIPLE DASH HORIZONTAL: 太3点鎖線)
        "\u2508", // ┈ (BOX DRAWINGS LIGHT QUADRUPLE DASH HORIZONTAL: 4点鎖線)
        "\u2509", // ┉ (BOX DRAWINGS HEAVY QUADRUPLE DASH HORIZONTAL: 太4点鎖線)
        "\u254C", // ╌ (BOX DRAWINGS LIGHT DOUBLE DASH HORIZONTAL: 2点鎖線)
        "\u254D", // ╍ (BOX DRAWINGS HEAVY DOUBLE DASH HORIZONTAL: 太2点鎖線)
        "\u301C", // 〜 (WAVE DASH: 波ダッシュ)
        "\u007E", // ~ (TILDE: チルダ)
        "\u005F", // _ (LOW LINE: アンダースコア)
        "\uFF3F", // ＿ (FULLWIDTH LOW LINE: 全角アンダースコア)
        "\uFE4E", // ﹎ (CENTRELINE LOW LINE: 中央線アンダースコア)
        "\uFFE3", // ￣ (FULLWIDTH MACRON: 全角マクロン/上線)
        "\u02C9", // ˉ (MODIFIER LETTER MACRON: 修飾用マクロン)
    ];
    const baseClass = base.map(escapeForCharClass).join("");
    const exClass = ex.map(escapeForCharClass).join("");
    // 'u' フラグを追加して Unicode のサロゲート対を正しく扱い、文字クラスの特殊文字は事前にエスケープする
    const res = text?.replace(new RegExp(`[${baseClass}]`, "gu"), replacement);
    return (expandInterpretation ? res?.replace(new RegExp(`[${exClass}]`, "gu"), replacement) ?? undefined : res) ?? null;
};
Array.prototype.notMap = function (predicate) {
    return this.map(_.negate(predicate));
};
Array.prototype.notFilter = function (predicate) {
    return this.filter(_.negate(predicate));
};
// Ansuko型へのキャストを外し、より安全な unknown as LoDashStatic に変更
export default {
    ..._,
    isEmptyOrg: _.isEmpty,
    toNumberOrg: _.toNumber,
    castArrayOrg: _.castArray,
    isEmpty,
    toNumber,
    boolIf,
    kanaToFull,
    kanaToHalf,
    kanaToHira,
    hiraToKana,
    toFullWidth,
    toHalfWidth,
    isValidStr,
    valueOr,
    equalsOr,
    hasOr,
    waited,
    parseJSON,
    jsonStringify,
    castArray,
    changes,
    haifun,
};
// 個別エクスポートはそのまま
export { isEmpty, toNumber, boolIf, kanaToFull, kanaToHalf, kanaToHira, hiraToKana, toFullWidth, toHalfWidth, isValidStr, valueOr, equalsOr, waited, parseJSON, jsonStringify, castArray, changes, haifun, };
