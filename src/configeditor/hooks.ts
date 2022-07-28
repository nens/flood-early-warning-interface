import { useState, useContext, useEffect } from "react";
import { useQueryClient } from "react-query";
import { useConfigContext, ConfigContext, useOrganisation } from "../providers/ConfigProvider";
import { useOrganisationUser } from "../api/hooks";
import { Config } from "../types/config";
import { validate, ValidationErrors } from "./validation";

// Hook used by the EditXxx components to store edited values,
// show a spinner, validate fields, and so on.
export function useConfigEdit() {
  const currentConfig = useConfigContext();
  const updateConfig = useUpdateConfig(); // See below


  console.assert(checkValidation(currentConfig, validate(currentConfig)), validate(currentConfig));

  const [status, setStatus] = useState("ok");

  // We keep a copy of the config, so that edits don't immediately update the
  // live one.
  const [values, setValues] = useState<Config>(JSON.parse(JSON.stringify(currentConfig)));
  // But if the config changes, we must update our state too or run into race conditions.
  useEffect(() => setValues(JSON.parse(JSON.stringify(currentConfig))), [currentConfig]);

  const [errors, setErrors] = useState<null | ValidationErrors>(null);

  const submit = () => {
    const candidateConfig: Config = { ...currentConfig, ...values };
    const validationErrors = validate(candidateConfig);
    setErrors(validationErrors);

    const validationOk = checkValidation(candidateConfig, validationErrors);
    if (validationOk) {
      setStatus("fetching");
      updateConfig(candidateConfig).then((error) => {
        if (error === null) {
          setStatus("ok");
          // Set errors back to null so they don't immediately show up again
          // once the user continues editing.
          setErrors(null);
        } else {
          setStatus("error");
        }
      });
    }
  };

  const setValuesAndValidate = (values: Config) => {
    setValues(values);
    // Once the form has been validated once (say by pressing submit), we then
    // re-validate on every change.
    if (errors !== null) {
      const candidateConfig: Config = { ...currentConfig, ...values };
      setErrors(validate(candidateConfig));
    }
  };

  const updateValues = (partialValues: Partial<Config>) =>
    setValuesAndValidate({ ...values, ...partialValues } as Config);

  return {
    status,
    values,
    setValues: setValuesAndValidate,
    updateValues,
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

function checkValidation(config: Config, errors: ValidationErrors): config is Config {
  return errors !== null && errors !== undefined && Object.keys(errors).length === 0;
}
