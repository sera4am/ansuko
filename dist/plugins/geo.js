import * as turf from "@turf/turf";
export var GeomType;
(function (GeomType) {
    GeomType["point"] = "point";
    GeomType["polygon"] = "polygon";
    GeomType["lineString"] = "linestring";
    GeomType["multiPoint"] = "multipoint";
    GeomType["multiPolygon"] = "multipolygon";
    GeomType["multiLineString"] = "multilinestring";
    GeomType["auto"] = "auto";
})(GeomType || (GeomType = {}));
const ansukoGeoPlugin = (ansuko) => {
    const _ = ansuko;
    const toLngLatToArray = (coord, digit) => {
        if (_.isNil(coord)) {
            return null;
        }
        let tLat = null;
        let tLng = null;
        if (Array.isArray(coord) && _.isNumber(coord[0]) && _.isNumber(coord[1])) {
            tLng = _.toNumber(coord[0]);
            tLat = _.toNumber(coord[1]);
        }
        else {
            if (typeof coord !== "object") {
                return null;
            }
            tLng = _.toNumber(coord.lng ?? coord.lon ?? coord.longitude);
            tLat = _.toNumber(coord.lat ?? coord.latitude);
        }
        console.log(tLat, tLng, _.toNumber(coord[0]));
        if (!tLat || !tLng) {
            return null;
        }
        if (((tLat < -90 || tLat > 90) && (tLng > -90 && tLng < 90)) ||
            ((tLng < -180 || tLng > 180) && (tLat > -180 && tLat < 180))) {
            const t = tLat;
            tLat = tLng;
            tLat = t;
        }
        return [
            (_.isNumber(digit) ? _.toNumber(tLng.toFixed(digit)) : tLng),
            (_.isNumber(digit) ? _.toNumber(tLat.toFixed(digit)) : tLat)
        ];
    };
    const toPointGeoJson = (geo, digit) => {
        let lngLat = null;
        if (_.isEmpty(geo)) {
            return null;
        }
        if (Array.isArray(geo)) {
            if (_.size(geo) === 1) {
                lngLat = toLngLatToArray(geo[0], digit);
            }
            else {
                lngLat = toLngLatToArray(geo, digit);
            }
        }
        else if (_.has(geo, "lat") || _.has(geo, "latitude")) {
            lngLat = toLngLatToArray(geo, digit);
        }
        else if (_.has(geo, "type")) {
            switch (geo.type.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "point") {
                        return null;
                    }
                    if (_.size(geo.features) !== 1) {
                        return null;
                    }
                    lngLat = toLngLatToArray(_.get(geo, "features[0].geometry.coordinates"), digit);
                    break;
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "point") {
                        return null;
                    }
                    lngLat = toLngLatToArray(geo.geometry?.coordinates, digit);
                    break;
                case "point":
                    lngLat = toLngLatToArray(geo.coordinates, digit);
                    break;
                default:
                    return null;
            }
        }
        else {
            return null;
        }
        if (!lngLat) {
            return null;
        } // null チェック追加
        try {
            return turf.point(lngLat)?.geometry;
        }
        catch {
            return null;
        }
    };
    const toPolygonGeoJson = (geo, digit) => {
        let ll = null;
        if (_.arrayDepth(geo) === 3 && _.size(geo) === 1) { // [[外周リング]]
            ll = _.first(geo).map((coord) => toLngLatToArray(coord, digit));
        }
        else if (_.arrayDepth(geo) === 2) { // [外周リング]
            ll = geo.map((coord) => toLngLatToArray(coord, digit));
            console.log("[PolygonGeoJson]", "parse", ll);
        }
        else if (_.has(geo, "type")) {
            switch (_.get(geo, "type")?.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "polygon") {
                        return null;
                    }
                    if (_.size(geo.features) !== 1) {
                        return null;
                    }
                    // 最初のリング（外周）だけ取得
                    ll = _.first(_.first(geo.features)?.geometry.coordinates)
                        ?.map((coord) => toLngLatToArray(coord, digit));
                    break;
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "polygon") {
                        return null;
                    }
                    ll = _.first(geo.geometry.coordinates)?.map((coord) => toLngLatToArray(coord, digit));
                    break;
                case "polygon":
                    ll = _.first(geo.coordinates)?.map((coord) => toLngLatToArray(coord, digit));
                    break;
                default:
                    return null;
            }
        }
        else {
            return null;
        }
        if (!ll || ll.find(_.isEmpty)) {
            return null;
        }
        if (!_.isEqual(_.first(ll), _.last(ll))) {
            return null;
        } // 閉じてるかチェック
        try {
            return turf.polygon([ll])?.geometry; // [ll] で囲む（外周リングの配列にする）
        }
        catch {
            return null;
        }
    };
    const toLineStringGeoJson = (geo, digit) => {
        let ll = null;
        if (_.arrayDepth(geo) === 3 && _.size(geo) === 1) {
            ll = _.first(geo).map((l) => toLngLatToArray(l, digit));
        }
        else if (_.arrayDepth(geo) === 2) {
            ll = geo.map((l) => toLngLatToArray(l, digit));
        }
        else if (_.has(geo, "type")) {
            switch (_.get(geo, "type")?.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "linestring") {
                        return null;
                    }
                    if (_.size(geo.features) !== 1) {
                        return null;
                    }
                    ll = _.first(geo.features)?.geometry.coordinates?.map((l) => toLngLatToArray(l, digit));
                    break;
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "linestring") {
                        return null;
                    }
                    ll = geo.geometry?.coordinates?.map((l) => toLngLatToArray(l, digit));
                    break;
                case "linestring":
                    ll = geo.coordinates?.map((l) => toLngLatToArray(l, digit));
                    break;
                default:
                    return null;
            }
        }
        else {
            return null;
        }
        if (!ll || ll.find(_.isEmpty)) {
            return null;
        }
        try {
            const feature = turf.lineString(ll); // Feature を取得
            if (!_.isEmpty(turf.kinks(feature)?.features)) {
                return null;
            } // 交差チェック
            return feature.geometry; // Geometry を返す
        }
        catch {
            return null;
        }
    };
    const toMultiPointGeoJson = (geo, digit) => {
        let ll = null;
        if (_.arrayDepth(geo) === 2) { // MultiPointは2次元
            ll = geo.map((coord) => toLngLatToArray(coord, digit));
        }
        else if (_.has(geo, "type")) {
            switch (_.get(geo, "type")?.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "multipoint") {
                        return null;
                    }
                    if (_.size(geo.features) !== 1) {
                        return null;
                    }
                    ll = _.first(geo.features).geometry?.coordinates
                        ?.map((coord) => toLngLatToArray(coord, digit));
                    break;
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "multipoint") {
                        return null;
                    }
                    ll = geo.geometry?.coordinates?.map((coord) => toLngLatToArray(coord, digit));
                    break;
                case "multipoint":
                    ll = geo.coordinates?.map((coord) => toLngLatToArray(coord, digit));
                    break;
                default:
                    return null;
            }
        }
        else {
            return null;
        }
        if (!ll || ll.find(_.isEmpty)) {
            return null;
        }
        try {
            return turf.multiPoint(ll)?.geometry;
        }
        catch {
            return null;
        }
    };
    const toMultiPolygonGeoJson = (geo, digit) => {
        let ll = null;
        if (_.arrayDepth(geo) === 4) {
            ll = geo.map((polygon) => _.first(polygon).map((l) => toLngLatToArray(l, digit)));
        }
        else if (_.has(geo, "type")) {
            switch (geo.type.toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "multipolygon") {
                        return null;
                    }
                    if (_.size(geo.features) !== 1) {
                        return null;
                    }
                    ll = _.first(geo.features).geometry?.coordinates?.map((polygon) => _.first(polygon).map((l) => toLngLatToArray(l, digit)));
                    break;
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "multipolygon") {
                        return null;
                    }
                    ll = geo.geometry?.coordinates?.map((polygon) => _.first(polygon).map((l) => toLngLatToArray(l, digit)));
                    break;
                case "multipolygon":
                    ll = geo.coordinates?.map((polygon) => _.first(polygon).map((l) => toLngLatToArray(l, digit)));
                    break;
                default:
                    return null;
            }
        }
        else {
            return null;
        }
        if (!ll || ll.find((polygon) => !polygon || polygon.find((ring) => !ring || ring.find(_.isEmpty)) || !_.isEqual(_.first(polygon), _.last(polygon)))) {
            return null;
        }
        try {
            return turf.multiPolygon(ll)?.geometry;
        }
        catch {
            return null;
        }
    };
    const toMultiLineStringGeoJson = (geo, digit) => {
        let ll = null;
        if (_.arrayDepth(geo) === 3) {
            ll = geo.map((line) => line.map((l) => toLngLatToArray(l, digit)));
        }
        else if (_.has(geo, "type")) {
            switch (_.get(geo, "type").toLowerCase()) {
                case "featurecollection":
                    if (_.get(geo, "features[0].geometry.type")?.toLowerCase() !== "multilinestring") {
                        return null;
                    }
                    if (_.size(geo.features) !== 1) {
                        return null;
                    }
                    ll = _.first(geo.features).geometry?.coordinates?.map((line) => line.map((l) => toLngLatToArray(l, digit)));
                    break;
                case "feature":
                    if (geo.geometry?.type?.toLowerCase() !== "multilinestring") {
                        return null;
                    } // 修正
                    ll = geo.geometry?.coordinates?.map((line) => line.map((l) => toLngLatToArray(l, digit)));
                    break;
                case "multilinestring":
                    ll = geo.coordinates?.map((line) => line.map((l) => toLngLatToArray(l, digit)));
                    break;
                default:
                    return null;
            }
        }
        if (!ll || ll.find((g) => !g || g.find(_.isEmpty))) {
            return null;
        }
        try {
            // 一旦linestringでチェック
            if (ll.find((l) => {
                const r = turf.lineString(l);
                if (!r)
                    return true;
                const kinks = turf.kinks(r);
                return !_.isEmpty(kinks.features);
            })) {
                return null;
            }
            return turf.multiLineString(ll)?.geometry;
        }
        catch {
            return null;
        }
    };
    const unionPolygon = (geo, digit) => {
        let list = null;
        const g = geo;
        console.log("[Union]", "Array depth", _.arrayDepth(geo));
        if (_.arrayDepth(geo) === 4) {
            geo = _.first(geo);
        }
        if (Array.isArray(geo)) {
            list = geo.map(g => {
                const p = toPolygonGeoJson(g, digit);
                return p ? turf.polygon(p.coordinates) : null;
            }).filter(Boolean);
        }
        else if (_.has(geo, "type")) {
            switch (_.get(g, "type")?.toLowerCase()) {
                case "featurecollection":
                    list = g.features?.map((f) => {
                        const p = toPolygonGeoJson(f, digit);
                        return p ? turf.polygon(p.coordinates) : null;
                    }).filter(Boolean);
                    break;
                case "feature":
                    if (g.geometry?.type !== "polygon") {
                        return g;
                    }
                    else if (g.geometry?.type === "multipolygon") {
                        list = g.geometry?.coordinates.map((c) => {
                            const p = toPolygonGeoJson(c, digit);
                            return p ? turf.polygon(p.coordinates) : null;
                        }).filter(Boolean);
                    }
                    break;
                case "polygon":
                    return g;
                case "multipolygon":
                    list = g.coordinates.map((c) => {
                        const p = toPolygonGeoJson(c, digit);
                        return p ? turf.polygon(p.coordinates) : null;
                    }).filter(Boolean);
                    break;
                default:
                    return null;
            }
        }
        else {
            return null;
        }
        if (_.isEmpty(list)) {
            return null;
        }
        if (_.size(list) === 1) {
            console.log("[Single response]", JSON.stringify(list));
            return _.first(list).geometry;
        }
        return turf.union(turf.featureCollection(list))?.geometry ?? null;
    };
    const toGeoJson = (geo, type = GeomType.auto, digit) => {
        if (_.isEmpty(geo)) {
            return null;
        }
        switch (type) {
            case GeomType.point:
                return toPointGeoJson(geo, digit);
            case GeomType.polygon:
                return toPolygonGeoJson(geo, digit);
            case GeomType.lineString:
                return toLineStringGeoJson(geo, digit);
            case GeomType.multiLineString:
                return toMultiLineStringGeoJson(geo, digit);
            case GeomType.multiPoint:
                return toMultiPointGeoJson(geo, digit);
            case GeomType.multiPolygon:
                return toMultiPolygonGeoJson(geo, digit);
            default:
                break;
        }
        // auto: 次元の高い順に試す
        return toMultiPolygonGeoJson(geo, digit)
            ?? toMultiLineStringGeoJson(geo, digit)
            ?? toPolygonGeoJson(geo, digit)
            ?? toLineStringGeoJson(geo, digit)
            ?? toMultiPointGeoJson(geo, digit)
            ?? toPointGeoJson(geo, digit);
    };
    const parseToTerraDraw = (geo) => {
        let feature = toGeoJson(geo, GeomType.auto);
        if (_.isEmpty(feature) && Array.isArray(geo)) {
            return geo.flatMap(parseToTerraDraw);
        }
        if (!feature)
            return [];
        const features = [];
        const geom = feature.geometry; // 一度だけ
        switch (geom.type) {
            case "MultiPoint":
                geom.coordinates.forEach((coord) => {
                    const f = turf.point(coord, { mode: "point" });
                    f.id = crypto.randomUUID();
                    features.push(f);
                });
                break;
            case "MultiLineString":
                geom.coordinates.forEach((coords) => {
                    const f = turf.lineString(coords, { mode: "linestring" });
                    f.id = crypto.randomUUID();
                    features.push(f);
                });
                break;
            case "MultiPolygon":
                geom.coordinates.forEach((coords) => {
                    const f = turf.polygon(coords, { mode: "polygon" });
                    f.id = crypto.randomUUID();
                    features.push(f);
                });
                break;
            default:
                const f = { ...feature };
                f.id = crypto.randomUUID();
                f.properties = {
                    ...f.properties,
                    mode: geom.type.toLowerCase()
                };
                features.push(f);
        }
        return features;
    };
    const a = ansuko;
    a.toGeoJson = toGeoJson;
    a.toPointGeoJson = toPointGeoJson;
    a.toPolygonGeoJson = toPolygonGeoJson;
    a.toLineStringGeoJson = toLineStringGeoJson;
    a.toMultiPointGeoJson = toMultiPointGeoJson;
    a.toMultiLineStringGeoJson = toMultiLineStringGeoJson;
    a.toMultiPolygonGeoJson = toMultiPolygonGeoJson;
    a.unionPolygon = unionPolygon;
    a.parseToTerraDraw = parseToTerraDraw;
    return ansuko;
};
export default ansukoGeoPlugin;
