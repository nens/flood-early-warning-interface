import React from 'react';

import styles from '../components/Tile.module.css';
import Tile from '../components/Tile';
import AlarmsMap from '../components/AlarmsMap';
import AlarmsTable from '../components/AlarmsTable';
import { useRasterAlarms } from '../api/hooks';
import { isGaugeAlarm } from '../util/rasterAlarms';

function AlarmsTab() {
  const response = useRasterAlarms();

  if (response.status === 'success') {
    const alarms = response.data;

    return (
      <div className={styles.TileList}>
        <Tile title="Alarms" size="large">
          <AlarmsTable alarms={alarms.results.filter(isGaugeAlarm)} />
        </Tile>
        <Tile title="Map" size="large">
          <AlarmsMap />
        </Tile>
      </div>
    );
  } else {
    return <p>Fetching alarms status...</p>
  }
}

export default AlarmsTab;
