// Helper code for bounds and bounding boxes.

import { LatLngBounds } from "leaflet";
import { Geometry, Point, Polygon } from "geojson";

export class BoundingBox {
  westmost: string;
  southmost: string;
  eastmost: string;
  northmost: string;

  constructor(westmost: string, southmost: string, eastmost: string, northmost: string) {
    this.westmost = westmost;
    this.southmost = southmost;
    this.eastmost = eastmost;
    this.northmost = northmost;
  }

  setField(field: string, value: string): BoundingBox {
    const newBbox = { ...this, [field]: value };
    return new BoundingBox(newBbox.westmost, newBbox.southmost, newBbox.eastmost, newBbox.northmost);
  }

  toLeafletArray(): [[number, number], [number, number]] {
    return [
      [parseFloat(this.southmost), parseFloat(this.westmost)],
      [parseFloat(this.northmost), parseFloat(this.eastmost)],
    ];
  }

  toLeafletBounds() {
    return new LatLngBounds(this.toLeafletArray());
  }

  toLizardBbox() {
    return [this.westmost, this.southmost, this.eastmost, this.northmost].join(",");
  }

  toConfigBbox() {
    return [this.westmost, this.southmost, this.eastmost, this.northmost];
  }
}

export function isSamePoint(a: Geometry, b: Geometry, epsilon: number = 0) {
  return (
    a.type === "Point" &&
    b.type === "Point" &&
    a.coordinates &&
    a.coordinates.length >= 2 &&
    b.coordinates &&
    b.coordinates.length >= 2 &&
    Math.abs(a.coordinates[0] - b.coordinates[0]) <= epsilon &&
    Math.abs(a.coordinates[1] - b.coordinates[1]) <= epsilon
  );
}

export function pointInPolygon(point: Point, polygon: Polygon) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  // Shamelessly stolen and adapted from https://github.com/substack/point-in-polygon
  if (!point) return false;

  const x = point.coordinates[0];
  const y = point.coordinates[1];

  let inside = false;

  const vs = polygon.coordinates[0]; // We only use the outer boundary, ignore the holes

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
      yi = vs[i][1];
    const xj = vs[j][0],
      yj = vs[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}
