import IssuedWarningsTable from "../components/IssuedWarningsTable";
import Tile from "../components/Tile";
import styles from "../components/Tile.module.css";

function IssuedWarningsTab() {
  return (
    <div className={styles.TileList}>
      <Tile size="large" title="Issued Warnings">
        <IssuedWarningsTable />
      </Tile>
    </div>
  );
}

export default IssuedWarningsTab;
