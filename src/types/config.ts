// Type of the whole config

import { Feature, FeatureCollection, Polygon, Point } from "geojson";
import { Timeseries, Paginated, RasterAlarm } from "./api";
import { TileDefinition } from "./tiles";

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
  };
}

interface FakeData {
  [key: string]: Timeseries | Event[] | MaxForecast | Paginated<RasterAlarm>;
}

export interface ExtraRasters {
  title: string;
  maps: Record<string, { title: string; uuid: string; color: string }>;
}

export interface Tab {
  url: string;
  slug?: string /* For multiple copies of the same tab */;
  title: string;
}

export type BoundingBox = [string, string, string, string];

export interface TableTabGeneralConfig {
  nameColumnHeader: string;
  tableTitleLeft?: string;
  tableTitleRight?: string;
  mapTitleLeft?: string;
  mapTitleRight?: string;
  alarmType?: "raster" | "timeseries" | "none";
}

export interface TableTabRowConfig {
  /* Note there is no further structure here, much easier for config pages */
  /* And use "null" instead of being optional so they can be unset using spreads */
  uuid: string /* Invisible to user, but very handy to have */;
  name: string /* Must be unique in table */;
  mapGeometry: string | null /* Valid GeoJSON Feature or FeatureCollection */;
  alarmUuid: string | null /* Can be timeseries or raster */;
  timeseries: string | null /* UUID; for current level column */;
  clickUrl: string | null /* For click to a chart, e.g. stations/21 */;
  /* These must either be both set or neither. Used to show a clickable point on the
     map, and for looking up the water level in the flood model map. */
  lat: number | null /* Latitude */;
  lng: number | null /* Longitude */;
}

export interface TableTabAlarmThreshold {
  uuid: string;
  warning_level: string;
  value: number;
  color: string;
}

export interface TableTabConfig {
  general: TableTabGeneralConfig;
  rows: TableTabRowConfig[];
  thresholds: TableTabAlarmThreshold[];
}

export interface TableTabConfigs {
  [tableKey: string]: TableTabConfig;
}

export interface Config {
  version?: 1;
  boundingBoxes: {
    default: BoundingBox;
    rainMap?: BoundingBox;
    floodModelMap?: BoundingBox;
    warningAreas?: BoundingBox;
    dams?: BoundingBox;
  };
  rasters: {
    operationalModelLevel: string;
    operationalModelDepth: string;
    rainForecast: string;
  };
  wmsLayers?: {
    [name: string]: WMSLayer;
  };
  rainLegend: [string, string][];
  rainfallWmsLayers?: {
    title: string;
    wms_url: string;
    wms_layers: string;
  }[];
  rainPopupFields: RainPopupField[];
  mapbox_access_token: string;
  timeseriesForWarningAreas: {
    [name: string]: string;
  };
  dams: FeatureCollection<Point, DamProperties>;
  dashboardTitle?: string;
  tiles: TileDefinition[];
  flood_warning_areas: FeatureCollection<Polygon, WarningAreaProperties>;
  trainingDashboards: TrainingDashboard[];
  nowDateTimeUTC?: string;
  fakeData: FakeData;
  rssUrl: string;
  extraRasters: ExtraRasters;
  tabs: Tab[];
  tableTabConfigs: TableTabConfigs;
  infoText: string;
  infoImage: string;
  emergencyPlansText: string;
}
