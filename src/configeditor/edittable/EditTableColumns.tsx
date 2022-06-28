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

  const setValueInColumns = (key: keyof TableTabGeneralConfig, value: boolean) =>
    setColumns({ ...currentGeneralConfig, [key]: value });

  const allDisabled = status === "fetching";

  return (
    <>
      <VStack align="left">
        <Checkbox
          id="columnCurrentLevelTs"
          variant="outline"
          isChecked={currentGeneralConfig.columnCurrentLevelTs}
          onChange={(e) => setValueInColumns("columnCurrentLevelTs", e.target.checked)}
        >
          Current level based on timeseries
        </Checkbox>
        <Checkbox
          id="columnCurrentLevelR"
          variant="outline"
          isChecked={currentGeneralConfig.columnCurrentLevelR}
          onChange={(e) => setValueInColumns("columnCurrentLevelR", e.target.checked)}
        >
          Current level based on operational model
        </Checkbox>
        <Checkbox
          id="columnMaxForecast"
          variant="outline"
          isChecked={currentGeneralConfig.columnMaxForecast}
          onChange={(e) => setValueInColumns("columnMaxForecast", e.target.checked)}
        >
          Max forecast based on operational model
        </Checkbox>
        <Checkbox
          id="columnTimeToMax"
          variant="outline"
          isChecked={currentGeneralConfig.columnTimeToMax}
          onChange={(e) => setValueInColumns("columnTimeToMax", e.target.checked)}
        >
          Time to max based on operational model
        </Checkbox>
        <Checkbox
          id="columnRssWarning"
          variant="outline"
          isChecked={currentGeneralConfig.columnRssWarning}
          onChange={(e) => setValueInColumns("columnRssWarning", e.target.checked)}
        >
          "Partner Warning" based on RSS feed
        </Checkbox>
        <Checkbox
          id="columnTriggerLevel"
          variant="outline"
          isChecked={currentGeneralConfig.columnTriggerLevel}
          onChange={(e) => setValueInColumns("columnTriggerLevel", e.target.checked)}
        >
          Currently triggered threshold level, if any
        </Checkbox>
        <Checkbox
          id="columnAlarmThresholds"
          variant="outline"
          isChecked={currentGeneralConfig.columnAlarmThresholds}
          onChange={(e) => setValueInColumns("columnAlarmThresholds", e.target.checked)}
        >
          One column per threshold showing the configured levels
        </Checkbox>
        <Checkbox
          id="columnDownloadLinks"
          variant="outline"
          isChecked={currentGeneralConfig.columnDownloadLinks}
          onChange={(e) => setValueInColumns("columnDownloadLinks", e.target.checked)}
        >
          A column with icons for downloadable files
        </Checkbox>
        <Checkbox
          id="columnAdminMessages"
          variant="outline"
          isChecked={currentGeneralConfig.columnAdminMessages}
          onChange={(e) => setValueInColumns("columnAdminMessages", e.target.checked)}
        >
          Allow admins to post messages belonging to rows and others to view them
        </Checkbox>
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
