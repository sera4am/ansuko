import _ from "lodash";
const escapeForCharClass = (s) => s.replace(/[\]\-\\\^]/g, '\\$&');
export const haifun = (text, replacement = "‐", expandInterpretation = false) => {
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
export const toHalfWidth = (value, withHaifun) => {
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
