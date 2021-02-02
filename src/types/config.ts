// Type of the whole config

import { TileDefinition } from './tiles';

export interface Config {
  clientconfig: {
    configuration: {
      tiles: TileDefinition[]
    }
  }
}
