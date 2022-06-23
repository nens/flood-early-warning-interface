import { ErrorObject } from "../validation";
import { getTableConfig, changeTableConfig, moveUp, moveDown, change, remove } from "./tabUtils";
import { useConfigEdit } from "../hooks";

interface EditTableAlarmsProps {
  tabKey: string;
}

function EditTableAlarms({ tabKey }: EditTableAlarmsProps) {
  const { status, values, errors, setValues, submit } = useConfigEdit();

  const tableErrors: ErrorObject = (errors?.tableTabConfigs as ErrorObject) ?? {};

  const currentConfig = getTableConfig(values.tableTabConfigs, tabKey);
  const currentRows = currentConfig.rows ?? [];

  const alarmType = currentConfig.general.alarmType ?? "none";

  if (alarmType !== "raster" && alarmType !== "timeseries") {
    return <>Please first choose an alarm type in the General part.</>;
  }

  return null;
}
