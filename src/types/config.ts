// Type of the whole config

import { FeatureCollection } from 'geojson';
import { TileDefinition } from './tiles';

export interface Config {
  clientconfig: {
    configuration: {
      bounding_box: [string, string, string, string],
      mapbox_access_token: string,
      tiles: TileDefinition[],
      flood_warning_areas: FeatureCollection,
    }
  }
}
