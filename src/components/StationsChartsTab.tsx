import React, { useContext } from 'react';
import { ConfigContext } from '../providers/ConfigProvider';

import TileList from './TileList';

function StationChartsTab() {
  const config = useContext(ConfigContext)!.config!.clientconfig!.configuration!;

  return (
    <TileList tiles={config.tiles} />
  );
}

export default StationChartsTab;
