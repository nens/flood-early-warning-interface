import { Tab } from "../types/config";

interface TableTabProps {
  tab: Tab;
}

function TableTab({ tab }: TableTabProps) {
  return <>{tab.title}</>;
}

export default TableTab;
