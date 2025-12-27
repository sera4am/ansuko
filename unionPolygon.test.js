import _ from './dist/index.js'
import geo from './dist/plugins/geo.js'

// テストヘルパー
const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`❌ ${message}`)
    }
    console.log(`✅ ${message}`)
}

const assertEqual = (actual, expected, message) => {
    const isEqual = JSON.stringify(actual) === JSON.stringify(expected)
    if (!isEqual) {
        console.error(`Expected:`, expected)
        console.error(`Actual:`, actual)
        throw new Error(`❌ ${message}`)
    }
    console.log(`✅ ${message}`)
}

console.log('\n========== unionPolygon Tests ==========\n')

const ansuko = _.extend(geo)

// ========== Test 1: 2つの同じPolygonの結合 ==========
console.log('--- Test 1: Union of identical polygons ---')
const polygon1 = [
    [
        139.67888894608188,
        35.709194315067336
    ],
    [
        139.67888894608188,
        35.69791246840187
    ],
    [
        139.69870010347233,
        35.69791246840187
    ],
    [
        139.69870010347233,
        35.709194315067336
    ],
    [
        139.67888894608188,
        35.709194315067336
    ]
]

const polygon2 = [
    [
        139.67888894608188,
        35.709194315067336
    ],
    [
        139.67888894608188,
        35.69791246840187
    ],
    [
        139.69870010347233,
        35.69791246840187
    ],
    [
        139.69870010347233,
        35.709194315067336
    ],
    [
        139.67888894608188,
        35.709194315067336
    ]
]

const union1 = ansuko.unionPolygon([polygon1, polygon2])
assert(union1 !== null, 'unionPolygon should return result for identical polygons')
assert(union1.type === 'Polygon' || union1.type === 'MultiPolygon', 'Result should be Polygon or MultiPolygon')
console.log('Union result type:', union1.type)
console.log('Union coordinates:', JSON.stringify(union1.coordinates))

// ========== Test 2: 重ならないPolygonの結合 ==========
console.log('\n--- Test 2: Union of non-overlapping polygons ---')
const multiPolygon = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "coordinates": [
                    [
                        [
                            139.69271495922158,
                            35.70799694030191
                        ],
                        [
                            139.69271495922158,
                            35.704150935911485
                        ],
                        [
                            139.69713900584316,
                            35.704150935911485
                        ],
                        [
                            139.69713900584316,
                            35.70799694030191
                        ],
                        [
                            139.69271495922158,
                            35.70799694030191
                        ]
                    ]
                ],
                "type": "Polygon"
            }
        },
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "coordinates": [
                    [
                        [
                            139.69836212461473,
                            35.7063275436043
                        ],
                        [
                            139.69836212461473,
                            35.70294637989724
                        ],
                        [
                            139.70307243307468,
                            35.70294637989724
                        ],
                        [
                            139.70307243307468,
                            35.7063275436043
                        ],
                        [
                            139.69836212461473,
                            35.7063275436043
                        ]
                    ]
                ],
                "type": "Polygon"
            }
        }
    ]
}

const union2 = ansuko.unionPolygon(multiPolygon)
assert(union2 !== null, 'unionPolygon should handle feature collection')
assert(union2.type === 'MultiPolygon', 'Separate polygons should result in MultiPolygon')
console.log('Union result type:', union2.type)
console.log('Number of polygons:', union2.coordinates.length)

// ========== Test 3: 単一Polygonを渡す ==========
console.log('\n--- Test 3: Single polygon ---')
const singlePolygon = [
    [
        139.69836212461473,
        35.7063275436043
    ],
    [
        139.69836212461473,
        35.70294637989724
    ],
    [
        139.70307243307468,
        35.70294637989724
    ],
    [
        139.70307243307468,
        35.7063275436043
    ],
    [
        139.69836212461473,
        35.7063275436043
    ]
]

const union3 = ansuko.unionPolygon([singlePolygon])
assert(union3 !== null, 'unionPolygon should handle single polygon')
assert(union3.type === 'Polygon', 'Single polygon should return Polygon')
console.log('Union result type:', union3.type)

// ========== Test 4: digit精度指定 ==========
console.log('\n--- Test 4: With digit precision ---')
const polygon7 = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "coordinates": [
                    [
                        [
                            139.7002878860834,
                            35.707003759137365
                        ],
                        [
                            139.7002878860834,
                            35.705587926297156
                        ],
                        [
                            139.70242183798342,
                            35.705587926297156
                        ],
                        [
                            139.70242183798342,
                            35.707003759137365
                        ],
                        [
                            139.7002878860834,
                            35.707003759137365
                        ]
                    ]
                ],
                "type": "Polygon"
            }
        },
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "coordinates": [
                    [
                        [
                            139.70156305246286,
                            35.70778562619704
                        ],
                        [
                            139.70156305246286,
                            35.70607396130025
                        ],
                        [
                            139.70187533810594,
                            35.70607396130025
                        ],
                        [
                            139.70187533810594,
                            35.70778562619704
                        ],
                        [
                            139.70156305246286,
                            35.70778562619704
                        ]
                    ]
                ],
                "type": "Polygon"
            }
        },
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "coordinates": [
                    [
                        [
                            139.7029162902511,
                            35.70571471832264
                        ],
                        [
                            139.7029162902511,
                            35.704404524331764
                        ],
                        [
                            139.70455578988145,
                            35.704404524331764
                        ],
                        [
                            139.70455578988145,
                            35.70571471832264
                        ],
                        [
                            139.7029162902511,
                            35.70571471832264
                        ]
                    ]
                ],
                "type": "Polygon"
            }
        }
    ]
}

const union4 = ansuko.unionPolygon(polygon7, 9)
console.log(JSON.stringify(union4, null, 2))
assert(union4 !== null, 'unionPolygon should handle digit precision')
assert(union4.type === 'MultiPolygon', 'Result should be MultiPolygon')
// 座標が丸められているか確認
const firstCoord = union4.coordinates[0][0][0]
console.log('First coordinate (should be rounded to 9 digits):', firstCoord)
assert(firstCoord[0] === 139.700287886, 'Longitude should be rounded to 9 digits')
assert(firstCoord[1] === 35.705587926, 'Latitude should be rounded to 9 digits')

// ========== Test 5: null/invalid入力 ==========
console.log('\n--- Test 5: Invalid inputs ---')
const union5 = ansuko.unionPolygon(null)
assertEqual(union5, null, 'unionPolygon(null) should return null')

const union6 = ansuko.unionPolygon([])
assertEqual(union6, null, 'unionPolygon([]) should return null')

const union7 = ansuko.unionPolygon([[0, 0]])
assertEqual(union7, null, 'unionPolygon with invalid polygon should return null')

console.log('\n========== All unionPolygon Tests Passed! 🎉 ==========\n')