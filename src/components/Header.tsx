import React, { useContext } from 'react';
import { LizardAuthContext } from '../providers/LizardAuthProvider';

function Header() {
  const bootstrap = useContext(LizardAuthContext)!.bootstrap;

  return (
    <div style={{height: 'var(--header-height)'}}>Logged in {bootstrap!.user.first_name}!</div>
  );
}

export default Header;
