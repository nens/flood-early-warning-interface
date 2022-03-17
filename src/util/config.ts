// Helper functions to do with the config
import { useConfigContext } from "../providers/ConfigProvider";
import { LeafletEvent } from "leaflet";
import { useRouteMatch, useHistory } from "react-router";
import { useCallback } from "react";
import { Timeseries } from "../types/api";

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

export function useClickToTimeseries(
  timeseries: string,
  iframe: boolean = false,
  targetTest?: (target: any) => boolean
) {
  // Hook that returns a memoized callback function that sends the user to the
  // correct timeseries chart. Returns a function that does nothing if there
  // is no such chart.
  const config = useConfigContext();
  const { url } = useRouteMatch();
  const history = useHistory();

  const tile = config.tiles.find(
    (tile) =>
      timeseries &&
      tile.type === "timeseries" &&
      tile.timeseries &&
      tile.timeseries.indexOf(timeseries) > -1
  );

  const callback = useCallback(
    (event: any) => {
      // url starts with something like /floodsmart/, we don't hardcode it so it can change.
      // urlParts[0] is the empty string, use [1].
      if (targetTest && event instanceof MouseEvent && !targetTest(event.target as HTMLElement)) {
        return;
      }

      if (tile) {
        const urlParts = url.split("/");
        const newUrl = iframe
          ? `/${urlParts[1]}/iframe/${tile.id}/`
          : `/${urlParts[1]}/stations/${tile.id}/`;

        history.push(newUrl);
      }
    },
    [history, url, iframe, tile]
  );

  return tile ? callback : null;
}
