import { useState } from "react";
import {
  IconButton,
  Spinner,
  FormLabel,
  Input,
  Text,
  Button,
  Heading,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { BsJustify } from "react-icons/bs";

import { TableTabRowConfig } from "../../types/config";
import { useConfigEdit } from "../hooks";
import { getTableConfig, changeTableConfig, change } from "./tabUtils";
import { ErrorObject } from "../validation";
import If from "../../components/If";

interface EditTableRowProps {
  tabKey: string;
}

function EditTableRow({ tabKey }: EditTableRowProps) {
  const { status, values, errors, setValues, submit } = useConfigEdit();

  const allDisabled = status === "fetching";

  const tableErrors: ErrorObject = (errors?.tableTabConfigs as ErrorObject) ?? {};

  const currentConfig = getTableConfig(values.tableTabConfigs, tabKey);
  const currentRows = currentConfig.rows ?? [];

  const [currentRowUuid, setCurrentRowUuid] = useState("");

  const currentRowIdx = currentRows.findIndex(
    (row) => currentRowUuid && row.uuid === currentRowUuid
  );
  const currentRow = currentRows[currentRowIdx];

  const setRow = (row: TableTabRowConfig, idx: number) =>
    setValues(
      changeTableConfig(values, tabKey, { ...currentConfig, rows: change(currentRows, idx, row) })
    );

  const setValueInRow = (key: keyof TableTabRowConfig, value: string) =>
    setRow({ ...currentRow, [key]: value || null }, currentRowIdx);

  const autoIndent = () => {
    const text = currentRow.mapGeometry;
    if (text !== null) {
      try {
        const parsed = JSON.parse(text);
        // Successful, indent
        const indented = JSON.stringify(parsed, null, 2);
        if (text !== indented) {
          setValueInRow("mapGeometry", indented);
        }
      } catch (e) {
        // Ignore.
      }
    }
  };

  return (
    <>
      <Select
        value={currentRowUuid}
        onChange={(e) => setCurrentRowUuid(e.target.value)}
        placeholder="-- Select a Row --"
        mb={4}
      >
        {currentRows.map((row) => (
          <option key={row.uuid} value={row.uuid}>
            {row.name}
          </option>
        ))}
      </Select>
      {currentRow !== undefined ? (
        <>
          <Heading size="l" mb={4}>
            {currentRow.name}
          </Heading>

          <FormLabel htmlFor="mapGeometry">
            Geometry (GeoJSON Feature or FeatureCollection, note all properties are ignored!)
          </FormLabel>
          <Textarea
            id="mapGeometry"
            disabled={allDisabled}
            size="xl"
            rows={10}
            variant="outline"
            placeholder="GeoJSON"
            value={currentRow.mapGeometry || ""}
            onChange={(event) => setValueInRow("mapGeometry", event.target.value)}
          />
          <IconButton size="s" icon={<BsJustify />} aria-label="autoindent" onClick={autoIndent} />

          <If test={currentRowUuid in tableErrors}>
            <Text m="4" color="red.600">
              {tableErrors[currentRowUuid]}
            </Text>
          </If>
          <Button onClick={submit} disabled={allDisabled} m={4}>
            Submit
          </Button>
          <If test={allDisabled}>
            <Spinner />
          </If>
        </>
      ) : null}
    </>
  );
}

export default EditTableRow;
