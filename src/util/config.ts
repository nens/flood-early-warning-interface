// Helper functions to do with the config
import { useConfigContext } from "../providers/ConfigProvider";
import { useLocation, useNavigate } from "react-router";
import { useCallback } from "react";
import { Alarm, Timeseries } from "../types/api";
import { TableTabConfig } from "../types/config";

export function useIsTimeseriesClickable(timeseries: Timeseries[]) {
  // Return first timeseries that has a chart
  const config = useConfigContext();

  for (const ts of timeseries) {
    const tile = config.tiles.find(
      (tile) =>
        timeseries &&
        tile.type === "timeseries" &&
        tile.timeseries &&
        tile.timeseries.indexOf(ts.uuid) > -1
    );
    if (tile) return ts;
  }

  return null;
}

export function useClickToTimeseries(timeseries: string, iframe: boolean = false) {
  // Hook that returns a memoized callback function that sends the user to the
  // correct timeseries chart. Returns a function that does nothing if there
  // is no such chart.
  const config = useConfigContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const tile = config.tiles.find(
    (tile) =>
      timeseries &&
      tile.type === "timeseries" &&
      tile.timeseries &&
      tile.timeseries.indexOf(timeseries) > -1
  );

  const callback = useCallback(() => {
    // url starts with something like /floodsmart/, we don't hardcode it so it can change.
    // urlParts[0] is the empty string, use [1].
    if (tile) {
      const urlParts = pathname.split("/");
      const newUrl = iframe
        ? `/${urlParts[1]}/iframe/${tile.id}/`
        : `/${urlParts[1]}/stations/${tile.id}/`;

      navigate(newUrl);
    }
  }, [navigate, pathname, iframe, tile]);

  return tile ? callback : null;
}

/* Given an alarm and a warning level, find the threshold */
export const alarmThresholdForLevel = (alarm: Alarm | null, warningLevel: string) => {
  const theThreshold = alarm?.thresholds.find(
    (t) => t.warning_level.toLowerCase() === warningLevel.toLowerCase()
  );
  return theThreshold ?? null;
};

/* Given a config of a table tab and a warning level, find the threshold's config */
export const configThresholdForLevel = (tabConfig: TableTabConfig, warningLevel: string) => {
  const theThreshold = tabConfig.thresholds.find(
    (t) => warningLevel && t.warning_level.toLowerCase() === warningLevel.toLowerCase()
  );
  return theThreshold ?? null;
};
