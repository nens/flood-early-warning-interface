import React, { useRef } from "react";

import { WithChildren } from "../types/util";
import { useRect } from "../util/hooks";
import RectProvider from "../providers/RectProvider";

import { ReactComponent as LizardIcon } from "./lizard.svg";

import styles from "./Tile.module.css";

export type TileSize = "smallsquare" | "large" | "full" | "halfheight";

interface Props {
  title: string;
  size?: TileSize;
  onClick?: () => void;
  x?: () => void;
  viewInLizardLink?: string;
  rightText?: string;
}

function Tile({
  title,
  children,
  onClick,
  x,
  viewInLizardLink,
  size = "smallsquare",
  rightText,
}: WithChildren<Props>) {
  // We compute the size of the content div and supply it in a context to children
  const contentDivRef = useRef<HTMLDivElement>(null);
  const rect = useRect(contentDivRef);

  const sizeClass =
    size === "smallsquare"
      ? styles.TileSmall
      : size === "large"
      ? styles.TileLarge
      : size === "halfheight"
      ? styles.TileHalfHeight
      : styles.TileFull;

  return (
    <div className={`${styles.Tile} ${sizeClass}`}>
      <div
        className={styles.Title}
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : undefined }}
      >
        {title}
        {x ? (
          <span className={styles.X} onClick={x} title="Close">
            &#128473;
          </span>
        ) : null}
        {viewInLizardLink ? (
          <LizardIcon
            className={styles.LizardIcon}
            onClick={() => window.open(viewInLizardLink, "_blank")}
          />
        ) : null}
        {rightText ? <span className={styles.RightText}>{rightText}</span> : null}
      </div>
      <RectProvider rect={rect}>
        <div ref={contentDivRef} className={styles.Content}>
          {children}
        </div>
      </RectProvider>
    </div>
  );
}

export default Tile;
