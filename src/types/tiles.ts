import React from 'react';

interface BaseTileProps {
  title: string;
  id: number;
}

interface MapTile extends BaseTileProps {
  type: "map"
}

interface ChartTile extends BaseTileProps {
  type: "chart"
}

export type TileDefinition = MapTile | ChartTile;
