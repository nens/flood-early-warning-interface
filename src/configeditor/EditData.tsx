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

function EditGeneral() {
  const { status, values, updateValues, errors, submit } = useConfigEdit();

  const rasters = values.rasters || {
    operationalModelDepth: "",
    operationalModelLevel: "",
    rainForecast: "",
  };

  return (
    <VStack align="left">
      <FormControl isInvalid={!!errors.dashboardTitle}>
        <Heading size="l" m={4}>
          Data
        </Heading>
        <FormLabel htmlFor="unit" m={4}>
          Water level unit
        </FormLabel>
        <Input
          m={4}
          id="unit"
          variant="outline"
          placeholder="Water level unit"
          value={values.waterlevelUnit || ""}
          onChange={(event) => updateValues({ waterlevelUnit: event.target.value })}
        />
        <FormErrorMessage>{errors.dashboardTitle}</FormErrorMessage>
        <FormLabel htmlFor="operationalModelDepth" m={4}>
          UUID of the operational model depth raster (optional)
        </FormLabel>
        <Input
          m={4}
          id="operationalModelDepth"
          variant="outline"
          placeholder="Operation Model Depth Raster UUID"
          value={rasters.operationalModelDepth || ""}
          onChange={(event) =>
            updateValues({ rasters: { ...rasters, operationalModelDepth: event.target.value } })
          }
        />
        <FormLabel htmlFor="operationalModelLevel" m={4}>
          UUID of the operational model level raster (optional)
        </FormLabel>
        <Input
          m={4}
          id="operationalModelLevel"
          variant="outline"
          placeholder="Operation Model Level Raster UUID"
          value={rasters.operationalModelLevel || ""}
          onChange={(event) =>
            updateValues({ rasters: { ...rasters, operationalModelLevel: event.target.value } })
          }
        />
        <FormLabel htmlFor="rainForecast" m={4}>
          UUID of the rain forecast raster (optional)
        </FormLabel>
        <Input
          m={4}
          id="rainForecast"
          variant="outline"
          placeholder="Rain Forecast Raster UUID"
          value={rasters.rainForecast || ""}
          onChange={(event) =>
            updateValues({ rasters: { ...rasters, rainForecast: event.target.value } })
          }
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
