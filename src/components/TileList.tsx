import React from 'react';

import styles from './Tile.module.css';

import { TileDefinition } from '../types/tiles';

import Tile from './Tile';

interface Props {
  tiles: TileDefinition[];
}

function TileList({tiles}: Props) {
  return (
    <div className={styles.TileList}>
      {tiles.map(tile => (<Tile tile={tile} />))}
    </div>
  );
}

export default TileList;
