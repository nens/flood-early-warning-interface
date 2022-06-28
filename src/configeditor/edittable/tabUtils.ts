import { TableTabConfig, TableTabConfigs, Config } from "../../types/config";

export const EMPTY_TABLE_TAB_CONFIG: TableTabConfig = {
  general: {
    nameColumnHeader: "Name",
  },
  rows: [],
  thresholds: [],
};

export function getTableConfig(tableTabConfigs: TableTabConfigs, tabKey: string) {
  return tableTabConfigs[tabKey] ?? EMPTY_TABLE_TAB_CONFIG;
}

export function changeTableConfig(
  config: Config,
  tabKey: string,
  newTableConfig: TableTabConfig
): Config {
  return {
    ...config,
    tableTabConfigs: {
      ...(config.tableTabConfigs ?? {}),
      [tabKey]: newTableConfig,
    },
  };
}
