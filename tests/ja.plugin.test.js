import _ from '../dist/index.js'
import '../dist/plugins/ja.js'
import { describe, it, expect } from 'vitest'

const ansuko = _

describe('JA Plugin', () => {
  it('kanaToFull', () => {
    expect(ansuko.kanaToFull('ｶﾞｷﾞ')).toBe('ガギ')
    expect(ansuko.kanaToFull('ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ')).toBe('パピプペポ')
    expect(ansuko.kanaToFull(123)).toBeNull()
  })

  it('kanaToHalf', () => {
    expect(ansuko.kanaToHalf('ガギ')).toBe('ｶﾞｷﾞ')
    expect(ansuko.kanaToHalf('アイウ')).toBe('ｱｲｳ')
    expect(ansuko.kanaToHalf(null)).toBeNull()
  })

  it('parentheses are converted (regression: used to become "undefined")', () => {
    expect(ansuko.kanaToFull('ｱ(ｲ)')).toBe('ア（イ）')
    expect(ansuko.kanaToHalf('ア（イ）')).toBe('ｱ(ｲ)')
    expect(ansuko.toFullWidth('a(b)')).toBe('ａ（ｂ）')
    // 正規表現を使い回しても結果が変わらないこと (g フラグの lastIndex)
    expect(ansuko.kanaToFull('ｱ(ｲ)')).toBe('ア（イ）')
  })

  it('kanaToHira / hiraToKana', () => {
    expect(ansuko.kanaToHira('アイウ')).toBe('あいう')
    expect(ansuko.hiraToKana('あいう')).toBe('アイウ')
  })

  it('toHalfWidth (with haifun)', () => {
    // hyphen normalization
    expect(ansuko.toHalfWidth('ABCーDEF','-')).toBe('ABC-DEF')
    // full-width to half-width
    expect(ansuko.toHalfWidth('ＡＢＣ１２３')).toBe('ABC123')
    // spaces
    expect(ansuko.toHalfWidth(' ｱｲｳ　123 ')).toBe(' ｱｲｳ 123 ')
  })

  it('toFullWidth (with haifun)', () => {
    expect(ansuko.toFullWidth('ABC-123','ー')).toBe('ＡＢＣー１２３')
    expect(ansuko.toFullWidth(' ｱｲｳ 123 ')).toBe('　アイウ　１２３　')
  })

  it('haifun normalization', () => {
    expect(ansuko.haifun('東京ー大阪—名古屋')).toBe('東京‐大阪‐名古屋')
    expect(ansuko.haifun('file_name〜test','‐',true)).toBe('file‐name‐test')
  })

  it('haifun keeps ASCII digits (astral code points must not split into BMP + digit)', () => {
    expect(ansuko.haifun('8‐1 10−0', '-')).toBe('8-1 10-0')
    expect(ansuko.toHalfWidth('西新宿二丁目８－１', '-')).toBe('西新宿二丁目8-1')
    expect(ansuko.haifun('\u{10110}\u{10191}', '-')).toBe('--')
  })
})
