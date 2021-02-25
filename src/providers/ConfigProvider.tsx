import React from 'react';
import { Config } from '../types/config';
import { useConfig } from '../api/hooks';
import { WithChildren } from '../types/util';

export const ConfigContext = React.createContext<{config: Config|null}>({config: null});

function ConfigProvider({ children }: WithChildren) {
  const configResponse = useConfig();

  if (configResponse.status === 'success') {
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

export default ConfigProvider;
