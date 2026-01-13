import GeoJSON from "geojson";
import { type AnsukoType } from "../index.js";
/**
 * Geometry type selector for conversions. Use `auto` to try higher dimensions first.
 */
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
    toLngLatArray: (coord: any, digit?: number) => [lng: number, lat: number] | null;
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
