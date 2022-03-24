import { useRSSFeed } from "../api/rss";
import IssuedWarningsTable from "../components/IssuedWarningsTable";
import EWNRSSTable from "../components/EWNRSSTable";
import Tile from "../components/Tile";
import styles from "../components/Tile.module.css";

function IssuedWarningsTab() {
  const rssResponse = useRSSFeed();

  console.log(rssResponse.data);

  return (
    <div className={styles.TileList}>
      <Tile size="large" title="Issued Warnings">
        <IssuedWarningsTable />
      </Tile>
      <Tile size="large" title="EWN Warnings">
        <EWNRSSTable />
      </Tile>
    </div>
  );
}

export default IssuedWarningsTab;
