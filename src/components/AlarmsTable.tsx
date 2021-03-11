import React, { useContext } from 'react';

import { RasterAlarm, Events, Event } from '../types/api';
import { thresholdsByWarningLevel } from '../util/rasterAlarms';
import { arrayMax, arrayMin } from '../util/functions';
import { useRasterEvents } from '../api/hooks';
import { TimeContext } from '../providers/TimeProvider';
import styles from './AlarmsTable.module.css';

interface TableProps {
  alarms: RasterAlarm[]
}

interface RowProps {
  alarm: RasterAlarm;
  events: Events | null;
  nowTimestamp: number;
}

function timeDiffToString(timestamp: number, now: number) {
  // Show difference in hours and minutes. Timestamp > now.
  const diffMinutes = Math.round((timestamp - now) / 1000 / 60);

  const minutes = diffMinutes % 60;
  const hours = (diffMinutes - minutes) / 60;

  return (hours > 0 ? hours+"h" : "") + minutes + "m";
}

function roundToCm(level: number) {
  return Math.round(level * 100) / 100;
}

function AlarmsRow({ alarm, events, nowTimestamp }: RowProps) {
  const thresholds = thresholdsByWarningLevel(alarm);

  // Figure out where 'now' and 'max' are in the events array
  let indexOfNow = null;
  let valueOfNow = null;
  let indexOfMax = null;
  let valueOfMax = null;
  let timeOfMax = null;

  if (events && events.length) {
    indexOfNow = arrayMin(events, event =>
      Math.abs(event.timestamp.getTime() - nowTimestamp)
    );
    valueOfNow = events[indexOfNow].value;

    // For the maximum we only care about future events
    const futureEvents = events.filter(event => event.timestamp.getTime() >= nowTimestamp);
    indexOfMax = arrayMax(
      futureEvents,
      event => event.value !== null ? event.value : -Infinity
    );

    if (indexOfMax !== -1) {
      timeOfMax = futureEvents[indexOfMax].timestamp;
      valueOfMax = futureEvents[indexOfMax].value;
    }
  }

  return (
    <div key={`alarmrow-${alarm.uuid}`} className={styles.tr}>
      <div className={styles.tdLeft}>{alarm.name}</div>
      <div className={styles.tdCenter}>{thresholds.minor.toFixed(2)}</div>
      <div className={styles.tdCenter}>{thresholds.moderate.toFixed(2)}</div>
      <div className={styles.tdCenter}>{thresholds.major.toFixed(2)}</div>
      <div className={styles.tdCenter}>
        {valueOfNow !== null ? valueOfNow.toFixed(2) : "-"}
      </div>
      <div className={styles.tdCenter}>
        {valueOfMax !== null ? valueOfMax.toFixed(2) : "-"}
      </div>
      <div className={styles.tdCenter}>
        {timeOfMax !== null ? timeDiffToString(timeOfMax.getTime(), nowTimestamp) : "-"}
      </div>
      <div className={styles.tdCenter}>
        {alarm.latest_trigger.warning_level || "-"}
      </div>
    </div>
  );
}

function AlarmsTable({ alarms }: TableProps) {
  // XXX use config
  const operationalModel = "e7f7e720-da7b-44dd-a44e-c921f84bacbe";
  const {start, now, end} = useContext(TimeContext);

  const currentLevels = useRasterEvents(
    alarms.map(alarm => { return {uuid: operationalModel, geometry: alarm.geometry};}),
    start,
    end
  );

  return (
    <div className={styles.alarmsTable}>
      <div className={styles.tr}>
        <div className={styles.thtd}>Warning area</div>
        <div className={styles.thtd}>Minor</div>
        <div className={styles.thtd}>Moderate</div>
        <div className={styles.thtd}>Major</div>
        <div className={styles.thtd}>Current level</div>
        <div className={styles.thtd}>Max level</div>
        <div className={styles.thtd}>Time to max</div>
        <div className={styles.thtd}>Level breached</div>
      </div>
      {alarms.map((alarm, idx) =>
        <AlarmsRow
          alarm={alarm}
          events={currentLevels.success ? currentLevels.data[idx] : null}
          nowTimestamp={now.getTime()}
        />)}
    </div>
  );
}

export default AlarmsTable;
