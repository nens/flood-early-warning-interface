import IssuedWarningsTable from "../components/IssuedWarningsTable";
import EWNRSSTable from "../components/EWNRSSTable";
import Tile from "../components/Tile";
import styles from "../components/Tile.module.css";

function IssuedWarningsTab() {
  return (
    <div className={styles.TileList}>
      <Tile size="large" title="Partner Alerts">
        <IssuedWarningsTable />
      </Tile>
      <Tile size="large" title="Public Warnings">
        <EWNRSSTable />
      </Tile>
    </div>
  );
}

export default IssuedWarningsTab;
