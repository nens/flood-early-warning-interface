import React from 'react';

import { RasterAlarm } from '../types/api';
//import { thresholdsByWarningLevel } from '../util/rasterAlarms';
import { IconActiveAlarmSVG, IconInactiveAlarmSVG } from './Icons';

import styles from './AlarmsTable.module.css';

interface Props {
  alarms: RasterAlarm[]
}


function AlarmsTable({ alarms }: Props) {
  return (
    <div className={styles.alarmsTable}>
      <div className={styles.tr}>
        <div className={styles.thtd}>&nbsp;</div>
        <div className={styles.thtd}>Warning area</div>
        <div className={styles.thtd}>Current level</div>
        <div className={styles.thtd}>Max level</div>
        <div className={styles.thtd}>Time of max</div>
        <div className={styles.thtd}>Level breached</div>
        <div className={styles.thtd}>Chart</div>
      </div>
      {alarms.map((alarm, i) => {
        //const thresholds = thresholdsByWarningLevel(alarm);

        return (
          <div className={styles.tr}>
            <div className={styles.tdLeft}>
              {i % 2 === 0 ? <IconActiveAlarmSVG /> : <IconInactiveAlarmSVG />}
            </div>
            <div className={styles.tdLeft}>{alarm.name}</div>
            <div className={styles.tdCenter}>9.5</div>
            <div className={styles.tdCenter}>10.5</div>
            <div className={styles.tdCenter}>14:45</div>
            <div className={styles.tdCenter}>Minor</div>
          </div>
        );
      })}
    </div>
  );
}

export default AlarmsTable;
