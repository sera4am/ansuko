import { haifun } from "../util.js";
const ansukoJaPlugin = (ansuko) => {
    const _ = ansuko;
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
    /**
     * Converts half-width katakana to full-width.
     * @param str - String
     * @returns Full-width katakana or null
     * @example _.kanaToFull('ｶﾞｷﾞ') // 'ガギ'
     * @category Japanese Utilities
     */
    const kanaToFull = (str) => {
        if (!_.isValidStr(str)) {
            return null;
        }
        const regex = new RegExp(`(${Object.keys(kanaMap).join('|')})`, 'g');
        return str.replace(regex, m => kanaMap[m]);
    };
    /**
     * Converts full-width katakana to half-width (dakuten may split into two characters).
     * @param str - String
     * @returns Half-width katakana or null
     * @example _.kanaToHalf('ガギ') // 'ｶﾞｷﾞ'
     * @category Japanese Utilities
     */
    const kanaToHalf = (str) => {
        if (!_.isValidStr(str)) {
            return null;
        }
        const reverseMap = _.invert(kanaMap);
        const sortedKeys = Object.keys(reverseMap)
            .sort((v1, v2) => _.size(v2) - _.size(v1));
        const regex = new RegExp(`(${sortedKeys.join('|')})`, 'g');
        return str.replace(regex, m => reverseMap[m]);
    };
    /**
     * Converts katakana to hiragana; half-width input is converted to full-width first.
     * @param str - String
     * @returns Hiragana or null
     * @example _.kanaToHira('アイウ') // 'あいう'
     * @category Japanese Utilities
     */
    const kanaToHira = (str) => {
        if (!_.isValidStr(str)) {
            return null;
        }
        return kanaToFull(str)?.replace(/[\u30a1-\u30f6]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60)) ?? null;
    };
    /**
     * Converts hiragana to katakana.
     * @param str - String
     * @returns Katakana or null
     * @example _.hiraToKana('あいう') // 'アイウ'
     * @category Japanese Utilities
     */
    const hiraToKana = (str) => {
        if (!_.isValidStr(str)) {
            return null;
        }
        return str.replace(/[\u3041-\u3096]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60)) ?? null;
    };
    /**
     * Converts half-width characters to full-width; optionally normalizes hyphens.
     * @param value - Value to convert
     * @param withHaifun - Hyphen replacement character
     * @returns Full-width string or null
     * @example _.toFullWidth('ABC-123','ー') // 'ＡＢＣー１２３'
     * @category Japanese Utilities
     */
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
            // 全角は0x0021～0x007E、半角は0xFF01～0xFF5E
            if (code >= 0x0021 && code <= 0x007E) {
                return String.fromCharCode(code + 0xFEE0);
            }
            return char;
        }).join('');
        return withHaifun ? haifun(str, withHaifun) : str;
    };
    /**
     * Converts to half-width and optionally normalizes hyphens.
     * @param value - Value to convert
     * @param withHaifun - Hyphen replacement character
     * @returns Half-width string or null
     * @example _.toHalfWidth('ＡＢＣー１２３','-') // 'ABC-123'
     * @example _.toHalfWidth(' ｱｲｳ 123 ') // ' ｱｲｳ 123 '
     * @category Japanese Utilities
     */
    const toHalfWidth = (value, withHaifun) => {
        if (_.isNil(value)) {
            return null;
        }
        const str = String(value).split('').map(char => {
            const code = char.charCodeAt(0);
            // スペース
            if (code === 0x3000) {
                return '\u0020'; // 半角スペース
            }
            // 全角は0xFF01～0xFF5E、半角は0x0021～0x007E
            if (code >= 0xFF01 && code <= 0xFF5E) {
                return String.fromCharCode(code - 0xFEE0);
            }
            return char;
        }).join('');
        return withHaifun ? haifun(str, withHaifun) : str;
    };
    const a = ansuko;
    a.kanaToFull = kanaToFull;
    a.kanaToHalf = kanaToHalf;
    a.kanaToHira = kanaToHira;
    a.hiraToKana = hiraToKana;
    a.toHalfWidth = toHalfWidth;
    a.toFullWidth = toFullWidth;
    a.haifun = haifun;
    return ansuko;
};
export default ansukoJaPlugin;
