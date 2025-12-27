import { type AnsukoType } from "../index.js";
export declare enum GeomType {
    point = "point",
    polygon = "polygon",
    lineString = "linestring",
    multiPoint = "multipoint",
    multiPolygon = "multipolygon",
    multiLineString = "multilinestring",
    auto = "auto"
}
export interface AnsukoGeoPluginExtension {
    toPointGeoJson: (geo: any, digit?: number) => GeoJSON.Point | null;
    toPolygonGeoJson: (geo: any, digit?: number) => GeoJSON.Polygon | null;
    toLineStringGeoJson: (geo: any, digit?: number) => GeoJSON.LineString | null;
    toMultiPointGeoJson: (geo: any, digit?: number) => GeoJSON.MultiPoint | null;
    toMultiPolygonGeoJson: (geo: any, digit?: number) => GeoJSON.MultiPolygon | null;
    toMultiLineStringGeoJson: (geo: any, digit?: number) => GeoJSON.MultiLineString | null;
    unionPolygon: (geo: any, digit?: number) => GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
}
declare const ansukoGeoPlugin: <T extends AnsukoType>(ansuko: T) => T & AnsukoGeoPluginExtension;
export default ansukoGeoPlugin;
