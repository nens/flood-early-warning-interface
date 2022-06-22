import { Button, FormLabel, Input, Spinner } from "@chakra-ui/react";

import { TableTabGeneralConfig } from "../../types/config";
import { useConfigEdit } from "../hooks";
import If from "../../components/If";

interface EditTableGeneralProps {
  tabKey: string;
}

function EditTableGeneral({tabKey}: EditTableGeneralProps) {
  const { status, values, setValues, submit } = useConfigEdit(["tableTabConfigs"]);

  const currentConfig = values.tableTabConfigs[tabKey] || {};
  const currentGeneralConfig: Partial<TableTabGeneralConfig> = currentConfig.general || {};

  const setGeneral = (general: TableTabGeneralConfig) => setValues({...values, tableTabConfigs: { [tabKey]: {...currentConfig, general} }});

  const setValueInGeneral = (key: keyof TableTabGeneralConfig, value: string) => setGeneral({...currentGeneralConfig, [key]: value});

  const allDisabled = status === "fetching";

  return (
    <>
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
