import _ from '../dist/index.js'
import ja from '../dist/plugins/ja.js'
import { describe, it, expect } from 'vitest'

const ansuko = _.extend(ja)

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
})
