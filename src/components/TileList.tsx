import React from 'react';

import styles from './Tile.module.css';

import { TileDefinition } from '../types/tiles';

import Tile from './Tile';
import TimeseriesTile from './TimeseriesTile';

interface Props {
  tiles: TileDefinition[];
}

function TileList({tiles}: Props) {
  return (
    <div className={styles.TileList}>
      {tiles.map(tile => (
        <Tile title={tile.title} key={tile.id}>
          {(tile.type === 'timeseries') ? <TimeseriesTile tile={tile} /> : null}
        </Tile>
      ))}
    </div>
  );
}

export default TileList;
