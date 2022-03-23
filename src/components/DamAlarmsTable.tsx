import { useContext, MouseEvent } from "react";
import { BiMessageRoundedDetail } from "react-icons/bi";

import { dashOrNum } from "../util/functions";
import { useClickToTimeseries } from "../util/config";
import { Dam } from "../types/config";
import { RasterAlarm } from "../types/api";
import { thresholdsByWarningLevel } from "../util/rasterAlarms";
import { isSamePoint } from "../util/bounds";
import { useCurrentLevelTimeseries, useMaxForecastAtPoint, useUserHasRole } from "../api/hooks";
import { TimeContext } from "../providers/TimeProvider";
import { useConfigContext } from "../providers/ConfigProvider";
import TriggerHeader from "./TriggerHeader";
import styles from "./AlarmsTable.module.css";
import { HoverAndSelectContext } from "../providers/HoverAndSelectProvider";
import { useMessages } from "../api/messages";

interface TableProps {
  dams: Dam[];
  damAlarms: RasterAlarm[];
}

interface RowProps {
  dam: Dam;
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

function DamRow({ dam, alarm, now, operationalModelLevel }: RowProps) {
  const { hover, setHover, setSelect } = useContext(HoverAndSelectContext);
  const messages = useMessages("" + dam.properties.name);
  const isAdmin = useUserHasRole("admin");

  const rowClick = useClickToTimeseries(dam.properties.timeseries);
  const thresholds = alarm ? thresholdsByWarningLevel(alarm) : {};

  const currentLevel = useCurrentLevelTimeseries(dam.properties.timeseries);
  const maxForecast = useMaxForecastAtPoint(
    operationalModelLevel,
    dam.properties.has_level_forecast && alarm ? alarm : null
  );

  const warningLevel = alarm ? alarm.latest_trigger.warning_level : null;
  const warningStyle = {
    background: warningLevel ? `var(--trigger-${warningLevel.toLowerCase()}-table)` : undefined,
  };
  const warningClassTd = warningLevel ? styles.td_warning : "";
  const highlight = hover?.name === dam.properties.name;

  const hasMessages = messages.status === "success" && messages.messages.length > 0;

  const clickMessagesButton = (event: MouseEvent<HTMLButtonElement>) => {
    // If already selected to this, turn selection off; otherwise select this dam.
    setSelect((select) =>
      select?.name === dam.properties.name ? null : { id: "" + dam.id!, name: dam.properties.name }
    );
    event.stopPropagation();
  };

  return (
    <div
      className={`${styles.tr} ${highlight ? styles.tr_highlight : ""}`}
      style={warningStyle}
      onMouseEnter={() => setHover({ id: "" + dam.id!, name: dam.properties.name })}
      onMouseLeave={() => setHover(null)}
      onClick={rowClick ?? undefined}
    >
      <div className={styles.tdLeft}>{dam.properties.name}</div>
      <div className={`${styles.tdCenter} ${warningClassTd}`}>{dashOrNum(currentLevel)}</div>
      <div className={`${styles.tdCenter} ${warningClassTd}`}>{dashOrNum(maxForecast.value)}</div>
      <div className={`${styles.tdCenter} ${warningClassTd}`}>
        {maxForecast.time !== null
          ? timeDiffToString(maxForecast.time.getTime(), now.getTime())
          : "-"}
      </div>
      <div className={`${styles.tdCenter} ${warningClassTd}`}>{warningLevel || "-"}</div>
      <div className={styles.tdCenter}>{dashOrNum(thresholds.monitor)}</div>
      <div className={styles.tdCenter}>{dashOrNum(thresholds.white)}</div>
      <div className={styles.tdCenter}>{dashOrNum(thresholds.amber)}</div>
      <div className={styles.tdCenter}>{dashOrNum(thresholds.red)}</div>
      <div className={styles.tdCenter}>
        {hasMessages || isAdmin ? (
          <button
            style={{ background: "var(--white-color)", padding: 0, margin: 0 }}
            onClick={clickMessagesButton}
          >
            <BiMessageRoundedDetail
              color={hasMessages ? "var(--primary-color)" : "lightgray"}
              size="25px"
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function DamAlarmsTable({ dams, damAlarms }: TableProps) {
  const config = useConfigContext();
  const { now } = useContext(TimeContext);

  const operationalModelLevel = config.rasters.operationalModelLevel;

  return (
    <div className={styles.alarmsTable}>
      <div className={styles.tr}>
        <div className={styles.thtd}>Dam</div>
        <div className={styles.thtd}>Current level (mAHD)</div>
        <div className={styles.thtd}>Max forecast (mAHD)</div>
        <div className={styles.thtd}>Time to max</div>
        <div className={styles.thtd}>Forecast level breached</div>
        <div className={styles.thtd}>
          <TriggerHeader level="Monitor" />
        </div>
        <div className={styles.thtd}>
          <TriggerHeader level="White" />
        </div>
        <div className={styles.thtd}>
          <TriggerHeader level="Amber" />
        </div>
        <div className={styles.thtd}>
          <TriggerHeader level="Red" />
        </div>
        <div className={styles.thtd}>
          <BiMessageRoundedDetail />
        </div>
      </div>
      {dams.map((dam, idx) => {
        const alarm = damAlarms.find((alarm) => isSamePoint(alarm.geometry, dam.geometry));

        return (
          <DamRow
            dam={dam}
            alarm={alarm}
            now={now}
            key={idx}
            operationalModelLevel={operationalModelLevel}
          />
        );
      })}
    </div>
  );
}

export default DamAlarmsTable;
