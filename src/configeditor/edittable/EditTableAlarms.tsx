import { Fragment, useState } from "react";
import {
  Button,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { BsFillArrowUpSquareFill, BsFillArrowDownSquareFill, BsTrashFill } from "react-icons/bs";
import { fetchWithError } from "../../api/hooks";

import { TableTabThresholdConfig } from "../../types/config";
import { getError } from "../validation";
import { getTableConfig, changeTableConfig } from "./tabUtils";
import { moveUp, moveDown, change, remove } from "../../util/functions";
import { useConfigEdit } from "../hooks";
import If from "../../components/If";

interface EditTableAlarmsProps {
  tabKey: string;
}

function getEmptyThreshold(): TableTabThresholdConfig {
  return {
    // @ts-ignore
    uuid: crypto.randomUUID() as unknown as string,
    warning_level: "",
    color: "#ff0000",
  };
}

function EditTableAlarms({ tabKey }: EditTableAlarmsProps) {
  const { status, values, errors, setValues, submit } = useConfigEdit();
  const [uuid, setUuid] = useState<string>("");

  const errorByUuid = (uuid: string) =>
    getError(errors, ["tableTabConfigs", tabKey, "thresholds", uuid]);
  const errorAll = getError(errors, ["tableTabConfigs", tabKey, "thresholds"]);

  const allDisabled = status === "fetching";

  const currentConfig = getTableConfig(values.tableTabConfigs, tabKey);
  const currentThresholds = currentConfig.thresholds ?? [];

  const setThresholds = (thresholds: TableTabThresholdConfig[]) =>
    setValues(changeTableConfig(values, tabKey, { ...currentConfig, thresholds }));

  const alarmType = currentConfig.general.alarmType ?? "none";

  const addThreshold = () => setThresholds(currentThresholds.concat([getEmptyThreshold()]));

  if (alarmType !== "raster" && alarmType !== "timeseries") {
    return <>Please first choose an alarm type in the General Settings.</>;
  }

  const fetchByUuid = async () => {
    if (!uuid) return;
    try {
      const response = await fetchWithError(`/api/v4/${alarmType}alarms/${uuid}/`);

      if (
        response &&
        response.thresholds &&
        response.thresholds.length &&
        currentThresholds.length === 0
      ) {
        setThresholds(
          response.thresholds.map((t: any) => {
            return {
              ...getEmptyThreshold(),
              warning_level: t.warning_level,
            } as TableTabThresholdConfig;
          })
        );
      }
    } catch (e) {
      // Ignore.
    }
  };

  return (
    <>
      {currentThresholds.length === 0 ? (
        <>
          <FormLabel htmlFor="alarmUuid" m={4}>
            Fill in using {currentConfig.general.alarmType} alarm UUID:
          </FormLabel>
          <Input
            id="alarmUuid"
            variant="outline"
            placeholder="Enter an alarm UUID"
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            m={4}
          />
          <Button onClick={fetchByUuid} disabled={allDisabled} m={4}>
            Fetch
          </Button>
          <Text m={4}>-- OR --</Text>
        </>
      ) : null}
      <Button onClick={addThreshold} m={4}>
        Add Threshold
      </Button>
      <Grid
        templateColumns="40px 40px 200px 200px 40px 1fr"
        templateRows={`repeat(${currentThresholds.length} 1fr)`}
        gap={4}
        m={4}
      >
        {currentThresholds.map((threshold, idx) => (
          <Fragment key={threshold.uuid}>
            <GridItem>
              <IconButton
                variant="outline"
                aria-label="Move up"
                icon={<BsFillArrowUpSquareFill />}
                disabled={allDisabled}
                onClick={() => setThresholds(moveUp(currentThresholds, idx))}
              />
            </GridItem>
            <GridItem>
              <IconButton
                variant="outline"
                aria-label="Move down"
                icon={<BsFillArrowDownSquareFill />}
                disabled={allDisabled}
                onClick={() => setThresholds(moveDown(currentThresholds, idx))}
              />
            </GridItem>
            <GridItem>
              <Input
                value={threshold.warning_level}
                disabled={allDisabled}
                placeholder="Warning level"
                onChange={(e) =>
                  setThresholds(
                    change(currentThresholds, idx, { ...threshold, warning_level: e.target.value })
                  )
                }
              />
            </GridItem>
            <GridItem>
              <Input
                value={threshold.color}
                disabled={allDisabled}
                placeholder="Color"
                onChange={(e) =>
                  setThresholds(
                    change(currentThresholds, idx, { ...threshold, color: e.target.value })
                  )
                }
              />
            </GridItem>
            <GridItem>
              <IconButton
                variant="outline"
                aria-label="delete"
                icon={<BsTrashFill />}
                onClick={() => setThresholds(remove(currentThresholds, idx))}
                disabled={allDisabled}
              />
            </GridItem>
            <GridItem>
              <Text color="red.600">{errorByUuid(threshold.uuid) ?? null}</Text>
            </GridItem>
          </Fragment>
        ))}
      </Grid>
      <If test={!!errorAll}>
        <Text m="4" color="red.600">
          {errorAll}
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

export default EditTableAlarms;
