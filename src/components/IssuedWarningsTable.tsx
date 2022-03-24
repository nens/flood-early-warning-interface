import { useState } from "react";
import { RasterAlarm, Trigger } from "../types/api";
import { useRasterAlarms, useRasterAlarmTriggers } from "../api/hooks";
import { dashOrNum } from "../util/functions";

import styles from "./IssuedWarningsTable.module.css";

interface AlarmTrigger {
  alarm: RasterAlarm;
  trigger: Trigger;
}

const TRIGGERS_PER_PAGE = 15;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function _toTimeStr(d: Date) {
  const day = d.getDate();
  const month = MONTHS[d.getMonth()].substr(0, 3);
  const year = d.getFullYear();

  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

function sortTriggers(triggers: AlarmTrigger[], ordering: string) {
  const reverse = ordering[0] === "-";
  if (reverse) ordering = ordering.slice(1);

  const cmp = (v1: any, v2: any) => {
    if (v1 < v2) return reverse ? 1 : -1;
    if (v2 < v1) return reverse ? -1 : 1;
    return 0;
  };

  triggers.sort((t1: AlarmTrigger, t2: AlarmTrigger) => {
    if (ordering === "triggeredat") {
      return cmp(t1.trigger.trigger_time, t2.trigger.trigger_time);
    }
    if (ordering === "name") {
      return cmp(t1.alarm.name, t2.alarm.name);
    }
    if (ordering === "level") {
      return cmp(t1.trigger.warning_level ?? "", t2.trigger.warning_level ?? "");
    }
    if (ordering === "value") {
      return cmp(t1.trigger.value, t2.trigger.value);
    }
    return 0;
  });
}

function IssuedWarningsTable() {
  const [filter, setFilter] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [ordering, setOrdering] = useState<string>("-triggeredat");

  const rasterAlarms = useRasterAlarms();
  const response = useRasterAlarmTriggers();

  if (!rasterAlarms.data || !rasterAlarms.data.results || !rasterAlarms.data.results.length) {
    return null;
  }

  if (response.length === 0) {
    return null;
  }

  const alarms = rasterAlarms.data.results.slice();
  alarms.sort((a1, a2) => {
    if (a1.name < a2.name) return -1;
    if (a2.name < a1.name) return 1;
    return 0;
  });

  let triggers = filter ? response.filter((trigger) => trigger.alarm.uuid === filter) : response;
  sortTriggers(triggers, ordering);

  const numTriggers = triggers.length;
  const previousEnabled = page > 0;
  const nextEnabled = triggers.length > (page + 1) * TRIGGERS_PER_PAGE;

  const firstIndex = page * TRIGGERS_PER_PAGE;
  const lastIndex = Math.min(triggers.length, (page + 1) * TRIGGERS_PER_PAGE);
  triggers = triggers.slice(firstIndex, lastIndex);

  const clickOrdering = (header: string) => {
    if (ordering === header) {
      setOrdering(`-${header}`);
    } else {
      setOrdering(header);
    }
    setPage(0);
  };

  const isOrdering = (header: string) => {
    if (ordering === header) {
      return <>&#x25B2;</>;
    } else if (ordering === `-${header}`) {
      return <>&#x25BC;</>;
    } else {
      return null;
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <select
        onChange={(e) => {
          setFilter(e.target.value);
          setPage(0);
        }}
      >
        <option value={""}>-- Filter on alarm name --</option>
        {alarms.map((alarm) => (
          <option key={alarm.uuid} value={alarm.uuid}>
            {alarm.name}
          </option>
        ))}
      </select>
      <div className={styles.WarningsTable}>
        <div className={styles.tr}>
          <div className={styles.thtd} onClick={() => clickOrdering("triggeredat")}>
            Triggered at {isOrdering("triggeredat")}
          </div>
          <div className={styles.thtd} onClick={() => clickOrdering("name")}>
            Name {isOrdering("name")}
          </div>
          <div className={styles.thtd} onClick={() => clickOrdering("level")}>
            Trigger level {isOrdering("level")}
          </div>
          <div className={styles.thtd} onClick={() => clickOrdering("value")}>
            Trigger value {isOrdering("value")}
          </div>
        </div>
        {triggers.map(({ alarm, trigger }) => (
          <div className={styles.tr} key={"" + trigger.id}>
            <div className={styles.tdLeft}>{_toTimeStr(new Date(trigger.trigger_time))}</div>
            <div className={styles.tdLeft}>{alarm.name}</div>
            <div className={styles.tdLeft}>{trigger.warning_level || "No further impact"}</div>
            <div className={styles.tdLeft}>{`${dashOrNum(trigger.value)} mAHD`}</div>
          </div>
        ))}
      </div>
      <p className={styles.numWarnings}>
        Showing warnings {firstIndex + 1} to {lastIndex} of {numTriggers}.
      </p>
      <input
        type="button"
        disabled={!previousEnabled}
        value="<"
        onClick={() => previousEnabled && setPage(page - 1)}
      />
      <input
        type="button"
        disabled={!nextEnabled}
        value=">"
        onClick={() => nextEnabled && setPage(page + 1)}
      />
    </div>
  );
}

export default IssuedWarningsTable;
