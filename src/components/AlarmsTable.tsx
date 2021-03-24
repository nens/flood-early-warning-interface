import React, { useContext } from 'react';
import { Feature, Polygon } from 'geojson';
import { RasterAlarm } from '../types/api';
import { WarningAreaProperties } from '../types/config';
import { thresholdsByWarningLevel } from '../util/rasterAlarms';
import { arrayMax } from '../util/functions';
import { pointInPolygon } from '../util/bounds';
import { useRasterEvents } from '../api/hooks';
import { TimeContext } from '../providers/TimeProvider';
import { useConfigContext } from '../providers/ConfigProvider';
import styles from './AlarmsTable.module.css';

interface TableProps {
  alarms: RasterAlarm[];
  hoverArea: string | null;
  setHoverArea: (uuid: string | null) => void;
}

interface RowProps {
  warningArea: Feature<Polygon, WarningAreaProperties>;
  alarm: RasterAlarm | undefined;
  start: Date;
  end: Date;
  hoverArea: string | null;
  setHoverArea: (uuid: string | null) => void;
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

function WarningAreaRow({
  warningArea,
  alarm,
  start,
  end,
  hoverArea,
  setHoverArea,
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

  const highlight = hoverArea === warningArea.id;
  console.log('hoverArea = ', hoverArea, 'warningArea = ', warningArea.id, 'highlight=', highlight);

  return (
    <div
      className={`${styles.tr} ${warningClass ? styles[warningClass] : ""} ${highlight ? styles.tr_highlight : ""}`}
      onMouseEnter={() => setHoverArea("" + warningArea.id)}
      onMouseLeave={() => setHoverArea(null)}
    >
      <div className={styles.tdLeft}>{warningArea.properties.name}</div>
      <div className={styles.tdCenter}>
        {valueOfNow !== null ? valueOfNow.toFixed(2) : "-"}
      </div>
      <div className={styles.tdCenter}>
        {valueOfMax !== null ? valueOfMax.toFixed(2) : "-"}
      </div>
      <div className={styles.tdCenter}>
        {timeOfMax !== null ? timeDiffToString(timeOfMax.getTime(), start.getTime()) : "-"}
      </div>
      <div className={styles.tdCenter}>
        {warningLevel || "-"}
      </div>
      <div className={styles.tdCenter}>{thresholds.minor.toFixed(2)}</div>
      <div className={styles.tdCenter}>{thresholds.moderate.toFixed(2)}</div>
      <div className={styles.tdCenter}>{thresholds.major.toFixed(2)}</div>
    </div>
  );
}

function AlarmsTable({ alarms, hoverArea, setHoverArea }: TableProps) {
  const config = useConfigContext();
  const {now, end} = useContext(TimeContext);

  const warning_areas = config.flood_warning_areas;
  const operationalModelLevel = config.rasters.operationalModelLevel;

  return (
    <div className={styles.alarmsTable}>
      <div className={styles.tr}>
        <div className={styles.thtd}>Warning area</div>
        <div className={styles.thtd}>Current level (mAHD)</div>
        <div className={styles.thtd}>Max forecast (mAHD)</div>
        <div className={styles.thtd}>Time to max</div>
        <div className={styles.thtd}>Forecast level breached</div>
        <div className={styles.thtd}>Minor</div>
        <div className={styles.thtd}>Moderate</div>
        <div className={styles.thtd}>Major</div>
      </div>
      {warning_areas.features.map((feature, idx) => (
        <WarningAreaRow
          warningArea={feature}
          alarm={alarms.find((alarm) => pointInPolygon(alarm.geometry, feature.geometry))}
          start={now}
          end={end}
          key={idx}
          hoverArea={hoverArea}
          setHoverArea={setHoverArea}
          operationalModelLevel={operationalModelLevel}
        />
      ))}
    </div>
  );
}

export default AlarmsTable;
