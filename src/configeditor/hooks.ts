import { useState, useContext } from "react";
import { useQueryClient } from "react-query";
import { useConfigContext, ConfigContext, useOrganisation } from "../providers/ConfigProvider";
import { useOrganisationUser } from "../api/hooks";
import { BoundingBox } from "../util/bounds";
import { Config } from "../types/config";

interface PartialConfig {
  [key: string]: any;
}

export interface ErrorObject {
  [key: string]: string
}

interface ValidationErrors {
  [key: string]: string | ErrorObject;
}

// Hook used by the EditXxx components to store edited values,
// show a spinner, validate fields, and so on.
export function useConfigEdit(fields: string[]) {
  const currentConfig = useConfigContext();
  const updateConfig = useUpdateConfig(); // See below

  console.assert(checkValidation(currentConfig, validate(currentConfig)), currentConfig);

  const [status, setStatus] = useState("ok");

  const defaultValues: PartialConfig = Object.fromEntries(
    Object.entries(currentConfig)
      .filter(([key, value]) => fields.indexOf(key) !== -1)
      // JSON stringify/parse so that we are sure the real value isn't mutated
      .map(([key, value]) => [key, JSON.parse(JSON.stringify(value))])
  );

  const [values, setValues] = useState<PartialConfig>(defaultValues);
  const [errors, setErrors] = useState<null | ValidationErrors>(null);

  const submit = () => {
    const candidateConfig: PartialConfig = { ...currentConfig, ...values };
    const validationErrors = validate(candidateConfig);
    setErrors(validationErrors);

    const validationOk = checkValidation(candidateConfig, validationErrors);
    if (validationOk) {
      setStatus("fetching");
      updateConfig(candidateConfig as Config).then((error) => {
        if (error === null) {
          setStatus("ok");
        } else {
          setStatus("error");
        }
      });
    }
  };

  const setValuesAndValidate = (values: PartialConfig) => {
    setValues(values);
    // Once the form has been validated once (say by pressing submit), we then
    // re-validate on every change.
    if (errors !== null) {
      const candidateConfig: PartialConfig = { ...currentConfig, ...values };
      setErrors(validate(candidateConfig));
    }
  };

  return {
    status,
    values,
    setValues: setValuesAndValidate,
    errors: errors || {},
    submit,
  };
}

function useUpdateConfig() {
  // This hook returns a function that can actually update the config.
  // It assumes everything is already validated.
  // It returns null if everything went OK, and an error message otherwise.
  const queryClient = useQueryClient();
  const configContext = useContext(ConfigContext);
  const currentFullConfig = configContext.fullConfig!;
  const slug = configContext.currentConfigSlug;
  const organisationUser = useOrganisationUser();
  const organisation = useOrganisation();

  return async (newConfig: Config) => {
    // For now we only update existing configs.
    const newFullConfig = { ...currentFullConfig };
    newFullConfig.clientconfig.configuration = newConfig;
    newFullConfig.comment = `Updated by ${organisationUser?.username} from config page`;
    // @ts-expect-error  A string is sent to the backend, not the whole organisation
    newFullConfig.clientconfig.organisation = organisation.uuid;

    const url = `/api/v4/clientconfigs/${newFullConfig.clientconfig.id}/`;
    const method = "PUT"; // POST for new configs, PUT for updates -- we only do updates

    // Send a fetch request.
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(newFullConfig),
    });

    if (response.ok) {
      // Update React Query cache to new version and return null, for no errors
      const parsedJson = await response.json();
      queryClient.setQueryData(["config", slug], parsedJson);
      return null;
    } else {
      // Invalidate React Query cache (apparently something changed),
      // then return the error.
      queryClient.invalidateQueries(["config", slug]);
      return response.statusText;
    }
  };
}

function validateBoundingBoxes(type: string, bounds: BoundingBox | null, errors: ValidationErrors) {
  if (typeof errors.boundingBoxes === 'string') return;

  if (type === "default" && bounds === null) {
    errors.boundingBoxes = {
      ...errors.boundingBoxes,
      [type]: 'Default field is required.'
    }
  }

  if (bounds) {
    if (parseFloat(bounds.northmost) < parseFloat(bounds.southmost)) {
      errors.boundingBoxes = {
        ...errors.boundingBoxes,
        [type]: 'North coordinate must be greater than South coordinate.'
      }
    } else if (parseFloat(bounds.eastmost) < parseFloat(bounds.westmost)) {
      errors.boundingBoxes = {
        ...errors.boundingBoxes,
        [type]: 'East coordinate must be greater than West coordinate.'
      }
    } else if (
      parseFloat(bounds.westmost) < -180 ||
      parseFloat(bounds.westmost) > 180 ||
      parseFloat(bounds.eastmost) < -180 ||
      parseFloat(bounds.eastmost) > 180
    ) {
      errors.boundingBoxes = {
        ...errors.boundingBoxes,
        [type]: 'West and East coordinates must be between -180° and 180°.'
      }
    } else if (
      parseFloat(bounds.southmost) < -90 ||
      parseFloat(bounds.southmost) > 90 ||
      parseFloat(bounds.northmost) < -90 ||
      parseFloat(bounds.northmost) > 90
    ) {
      errors.boundingBoxes = {
        ...errors.boundingBoxes,
        [type]: 'South and North coordinates must be between -90° and 90°.'
      }
    } else if (!bounds.toConfigBbox().every(e => e !== "")) {
      errors.boundingBoxes = {
        ...errors.boundingBoxes,
        [type]: 'Please fill in all fields.'
      }
    }
  }
}

function validate(config: PartialConfig) {
  const errors: ValidationErrors = {};

  if (config.dashboardTitle === "") {
    errors.dashboardTitle = "Dashboard title should not be the empty string.";
  }

  if (config.boundingBoxes) {
    // bounding boxes of different types of map
    const boundingBoxes = config.boundingBoxes as Config['boundingBoxes'];
    const defaultBounds = boundingBoxes.default ? new BoundingBox(...boundingBoxes.default) : null;
    const warningAreaBounds = boundingBoxes.warningAreas ? new BoundingBox(...boundingBoxes.warningAreas) : null;
    const rainMapBounds = boundingBoxes.rainMap ? new BoundingBox(...boundingBoxes.rainMap) : null;
    const floodModelMapBounds = boundingBoxes.floodModelMap ? new BoundingBox(...boundingBoxes.floodModelMap) : null;
    const damBounds = boundingBoxes.dams ? new BoundingBox(...boundingBoxes.dams) : null;

    validateBoundingBoxes("default", defaultBounds, errors);
    validateBoundingBoxes("warningAreas", warningAreaBounds, errors);
    validateBoundingBoxes("dams", damBounds, errors);
    validateBoundingBoxes("floodModelMap", floodModelMapBounds, errors);
    validateBoundingBoxes("rainMap", rainMapBounds, errors);
  }

  return errors;
}

function checkValidation(config: PartialConfig, errors: ValidationErrors): config is Config {
  return errors !== null && errors !== undefined && Object.keys(errors).length === 0;
}
