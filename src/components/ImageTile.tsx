import React, { useContext } from 'react';

import { ExternalTile } from '../types/tiles';
import { RectResult } from '../util/hooks';
import { RectContext } from '../providers/RectProvider';

interface Props {
  tile: ExternalTile;
}

function ImageTile({tile}: Props) {
  // Tile passes on the content's rectangle in context
  const { rect } = useContext(RectContext) as {rect: RectResult};

  return (
    <img
      src={tile.imageUrl}
      alt={tile.title}
      width={rect.width}
      height={rect.height} />
  );
}

export default ImageTile;
