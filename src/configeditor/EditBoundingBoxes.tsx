import {
    Input,
    Button,
    VStack,
    FormControl,
    FormLabel,
    Text,
    FormErrorMessage,
  } from "@chakra-ui/react";
  import { useConfigEdit } from "./hooks";
  
  function EditBoundingBoxes() {
    const { status, values, setValues, errors, submit } = useConfigEdit(["boundingBoxes"]);
  
    return (
      <VStack align="left">
        <FormControl>
          <FormLabel htmlFor="default">Alarm</FormLabel>
          <Input
            id="default"
            variant="outline"
            value={values.boundingBoxes.default || ""}
            onChange={(event) => setValues({ ...values, boundingBoxes: {
                ...values.boundingBoxes,
                default: event.target.value
            }})}
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