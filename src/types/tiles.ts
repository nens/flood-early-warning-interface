import React from 'react';

interface BaseTileProps {
  title: string;
  id: number;
}

export interface MapTile extends BaseTileProps {
  type: "map"
}

export interface ChartTile extends BaseTileProps {
  type: "timeseries"
}

export interface ExternalTile extends BaseTileProps {
  type: "external";
  imageUrl: string;
}

export type TileDefinition = MapTile | ChartTile | ExternalTile;
