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
  tableTitleLeft?: string;
  tableTitleRight?: string;
  mapTitleLeft?: string;
  mapTitleRight?: string;
}

export interface TableTabConfig {
  general?: TableTabGeneralConfig;
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
  tableTabConfigs: {
    [tableKey: string]: TableTabConfig;
  },
  infoText: string;
  infoImage: string;
  emergencyPlansText: string;
}
