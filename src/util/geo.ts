import { Feature, FeatureCollection, Geometry, Position } from "geojson";

export function isFeature(json: any): json is Feature {
  if (typeof json !== "object") return false;
  if (!("type" in json) || json.type !== "Feature") return false;
  if (!json.geometry) return false;
  return true;
}

export function isFeatureCollection(json: any): json is FeatureCollection {
  if (typeof json !== "object") return false;
  if (!("type" in json) || json.type !== "FeatureCollection") return false;
  if (!Array.isArray(json.features)) return false;
  return json.features.every(isFeature);
}

export function validateGeometry(geometry: Geometry, errorFn: (error: string) => void) {
  if (geometry.type === "Point") {
    isPosition(geometry.coordinates, errorFn);
  } else if (geometry.type === "LineString") {
    isLineString(geometry.coordinates, errorFn);
  } else if (geometry.type === "Polygon") {
    isPolygon(geometry.coordinates, errorFn);
  } else {
    errorFn(`Feature geometry type must be Point, LineString or Polygon, not "${geometry.type}".`);
  }
}

function isPosition(position: Position, errorFn: (error: string) => void): boolean {
  if (!Array.isArray(position)) {
    errorFn("Position coordinates must be an array.");
    return false;
  }
  if (position.length < 2 || position.length > 3) {
    errorFn("Position coordinates must be an array with two or three elements.");
    return false;
  }
  if (typeof position[0] !== "number" || typeof position[1] !== "number") {
    errorFn("Coordinates must be numbers.");
    return false;
  }
  return true;
}

function isLineString(lineString: Position[], errorFn: (error: string) => void): boolean {
  if (!Array.isArray(lineString)) {
    errorFn("LineString coordinates must be an array.");
    return false;
  }
  if (lineString.length < 2) {
    errorFn("LineString coordinates must have at least two positions.");
    return false;
  }
  return lineString.every((position) => isPosition(position, errorFn));
}

function isLinearRing(lineString: Position[], errorFn: (error: string) => void): boolean {
  if (!isLineString(lineString, errorFn)) return false;

  const length = lineString.length;

  if (length < 4) {
    errorFn("Polygon element must have at least four positions.");
    return false;
  }
  if (
    lineString[0][0] !== lineString[length - 1][0] ||
    lineString[0][1] !== lineString[length - 1][1]
  ) {
    errorFn("First and last position of Polygon element must be the same.");
    return false;
  }
  return true;
}

function isPolygon(polygon: Position[][], errorFn: (error: string) => void): boolean {
  if (!Array.isArray(polygon) || polygon.length === 0) {
    errorFn("Polygon must be an array of one or more LineStrings.");
    return false;
  }
  return polygon.every((linearRing) => isLinearRing(linearRing, errorFn));
}
