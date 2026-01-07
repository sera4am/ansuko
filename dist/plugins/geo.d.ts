import GeoJSON from "geojson";
import { type AnsukoType } from "../index.js";
export declare enum GeomType {
    point = 0,
    polygon = 1,
    lineString = 2,
    multiPoint = 3,
    multiPolygon = 4,
    multiLineString = 5,
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
