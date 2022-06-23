/* The table that is on the left of the table tab */

import styles from "./AlarmsTable.module.css";

import { TableTabConfig, TableTabRowConfig } from "../types/config";

interface TableTabTableProps {
  tabConfig: TableTabConfig;
}

interface TableRowProps {
  tabConfig: TableTabConfig;
  row: TableTabRowConfig;
}

function TableRow({tabConfig, row}: TableRowProps) {
  const highlight = false;

  return (
    <div
      className={`${styles.tr} ${highlight ? styles.tr_highlight : ""}`}
    >
    <div className={styles.tdLeft}>{row.name}</div>
    </div>
  );
}

function TableTabTable({ tabConfig }: TableTabTableProps) {
  return (
    <div className={styles.alarmsTable}>
      <div className={styles.tr}>
        <div className={styles.thtd}>{tabConfig.general.nameColumnHeader}</div>
      </div>
      {tabConfig.rows.map(row => (
        <TableRow
          key={row.uuid}
          tabConfig={tabConfig}
          row={row}
        />
      ))}
    </div>
  );
}

export default TableTabTable;
