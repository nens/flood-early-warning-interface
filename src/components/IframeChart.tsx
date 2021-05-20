import { useCallback } from 'react';
import { useParams, Redirect, useHistory } from 'react-router';
import { useConfigContext } from "../providers/ConfigProvider";
import Tile from './Tile';
import TimeseriesTile from "./TimeseriesTile";

function IframeChart(props: {iframeUrl: string}) {
  const config = useConfigContext();
  const { tileId } = useParams<{tileId: string}>();
  const routerHistory = useHistory();
  const close = useCallback(
    () => routerHistory.push(props.iframeUrl),
    [routerHistory, props.iframeUrl]);

  const tile = config.tiles.find(t => (""+t.id) === tileId);

  if (!tile || tile.type !== 'timeseries') {
    return null; /// XXX - probably redirect to main iframe
  }

  return (
    <Tile
      size="full"
      title={tile.title}
      x={close}
    >
    <TimeseriesTile tile={tile} full />
    </Tile>
  )
}

export default IframeChart;
