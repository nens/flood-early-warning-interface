/* The table that is on the left of the table tab */
import { useCallback, useContext, MouseEvent } from "react";
import { useRouteMatch, useHistory } from "react-router";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { AiOutlineFilePdf } from "react-icons/ai";

import { HoverAndSelectContext } from "../providers/HoverAndSelectProvider";
import { TimeContext } from "../providers/TimeProvider";
import TriggerHeader from "./TriggerHeader";
import {
  useAlarm,
  useCurrentLevelTimeseries,
  useCurrentRasterValueAtPoint,
  useMaxForecastAtPoint,
  useUserHasRole,
} from "../api/hooks";
import { useMessages } from "../api/messages";
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

function PdfIcon({ url }: { url: string }) {
  const clickDiv = (event: MouseEvent<HTMLButtonElement>) => {
    window.open(url, "_blank");
    event.stopPropagation();
  };

  return (
    <button
      style={{ background: "var(--white-color)", color: "black", padding: 0, margin: 0 }}
      onClick={clickDiv}
    >
      <AiOutlineFilePdf size={32} />
    </button>
  );
}

function useClickOnTableRow(row: TableTabRowConfig, iframe: boolean) {
  const { url } = useRouteMatch();
  const history = useHistory();

  const callback = useCallback(() => {
    // url starts with something like /floodsmart/, we don't hardcode it so it can change.
    // urlParts[0] is the empty string, use [1].
    // row.clickUrl is the part after that, e.g. "stations/24/" (that does not
    // work well with iframe mode, but we try by replacing "stations" with "iframe".
    if (row.clickUrl) {
      const urlParts = url.split("/");
      const clickUrl = iframe ? row.clickUrl.replace("stations", "iframe") : row.clickUrl;
      const newUrl = `/${urlParts[1]}/${clickUrl}`;

      history.push(newUrl);
    }
  }, [history, url, iframe, row]);

  return callback;
}

function TableRow({ now, config, tabConfig, row }: TableRowProps) {
  const { hover, setHover, setSelect } = useContext(HoverAndSelectContext);
  const highlight = hover?.id === row.uuid;

  const currentLevel = useCurrentLevelTimeseries(row.timeseries ?? "");
  const maxForecast = useMaxForecastAtPoint(
    config.rasters.operationalModelLevel,
    row.lng && row.lat ? { type: "Point", coordinates: [row.lng, row.lat] } : null,
    row.uuid
  );
  const currentLevelRaster = useCurrentRasterValueAtPoint(
    config.rasters.operationalModelLevel,
    row.lng && row.lat ? { type: "Point", coordinates: [row.lng, row.lat] } : null,
  );
  const alarm = useAlarm(row.alarmUuid ?? null, tabConfig.general.alarmType);
  const latestRssItem = useLatestItemForArea(row.name);
  const isAdmin = useUserHasRole("admin");
  const messages = useMessages(row.uuid);
  const hasMessages = messages.status === "success" && messages.messages.length > 0;

  const rowClick = useClickOnTableRow(row, false);

  const clickMessagesButton = (event: MouseEvent<HTMLButtonElement>) => {
    // If already selected to this, turn selection off; otherwise select this warningArea.
    setSelect((select) => (select?.id === row.uuid ? null : { id: row.uuid, name: row.name }));
    event.stopPropagation(); // Otherwise the row's onClick is triggered.
  };

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

  const triggerLevel = alarm?.latest_trigger.warning_level
    ? configThresholdForLevel(alarm.latest_trigger.warning_level)
    : null;

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
    <div
      className={`${styles.tr} ${highlight ? styles.tr_highlight : ""}`}
      onMouseEnter={() => setHover({ id: row.uuid, name: row.name })}
      onMouseLeave={() => setHover(null)}
      onClick={rowClick}
    >
      <div className={styles.tdLeft}>{row.name}</div>
      <If test={!!tabConfig.general.columnCurrentLevelTs}>
        <div className={styles.thtd}>{currentLevel !== null ? currentLevel.toFixed(2) : "-"}</div>
      </If>
      <If test={!!tabConfig.general.columnCurrentLevelR}>
        <div className={styles.thtd}>{currentLevelRaster?.value?.toFixed(2) ?? "-"}</div>
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
        <div
          className={styles.thtd}
          style={{ color: triggerLevel ? triggerLevel.color : undefined }}
        >
          {alarm?.latest_trigger.warning_level || "-"}
        </div>
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
        <div className={styles.thtd}>
          {row.downloadUrl ? <PdfIcon url={row.downloadUrl} /> : "-"}
        </div>
      </If>
      <If test={!!tabConfig.general.columnAdminMessages}>
        <div className={styles.thtd}>
          {hasMessages || isAdmin ? (
            <button
              style={{ background: "var(--white-color)", padding: 0, margin: 0 }}
              onClick={clickMessagesButton}
            >
              <BiMessageRoundedDetail
                color={hasMessages ? "red" : "lightgray"}
                fontWeight="bold"
                size="25px"
              />
            </button>
          ) : null}
        </div>
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
              <TriggerHeader level={threshold.warning_level} configColor={threshold.color} />
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
