import React from "react";
import {
  Input,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Text,
  HStack,
  FormErrorMessage,
  Divider,
} from "@chakra-ui/react";
import { Config } from "../types/config";
import { BoundingBox } from "../util/bounds";
import { useConfigEdit } from "./hooks";

interface LatLngInputProps {
  title: string;
  field: string;
  value: string;
  error?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface EditSingleBoundingBoxesProps {
  type: string;
  bounds: BoundingBox | null;
  values: any;
  setValues: any;
}

function LatLngInput(props: LatLngInputProps) {
  return (
    <FormControl isInvalid={!!props.error}>
      <FormLabel htmlFor={props.field}>{props.title}</FormLabel>
      <Input
        id={props.field}
        type="number"
        variant="outline"
        value={props.value}
        onChange={props.onChange}
      />
      <FormErrorMessage>{props.error}</FormErrorMessage>
    </FormControl>
  )
}

function EditSingleBoundingBoxes(props: EditSingleBoundingBoxesProps) {
  const { type, bounds, values, setValues } = props

  if (!bounds) return null;

  return (
    <HStack marginBottom={4}>
      <LatLngInput
        title="West"
        field="west"
        value={bounds.westmost}
        onChange={(event) => {
          bounds.westmost = event.target.value;
          setValues({
            ...values,
            boundingBoxes: {
              ...values.boundingBoxes,
              [type]: bounds.toConfigBbox()
            }
          })
        }}
      />
      <LatLngInput
        title="South"
        field="south"
        value={bounds.southmost}
        onChange={(event) => {
          bounds.southmost = event.target.value;
          setValues({
            ...values,
            boundingBoxes: {
              ...values.boundingBoxes,
              [type]: bounds.toConfigBbox()
            }
          })
        }}
      />
      <LatLngInput
        title="East"
        field="east"
        value={bounds.eastmost}
        onChange={(event) => {
          bounds.eastmost = event.target.value;
          setValues({
            ...values,
            boundingBoxes: {
              ...values.boundingBoxes,
              [type]: bounds.toConfigBbox()
            }
          })
        }}
        error={parseFloat(bounds.eastmost) < parseFloat(bounds.westmost) ? "South coordinate must be greater than West coordinate" : null}
      />
      <LatLngInput
        title="North"
        field="north"
        value={bounds.northmost}
        onChange={(event) => {
          bounds.northmost = event.target.value;
          setValues({
            ...values,
            boundingBoxes: {
              ...values.boundingBoxes,
              [type]: bounds.toConfigBbox()
            }
          })
        }}
        error={parseFloat(bounds.northmost) < parseFloat(bounds.southmost) ? "North coordinate must be greater than South coordinate" : null}
      />
    </HStack>
  )
}

function EditBoundingBoxes() {
  const { status, values, setValues, errors, submit } = useConfigEdit(["boundingBoxes"]);
  const boundingBoxes = values.boundingBoxes as Config['boundingBoxes'];
  const defaultBounds = new BoundingBox(...boundingBoxes.default);
  const warningAreaBounds = boundingBoxes.warningAreas ? new BoundingBox(...boundingBoxes.warningAreas) : null;
  const rainMapBounds = boundingBoxes.rainMap ? new BoundingBox(...boundingBoxes.rainMap) : null;
  const floodModelMapBounds = boundingBoxes.floodModelMap ? new BoundingBox(...boundingBoxes.floodModelMap) : null;
  const damBounds = boundingBoxes.dams ? new BoundingBox(...boundingBoxes.dams) : null;

  return (
    <VStack align="left">
      <FormControl>
        <FormControl isRequired>
          <FormLabel htmlFor="default"><b>Default</b></FormLabel>
        </FormControl>
        <EditSingleBoundingBoxes
          type="default"
          bounds={defaultBounds}
          values={values}
          setValues={setValues}
        />
        <Divider />
        <FormControl>
          <FormLabel htmlFor="warningAreas"><b>Warning Areas</b></FormLabel>
        </FormControl>
        <EditSingleBoundingBoxes
          type="warningAreas"
          bounds={warningAreaBounds}
          values={values}
          setValues={setValues}
        />
        <Divider />
        <FormControl>
          <FormLabel htmlFor="dams"><b>Dams</b></FormLabel>
        </FormControl>
        <EditSingleBoundingBoxes
          type="dams"
          bounds={damBounds}
          values={values}
          setValues={setValues}
        />
        <Divider />
        <FormControl>
          <FormLabel htmlFor="floodModelMap"><b>Flood Model Map</b></FormLabel>
        </FormControl>
        <EditSingleBoundingBoxes
          type="floodModelMap"
          bounds={floodModelMapBounds}
          values={values}
          setValues={setValues}
        />
        <Divider />
        <FormControl>
          <FormLabel htmlFor="rainMap"><b>Rain Map</b></FormLabel>
        </FormControl>
        <EditSingleBoundingBoxes
          type="rainMap"
          bounds={rainMapBounds}
          values={values}
          setValues={setValues}
        />
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