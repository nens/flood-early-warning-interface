import { WithChildren } from "../types/util";

import styles from "./Tile.module.css";

interface Props {
  title: string;
}

function LargeTile({ children, title }: WithChildren<Props>) {
  return (
    <div className={styles.LargeTile}>
      <div className={styles.Title}>{title}</div>
      <div className={styles.Content}>{children}</div>
    </div>
  );
}

export default LargeTile;
