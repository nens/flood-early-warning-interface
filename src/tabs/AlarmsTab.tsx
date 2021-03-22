import React, { useState } from 'react';

import styles from '../components/Tile.module.css';
import Tile from '../components/Tile';
import AlarmsMap from '../components/AlarmsMap';
import AlarmsTable from '../components/AlarmsTable';
import { useRasterAlarms } from '../api/hooks';
import { isGaugeAlarm } from '../util/rasterAlarms';

function AlarmsTab() {
  const response = useRasterAlarms();

  const [hoverAlarm, setHoverAlarm] = useState<string | null>(null);

  if (response.status === 'success') {
    const alarms = response.data;

    const gaugeAlarms = alarms.results.filter(isGaugeAlarm);

    return (
      <div className={styles.TileList}>
        <Tile title="Alarms" size="large">
          <AlarmsTable
            alarms={gaugeAlarms}
            hoverAlarm={hoverAlarm}
            setHoverAlarm={setHoverAlarm}
          />
        </Tile>
        <Tile title="Map" size="large">
          <AlarmsMap
            alarms={gaugeAlarms}
            hoverAlarm={hoverAlarm}
            setHoverAlarm={setHoverAlarm}
          />
        </Tile>
      </div>
    );
  } else {
    return <p>Fetching alarms status...</p>
  }
}

export default AlarmsTab;
