import React, { useEffect } from "react";
import {
  Button,
  VStack,
  NumberInputField,
  NumberInput,
  FormControl,
  FormLabel,
  Text,
  HStack,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Config } from "../types/config";
import { BoundingBox } from "../util/bounds";
import { useConfigEdit } from "./hooks";
import { getError } from "./validation";
import { DEFAULT_CONFIG } from "../constants";

interface LatLngInputProps {
  title: string;
  field: string;
  value: string;
  error: boolean;
  onChange: (valueString: string) => void;
}

interface EditSingleBoundingBoxesProps {
  type: string;
  bounds: BoundingBox | null;
  values: Config;
  updateValues: (values: Partial<Config>) => void;
  error: boolean;
}

function LatLngInput(props: LatLngInputProps) {
  return (
    <FormControl isInvalid={props.error}>
      <FormLabel htmlFor={props.field}>{props.title}</FormLabel>
      <NumberInput
        id={props.field}
        variant="outline"
        value={props.value}
        onChange={props.onChange}
        precision={4}
        min={-360}
        max={360}
        size="sm"
      >
        <NumberInputField />
      </NumberInput>
    </FormControl>
  );
}

function EditSingleBoundingBoxes(props: EditSingleBoundingBoxesProps) {
  const { type, bounds, values, updateValues, error } = props;

  const onChange = (value: string, field: "westmost" | "southmost" | "eastmost" | "northmost") => {
    if (!bounds) {
      const newBounds =
        field === "westmost"
          ? new BoundingBox(value, "", "", "")
          : field === "southmost"
          ? new BoundingBox("", value, "", "")
          : field === "eastmost"
          ? new BoundingBox("", "", value, "")
          : new BoundingBox("", "", "", value);
      updateValues({
        boundingBoxes: {
          ...values.boundingBoxes,
          [type]: newBounds.toConfigBbox(),
        },
      });
    } else {
      const newBounds = bounds.setField(field, value);
      const configBbox = newBounds.toConfigBbox();
      updateValues({
        boundingBoxes: {
          ...values.boundingBoxes,
          [type]: !configBbox.every((e) => e === "") ? configBbox : undefined,
        },
      });
    }
  };

  return (
    <HStack align="start">
      <LatLngInput
        title="West"
        field="westmost"
        value={bounds ? bounds.westmost : ""}
        onChange={(value) => onChange(value, "westmost")}
        error={error}
      />
      <LatLngInput
        title="South"
        field="southmost"
        value={bounds ? bounds.southmost : ""}
        onChange={(value) => onChange(value, "southmost")}
        error={error}
      />
      <LatLngInput
        title="East"
        field="eastmost"
        value={bounds ? bounds.eastmost : ""}
        onChange={(value) => onChange(value, "eastmost")}
        error={error}
      />
      <LatLngInput
        title="North"
        field="northmost"
        value={bounds ? bounds.northmost : ""}
        onChange={(value) => onChange(value, "northmost")}
        error={error}
      />
      <button
        key={type}
        title={"Clear input"}
        onClick={() =>
          updateValues({
            boundingBoxes: {
              ...values.boundingBoxes,
              [type]: undefined,
            },
          })
        }
      >
        &#x2715;
      </button>
    </HStack>
  );
}

function EditBoundingBoxes() {
  const { status, values, updateValues, errors, submit } = useConfigEdit();

  // bounding boxes of different types of map
  const boundingBoxes = values.boundingBoxes;
  const defaultBounds = boundingBoxes.default ? new BoundingBox(...boundingBoxes.default) : null;
  const warningAreaBounds = boundingBoxes.warningAreas
    ? new BoundingBox(...boundingBoxes.warningAreas)
    : null;
  const rainMapBounds = boundingBoxes.rainMap ? new BoundingBox(...boundingBoxes.rainMap) : null;
  const floodModelMapBounds = boundingBoxes.floodModelMap
    ? new BoundingBox(...boundingBoxes.floodModelMap)
    : null;
  const damBounds = boundingBoxes.dams ? new BoundingBox(...boundingBoxes.dams) : null;

  const error = (type: string) => getError(errors, ["boundingBoxes", type]);

  // useEffect when component first mounted to update default bounding boxes
  // to the value in DEFAULT_CONFIG if it does not have a value yet.
  useEffect(() => {
    if (!boundingBoxes.default) {
      updateValues({
        boundingBoxes: {
          ...values.boundingBoxes,
          default: DEFAULT_CONFIG.boundingBoxes.default,
        },
      });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <VStack align="left">
      <em>
        <Text>Notes:</Text>
        <Text>- Values of bounding boxes should be in WGS84 coordinate system.</Text>
        <Text>- Default field is required and will be used in place of any missing field.</Text>
      </em>
      <FormControl>
        <FormControl isRequired isInvalid={!error("default")}>
          <FormLabel htmlFor="default">
            <b>Default</b>
          </FormLabel>
          <EditSingleBoundingBoxes
            type="default"
            bounds={defaultBounds}
            values={values}
            updateValues={updateValues}
            error={!!error("default")}
          />
          <FormErrorMessage>{error("default")}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!error("warningAreas")} marginTop={5}>
          <FormLabel htmlFor="warningAreas">
            <b>Warning Areas</b>
          </FormLabel>
          <EditSingleBoundingBoxes
            type="warningAreas"
            bounds={warningAreaBounds}
            values={values}
            updateValues={updateValues}
            error={!!error("warningAreas")}
          />
          <FormErrorMessage>{error("warningAreas")}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!error("dams")} marginTop={5}>
          <FormLabel htmlFor="dams">
            <b>Dams</b>
          </FormLabel>
          <EditSingleBoundingBoxes
            type="dams"
            bounds={damBounds}
            values={values}
            updateValues={updateValues}
            error={!!error("dams")}
          />
          <FormErrorMessage>{error("dams")}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!error("floodModelMap")} marginTop={5}>
          <FormLabel htmlFor="floodModelMap">
            <b>Flood Model Map</b>
          </FormLabel>
          <EditSingleBoundingBoxes
            type="floodModelMap"
            bounds={floodModelMapBounds}
            values={values}
            updateValues={updateValues}
            error={!!error("floodModelMap")}
          />
          <FormErrorMessage>{error("floodModelMap")}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!error("rainMap")} marginTop={5}>
          <FormLabel htmlFor="rainMap">
            <b>Rain Map</b>
          </FormLabel>
          <EditSingleBoundingBoxes
            type="rainMap"
            bounds={rainMapBounds}
            values={values}
            updateValues={updateValues}
            error={!!error("rainMap")}
          />
          <FormErrorMessage>{error("rainMap")}</FormErrorMessage>
        </FormControl>
        <Button onClick={submit} marginTop="4" disabled={status !== "ok"}>
          Submit
        </Button>
        {status === "error" ? (
          <Text color="red">
            An error occurred. Maybe someone else also updated the configuration.
          </Text>
        ) : null}
      </FormControl>
    </VStack>
  );
}

export default EditBoundingBoxes;
