import { type AnsukoType } from "../index.js"
import { toHalfWidth, haifun } from "../util.js"


export interface AnsukoJaExtension {
    kanaToFull: (str: unknown) => string | null
    kanaToHalf: (str: unknown) => string | null
    kanaToHira: (str: unknown) => string | null
    hiraToKana: (str: unknown) => string | null
    toHalfWidth: (value: unknown, withHaifun?: string) => string | null
    toFullWidth: (value: unknown, withHaifun?: string) => string | null
    haifun: typeof haifun
}

const ansukoJaPlugin = <T extends AnsukoType>(ansuko: T): T & AnsukoJaExtension => {

    const _ = ansuko as AnsukoType


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

    const kanaToFull = (str: unknown): string | null => {
        if (!_.isValidStr(str)) { return null }
        const regex = new RegExp(`(${Object.keys(kanaMap).join('|')})`, 'g')
        return str.replace(regex, m => kanaMap[m])
    }

    const kanaToHalf = (str: unknown): string | null => {
        if (!_.isValidStr(str)) { return null }

        const reverseMap = _.invert(kanaMap)
        const sortedKeys = Object.keys(reverseMap)
            .sort((v1: string, v2: string) => _.size(v2) - _.size(v1))
        const regex = new RegExp(`(${sortedKeys.join('|')})`, 'g')
        return str.replace(regex, m => reverseMap[m])
    }

    const kanaToHira = (str: unknown): string | null => {
        if (!_.isValidStr(str)) { return null }
        return kanaToFull(str)?.replace(/[\u30a1-\u30f6]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60)) ?? null
    }

    const hiraToKana = (str: unknown): string | null => {
        if (!_.isValidStr(str)) { return null }
        return str.replace(/[\u3041-\u3096]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60)) ?? null
    }


    const toFullWidth = (value: unknown, withHaifun?: string): string | null => {
        if (_.isNil(value)) { return null }
        const withFullKana = kanaToFull(String(value))
        if (_.isNil(withFullKana)) { return null }
        const str = withFullKana!.split('').map(char => {
            const code = char.charCodeAt(0)
            // スペース
            if (code === 0x0020) {
                return '\u3000'  // 全角スペース
            }
            // 全角は0xFF01～0xFF5E、半角は0x0021～0x007E
            if (code >= 0x0021 && code <= 0x007E) {
                return String.fromCharCode(code + 0xFEE0)
            }
            return char
        }).join('')
        return withHaifun ? haifun(str, withHaifun) : str
    }

    const a = ansuko as any
    a.kanaToFull = kanaToFull
    a.kanaToHalf = kanaToHalf
    a.kanaToHira = kanaToHira
    a.hiraToKana = hiraToKana
    a.toHalfWidth = toHalfWidth
    a.toFullWidth = toFullWidth
    a.haifun = haifun

    return ansuko as T & AnsukoJaExtension
}

export default ansukoJaPlugin