import React, { useContext } from 'react';
import { Feature, Polygon } from 'geojson';
import { RasterAlarm } from '../types/api';
import { WarningAreaProperties } from '../types/config';
import { thresholdsByWarningLevel } from '../util/rasterAlarms';
import { pointInPolygon } from '../util/bounds';
import { useClickToTimeseries } from '../util/config';
import { dashOrNum } from '../util/functions';
import { useCurrentLevelTimeseries, useMaxForecastAtPoint } from '../api/hooks';
import { TimeContext } from '../providers/TimeProvider';
import { useConfigContext } from '../providers/ConfigProvider';
import styles from './AlarmsTable.module.css';
import TriggerHeader from './TriggerHeader';

interface TableProps {
  alarms: RasterAlarm[];
  hoverArea: string | null;
  setHoverArea: (uuid: string | null) => void;
}

interface RowProps {
  warningArea: Feature<Polygon, WarningAreaProperties>;
  alarm: RasterAlarm | undefined;
  now: Date;
  hoverArea: string | null;
  setHoverArea: (uuid: string | null) => void;
  operationalModelLevel: string;
}

function timeDiffToString(timestamp: number, now: number) {
  // Show difference in hours and minutes. Timestamp > now.
  const diffMinutes = Math.round((timestamp - now) / 1000 / 60);

  const minutes = diffMinutes % 60;
  const hours = (diffMinutes - minutes) / 60;

  return (hours > 0 ? hours+"h" : "") + minutes + "min";
}

function WarningAreaRow({
  warningArea,
  alarm,
  now,
  hoverArea,
  setHoverArea,
  operationalModelLevel
}: RowProps) {
  const rowClick = useClickToTimeseries(warningArea.properties.timeseries);
  const thresholds = alarm ? thresholdsByWarningLevel(alarm) : {};

  const currentLevel = useCurrentLevelTimeseries(warningArea.properties.timeseries);
  const maxForecast = useMaxForecastAtPoint(
    operationalModelLevel,
    alarm || null
  );

  const warningLevel = alarm ? alarm.latest_trigger.warning_level : null;
  const warningClass = warningLevel ? styles[`tr_${warningLevel.toLowerCase()}`] : "";
  const warningClassTd = warningLevel ? styles.td_warning : "";
  const highlight = hoverArea === warningArea.id;

  return (
    <div
      className={`${styles.tr} ${warningClass} ${highlight ? styles.tr_highlight : ""}`}
      onMouseEnter={() => setHoverArea("" + warningArea.id)}
      onMouseLeave={() => setHoverArea(null)}
      onClick={rowClick ?? undefined}
    >
      <div className={styles.tdLeft}>{warningArea.properties.name}</div>
      <div className={`${styles.tdCenter} ${warningClassTd}`}>
        {dashOrNum(currentLevel)}
      </div>
      <div className={`${styles.tdCenter} ${warningClassTd}`}>
        {dashOrNum(maxForecast.value)}
      </div>
      <div className={`${styles.tdCenter} ${warningClassTd}`}>
        {maxForecast.time !== null ? timeDiffToString(maxForecast.time.getTime(), now.getTime()) : "-"}
      </div>
      <div className={`${styles.tdCenter} ${warningClassTd}`}>
        {warningLevel || "-"}
      </div>
      <div className={styles.tdCenter}>{dashOrNum(thresholds.minor)}</div>
      <div className={styles.tdCenter}>{dashOrNum(thresholds.moderate)}</div>
      <div className={styles.tdCenter}>{dashOrNum(thresholds.major)}</div>
    </div>
  );
}

function AlarmsTable({ alarms, hoverArea, setHoverArea }: TableProps) {
  const config = useConfigContext();
  const {now} = useContext(TimeContext);

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
        <div className={styles.thtd}><TriggerHeader level="Minor"/></div>
        <div className={styles.thtd}><TriggerHeader level="Moderate"/></div>
        <div className={styles.thtd}><TriggerHeader level="Major"/></div>
      </div>
      {warning_areas.features.map((feature, idx) => (
        <WarningAreaRow
          warningArea={feature}
          alarm={alarms.find((alarm) => pointInPolygon(alarm.geometry, feature.geometry))}
          now={now}
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
