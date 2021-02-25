import React, { useContext } from 'react';
import { ConfigContext } from '../providers/ConfigProvider';

import TileList from '../components/TileList';

function StationChartsTab() {
  const config = useContext(ConfigContext)!.config!.clientconfig!.configuration!;

  // Keep the tiles that are timeseries
  const tiles = config.tiles.filter(tile => tile.type === 'timeseries');

  return (
    <TileList tiles={tiles} />
  );
}

export default StationChartsTab;
