import React, { useCallback } from 'react';

import { useParams, Redirect, useHistory } from 'react-router';

import { TileDefinition } from '../types/tiles';
import Tile from './Tile';
import TimeseriesTile from './TimeseriesTile';
import styles from './FullTileTab.module.css';

interface Props {
  tiles: TileDefinition[];
  url: string;
}

function FullTileTab({tiles, url}: Props) {
  const { tileId } = useParams<{tileId: string}>();
  const routerHistory = useHistory();
  const onClickFullTile = useCallback(
    () => routerHistory.push(url),
    [routerHistory, url]);

  const tilesWithId = tiles.filter(t => (""+t.id) === tileId);

  if (tilesWithId.length !== 1) {
    return (
      <Redirect to={url} />
    );
  }

  const fullTile = tilesWithId[0];

  return (
    <div className={styles.FullTileTab}>
      <div className={styles.Sidebar}>
        {tiles.map((tile) => (
          (tile.type === 'timeseries' ?
           <Tile key={tile.id} size="smallsquare" title={tile.shortTitle}>
             <TimeseriesTile tile={tile} full={false} />
           </Tile>
         : null)
        ))}
      </div>
      <div className={styles.FullTile}>
        <Tile size="full" title={fullTile.title} x={onClickFullTile}>
          {fullTile.type === 'timeseries' ? <TimeseriesTile tile={fullTile} full={true} /> : null}
        </Tile>
      </div>
    </div>
        );
}

export default FullTileTab;
