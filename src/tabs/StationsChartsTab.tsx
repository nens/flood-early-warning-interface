import React, { useContext } from 'react';
import { useRouteMatch, Switch, Route } from 'react-router';
import { ConfigContext } from '../providers/ConfigProvider';

import TileList from '../components/TileList';
import FullTileTab from '../components/FullTileTab';

function StationChartsTab() {
  const { path, url } = useRouteMatch();
  const config = useContext(ConfigContext)!.config!.clientconfig!.configuration!;

  // Keep the tiles that are timeseries
  const tiles = config.tiles.filter(tile => tile.type === 'timeseries');

  return (
    <Switch>
      <Route exact path={path}>
        <TileList tiles={tiles} />
      </Route>
      <Route path={`${path}/:tileId`}>
        <FullTileTab tiles={tiles} url={url} />
      </Route>
    </Switch>
  );

}

export default StationChartsTab;
