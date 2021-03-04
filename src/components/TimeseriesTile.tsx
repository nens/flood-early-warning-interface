import React, { useContext } from 'react';

import { TileDefinition } from '../types/tiles';
import { RectResult } from '../util/hooks';
import { RectContext } from '../providers/RectProvider';

interface Props {
  tile: TileDefinition;
}

const SHOW_ONLY: string[] = [
];
const KEYS_DONE: string[] = [
  'backgroundColorShapes',
  'colors',
  'id',
  'legend',
  'legendStrings',
  'shortTitle',
  'title',
  'rasterIntersections',
  'thresholds',
  'timelines',
  'timeseries',
  'type',
  'viewInLizardLink'
];

function TimeseriesTile({tile}: Props) {
  // Tile passes on the content's rectangle in context
  const { rect } = useContext(RectContext) as {rect: RectResult};

  const keys = Object.keys(tile);
  keys.sort()

  return (
    <>
      <p>{`Type: ${tile.type}`}</p>
      <p>ID: {tile.id} Width: {rect.width} Height: {rect.height}</p>
      <ul>
        {keys.map(key => (
          (SHOW_ONLY.length > 0) ?
          (SHOW_ONLY.indexOf(key) > -1 ? (<li>{key}: {JSON.stringify((tile as any)[key], null, 2)}</li>) : null)
          : (KEYS_DONE.indexOf(key) > -1 ? null : (<li>{key}: {JSON.stringify((tile as any)[key], null, 2)}</li>))
        ))}
      </ul>
    </>
  );
}

export default TimeseriesTile;
