// Helper functions to do with the config
import { useConfigContext } from '../providers/ConfigProvider';
import { useRouteMatch, useHistory } from 'react-router';
import { useCallback } from 'react';

export function useClickToTimeseries(timeseries: string): () => void {
  // Hook that returns a memoized callback function that sends the user to the
  // correct timeseries chart. Returns a function that does nothing if there
  // is no such chart.
  const config = useConfigContext();
  const { url } = useRouteMatch();
  const history = useHistory();

  const tile = config.tiles.find(tile =>
    (timeseries &&
     tile.type === 'timeseries' &&
     tile.timeseries &&
     tile.timeseries.indexOf(timeseries) > -1)
  );

  return useCallback(() => {
    if (tile) {
      // url starts with something like /floodsmart/, we don't hardcode it so it can change.
      // urlParts[0] is the empty string, use [1].
      const urlParts = url.split('/');
      const newUrl = `/${urlParts[1]}/stations/${tile.id}/`;

      history.push(newUrl);
    }
  }, [url, timeseries]);
}
