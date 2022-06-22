import styles from "../components/Tile.module.css";
import Tile from "../components/Tile";

import { getTabKey, useConfigContext } from "../providers/ConfigProvider";
import { Tab, TableTabConfig } from "../types/config";

interface TableTabProps {
  tab: Tab;
}

function TableTab({ tab }: TableTabProps) {
  const config = useConfigContext();
  const tabKey = getTabKey(tab);

  const tabConfig: TableTabConfig = config.tableTabConfigs[tabKey] || {};

  console.log(config);

  return (
    <div className={styles.TileList}>
      <Tile title={tabConfig?.general?.tableTitleLeft || ""} size="large" rightText={tabConfig?.general?.tableTitleRight}>
      </Tile>
      <Tile title={tabConfig?.general?.mapTitleLeft || ""} rightText={tabConfig?.general?.tableTitleRight} size="large">
      </Tile>
    </div>
  );
}

export default TableTab;
