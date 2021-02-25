import React, { useContext } from 'react';
import { ConfigContext } from '../providers/ConfigProvider';
import Tile from '../components/Tile';
import ImageTile from '../components/ImageTile';

import { ExternalTile } from '../types/tiles';

import styles from './RainfallTab.module.css';

function RainfallTab() {
  const config = useContext(ConfigContext)!.config!.clientconfig!.configuration!;
  const imageTiles = config.tiles.filter(tile => tile.type === 'external') as ExternalTile[];

  return (
    <div className={styles.RainfallTab}>
      <div className={styles.RainfallLeft}>
        {imageTiles.map(tile => (
          <Tile key={tile.id} title={tile.title}>
            <ImageTile tile={tile} />
          </Tile>
        ))}
      </div>

      <div className={styles.RainfallRight}>Testing 2</div>
    </div>
  );
}

export default RainfallTab;
