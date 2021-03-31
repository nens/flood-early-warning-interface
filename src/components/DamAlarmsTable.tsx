import React, { useContext } from 'react';
import { FeatureCollection, Feature, Point } from 'geojson';
import { DamProperties } from '../types/config';
import { RasterAlarm } from '../types/api';
import { thresholdsByWarningLevel } from '../util/rasterAlarms';
import { arrayMax } from '../util/functions';
import { isSamePoint } from '../util/bounds';
import { useRasterEvents } from '../api/hooks';
import { TimeContext } from '../providers/TimeProvider';
import { useConfigContext } from '../providers/ConfigProvider';
import styles from './AlarmsTable.module.css';

interface TableProps {
  dams: FeatureCollection<Point, DamProperties>;
  damAlarms: RasterAlarm[];
  hoverDam: string | null;
  setHoverDam: (uuid: string | null) => void;
}

interface RowProps {
  dam: Feature<Point, DamProperties>;
  alarm: RasterAlarm | undefined;
  start: Date;
  end: Date;
  hoverDam: string | null;
  setHoverDam: (uuid: string | null) => void;
  operationalModelLevel: string;
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

function DamRow({
  dam,
  alarm,
  start,
  end,
  hoverDam,
  setHoverDam,
  operationalModelLevel
}: RowProps) {
  const thresholds = alarm ? thresholdsByWarningLevel(alarm) : {};

  // Figure out where 'max' is in the events array
  let valueOfNow = null;
  let indexOfMax = null;
  let valueOfMax = null;
  let timeOfMax = null;

  const currentLevels = useRasterEvents(
    alarm ? [{uuid: operationalModelLevel, geometry: alarm.geometry}] : [],
    start,
    end
  );

  if (currentLevels.success && currentLevels.data.length > 0) {
    const events = currentLevels.data[0];

    if (events !== null && events.length > 0) {
      valueOfNow = events[0].value;

      // Round value to cm, so we don't see a max in the future that shows as the same as
      // current value
      indexOfMax = arrayMax(
        events,
        event => event.value !== null ? roundToCm(event.value) : -Infinity
      );

      if (indexOfMax !== -1) {
        timeOfMax = events[indexOfMax].timestamp;
        valueOfMax = events[indexOfMax].value;
      }
    }
  }

  const warningLevel = alarm ? alarm.latest_trigger.warning_level : null;
  const warningClass = warningLevel ? `tr_${warningLevel.toLowerCase()}` : null;

  const highlight = hoverDam === dam.properties.name;


  const dashOrNum = (value: number | null | undefined): string =>
    (value !== null && value !== undefined) ? value.toFixed(2) : "-";

  return (
    <div
      className={`${styles.tr} ${warningClass ? styles[warningClass] : ""} ${highlight ? styles.tr_highlight : ""}`}
      onMouseEnter={() => setHoverDam(dam.properties.name)}
      onMouseLeave={() => setHoverDam(null)}
    >
      <div className={styles.tdLeft}>{dam.properties.name}</div>
      <div className={styles.tdCenter}>
        {dashOrNum(valueOfNow)}
      </div>
      <div className={styles.tdCenter}>
        {dashOrNum(valueOfMax)}
      </div>
      <div className={styles.tdCenter}>
        {timeOfMax !== null ? timeDiffToString(timeOfMax.getTime(), start.getTime()) : "-"}
      </div>
      <div className={styles.tdCenter}>
        {warningLevel || "-"}
      </div>
      <div className={styles.tdCenter}>{dashOrNum(thresholds.blue)}</div>
      <div className={styles.tdCenter}>{dashOrNum(thresholds.white)}</div>
      <div className={styles.tdCenter}>{dashOrNum(thresholds.amber)}</div>
      <div className={styles.tdCenter}>{dashOrNum(thresholds.red)}</div>
    </div>
  );
}

function DamAlarmsTable({ dams, damAlarms, hoverDam, setHoverDam }: TableProps) {
  const config = useConfigContext();
  const {now, end} = useContext(TimeContext);

  const operationalModelLevel = config.rasters.operationalModelLevel;

  console.log('damAlarms', damAlarms);

  return (
    <div className={styles.alarmsTable}>
      <div className={styles.tr}>
        <div className={styles.thtd}>Dam</div>
        <div className={styles.thtd}>Current level (mAHD)</div>
        <div className={styles.thtd}>Max forecast (mAHD)</div>
        <div className={styles.thtd}>Time to max</div>
        <div className={styles.thtd}>Forecast level breached</div>
        <div className={styles.thtd}>Blue</div>
        <div className={styles.thtd}>White</div>
        <div className={styles.thtd}>Amber</div>
        <div className={styles.thtd}>Red</div>
      </div>
      {dams.features.map((feature, idx) => {
        const alarm = damAlarms.find(alarm => isSamePoint(alarm.geometry, feature.geometry));

        return (
          <DamRow
            dam={feature}
            alarm={alarm}
            start={now}
            end={end}
            key={idx}
            hoverDam={hoverDam}
            setHoverDam={setHoverDam}
            operationalModelLevel={operationalModelLevel}
          />
        );
      })}
    </div>
  );
}

export default DamAlarmsTable;
