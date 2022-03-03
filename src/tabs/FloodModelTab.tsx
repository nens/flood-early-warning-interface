import React from "react";

import styles from "../components/Tile.module.css";

import Tile from "../components/Tile";
import FloodModelMap from "../components/FloodModelMap";

function FloodModelTab() {
  return (
    <div className={styles.TileList}>
      <Tile size="large" title="Flood extent forecast">
        <FloodModelMap />
      </Tile>
    </div>
  );
}

export default FloodModelTab;
