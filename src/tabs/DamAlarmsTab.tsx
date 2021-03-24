import React, { useState } from 'react';

import styles from '../components/Tile.module.css';
import Tile from '../components/Tile';
import DamAlarmsMap from '../components/DamAlarmsMap';
import DamAlarmsTable from '../components/DamAlarmsTable';
import { useRasterAlarms } from '../api/hooks';
import { isGaugeAlarm } from '../util/rasterAlarms';
import { useConfigContext } from '../providers/ConfigProvider';

function DamAlarmsTab() {
  const response = useRasterAlarms();
  const { dams } = useConfigContext();

  const [hoverDam, setHoverDam] = useState<string | null>(null);

  if (response.status === 'success') {
    const alarms = response.data;

    const gaugeAlarms = alarms.results.filter(isGaugeAlarm);

    return (
      <div className={styles.TileList}>
        <Tile title="Alarms" size="large">
          <DamAlarmsTable
            dams={dams}
            hoverDam={hoverDam}
            setHoverDam={setHoverDam}
          />
        </Tile>
        <Tile title="Map" size="large">
          <DamAlarmsMap
            dams={dams}
            hoverDam={hoverDam}
            setHoverDam={setHoverDam}
          />
        </Tile>
      </div>
    );
  } else {
    return <p>Fetching alarms status...</p>
  }
}

export default DamAlarmsTab;
