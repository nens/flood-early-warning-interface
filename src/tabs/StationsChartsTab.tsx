import React from "react";
import { Routes, Route } from "react-router";
import { useConfigContext } from "../providers/ConfigProvider";

import TileList from "../components/TileList";
import FullTileTab from "../components/FullTileTab";

function StationChartsTab() {
  const config = useConfigContext();

  // Keep the tiles that are timeseries
  const tiles = config.tiles.filter((tile) => tile.type === "timeseries" || tile.type === "map");

  return (
    <Routes>
      <Route path="" element={<TileList tiles={tiles} />} />
      <Route path=":tileId" element={<FullTileTab tiles={tiles} />} />
    </Routes>
  );
}

export default StationChartsTab;
