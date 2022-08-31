import { Button, FormLabel, Input, Spinner, Select } from "@chakra-ui/react";

import { TableTabGeneralConfig } from "../../types/config";
import { useConfigEdit } from "../hooks";
import If from "../../components/If";
import { getTableConfig, changeTableConfig } from "./tabUtils";

interface EditTableGeneralProps {
  tabKey: string;
}

function EditTableGeneral({ tabKey }: EditTableGeneralProps) {
  const { status, values, setValues, submit } = useConfigEdit();

  const currentConfig = getTableConfig(values.tableTabConfigs, tabKey);
  const currentGeneralConfig = currentConfig.general;

  const setGeneral = (general: TableTabGeneralConfig) =>
    setValues(changeTableConfig(values, tabKey, { ...currentConfig, general }));

  const setValueInGeneral = (key: keyof TableTabGeneralConfig, value: string) =>
    setGeneral({ ...currentGeneralConfig, [key]: value });

  const allDisabled = status === "fetching";

  return (
    <>
      <FormLabel htmlFor="tableTitleLeft">Header of name column (only mandatory column)</FormLabel>
      <Input
        id="nameColumnHeader"
        variant="outline"
        placeholder="Name column header"
        value={currentGeneralConfig.nameColumnHeader || ""}
        onChange={(event) => setValueInGeneral("nameColumnHeader", event.target.value)}
      />
      <FormLabel htmlFor="tableTitleLeft">Table title left</FormLabel>
      <Input
        id="tableTitleLeft"
        variant="outline"
        placeholder="Table title left"
        value={currentGeneralConfig.tableTitleLeft || ""}
        onChange={(event) => setValueInGeneral("tableTitleLeft", event.target.value)}
      />
      <FormLabel htmlFor="tableTitleRight">Table title right</FormLabel>
      <Input
        id="tableTitleRight"
        variant="outline"
        placeholder="Table title right"
        value={currentGeneralConfig.tableTitleRight || ""}
        onChange={(event) => setValueInGeneral("tableTitleRight", event.target.value)}
      />
      <FormLabel htmlFor="mapTitleLeft">Map title left</FormLabel>
      <Input
        id="mapTitleLeft"
        variant="outline"
        placeholder="Map title left"
        value={currentGeneralConfig.mapTitleLeft || ""}
        onChange={(event) => setValueInGeneral("mapTitleLeft", event.target.value)}
      />
      <FormLabel htmlFor="mapTitleRight">Map title right</FormLabel>
      <Input
        id="mapTitleRight"
        variant="outline"
        placeholder="Map title right"
        value={currentGeneralConfig.mapTitleRight || ""}
        onChange={(event) => setValueInGeneral("mapTitleRight", event.target.value)}
      />
      <FormLabel htmlFor="alarmType">Alarm type</FormLabel>
      <Select
        id="alarmType"
        variant="outline"
        placeholder="-- Select Alarm Type --"
        value={currentGeneralConfig.alarmType || "none"}
        onChange={(event) => setValueInGeneral("alarmType", event.target.value)}
      >
        <option value="raster">Raster alarm</option>
        <option value="timeseries">Timeseries alarm</option>
        <option value="none">None</option>
      </Select>
      <FormLabel htmlFor="mapLabels">Map Labels</FormLabel>
      <Select
        id="mapLabels"
        variant="outline"
        placeholder="-- Map Labels --"
        value={currentGeneralConfig.mapLabels || "all"}
        onChange={(event) => setValueInGeneral("mapLabels", event.target.value)}
      >
        <option value="all">Show all</option>
        <option value="onhover">Show label on hover</option>
        <option value="none">Show no map labels</option>
      </Select>
      <Button onClick={submit} disabled={allDisabled} mt={4}>
        Submit
      </Button>
      <If test={allDisabled}>
        <Spinner />
      </If>
    </>
  );
}

export default EditTableGeneral;
