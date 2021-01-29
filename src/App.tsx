import React, { useContext } from 'react';

import LizardAuthProvider, { LizardAuthContext } from './providers/LizardAuthProvider';

function App() {
  return (
    <LizardAuthProvider>
      <AppWithAuthentication />
    </LizardAuthProvider>
  );
}

function AppWithAuthentication() {
  const { bootstrap } = useContext(LizardAuthContext);
  return (
    <p>Logged in {bootstrap!.user.first_name}!</p>
  );
}

export default App;
