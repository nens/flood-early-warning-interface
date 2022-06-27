/* The table that is on the left of the table tab */
import { useContext } from "react";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { AiOutlineFilePdf } from "react-icons/ai";
import { Point } from "geojson";

import { TimeContext } from "../providers/TimeProvider";
import {
  useAlarm,
  useCurrentLevelTimeseries,
  useMaxForecastAtPoint,
  useUserHasRole,
} from "../api/hooks";
import { Config } from "../types/config";
import { timeDiffToString } from "./AlarmsTable";

import styles from "./AlarmsTable.module.css";

import { useLatestItemForArea } from "../api/rss";
import { TableTabConfig, TableTabRowConfig } from "../types/config";
import If from "./If";

interface TableTabTableProps {
  config: Config;
  tabConfig: TableTabConfig;
}

interface TableRowProps {
  now: Date;
  config: Config;
  tabConfig: TableTabConfig;
  row: TableTabRowConfig;
}

function TableRow({ now, config, tabConfig, row }: TableRowProps) {
  const highlight = false;

  const currentLevel = useCurrentLevelTimeseries(row.timeseries ?? "");
  const maxForecast = useMaxForecastAtPoint(
    config.rasters.operationalModelLevel,
    row.lng && row.lat ? { type: "Point", coordinates: [row.lng, row.lat] } : null,
    row.uuid
  );
  const alarm = useAlarm(row.alarmUuid ?? null, tabConfig.general.alarmType);
  const latestRssItem = useLatestItemForArea(row.name);

  const alarmThresholdForLevel = (warningLevel: string) => {
    const theThreshold = alarm?.thresholds.find(
      (t) => t.warning_level.toLowerCase() === warningLevel.toLowerCase()
    );
    return theThreshold ?? null;
  };

  const configThresholdForLevel = (warningLevel: string) => {
    const theThreshold = tabConfig.thresholds.find(
      (t) => t.warning_level.toLowerCase() === warningLevel.toLowerCase()
    );
    return theThreshold ?? null;
  };

  let rssWarning = "-";
  let rssWarningColor = undefined;

  if (latestRssItem !== null && latestRssItem.warning.toLowerCase() !== "no further impact") {
    rssWarning = latestRssItem.warning;
    // Find the right color for a warning string like "Minor Flood Warning"
    const firstWordOfRssWarning = rssWarning.toLowerCase().split(" ")[0];
    const threshold = configThresholdForLevel(firstWordOfRssWarning);

    if (threshold) {
      rssWarningColor = threshold.color;
    }
  }

  return (
    <div className={`${styles.tr} ${highlight ? styles.tr_highlight : ""}`}>
      <div className={styles.tdLeft}>{row.name}</div>
      <If test={!!tabConfig.general.columnCurrentLevelTs}>
        <div className={styles.thtd}>{currentLevel !== null ? currentLevel.toFixed(2) : "-"}</div>
      </If>
      <If test={!!tabConfig.general.columnCurrentLevelR}>
        <div className={styles.thtd}>-</div>
      </If>
      <If test={!!tabConfig.general.columnMaxForecast}>
        <div className={styles.thtd}>{maxForecast?.value ?? "-"}</div>
      </If>
      <If test={!!tabConfig.general.columnTimeToMax}>
        <div className={styles.thtd}>
          {maxForecast.time !== null
            ? timeDiffToString(maxForecast.time.getTime(), now.getTime())
            : "-"}
        </div>
      </If>
      <If test={!!tabConfig.general.columnTriggerLevel}>
        <div className={styles.thtd}>{alarm?.latest_trigger.warning_level || "-"}</div>
      </If>
      <If test={!!tabConfig.general.columnRssWarning}>
        <div className={styles.thtd} style={{ color: rssWarningColor }}>
          {rssWarning}
        </div>
      </If>
      <If test={!!tabConfig.general.columnAlarmThresholds}>
        {tabConfig.thresholds.map((threshold) => (
          <div key={threshold.uuid} className={styles.thtd}>
            {alarmThresholdForLevel(threshold.warning_level)?.value?.toFixed(2) ?? "-"}
          </div>
        ))}
      </If>
      <If test={!!tabConfig.general.columnDownloadLinks}>
        <div className={styles.thtd}>-</div>
      </If>
      <If test={!!tabConfig.general.columnAdminMessages}>
        <div className={styles.thtd}>-</div>
      </If>
    </div>
  );
}

function TableTabTable({ config, tabConfig }: TableTabTableProps) {
  const unit = config.waterlevelUnit ? `(${config.waterlevelUnit})` : "";
  const { now } = useContext(TimeContext);

  return (
    <div className={styles.alarmsTable}>
      <div className={styles.tr}>
        <div className={styles.thtd}>{tabConfig.general.nameColumnHeader}</div>
        <If test={!!tabConfig.general.columnCurrentLevelTs}>
          <div className={styles.thtd}>Current level {unit}</div>
        </If>
        <If test={!!tabConfig.general.columnCurrentLevelR}>
          <div className={styles.thtd}>Current level {unit}</div>
        </If>
        <If test={!!tabConfig.general.columnMaxForecast}>
          <div className={styles.thtd}>Max forecast {unit}</div>
        </If>
        <If test={!!tabConfig.general.columnTimeToMax}>
          <div className={styles.thtd}>Time to max</div>
        </If>
        <If test={!!tabConfig.general.columnTriggerLevel}>
          <div className={styles.thtd}>Partner Warning</div>
        </If>
        <If test={!!tabConfig.general.columnRssWarning}>
          <div className={styles.thtd}>Public Warning</div>
        </If>
        <If test={!!tabConfig.general.columnAlarmThresholds}>
          {tabConfig.thresholds.map((threshold) => (
            <div key={threshold.uuid} className={styles.thtd}>
              {threshold.warning_level}
            </div>
          ))}
        </If>
        <If test={!!tabConfig.general.columnDownloadLinks}>
          <div className={styles.thtd}>
            <AiOutlineFilePdf />
          </div>
        </If>
        <If test={!!tabConfig.general.columnAdminMessages}>
          <div className={styles.thtd}>
            <BiMessageRoundedDetail />
          </div>
        </If>
      </div>
      {tabConfig.rows.map((row) => (
        <TableRow key={row.uuid} now={now} config={config} tabConfig={tabConfig} row={row} />
      ))}
    </div>
  );
}

export default TableTabTable;
