import { FC } from "react";

import styles from "./Tile.module.css";

// Use this for an area overlaying the rest of the tile.

interface TileOverlayProps {
  open: boolean;
  title: string;
  x?: () => void;
}

const TileOverlay: FC<TileOverlayProps> = ({ open, children, title, x }) => {
  return (
    <div
      className={styles.TileOverlay}
      style={{
        height: open ? undefined : "0",
      }}
    >
      <div className={styles.Title}>
        {title}
        {x ? (
          <span className={styles.X} onClick={x} title="Close">
            &#128473;
          </span>
        ) : null}
      </div>
      <div style={{ padding: "1rem" }}>{children}</div>
    </div>
  );
};

export default TileOverlay;
