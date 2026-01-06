/**
 * 多様なハイフン/ダッシュ/横線を1文字に正規化します。
 * Normalizes many hyphen/dash/horizontal-line code points into one.
 * @param text - 対象文字列 / Text to normalize
 * @param replacement - 置換文字 / Replacement (default "‐")
 * @param expandInterpretation - 波ダッシュ等も対象にするか / Include tildes/underscores, etc.
 * @returns 正規化文字列またはnull / Normalized text or null
 * @example haifun('東京ー大阪—名古屋') // '東京‐大阪‐名古屋'
 * @example haifun('file_name〜test','‐',true) // 'file‐name‐test'
 * @example haifun('ABC—123−XYZ','-') // 'ABC-123-XYZ'
 * @category String Utilities
 */
export declare const haifun: (text?: string, replacement?: string, expandInterpretation?: boolean) => string | null;
/**
 * 全角を半角へ変換し、必要に応じてハイフンも統一します。
 * Converts full-width to half-width; optionally normalizes hyphens.
 * @param value - 変換対象 / Value to convert
 * @param withHaifun - ハイフン統一文字 / Hyphen replacement
 * @returns 半角文字列またはnull / Half-width string or null
 * @example toHalfWidth('ＡＢＣ１２３') // 'ABC123'
 * @example toHalfWidth('東京都千代田区１ー２ー３','-') // '東京都千代田区1-2-3'
 * @example toHalfWidth('ＡＢＣ　１２３') // 'ABC 123'
 * @category String Utilities
 */
export declare const toHalfWidth: (value: unknown, withHaifun?: string) => string | null;
