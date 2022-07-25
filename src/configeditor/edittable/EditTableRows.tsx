import { Fragment } from "react";
import { Button, Grid, GridItem, IconButton, Input, Spinner, Text } from "@chakra-ui/react";
import { BsFillArrowUpSquareFill, BsFillArrowDownSquareFill, BsTrashFill } from "react-icons/bs";

import { TableTabRowConfig } from "../../types/config";
import { useConfigEdit } from "../hooks";
import If from "../../components/If";
import { getTableConfig, changeTableConfig } from "./tabUtils";
import { moveUp, moveDown, remove, change } from "../../util/functions";
import { getError } from "../validation";

interface EditTableRowsProps {
  tabKey: string;
}

function getEmptyRow(): TableTabRowConfig {
  return {
    // @ts-ignore
    uuid: crypto.randomUUID() as unknown as string,
    name: "New item",
    mapGeometry: null,
    alarmUuid: null,
    timeseries: null,
    clickUrl: null,
    downloadUrl: null,
    lat: null,
    lng: null,
  };
}

function EditTableRows({ tabKey }: EditTableRowsProps) {
  const { status, values, errors, setValues, submit } = useConfigEdit();

  const error = getError(errors, ["tableTabConfigs", tabKey, "rows"]);
  const errorByRowUuid = (rowUuid: string) =>
    getError(errors, ["tableTabConfigs", tabKey, "rows", rowUuid]);

  const currentConfig = getTableConfig(values.tableTabConfigs, tabKey);
  const currentRows = currentConfig.rows ?? [];

  const setRows = (rows: TableTabRowConfig[]) =>
    setValues(changeTableConfig(values, tabKey, { ...currentConfig, rows }));

  const allDisabled = status === "fetching";

  const addRow = () => setRows(currentRows.concat([getEmptyRow()]));

  return (
    <>
      <Button onClick={addRow} m="4">
        Add Row
      </Button>
      <Grid
        templateColumns="40px 40px 500px 40px 1fr"
        templateRows={`repeat(${currentRows.length} 1fr)`}
        gap={4}
        m={4}
      >
        {currentRows.map((row, idx) => (
          <Fragment key={row.uuid}>
            <GridItem>
              <IconButton
                variant="outline"
                aria-label="Move up"
                icon={<BsFillArrowUpSquareFill />}
                disabled={allDisabled}
                onClick={() => setRows(moveUp(currentRows, idx))}
              />
            </GridItem>
            <GridItem>
              <IconButton
                variant="outline"
                aria-label="Move down"
                icon={<BsFillArrowDownSquareFill />}
                disabled={allDisabled}
                onClick={() => setRows(moveDown(currentRows, idx))}
              />
            </GridItem>
            <GridItem>
              <Input
                value={row.name}
                disabled={allDisabled}
                placeholder="Row name"
                onChange={(e) =>
                  setRows(change(currentRows, idx, { ...row, name: e.target.value }))
                }
              />
            </GridItem>
            <GridItem>
              <IconButton
                variant="outline"
                aria-label="delete"
                icon={<BsTrashFill />}
                onClick={() => setRows(remove(currentRows, idx))}
                disabled={allDisabled}
              />
            </GridItem>
            <GridItem>
              <Text color="red.600">{errorByRowUuid(row.uuid)}</Text>
            </GridItem>
          </Fragment>
        ))}
      </Grid>
      <If test={!!error}>
        <Text m="4" color="red.600">
          {error}
        </Text>
      </If>
      <Button onClick={submit} disabled={allDisabled} m={4}>
        Submit
      </Button>
      <If test={allDisabled}>
        <Spinner />
      </If>
    </>
  );
}

export default EditTableRows;
