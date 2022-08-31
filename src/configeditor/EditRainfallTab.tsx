import { useState, Fragment } from "react";
import {
  Button,
  Checkbox,
  Heading,
  Grid,
  GridItem,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
  Textarea,
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
  const allDisabled = status === "fetching";

  return (
    <>
      <VStack align="left">
        <Checkbox
          id="showDesignRainsButton"
          variant="outline"
          isChecked={values.showDesignRain ?? true}
          onChange={(e) => updateValues({
            showDesignRain: e.target.checked
          })}
        >
          Show Design Rain modal button
        </Checkbox>
        <If test={"showDesignRain" in errors}>
          <Text color="red.600">
            {getError(errors, ["showDesignRain"]) || null}
          </Text>
        </If>
        <Checkbox
          id="showRainfallModalButton"
          variant="outline"
          isChecked={values.showRainfallModalButton ?? false}
          onChange={(e) => updateValues({
            showRainfallModalButton: e.target.checked
          })}
        >
          Show custom Rainfall tab modal button
        </Checkbox>
        <If test={"showRainfallModalButton" in errors}>
          <Text color="red.600">
            {getError(errors, ["showRainfallModalButton"]) || null}
          </Text>
        </If>
        <Input
          value={values.rainfallModalTitle}
          disabled={allDisabled || !values.showRainfallModalButton}
          onChange={(e) => updateValues({rainfallModalTitle: e.target.value})}
          placeholder="Button text and dialog title"
        />
        <If test={"rainfallModalTitle" in errors}>
          <Text color="red.600">
            {getError(errors, ["rainfallModalTitle"]) || null}
          </Text>
        </If>
        <Textarea
          m={4}
          id="rainfallModalContent"
          variant="outline"
          placeholder="Text for Rainfall tab modal dialog in Markdown"
          value={values.rainfallModalContent || ""}
          disabled={allDisabled || !values.showRainfallModalButton}
          onChange={(event) => updateValues({ rainfallModalContent: event.target.value })}
          rows={6}
        />
        <If test={"rainfallModalContent" in errors}>
          <Text color="red.600">
            {getError(errors, ["rainfallModalContent"]) || null}
          </Text>
        </If>
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

export default EditFloodModelTab;
