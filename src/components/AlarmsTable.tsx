import React, { useContext } from "react";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { Feature, Polygon } from "geojson";
import { RasterAlarm } from "../types/api";
import { WarningAreaProperties } from "../types/config";
import { thresholdsByWarningLevel } from "../util/rasterAlarms";
import { pointInPolygon } from "../util/bounds";
import { useClickToTimeseries } from "../util/config";
import { dashOrNum } from "../util/functions";
import { useCurrentLevelTimeseries, useMaxForecastAtPoint, useUserHasRole } from "../api/hooks";
import { TimeContext } from "../providers/TimeProvider";
import { useConfigContext } from "../providers/ConfigProvider";
import styles from "./AlarmsTable.module.css";
import TriggerHeader from "./TriggerHeader";
import { useMessages } from "../api/messages";
import { HoverAndSelectContext } from "../providers/HoverAndSelectProvider";

interface TableProps {
  alarms: RasterAlarm[];
}

interface RowProps {
  warningArea: Feature<Polygon, WarningAreaProperties>;
  alarm: RasterAlarm | undefined;
  now: Date;
  operationalModelLevel: string;
}

function timeDiffToString(timestamp: number, now: number) {
  // Show difference in hours and minutes. Timestamp > now.
  const diffMinutes = Math.round((timestamp - now) / 1000 / 60);

  const minutes = diffMinutes % 60;
  const hours = (diffMinutes - minutes) / 60;

  return (hours > 0 ? hours + "h" : "") + minutes + "min";
}

function WarningAreaRow({ warningArea, alarm, now, operationalModelLevel }: RowProps) {
  const rowClick = useClickToTimeseries(
    warningArea.properties.timeseries,
    false,
    (target) => target === "div"
  );
  const { hover, setHover, setSelect } = useContext(HoverAndSelectContext);

  const thresholds = alarm ? thresholdsByWarningLevel(alarm) : {};
  const messages = useMessages("" + warningArea.id);
  const isAdmin = useUserHasRole("admin");

  const currentLevel = useCurrentLevelTimeseries(warningArea.properties.timeseries);
  const maxForecast = useMaxForecastAtPoint(operationalModelLevel, alarm || null);

  const warningLevel = alarm ? alarm.latest_trigger.warning_level : null;
  const warningClass = warningLevel ? styles[`tr_${warningLevel.toLowerCase()}`] : "";
  const warningClassTd = warningLevel ? styles.td_warning : "";
  const highlight = hover?.id === warningArea.id;

  const hasMessages = messages.status === "success" && messages.messages.length > 0;

  return (
    <>
      <div
        className={`${styles.tr} ${warningClass} ${highlight ? styles.tr_highlight : ""}`}
        onMouseEnter={() =>
          setHover({ id: "" + warningArea.id, name: warningArea.properties.name })
        }
        onMouseLeave={() => setHover(null)}
        onClick={rowClick ?? undefined}
      >
        <div className={styles.tdLeft}>{warningArea.properties.name}</div>
        <div className={`${styles.tdCenter} ${warningClassTd}`}>{dashOrNum(currentLevel)}</div>
        <div className={`${styles.tdCenter} ${warningClassTd}`}>{dashOrNum(maxForecast.value)}</div>
        <div className={`${styles.tdCenter} ${warningClassTd}`}>
          {maxForecast.time !== null
            ? timeDiffToString(maxForecast.time.getTime(), now.getTime())
            : "-"}
        </div>
        <div className={`${styles.tdCenter} ${warningClassTd}`}>{warningLevel || "-"}</div>
        <div className={styles.tdCenter}>{dashOrNum(thresholds.minor)}</div>
        <div className={styles.tdCenter}>{dashOrNum(thresholds.moderate)}</div>
        <div className={styles.tdCenter}>{dashOrNum(thresholds.major)}</div>
        <div className={styles.tdCenter}>
          {hasMessages || isAdmin ? (
            <button
              style={{background: "var(--white-color)", padding: 0, margin: 0}}
              onClick={(event) => {
                setSelect((select) =>
                  select?.id === "" + warningArea.id
                    ? null
                    : { id: "" + warningArea.id, name: warningArea.properties.name }
                );
                event.stopPropagation();
              }}
            >
              <BiMessageRoundedDetail
                color={hasMessages ? "var(--primary-color)" : "lightgray"}
                fontWeight="bold"
                size="25px"
              />
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

function AlarmsTable({ alarms }: TableProps) {
  const config = useConfigContext();
  const { now } = useContext(TimeContext);

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
        <div className={styles.thtd}>
          <TriggerHeader level="Minor" />
        </div>
        <div className={styles.thtd}>
          <TriggerHeader level="Moderate" />
        </div>
        <div className={styles.thtd}>
          <TriggerHeader level="Major" />
        </div>
        <div className={styles.thtd}>
          <BiMessageRoundedDetail />
        </div>
      </div>
      {warning_areas.features.map((feature, idx) => (
        <WarningAreaRow
          warningArea={feature}
          alarm={alarms.find((alarm) => pointInPolygon(alarm.geometry, feature.geometry))}
          now={now}
          key={idx}
          operationalModelLevel={operationalModelLevel}
        />
      ))}
    </div>
  );
}

export default AlarmsTable;
