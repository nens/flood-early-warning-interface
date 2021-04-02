// Type of the whole config

import { Feature, FeatureCollection, Polygon, Point } from 'geojson';
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

export interface Config {
  bounding_box: [string, string, string, string];
  rasters: {
    operationalModelLevel: string;
    operationalModelDepth: string;
    rainForecast: string;
  };
  rainfallWmsLayers?: {
    title: string;
    wms_url: string;
    wms_layers: string;
  }[];
  mapbox_access_token: string;
  timeseriesForWarningAreas: {
    [name: string]: string
  };
  dams: FeatureCollection<Point, DamProperties>;
  tiles: TileDefinition[];
  publicTiles: TileDefinition[]; // For use in iframe mode
  flood_warning_areas: FeatureCollection<Polygon, WarningAreaProperties>;
  iframeBaseTileId: number; // XXX
  referenceLevels: {[assetId: number]: string};
  trainingDashboards: any; // XXX
}
