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
  const { status, values, updateValues, errors, submit } = useConfigEdit();

  return (
    <VStack align="left">
      <FormControl isInvalid={!!errors.dashboardTitle}>
        <FormLabel htmlFor="dashboardTitle">Dashboard title</FormLabel>
        <Input
          id="dashboardTitle"
          variant="outline"
          placeholder="Dashboard title"
          value={values.dashboardTitle || ""}
          onChange={(event) => updateValues({dashboardTitle: event.target.value })}
        />
        <FormErrorMessage>{errors.dashboardTitle}</FormErrorMessage>
        <FormLabel htmlFor="infoText">Information dialog text (use Markdown)</FormLabel>
        <Textarea
          id="infoText"
          variant="outline"
          placeholder="Text for information dialog in Markdown"
          value={values.infoText || ""}
          onChange={(event) => updateValues({infoText: event.target.value })}
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
          onChange={(event) => updateValues({infoImage: event.target.value })}
        />
        <FormLabel htmlFor="emergencyPlansText">
          Text to show under an "Emergency Plans" button in the header.
        </FormLabel>
        <Textarea
          id="emergencyPlansText"
          variant="outline"
          placeholder="Emergency plans modal text"
          value={values.emergencyPlansText || ""}
          onChange={(event) => updateValues({emergencyPlansText: event.target.value })}
          rows={6}
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
