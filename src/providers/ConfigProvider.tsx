import React, { useContext } from 'react';
import { Config } from '../types/config';
import { useConfig } from '../api/hooks';
import { WithChildren } from '../types/util';

// Note that the default is null, but because the below only renders children if
// config is not null, components can assume that the value is a Config -- that is,
// config = useContext(ConfigContext)!.config!
// with the !s is safe to use and never null.

export const ConfigContext = React.createContext<{config: Config|null}>({config: null});

function ConfigProvider({ children }: WithChildren) {
  const configResponse = useConfig();

  if (configResponse.status === 'success' && configResponse.data) {
    const config = configResponse.data;

    return (
      <ConfigContext.Provider value={{config}}>
        {children}
      </ConfigContext.Provider>
    );
  } else if (configResponse.status === 'loading') {
    return (
      <p>Waiting for configuration...</p>
    );
  } else {
    return (
      <p>Error when loading configuration: {JSON.stringify(configResponse)}.</p>
    );
  }
}

// Helper hook that encapsulates the knowledges that config is never null. Don't use
// in components that aren't in this provider's child component tree.
export function useConfigContext(): Config {
  return useContext(ConfigContext)!.config!;
}

export default ConfigProvider;
