// Type of the whole config

import { Feature, FeatureCollection, Polygon, Point } from 'geojson';
import { Timeseries, Paginated, RasterAlarm } from './api';
import { TileDefinition } from './tiles';

export interface WarningAreaProperties {
  name: string;
  id: string;
  timeseries: string;
}

export type WarningArea = Feature<Polygon, WarningAreaProperties>;

export interface DamProperties {
  name: string;
  timeseries: string;
  has_level_forecast: boolean;
}

export type Dam = Feature<Point, DamProperties>;

export interface RainPopupField {
  field: string;
  description: string;
  type: "string";
}

export interface WMSLayer {
  wms: string;
  layer: string;
  styles: string;
}

export interface TrainingDashboard {
  url: string;
  name: string;
}

export interface MaxForecast {
  [uuid: string]: {
    value: number;
    timeToMax: number;
  }
}

interface FakeData {
  [key: string]: Timeseries | Event[] | MaxForecast | Paginated<RasterAlarm>;
}

export type BoundingBox = [string, string, string, string];

export interface Config {
  boundingBoxes: {
    default: BoundingBox;
    rainMap?: BoundingBox;
    floodModelMap?: BoundingBox;
    warningAreas?: BoundingBox;
    dams?: BoundingBox;
  },
  rasters: {
    operationalModelLevel: string;
    operationalModelDepth: string;
    rainForecast: string;
  };
  wmsLayers?: {
    [name: string]: WMSLayer
  },
  rainLegend: [string, string][],
  rainfallWmsLayers?: {
    title: string;
    wms_url: string;
    wms_layers: string;
  }[];
  rainPopupFields: RainPopupField[];
  mapbox_access_token: string;
  timeseriesForWarningAreas: {
    [name: string]: string
  };
  dams: FeatureCollection<Point, DamProperties>;
  dashboardTitle?: string;
  tiles: TileDefinition[];
  publicTiles: TileDefinition[]; // For use in iframe mode
  flood_warning_areas: FeatureCollection<Polygon, WarningAreaProperties>;
  iframeBaseTileId: number; // XXX
  referenceLevels: {[assetId: number]: string};
  trainingDashboards?: TrainingDashboard[]; // XXX
  nowDateTimeUTC?: string;
  fakeData?: FakeData;
}
