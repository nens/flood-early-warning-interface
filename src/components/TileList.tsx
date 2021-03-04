import React, { useCallback } from 'react';
import { useRouteMatch, useHistory } from 'react-router';
import styles from './Tile.module.css';

import { TileDefinition } from '../types/tiles';

import Tile from './Tile';
import TimeseriesTile from './TimeseriesTile';

interface TileWithCallbackProps {
  tile: TileDefinition;
}

interface TileListProps {
  tiles: TileDefinition[];
}

function TileWithCallback({tile}: TileWithCallbackProps) {
  // Put the call to Tile in its own component instead of inside the
  // map() in TileList so that each Tile can have its own memoized
  // callback function to use in onClick.
  const { url } = useRouteMatch();
  const routerHistory = useHistory();
  const handleOnClick = useCallback(
    () => routerHistory.push(`${url}/${tile.id}`),
    [routerHistory, url, tile]);

  return (
    <Tile
      title={tile.shortTitle} key={tile.id}
      onClick={handleOnClick}
    >
      {(tile.type === 'timeseries') ? <TimeseriesTile tile={tile} /> : null}
    </Tile>
  )
}

function TileList({tiles}: TileListProps) {
  return (
    <div className={styles.TileList}>
      {tiles.map(tile => <TileWithCallback key={tile.id} tile={tile} />)}
    </div>
  );
}

export default TileList;
