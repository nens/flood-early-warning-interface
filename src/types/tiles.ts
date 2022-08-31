import { Shape } from "plotly.js";

import { Point } from "geojson";

interface BaseTileProps {
  title: string;
  shortTitle: string;
  id: number;
  viewInLizardLink?: string;
}

/* Map */

export interface WmsLayer {
  url: string;
  layers: string;
  zindex?: number; // 10
  transparent?: boolean; // true
}

export interface MapTile extends BaseTileProps {
  type: "map";
  assetTypes?: string[];
  wmsLayers?: WmsLayer[];
}

/* Timeseries */

export interface BackgroundColorShape {
  color: string;
  opacity: string;
  isRelativeTimeFromNow: boolean;
  x1EpochTimeInMilliSeconds: number;
  x2EpochTimeInMilliSeconds: number;
}

// Not sure what the actual options are, using the only example I have right now RG20210304
export interface LegendStyle {
  font: {
    size: number;
    color: string;
    family: string;
  };
  bgcolor: string;
  x?: number;
  y?: number;
  xanchor?: "auto" | "left" | "center" | "right";
  yanchor?: "auto" | "top" | "middle" | "bottom";
  borderwidth?: number;
  bordercolor?: string;
}

export interface RasterIntersection {
  uuid: string;
  geometry: Point;
}

export interface Threshold {
  color: string;
  label: string;
  value: string;
  unitReference: string;
}

export interface Timeline {
  text: string;
  color: string;
  lineDash: Shape["line"]["dash"];
  isRelativeTimeFromNow: boolean;
  epochTimeInMilliSeconds: number;
}

export interface ChartTile extends BaseTileProps {
  type: "timeseries";
  backgroundColorShapes?: BackgroundColorShape[];
  colors: string[];
  legendStrings: string[];
  legend?: LegendStyle;
  rasterIntersections?: RasterIntersection[];
  timeseries?: string[];
  historicalTimeseries?: string[];
  thresholds?: Threshold[];
  timelines?: Timeline[];
  alarmsToHide?: string[];  /* Don't show these alarm UUIDs */
}

/* External (mostly single images) */

export interface ExternalTile extends BaseTileProps {
  type: "external";
  imageUrl: string;
}

export type TileDefinition = MapTile | ChartTile | ExternalTile;
