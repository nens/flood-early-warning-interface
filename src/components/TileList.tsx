import React, { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import styles from "./Tile.module.css";

import { TileDefinition } from "../types/tiles";
import { TileSize } from "./Tile";

import Tile from "./Tile";
import TimeseriesTile from "./TimeseriesTile";
import MapTile from "./MapTile";

interface TileWithCallbackProps {
  tile: TileDefinition;
  baseUrl: string;
  size?: TileSize;
}

interface TileListProps {
  tiles: TileDefinition[];
}

export function TileWithCallback({ tile, baseUrl, size = "smallsquare" }: TileWithCallbackProps) {
  // Put the call to Tile in its own component instead of inside the
  // map() in TileList so that each Tile can have its own memoized
  // callback function to use in onClick.
  const navigate = useNavigate();

  const handleOnClick = useCallback(
    () => navigate(`${baseUrl}/${tile.id}`),
    [navigate, baseUrl, tile]
  );

  return (
    <Tile
      title={size === "full" ? tile.title : tile.shortTitle ?? tile.title}
      key={tile.id}
      onClick={handleOnClick}
      size={size}
    >
      {tile.type === "timeseries" ? <TimeseriesTile tile={tile} /> : null}
      {tile.type === "map" ? <MapTile tile={tile} /> : null}
    </Tile>
  );
}

function TileList({ tiles }: TileListProps) {
  const { pathname } = useLocation();

  return (
    <div className={styles.TileList}>
      {tiles.map((tile) => (
        <TileWithCallback key={tile.id} tile={tile} baseUrl={pathname} />
      ))}
    </div>
  );
}

export default TileList;
