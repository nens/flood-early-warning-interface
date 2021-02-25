import React, { useContext } from 'react';

import { TileDefinition } from '../types/tiles';
import { RectResult } from '../util/hooks';
import { RectContext } from '../providers/RectProvider';

interface Props {
  tile: TileDefinition;
}

function TimeseriesTile({tile}: Props) {
  // Tile passes on the content's rectangle in context
  const { rect } = useContext(RectContext) as {rect: RectResult};

  return (
    <>
      <p>{`Type: ${tile.type}`}</p>
      <p>Width: {rect.width} Height: {rect.height}</p>
    </>
  );
}

export default TimeseriesTile;
