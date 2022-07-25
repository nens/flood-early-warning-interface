import { useState, Fragment } from "react";
import {
  Button,
  Heading,
  Grid,
  GridItem,
  IconButton,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { BsFillArrowUpSquareFill, BsFillArrowDownSquareFill, BsTrashFill } from "react-icons/bs";
import { FaUndo } from "react-icons/fa";

import If from "../components/If";
import { TimePeriod } from "../types/config";
import { moveUp, moveDown, remove, change } from "../util/functions";
import { useConfigEdit } from "./hooks";
import NumberInput from "./inputs/NumberInput";
import { getError } from "./validation";

function EditFloodModelTab() {
  const { status, values, updateValues, errors, submit } = useConfigEdit();

  const timePeriods = values.floodModelTimePeriods || [];
  const setTimePeriods = (newTimePeriods: TimePeriod[]) =>
    updateValues({ floodModelTimePeriods: newTimePeriods });

  const [deletedTimePeriods, setDeletedTimePeriods] = useState<TimePeriod[]>([]);

  const removeTimePeriod = (idx: number) => {
    setDeletedTimePeriods([...deletedTimePeriods, timePeriods[idx]]);
    setTimePeriods(remove(timePeriods, idx));
  };

  const undoRemove = (idx: number) => {
    setTimePeriods(timePeriods.concat([deletedTimePeriods[idx]]));
    setDeletedTimePeriods(remove(deletedTimePeriods, idx));
  };

  const changeLabel = (idx: number, label: string) => {
    setTimePeriods(change(timePeriods, idx, [label, timePeriods[idx][1]]));
  };

  const changeTime = (idx: number, time: number) => {
    setTimePeriods(change(timePeriods, idx, [timePeriods[idx][0], time]));
  };

  const movePeriodUp = (idx: number) => setTimePeriods(moveUp(timePeriods, idx));
  const movePeriodDown = (idx: number) => setTimePeriods(moveDown(timePeriods, idx));

  const addTimePeriod = () => setTimePeriods(timePeriods.concat([["Label", 60]]));

  const allDisabled = status === "fetching";

  const error = getError(errors, ["floodModelTimePeriods"]);

  return (
    <>
      <Button onClick={addTimePeriod} m="4">
        Add Time Period
      </Button>
      <Heading size="l" m="4">
        Current Time Periods
      </Heading>
      <Text m="4">
        Configure the time periods below. The time is measured in <strong>minutes</strong>.
      </Text>
      <Grid
        templateColumns="40px 40px 300px 150px 40px 1fr"
        templateRows={`repeat(${timePeriods.length} 1fr)`}
        gap={4}
        m={4}
      >
        {timePeriods.map(([label, time], idx) => {
          return (
            <Fragment key={`${idx}`}>
              <GridItem>
                <IconButton
                  variant="outline"
                  aria-label="Move up"
                  icon={<BsFillArrowUpSquareFill />}
                  disabled={allDisabled}
                  onClick={() => movePeriodUp(idx)}
                />
              </GridItem>
              <GridItem>
                <IconButton
                  variant="outline"
                  aria-label="Move down"
                  icon={<BsFillArrowDownSquareFill />}
                  disabled={allDisabled}
                  onClick={() => movePeriodDown(idx)}
                />
              </GridItem>
              <GridItem>
                <Input
                  value={label}
                  disabled={allDisabled}
                  onChange={(e) => changeLabel(idx, e.target.value)}
                />
              </GridItem>
              <GridItem>
                <NumberInput
                  value={time}
                  precision={0}
                  onChange={(e) => changeTime(idx, e)}
                  isDisabled={allDisabled}
                />
              </GridItem>
              <GridItem>
                <IconButton
                  variant="outline"
                  aria-label="delete"
                  icon={<BsTrashFill />}
                  onClick={() => removeTimePeriod(idx)}
                  disabled={allDisabled}
                />
              </GridItem>
              <GridItem>
                <Text color="red.600">
                  {getError(errors, ["floodModelTimePeriods", idx]) || null}
                </Text>
              </GridItem>
            </Fragment>
          );
        })}
      </Grid>
      <If test={!!error}>
        <Text m="4" color="red.600">
          {error}
        </Text>
      </If>
      <If test={deletedTimePeriods.length > 0}>
        <Heading size="l" m="4">
          Deleted Time Periods
        </Heading>
        <Grid
          templateColumns="300px 200px 40px"
          templateRows={`repeat(${deletedTimePeriods.length} 1fr)`}
          gap={4}
          m={4}
        >
          {deletedTimePeriods.map(([label, time], idx) => {
            return (
              <Fragment key={`${label}${idx}`}>
                <GridItem>
                  <Input defaultValue={label} disabled />
                </GridItem>
                <GridItem>
                  <Input defaultValue={time} disabled />
                </GridItem>
                <GridItem>
                  <IconButton
                    variant="outline"
                    aria-label="undo"
                    icon={<FaUndo />}
                    onClick={() => undoRemove(idx)}
                    disabled={allDisabled}
                  />
                </GridItem>
              </Fragment>
            );
          })}
        </Grid>
      </If>
      <Button onClick={submit} m={4} disabled={allDisabled}>
        Submit
      </Button>
      <If test={status === "fetching"}>
        <Spinner />
      </If>
    </>
  );
}

export default EditFloodModelTab;
