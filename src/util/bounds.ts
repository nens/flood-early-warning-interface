// Helper code for bounds and bounding boxes.

import { LatLngBounds } from "leaflet";
import { Geometry } from 'geojson';

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

  toLeafletArray(): [[number, number], [number, number]] {
    return [[
      parseFloat(this.southmost), parseFloat(this.westmost)
    ], [
      parseFloat(this.northmost), parseFloat(this.eastmost)
    ]];
  }

  toLeafletBounds() {
    return new LatLngBounds(this.toLeafletArray());
  }

  toLizardBbox() {
    return [this.westmost, this.southmost, this.eastmost, this.northmost].join(
      ","
    );
  }
}

export function isSamePoint(a: Geometry, b: Geometry) {
  return (
    a.type === "Point" &&
    b.type === "Point" &&
    a.coordinates &&
    a.coordinates.length >= 2 &&
    b.coordinates &&
    b.coordinates.length >= 2 &&
    a.coordinates[0] === b.coordinates[0] &&
    a.coordinates[1] === b.coordinates[1]
  );
}
