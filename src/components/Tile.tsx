import React from 'react';

import { TileDefinition } from '../types/tiles';

import styles from './Tile.module.css';

interface Props {
  tile: TileDefinition
}

function Tile({ tile }: Props) {
  return (
    <div className={styles.Tile}>
      <div className={styles.Title}>{tile.title}</div>
      <div className={styles.Content}>{tile.type}</div>
    </div>
  );
}

export default Tile;
