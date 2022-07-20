import {
  Input,
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Text,
  Textarea,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useConfigEdit } from "./hooks";

import NumberInput from "./inputs/NumberInput";

function EditGeneral() {
  const { status, values, updateValues, errors, submit } = useConfigEdit();

  return (
    <VStack align="left">
      <FormControl isInvalid={!!errors.dashboardTitle}>
        <Heading size="l" m={4}>
          Texts and logos
        </Heading>
        <FormLabel htmlFor="dashboardTitle" m={4}>
          Dashboard title
        </FormLabel>
        <Input
          m={4}
          id="dashboardTitle"
          variant="outline"
          placeholder="Dashboard title"
          value={values.dashboardTitle || ""}
          onChange={(event) => updateValues({ dashboardTitle: event.target.value })}
        />
        <FormErrorMessage>{errors.dashboardTitle}</FormErrorMessage>
        <FormLabel htmlFor="infoText" m={4}>
          Information dialog text (use Markdown)
        </FormLabel>
        <Textarea
          m={4}
          id="infoText"
          variant="outline"
          placeholder="Text for information dialog in Markdown"
          value={values.infoText || ""}
          onChange={(event) => updateValues({ infoText: event.target.value })}
          rows={6}
        />
        <FormLabel htmlFor="infoImage" m={4}>
          URL for logos of contributing organisations in the information dialog
        </FormLabel>
        <Input
          m={4}
          id="infoImage"
          variant="outline"
          placeholder="URL for logo image"
          value={values.infoImage || ""}
          onChange={(event) => updateValues({ infoImage: event.target.value })}
        />
        <FormLabel htmlFor="emergencyPlansText" m={4}>
          Text to show under an "Emergency Plans" button in the header.
        </FormLabel>
        <Textarea
          m={4}
          id="emergencyPlansText"
          variant="outline"
          placeholder="Emergency plans modal text"
          value={values.emergencyPlansText || ""}
          onChange={(event) => updateValues({ emergencyPlansText: event.target.value })}
          rows={6}
        />
        <FormLabel htmlFor="chartPeriodStart" m={4}>
          Start of the time period in chart, in hours before now.
        </FormLabel>
        <NumberInput
          m={4}
          id="chartPeriodStart"
          variant="outline"
          placeholder="Chart period start, in hours"
          value={values.chartPeriodStart}
          precision={0}
          min={0}
          onChange={(value) => updateValues({ chartPeriodStart: value })}
        />
        <FormLabel htmlFor="chartPeriodEnd" m={4}>
          End of the time period in chart, in hours after now.
        </FormLabel>
        <NumberInput
          m={4}
          id="chartPeriodEnd"
          variant="outline"
          placeholder="Chart period end, in hours"
          value={values.chartPeriodEnd}
          precision={0}
          min={0}
          onChange={(value) => updateValues({ chartPeriodEnd: value })}
        />

        {status === "error" ? (
          <Text color="red">
            An error occurred. Maybe someone else also updated the configuration.
          </Text>
        ) : null}
        <Button onClick={submit} marginTop="4" disabled={status !== "ok"} m={4}>
          Submit
        </Button>
      </FormControl>
    </VStack>
  );
}

export default EditGeneral;
