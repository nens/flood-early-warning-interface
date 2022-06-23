import styles from "../components/Tile.module.css";
import TableTabTable from "../components/TableTabTable";
import TableTabMap from "../components/TableTabMap";
import Tile from "../components/Tile";

import { getTabKey, useConfigContext } from "../providers/ConfigProvider";
import { Tab, TableTabConfig } from "../types/config";
import HoverAndSelectProvider from "../providers/HoverAndSelectProvider";

interface TableTabProps {
  tab: Tab;
}

function TableTab({ tab }: TableTabProps) {
  const config = useConfigContext();
  const tabKey = getTabKey(tab);

  const tabConfig: TableTabConfig = config.tableTabConfigs[tabKey];

  if (!tabConfig) return null;

  return (
    <HoverAndSelectProvider>
      <div className={styles.TileList}>
        <Tile title={tabConfig.general.tableTitleLeft || ""} size="large" rightText={tabConfig.general.tableTitleRight}>
          <TableTabTable tabConfig={tabConfig} />
        </Tile>
        <Tile title={tabConfig.general.mapTitleLeft || ""} rightText={tabConfig.general.tableTitleRight} size="large">
          <TableTabMap tabConfig={tabConfig} />
        </Tile>
      </div>
    </HoverAndSelectProvider>
  );
}

export default TableTab;
