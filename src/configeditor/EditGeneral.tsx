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

function EditGeneral() {
  const { status, values, setValues, errors, submit } = useConfigEdit(["dashboardTitle"]);

  return (
    <VStack align="left">
      <FormControl isInvalid={!!errors.dashboardTitle}>
        <FormLabel htmlFor="dashboardTitle">Dashboard title</FormLabel>
        <Input
          id="dashboardTitle"
          variant="outline"
          placeholder="Dashboard title"
          value={values.dashboardTitle || ""}
          onChange={(event) => setValues({ ...values, dashboardTitle: event.target.value })}
        />
        <FormErrorMessage>{errors.dashboardTitle}</FormErrorMessage>
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

export default EditGeneral;
