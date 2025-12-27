import _ from "../index"
import * as turf from "@turf/turf"
import { Geometry, Polygon, Position } from "geojson"
import { type AnsukoType } from "../index.js"

export enum GeomType {
    point = "point",
    polygon = "polygon",
    lineString = "linestring",
    multiPoint = "multipoint",
    multiPolygon = "multipolygon",
    multiLineString = "multilinestring",
    auto = "auto",
}

export interface AnsukoGeoPluginExtension {
    toPointGeoJson: (geo: any, digit?: number) => GeoJSON.Point | null
    toPolygonGeoJson: (geo: any, digit?: number) => GeoJSON.Polygon | null
    toLineStringGeoJson: (geo: any, digit?: number) => GeoJSON.LineString | null
    toMultiPointGeoJson: (geo: any, digit?: number) => GeoJSON.MultiPoint | null
    toMultiPolygonGeoJson: (geo: any, digit?: number) => GeoJSON.MultiPolygon | null
    toMultiLineStringGeoJson: (geo: any, digit?: number) => GeoJSON.MultiLineString | null
    unionPolygon: (geo: any, digit?: number) => GeoJSON.Polygon | GeoJSON.MultiPolygon | null
}

const ansukoGeoPlugin = <T extends AnsukoType>(ansuko: T): T & AnsukoGeoPluginExtension => {

    const _ = ansuko as AnsukoType

    const toLngLatToArray = (coord: any, digit?: number): [number, number] | null => {
        if (_.isNil(coord)) { return null }
        let tLat:any = null
        let tLng:any = null
        if (Array.isArray(coord) && _.isNumber(coord[0]) && _.isNumber(coord[1])) {
            tLng = _.toNumber(coord[0])
            tLat = _.toNumber(coord[1])
        } else {
            if (typeof coord !== "object") { return null }
            tLng = _.toNumber(coord.lng ?? coord.lon ?? coord.longitude)
            tLat = _.toNumber(coord.lat ?? coord.latitude)
        }

        if (!tLat || !tLng) { return null }
        if (
            ((tLat < -90 || tLat > 90) && (tLng > -90 && tLng < 90)) ||
            ((tLng < -180 || tLng > 180) && (tLat > -180 && tLat < 180))
        ) {
            const t = tLat
            tLat = tLng
            tLat = t
        }
        return [
            (_.isNumber(digit) ? _.toNumber(tLng.toFixed(digit)) : tLng) as number,
            (_.isNumber(digit) ? _.toNumber(tLat.toFixed(digit)) : tLat) as number
        ]
    }

    const toPointGeoJson = (geo: any, digit?:number): GeoJSON.Point | null => {
        let lngLat: [number, number] | null = null

        if (_.isEmpty(geo)) { return null }

        if (Array.isArray(geo)) {
            if (_.size(geo) === 1) {
                lngLat = toLngLatToArray(geo[0], digit)
            } else {
                lngLat = toLngLatToArray(geo, digit)
            }
        } else if (_.has(geo, "lat") || _.has(geo, "latitude")) {
            lngLat = toLngLatToArray(geo, digit)
        } else if (_.has(geo, "type")) {
            switch((geo as any).type.toLowerCase()) {
                case "featurecollection":
                    if ((_.get(geo, "features[0].geometry.type") as any)?.toLowerCase() !== "point") { return null }
                    if (_.size((geo as any).features) !== 1) { return null }
                    lngLat = toLngLatToArray(_.get(geo, "features[0].geometry.coordinates"), digit)
                    break
                case "feature":
                    if ((geo as any).geometry?.type?.toLowerCase() !== "point") { return null }
                    lngLat = toLngLatToArray((geo as any).geometry?.coordinates, digit)
                    break
                case "point":
                    lngLat = toLngLatToArray((geo as any).coordinates, digit)
                    break
                default:
                    return null
            }
        } else {
            return null
        }

        if (!lngLat) { return null }  // null チェック追加

        try {
            return turf.point(lngLat)?.geometry
        } catch {
            return null
        }
    }

    const toPolygonGeoJson = (geo: any, digit?: number): GeoJSON.Polygon | null => {
        let ll = null
        if (_.arrayDepth(geo) === 3 && _.size(geo) === 1) {  // [[外周リング]]
            ll = (_.first(geo) as any).map((coord: any) => toLngLatToArray(coord, digit))
        } else if (_.arrayDepth(geo) === 2) {  // [外周リング]
            ll = geo.map((coord: any) => toLngLatToArray(coord, digit))
        } else if (_.has(geo, "type")) {
            switch (_.get(geo, "type")?.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "polygon") { return null }
                    if (_.size(geo.features) !== 1) { return null }
                    // 最初のリング（外周）だけ取得
                    ll = (_.first((_.first(geo.features) as any)?.geometry.coordinates) as any)
                        ?.map((coord: any) => toLngLatToArray(coord, digit))
                    break
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "polygon") { return null }
                    ll = (_.first(geo.geometry.coordinates) as any)?.map((coord: any) => toLngLatToArray(coord, digit))
                    break
                case "polygon":
                    ll = (_.first(geo.coordinates) as any)?.map((coord: any) => toLngLatToArray(coord, digit))
                    break
                default:
                    return null
            }
        } else {
            return null
        }

        if (!ll || (ll as any).find(_.isEmpty)) { return null }
        if (!_.isEqual(_.first(ll), _.last(ll))) { return null }  // 閉じてるかチェック

        try {
            return turf.polygon([ll])?.geometry  // [ll] で囲む（外周リングの配列にする）
        } catch {
            return null
        }
    }

    const toLineStringGeoJson = (geo: any, digit?: number): GeoJSON.LineString | null => {
        let ll = null
        if (_.arrayDepth(geo) === 3 && _.size(geo) === 1) {
            ll = (_.first(geo) as any).map((l: any) => toLngLatToArray(l, digit))
        } else if (_.arrayDepth(geo) === 2) {
            ll = geo.map((l: any) => toLngLatToArray(l, digit))
        } else if (_.has(geo, "type")) {
            switch (_.get(geo, "type")?.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "linestring") { return null }
                    if (_.size(geo.features) !== 1) { return null }
                    ll = (_.first(geo.features) as any)?.geometry.coordinates?.map((l: any) => toLngLatToArray(l, digit))
                    break
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "linestring") { return null }
                    ll = geo.geometry?.coordinates?.map((l: any) => toLngLatToArray(l, digit))
                    break
                case "linestring":
                    ll = geo.coordinates?.map((l: any) => toLngLatToArray(l, digit))
                    break
                default:
                    return null
            }
        } else {
            return null
        }
        if (!ll || (ll as any).find(_.isEmpty)) { return null }
        try {
            const feature = turf.lineString(ll)  // Feature を取得
            if (!_.isEmpty(turf.kinks(feature)?.features)) { return null }  // 交差チェック
            return feature.geometry  // Geometry を返す
        } catch {
            return null
        }
    }

    const toMultiPointGeoJson = (geo: any, digit?: number): GeoJSON.MultiPoint | null => {
        let ll = null
        if (_.arrayDepth(geo) === 2) {  // MultiPointは2次元
            ll = geo.map((coord: any) => toLngLatToArray(coord, digit))
        } else if (_.has(geo, "type")) {
            switch (_.get(geo, "type")?.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "multipoint") { return null }
                    if (_.size(geo.features) !== 1) { return null }
                    ll = (_.first(geo.features) as any).geometry?.coordinates
                        ?.map((coord: any) => toLngLatToArray(coord, digit))
                    break
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "multipoint") { return null }
                    ll = geo.geometry?.coordinates?.map((coord: any) => toLngLatToArray(coord, digit))
                    break
                case "multipoint":
                    ll = geo.coordinates?.map((coord: any) => toLngLatToArray(coord, digit))
                    break
                default:
                    return null
            }
        } else {
            return null
        }
        if (!ll || (ll as any).find(_.isEmpty)) { return null }
        try {
            return turf.multiPoint(ll)?.geometry
        } catch {
            return null
        }
    }

    const toMultiPolygonGeoJson = (geo: any, digit?: number): GeoJSON.MultiPolygon | null => {
        let ll = null
        if (_.arrayDepth(geo) === 4) {
            ll = geo.map((polygon: any) => (_.first(polygon) as any).map((l: any) => toLngLatToArray(l, digit)))
        } else if (_.has(geo, "type")) {
            switch (geo.type.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "multipolygon") { return null }
                    if (_.size(geo.features) !== 1) { return null }
                    ll = (_.first(geo.features) as any).geometry?.coordinates?.map((polygon: any) =>
                        (_.first(polygon) as any).map((l: any) => toLngLatToArray(l, digit))
                    )
                    break
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "multipolygon") { return null }
                    ll = geo.geometry?.coordinates?.map((polygon: any) =>
                        (_.first(polygon) as any).map((l: any) => toLngLatToArray(l, digit))
                    )
                    break
                case "multipolygon":
                    ll = geo.coordinates?.map((polygon: any) =>
                        (_.first(polygon) as any).map((l: any) => toLngLatToArray(l, digit))
                    )
                    break
                default:
                    return null
            }
        } else {
            return null
        }
        if (!ll || (ll as any).find((polygon: any) =>
            !polygon || polygon.find((ring: any) => !ring || ring.find(_.isEmpty)) || !_.isEqual(_.first(polygon), _.last(polygon))
        )) { return null }
        try {
            return turf.multiPolygon(ll)?.geometry
        } catch {
            return null
        }
    }


    const toMultiLineStringGeoJson = (geo: any, digit?: number): GeoJSON.MultiLineString | null => {
        let ll = null
        if (_.arrayDepth(geo) === 3) {
            ll = geo.map((line: any) => line.map((l: any) => toLngLatToArray(l, digit)))
        } else if (_.has(geo, "type")) {
            switch (_.get(geo, "type").toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "multilinestring") { return null }
                    if (_.size(geo.features) !== 1) { return null }
                    ll = (_.first(geo.features) as any).geometry?.coordinates?.map((line: any) => line.map((l: any) => toLngLatToArray(l, digit)))
                    break
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "multilinestring") { return null }  // 修正
                    ll = geo.geometry?.coordinates?.map((line: any) => line.map((l: any) => toLngLatToArray(l, digit)))
                    break
                case "multilinestring":
                    ll = geo.coordinates?.map((line: any) => line.map((l: any) => toLngLatToArray(l, digit)))
                    break
                default:
                    return null
            }
        }
        if (!ll || (ll as any).find((g: any) => !g || g.find(_.isEmpty))) { return null }
        try {
            // 一旦linestringでチェック
            if ((ll as any).find((l: any) => {
                const r = turf.lineString(l)
                if (!r) return true
                const kinks = turf.kinks(r)
                return !_.isEmpty(kinks.features)
            })) { return null }
            return turf.multiLineString(ll)?.geometry
        } catch {
            return null
        }
    }

    const unionPolygon = (geo: any, digit?: number):GeoJSON.Polygon|GeoJSON.MultiPolygon|null => {
        let list:any = null
        const g:any  = geo
        if (_.arrayDepth(geo) === 4) {
            geo = _.first(geo)
        }
        if (Array.isArray(geo)) {
            list = geo.map(g => {
                const p = toPolygonGeoJson(g, digit)
                return p ? turf.polygon(p.coordinates) : null
            }).filter(Boolean)
        }
        else if (_.has(geo, "type")) {
            switch (_.get(g, "type")?.toLowerCase()) {
                case "featurecollection":
                    list = g.features?.map((f: any) => {
                        const p = toPolygonGeoJson(f, digit)
                        return p ? turf.polygon(p.coordinates): null
                    }).filter(Boolean)
                    break
                case "feature":
                    if (g.geometry?.type !== "polygon") {
                        return g as GeoJSON.Polygon
                    } else if (g.geometry?.type === "multipolygon") {
                        list = g.geometry?.coordinates.map((c: any) => {
                            const p = toPolygonGeoJson(c, digit)
                            return p ? turf.polygon(p.coordinates): null
                        }).filter(Boolean)
                    }
                    break
                case "polygon":
                    return g as GeoJSON.Polygon
                case "multipolygon":
                    list = g.coordinates.map((c: any) => {
                        const p = toPolygonGeoJson(c, digit)
                        return p ? turf.polygon(p.coordinates) : null
                    }).filter(Boolean)
                    break
                default:
                    return null
            }
        } else {
            return null
        }
        if (_.isEmpty(list)) { return null }
        if (_.size(list) === 1) {
            return (_.first(list) as any).geometry
        }
        return turf.union(turf.featureCollection(list))?.geometry ?? null
    }

    const toGeoJson = (geo: any, type: GeomType = GeomType.auto, digit?: number): Geometry | null => {

        if (_.isEmpty(geo)) { return null }

        switch (type) {
            case GeomType.point:
                return toPointGeoJson(geo, digit)
            case GeomType.polygon:
                return toPolygonGeoJson(geo, digit)
            case GeomType.lineString:
                return toLineStringGeoJson(geo, digit)
            case GeomType.multiLineString:
                return toMultiLineStringGeoJson(geo, digit)
            case GeomType.multiPoint:
                return toMultiPointGeoJson(geo, digit)
            case GeomType.multiPolygon:
                return toMultiPolygonGeoJson(geo, digit)
            default:
                break
        }

        // auto: 次元の高い順に試す
        return toMultiPolygonGeoJson(geo, digit)
            ?? toMultiLineStringGeoJson(geo, digit)
            ?? toPolygonGeoJson(geo, digit)
            ?? toLineStringGeoJson(geo, digit)
            ?? toMultiPointGeoJson(geo, digit)
            ?? toPointGeoJson(geo, digit)
    }

    const parseToTerraDraw = (geo: any): GeoJSON.Feature[] => {
        let feature = toGeoJson(geo, GeomType.auto)

        if (_.isEmpty(feature) && Array.isArray(geo)) {
            return geo.flatMap(parseToTerraDraw)
        }
        if (!feature) return []

        const features: GeoJSON.Feature[] = []
        const geom = (feature as any).geometry as any  // 一度だけ

        switch (geom.type) {
            case "MultiPoint":
                geom.coordinates.forEach((coord: any) => {
                    const f = turf.point(coord, { mode: "point" })
                    f.id = crypto.randomUUID()
                    features.push(f)
                })
                break

            case "MultiLineString":
                geom.coordinates.forEach((coords: any) => {
                    const f = turf.lineString(coords, { mode: "linestring" })
                    f.id = crypto.randomUUID()
                    features.push(f)
                })
                break

            case "MultiPolygon":
                geom.coordinates.forEach((coords: any) => {
                    const f = turf.polygon(coords, { mode: "polygon" })
                    f.id = crypto.randomUUID()
                    features.push(f)
                })
                break

            default:
                const f: any = { ...feature }
                f.id = crypto.randomUUID()
                f.properties = {
                    ...f.properties,
                    mode: geom.type.toLowerCase()
                }
                features.push(f)
        }

        return features
    }

    const a = ansuko as any

    a.toGeoJson = toGeoJson
    a.toPointGeoJson = toPointGeoJson
    a.toPolygonGeoJson = toPolygonGeoJson
    a.toLineStringGeoJson = toLineStringGeoJson
    a.toMultiPointGeoJson = toMultiPointGeoJson
    a.toMultiLineStringGeoJson = toMultiLineStringGeoJson
    a.toMultiPolygonGeoJson = toMultiPolygonGeoJson
    a.unionPolygon = unionPolygon
    a.parseToTerraDraw = parseToTerraDraw

    return ansuko as T & AnsukoGeoPluginExtension
}

export default ansukoGeoPlugin

