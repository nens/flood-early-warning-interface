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

// Array utils
export const swap = <T>(arr: T[], idx0: number, idx1: number): T[] =>
  arr.map((a: T, idx) => (idx === idx0 ? arr[idx1] : idx === idx1 ? arr[idx0] : a));

export const moveUp = <T>(arr: T[], idx: number): T[] => (idx > 0 ? swap(arr, idx, idx - 1) : arr);
export const moveDown = <T>(arr: T[], idx: number): T[] =>
  idx < arr.length - 1 ? swap(arr, idx, idx + 1) : arr;

export const change = <T>(arr: T[], idx: number, a: T): T[] =>
  arr
    .slice(0, idx)
    .concat([a])
    .concat(arr.slice(idx + 1));

export const remove = <T>(arr: T[], idx: number): T[] =>
  arr.slice(0, idx).concat(arr.slice(idx + 1));
