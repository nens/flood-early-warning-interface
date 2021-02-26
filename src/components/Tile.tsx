import React, { useRef } from 'react';

import { WithChildren } from '../types/util';
import { useRect } from '../util/hooks';
import RectProvider from '../providers/RectProvider';

import styles from './Tile.module.css';

type TileSize = "smallsquare" | "large";

interface Props {
  title: string;
  size?: TileSize
}

function Tile({ title, children, size="smallsquare" }: WithChildren<Props>) {
  // We compute the size of the content div and supply it in a context to children
  const contentDivRef = useRef<HTMLDivElement>(null);
  const rect = useRect(contentDivRef);

  return (
    <div className={size === "smallsquare" ? styles.Tile : styles.LargeTile}>
      <div className={styles.Title}>{title}</div>
      <RectProvider rect={rect}>
        <div ref={contentDivRef} className={styles.Content}>
          {children}
        </div>
      </RectProvider>
    </div>
  );
}

export default Tile;
