import { useState } from "react";
import { useRSSFeed, RssItem } from "../api/rss";
import { BiLinkExternal } from "react-icons/bi";

import styles from "./IssuedWarningsTable.module.css";

const WARNINGS_PER_PAGE = 15;

function sortItems(items: RssItem[], ordering: string) {
  const reverse = ordering[0] === "-";
  if (reverse) ordering = ordering.slice(1);

  const cmp = (v1: any, v2: any) => {
    if (v1 < v2) return reverse ? 1 : -1;
    if (v2 < v1) return reverse ? -1 : 1;
    return 0;
  };

  items.sort((t1: RssItem, t2: RssItem) => {
    if (ordering === "area") {
      return cmp(t1.area, t2.area);
    }
    if (ordering === "level") {
      return cmp(t1.warning ?? "", t2.warning ?? "");
    }
    return 0;
  });
}

function EWNRSSTable() {
  const [filter, setFilter] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [ordering, setOrdering] = useState<string>("-triggeredat");

  const rssItems = useRSSFeed();

  if (!rssItems.data) {
    return null;
  }

  const areaNamesObj: { [area: string]: 1 } = {};
  for (let i = 0; i < rssItems.data.length; i++) {
    areaNamesObj[rssItems.data[i].area] = 1;
  }
  const areaNames = Object.keys(areaNamesObj);
  areaNames.sort();

  const filtered = rssItems.data.filter((item) => !filter || item.area === filter);
  sortItems(filtered, ordering);
  const numTriggers = filtered.length;
  const previousEnabled = page > 0;
  const nextEnabled = filtered.length > (page + 1) * WARNINGS_PER_PAGE;
  const firstIndex = page * WARNINGS_PER_PAGE;
  const lastIndex = Math.min(filtered.length, (page + 1) * WARNINGS_PER_PAGE);
  let items = filtered.slice(firstIndex, lastIndex);

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
        <option value={""}>-- Filter on warning area --</option>
        {areaNames.map((areaName) => (
          <option key={areaName} value={areaName}>
            {areaName}
          </option>
        ))}
      </select>
      <div className={styles.WarningsTable}>
        <div className={styles.tr}>
          <div className={styles.thtd}>Publication date</div>
          <div className={styles.thtd} onClick={() => clickOrdering("area")}>
            Warning Area {isOrdering("area")}
          </div>
          <div className={styles.thtd} onClick={() => clickOrdering("level")}>
            Trigger level {isOrdering("level")}
          </div>
          <div className={styles.thtd}>Link</div>
        </div>
        {items.map(({ pubDate, area, warning, link }) => (
          <div className={styles.tr} key={link}>
            <div
              className={styles.tdLeft}
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {pubDate}
            </div>
            <div
              className={styles.tdLeft}
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {area}
            </div>
            <div
              className={styles.tdLeft}
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {warning}
            </div>
            <div
              className={styles.tdLeft}
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              <a href={link} target="_new">
                click <BiLinkExternal />
              </a>
            </div>
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

export default EWNRSSTable;
