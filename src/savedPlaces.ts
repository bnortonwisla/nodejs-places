/*
 * IDataSource that loads from from a Google Maps .json file of "Save Places"
 */

import fs, { read } from 'fs';
import { DataSourceInitCallback, DataSourceStatus, IDataSource, IDataSourceError } from './dataSource';

export class SavedPlaces implements IDataSource {
    
    private __status: DataSourceStatus = DataSourceStatus.Uninitialized; 
    public get status()  { return this.__status; }
    public get isInitialized(): boolean { return this.status === DataSourceStatus.Initialized; }

    private __error?: IDataSourceError;
    public get error() { return this.__error; }

    private readonly __path: string;
    private __places: Place[] = [];

    public constructor(path: string) {
        this.__path = path;
    }

    public initialize(callback?: DataSourceInitCallback ): void {
        this.__status = DataSourceStatus.InitializeInProgress;
        
        fs.readFile('./data/Saved Places.json', 'utf8', (err, data) => {
            this.__afterReadFile(err, data);
            if (callback) callback(this.isInitialized);
        });
    }

    public getData(): PlaceSimple[] { 
        const simplePlaces: PlaceSimple[] = [];
        this.__places.forEach(place => {
            simplePlaces.push(new PlaceSimple(place));
        });
        return simplePlaces;
    }

    public getDump(): object {
        return {
            "error": this.__error,
            "places": this.__places
        }
    }
    
    public getSummary(): object { 
        return {
            "errorMsg": this.error?.errorMsg,
            "places": this.__places.length,
            "readErrors": (this.error?.errorDetail as []).length
        }
    }

    private __afterReadFile(err: NodeJS.ErrnoException | null, data: string): void {
        
        if (err) {
            this.__status = DataSourceStatus.Errored;
            this.__error = { errorMsg: err.message };
            return;
        }

        const { places, readErrors } = this.__parseData(data);
        this.__places = places;
        
        if (readErrors.length > 0) {
            if (places.length > 0) {
                this.__status = DataSourceStatus.Initialized;
                this.__error = { errorMsg: "Some read errors.", errorDetail: readErrors };
            }
            else {
                this.__status = DataSourceStatus.Errored;
                this.__error = { errorMsg: "No valid places.", errorDetail: readErrors };
            }
        }
        else {
            this.__status = DataSourceStatus.Initialized;
        }
    }

    private __parseData(data: string): { places: Place[], readErrors: any[] } {
        const tempPlaces: any[] = JSON.parse(data).features;
        const outPlaces: Place[] = [];
        const outReadErrors: any[] = []
        tempPlaces.forEach(element => {
           const place = this.__parsePlace(element);
           if (place) outPlaces.push(place);
           else outReadErrors.push(element);
        });

        return { places: outPlaces, readErrors: outReadErrors }
    }

    private __parsePlace(element: any): Place | undefined {
        const placeString = JSON.stringify(element);
        try {
            return Convert.toPlace(placeString);   
        } catch (error) {
            return undefined;  //FUTURE: return error message
        }
    }
}

class PlaceSimple {
    public readonly name: string;
    public readonly address: string;
    public readonly country: string;

    constructor(place: Place) {
        this.name = place.properties.title;
        this.address = place.properties.location.address;
        this.country = place.properties.location.countryCode;
    }
}

/** Following generated from https://app.quicktype.io/ */

// To parse this data:
//
//   import { Convert, Place } from "./file";
//
//   const place = Convert.toPlace(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

interface Place {
    geometry:   Geometry;
    properties: Properties;
    type:       string;
}

interface Geometry {
    coordinates: number[];
    type:        string;
}

interface Properties {
    googleMapsURL: string;
    location:      Location;
    published:     Date;
    title:         string;
    updated:       Date;
}

interface Location {
    address:        string;
    businessName:   string;
    countryCode:    string;
    geoCoordinates: GeoCoordinates;
}

interface GeoCoordinates {
    latitude:  string;
    longitude: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
class Convert {
    public static toPlace(json: string): Place {
        return cast(JSON.parse(json), r("Place"));
    }

    public static placeToJson(value: Place): string {
        return JSON.stringify(uncast(value, r("Place")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Place": o([
        { json: "geometry", js: "geometry", typ: r("Geometry") },
        { json: "properties", js: "properties", typ: r("Properties") },
        { json: "type", js: "type", typ: "" },
    ], false),
    "Geometry": o([
        { json: "coordinates", js: "coordinates", typ: a(3.14) },
        { json: "type", js: "type", typ: "" },
    ], false),
    "Properties": o([
        { json: "Google Maps URL", js: "googleMapsURL", typ: "" },
        { json: "Location", js: "location", typ: r("Location") },
        { json: "Published", js: "published", typ: Date },
        { json: "Title", js: "title", typ: "" },
        { json: "Updated", js: "updated", typ: Date },
    ], false),
    "Location": o([
        { json: "Address", js: "address", typ: "" },
        { json: "Business Name", js: "businessName", typ: "" },
        { json: "Country Code", js: "countryCode", typ: "" },
        { json: "Geo Coordinates", js: "geoCoordinates", typ: r("GeoCoordinates") },
    ], false),
    "GeoCoordinates": o([
        { json: "Latitude", js: "latitude", typ: "" },
        { json: "Longitude", js: "longitude", typ: "" },
    ], false),
};
