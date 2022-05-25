import {
  Input,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Text,
  Textarea,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useConfigEdit } from "./hooks";

function EditGeneral() {
  const { status, values, setValues, errors, submit } = useConfigEdit([
    "dashboardTitle",
    "infoText",
    "infoImage",
  ]);

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
        <FormLabel htmlFor="infoText">Information dialog text (use Markdown)</FormLabel>
        <Textarea
          id="infoText"
          variant="outline"
          placeholder="Text for information dialog in Markdown"
          value={values.infoText || ""}
          onChange={(event) => setValues({ ...values, infoText: event.target.value })}
          rows={6}
        />
        <FormLabel htmlFor="infoImage">
          URL for logos of contributing organisations in the information dialog
        </FormLabel>
        <Input
          id="infoImage"
          variant="outline"
          placeholder="URL for logo image"
          value={values.infoImage || ""}
          onChange={(event) => setValues({ ...values, infoImage: event.target.value })}
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

export default EditGeneral;
