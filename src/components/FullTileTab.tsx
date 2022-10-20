import React, { useCallback } from "react";

import { useLocation, useNavigate, useParams } from "react-router";

import { TileDefinition } from "../types/tiles";
import Tile from "./Tile";
import TimeseriesTile from "./TimeseriesTile";
import MapTile from "./MapTile";
import { TileWithCallback } from "./TileList";
import styles from "./FullTileTab.module.css";

interface Props {
  tiles: TileDefinition[];
}

function FullTileTab({ tiles }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const urlWithoutTileId = location.pathname.split("/").slice(0, -1).join("/");

  const { tileId } = useParams<{ tileId: string }>();

  const onClickFullTile = useCallback(() => navigate(urlWithoutTileId), [navigate, urlWithoutTileId]);

  const tilesWithId = tiles.filter((t) => "" + t.id === tileId);

  if (tilesWithId.length !== 1) {
    navigate(urlWithoutTileId);
  }

  const fullTile = tilesWithId[0];

  return (
    <div className={styles.FullTileTab}>
      <div className={styles.Sidebar}>
        {tiles.map((tile) =>
          tile.type === "timeseries" ? (
            <TileWithCallback key={tile.id} size="smallsquare" tile={tile} baseUrl={urlWithoutTileId} />
          ) : null
        )}
      </div>
      <div className={styles.FullTile} key={fullTile.id}>
        <Tile
          size="full"
          title={fullTile.title}
          x={onClickFullTile}
          viewInLizardLink={fullTile.viewInLizardLink}
        >
          {fullTile.type === "timeseries" ? <TimeseriesTile tile={fullTile} full /> : null}
          {fullTile.type === "map" ? <MapTile tile={fullTile} full /> : null}
        </Tile>
      </div>
    </div>
  );
}

export default FullTileTab;
