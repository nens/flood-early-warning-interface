import { VStack, Button, Checkbox, FormLabel, Input, Spinner, Select } from "@chakra-ui/react";

import { TableTabConfig, TableTabGeneralConfig } from "../../types/config";
import { useConfigEdit } from "../hooks";
import If from "../../components/If";
import { getTableConfig, changeTableConfig } from "./tabUtils";

interface EditTableColumnsProps {
  tabKey: string;
}

function EditTableColumns({ tabKey }: EditTableColumnsProps) {
  const { status, values, setValues, submit } = useConfigEdit();

  const currentConfig = getTableConfig(values.tableTabConfigs, tabKey);
  const currentGeneralConfig = currentConfig.general;

  const setColumns = (general: TableTabGeneralConfig) =>
    setValues(changeTableConfig(values, tabKey, { ...currentConfig, general }));

  const setValueInColumns = (key: keyof TableTabGeneralConfig, value: string) =>
    setColumns({ ...currentGeneralConfig, [key]: value });

  const allDisabled = status === "fetching";

  return (
    <>
      <VStack align="left">
        <Checkbox id="columnCurrentLevelTs" variant="outline" checked={currentGeneralConfig.columnCurrentLevelTs}>Current level based on timeseries</Checkbox>
        <Checkbox id="columnCurrentLevelR" variant="outline" checked={currentGeneralConfig.columnCurrentLevelR}>Current level based on operational model</Checkbox>
        <Checkbox id="columnMaxForecast" variant="outline" checked={currentGeneralConfig.columnMaxForecast}>Max forecast based on operational model</Checkbox>
        <Checkbox id="columnTimeToMax" variant="outline" checked={currentGeneralConfig.columnTimeToMax}>Time to max based on operational model</Checkbox>
        <Checkbox id="columnRssWarning" variant="outline" checked={currentGeneralConfig.columnRssWarning}>"Partner Warning" based on RSS feed</Checkbox>
        <Checkbox id="columnTriggerLevel" variant="outline" checked={currentGeneralConfig.columnTriggerLevel}>Currently triggered threshold level, if any</Checkbox>
        <Checkbox id="columnAlarmThresholds" variant="outline" checked={currentGeneralConfig.columnAlarmThresholds}>One column per threshold showing the configured levels</Checkbox>
        <Checkbox id="columnDownloadLinks" variant="outline" checked={currentGeneralConfig.columnDownloadLinks}>A column with icons for downloadable files</Checkbox>
        <Checkbox id="columnAdminMessages" variant="outline" checked={currentGeneralConfig.columnAdminMessages}>Allow admins to post messages belonging to rows and others to view them</Checkbox>
      </VStack>
      <Button onClick={submit} disabled={allDisabled} mt={4}>
        Submit
      </Button>
      <If test={allDisabled}>
        <Spinner />
      </If>
    </>
  );
}

export default EditTableColumns;
