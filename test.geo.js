import _ from './dist/index.js'
import geo from './dist/plugins/geo.js'

console.log('=== Debug Start ===')

const ansuko = _.extend(geo)

console.log('1. ansukoにtoPointGeoJsonが追加されてる?', typeof ansuko.toPointGeoJson)
console.log('2. ansukoにisValidStrがある?', typeof ansuko.isValidStr)
console.log('3. ansukoにisEmptyがある?', typeof ansuko.isEmpty)

const testInput = [139.6917, 35.6895]
console.log('4. テスト入力:', testInput)

const result = ansuko.toPointGeoJson(testInput)
console.log('5. 結果:', result)

if (result === null) {
    console.log('❌ nullが返ってきた - toLngLatToArrayが失敗してる可能性')
} else {
    console.log('✅ 成功:', JSON.stringify(result, null, 2))
}
