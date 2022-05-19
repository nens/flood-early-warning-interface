import React, { useContext, useState } from "react";
import { Config } from "../types/config";
import { useConfig, Wrapped } from "../api/hooks";
import { Organisation } from "../types/api";
import { WithChildren } from "../types/util";

// Note that the default is null, but because the below only renders children if
// config is not null, components can assume that the value is a Config -- that is,
// config = useContext(ConfigContext)!.config!
// with the !s is safe to use and never null.

const DEFAULT_SLUG = "dashboardconfig";

interface ConfigContextInterface {
  fullConfig: Wrapped<Config> | null;
  config: Config | null;
  organisation: Organisation | null;
  currentConfigSlug: string;
  setCurrentConfigSlug: (slug: string) => void;
  resetConfigSlug: () => void;
  isTraining: boolean;
}

export const ConfigContext = React.createContext<ConfigContextInterface>({
  fullConfig: null,
  config: null,
  organisation: null,
  currentConfigSlug: DEFAULT_SLUG,
  setCurrentConfigSlug: () => {},
  resetConfigSlug: () => {},
  isTraining: false,
});

function ConfigProvider({ children }: WithChildren) {
  const [currentConfigSlug, setCurrentConfigSlug] = useState<string>(DEFAULT_SLUG);
  const configResponse = useConfig(currentConfigSlug);

  if (configResponse.status === "success" && configResponse.data) {
    const fullConfig = configResponse.data;
    const config = fullConfig.clientconfig.configuration;
    const organisation = fullConfig.clientconfig.organisation;

    return (
      <ConfigContext.Provider
        value={{
          fullConfig,
          config,
          organisation,
          currentConfigSlug,
          setCurrentConfigSlug,
          resetConfigSlug: () => setCurrentConfigSlug(DEFAULT_SLUG),
          isTraining: currentConfigSlug !== DEFAULT_SLUG,
        }}
      >
        {children}
      </ConfigContext.Provider>
    );
  } else if (configResponse.status === "loading") {
    return <p>Waiting for configuration...</p>;
  } else {
    return <p>Error when loading configuration: {JSON.stringify(configResponse)}.</p>;
  }
}

// Helper hooks that encapsulate the knowledge that config is never null. Don't use
// in components that aren't in this provider's child component tree.
export function useConfigContext(): Config {
  return useContext(ConfigContext)!.config!;
}
export function useOrganisation(): Organisation {
  return useContext(ConfigContext)!.organisation!;
}
export function useFakeData() {
  const configContext = useContext(ConfigContext);

  if (configContext.isTraining && configContext.config && configContext.config.fakeData) {
    return configContext.config.fakeData;
  }

  return null;
}

export default ConfigProvider;
