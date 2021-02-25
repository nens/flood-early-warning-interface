import React from 'react';
import { Bootstrap } from '../types/api';
import { useBootstrap } from '../api/hooks';
import { WithChildren } from '../types/util';

export const LizardAuthContext = React.createContext<{bootstrap: Bootstrap|null}>({bootstrap: null});

function LizardAuthProvider({ children }: WithChildren) {
  const bootstrapResponse = useBootstrap();

  if (bootstrapResponse.status === 'success') {
    const bootstrap = bootstrapResponse.data;

    if (!bootstrap.user.authenticated) {
      window.location.href = bootstrap.sso.login + '&next=/parramatta2/';
    }

    return (
      <LizardAuthContext.Provider value={{bootstrap}}>
        {children}
      </LizardAuthContext.Provider>
    );
  } else if (bootstrapResponse.status === 'loading') {
    return (
      <p>Waiting for authentication...</p>
    );
  } else {
    return (
      <p>Error when loading authentication: {JSON.stringify(bootstrapResponse)}.</p>
    );
  }
}

export default LizardAuthProvider;
