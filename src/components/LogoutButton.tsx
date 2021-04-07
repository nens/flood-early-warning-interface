import { useContext } from 'react';
import { LizardAuthContext } from '../providers/LizardAuthProvider';

import styles from './Header.module.css';

function LogoutButton() {
  const bootstrap = useContext(LizardAuthContext)!.bootstrap!;

  return (
    <div
      className={styles.LogoutButton}
      onClick={() => window.location.href=bootstrap.sso.logout}
    >
      Log out
    </div>
  );
}

export default LogoutButton;
