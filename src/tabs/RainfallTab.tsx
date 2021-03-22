import React from 'react';
import { useConfigContext } from '../providers/ConfigProvider';
import Tile from '../components/Tile';
import ImageTile from '../components/ImageTile';
import RainMap from '../components/RainMap';

import { ExternalTile } from '../types/tiles';

import styles from './RainfallTab.module.css';

function RainfallTab() {
  const config = useConfigContext();
  const imageTiles = config.tiles.filter(tile => tile.type === 'external') as ExternalTile[];

  return (
    <div className={styles.RainfallTab}>
      <div className={styles.RainfallLeft}>
        {imageTiles.map(tile => (
          <Tile key={tile.id} title={tile.title} size="halfheight">
            <ImageTile tile={tile} />
          </Tile>
        ))}
      </div>

      <div className={styles.RainfallRight}>
        <Tile size="full" title="Map with WMS layers that haven't been defined yet">
          <RainMap />
        </Tile>
      </div>
    </div>
  );
}

export default RainfallTab;
