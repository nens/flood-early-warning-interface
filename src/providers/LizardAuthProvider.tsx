import React from 'react';

import { Bootstrap } from '../types/api';

import { WithChildren } from '../types/util';

export const LizardAuthContext = React.createContext<{bootstrap: Bootstrap|null}>({bootstrap: null});

function LizardAuthProvider({ children }: WithChildren) {
  const [bootstrap, setBootstrap] = React.useState<Bootstrap | null>(null);

  React.useEffect(() => {
    const attemptLogin = async () => {
      const response = await fetch('/bootstrap/lizard/');
      const bootstrap = await response.json();

      if (bootstrap.user.authenticated) {
        setBootstrap(bootstrap);
      } else {
        window.location.href = bootstrap.sso.login + '&next=/parramatta2/';
      }
    };
    attemptLogin();
  }, []);

  if (bootstrap === null) {
    return <p>Waiting for authentication...</p>;
  } else {
    return (
      <LizardAuthContext.Provider value={{bootstrap}}>
        {children}
      </LizardAuthContext.Provider>
    );
  }
}

export default LizardAuthProvider;
