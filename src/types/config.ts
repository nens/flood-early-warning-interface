// Type of the whole config

import { FeatureCollection, Polygon } from 'geojson';
import { TileDefinition } from './tiles';

export interface WarningAreaProperties {
  name: string;
  id: string;
}

export interface Config {
  bounding_box: [string, string, string, string],
  operationalModel: string,
  mapbox_access_token: string,
  tiles: TileDefinition[],
  flood_warning_areas: FeatureCollection<Polygon, WarningAreaProperties>,
}
