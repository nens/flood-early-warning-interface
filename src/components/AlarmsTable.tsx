import React from 'react';

import { RasterAlarm } from '../types/api';
import { thresholdsByWarningLevel } from '../util/rasterAlarms';
import { withDefault } from '../util/functions';

import styles from './AlarmsTable.module.css';

interface Props {
  alarms: RasterAlarm[]
}


function AlarmsTable({ alarms }: Props) {
  return (
    <div className={styles.alarmsTable}>
      <div className={styles.tr}>
        <div className={styles.thtd}>Warning area</div>
        <div className={styles.thtd}>Current waterlevel</div>
        <div className={styles.thtd}>Minor</div>
        <div className={styles.thtd}>Moderate</div>
        <div className={styles.thtd}>Major</div>
        <div className={styles.thtd}>Level breached</div>
        <div className={styles.thtd}>Graph</div>
      </div>
      {alarms.map(alarm => {
        const thresholds = thresholdsByWarningLevel(alarm);

        return (
          <div className={styles.tr}>
            <div className={styles.tdLeft}>{alarm.name}</div>
            <div className={styles.tdCenter}>9.5</div>
            <div className={styles.tdCenter}>{withDefault(thresholds.minor, '-')}</div>
            <div className={styles.tdCenter}>{withDefault(thresholds.moderate, '-')}</div>
            <div className={styles.tdCenter}>{withDefault(thresholds.major, '-')}</div>
          </div>
        );
      })}
    </div>
  );
}

export default AlarmsTable;
