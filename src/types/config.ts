// Type of the whole config

import { FeatureCollection, Polygon } from 'geojson';
import { TileDefinition } from './tiles';

export interface WarningAreaProperties {
  name: string;
  id: string;
}

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
  tiles: TileDefinition[];
  publicTiles: TileDefinition[]; // For use in iframe mode
  flood_warning_areas: FeatureCollection<Polygon, WarningAreaProperties>;
  iframeBaseTileId: number; // XXX
  referenceLevels: {[assetId: number]: string};
  trainingDashboards: any; // XXX
}
