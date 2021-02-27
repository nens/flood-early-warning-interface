import React from 'react';
//import { LizardAuthContext } from '../providers/LizardAuthProvider';
import logoCombo from "../graphics/logo-combo.png";

import styles from './Header.module.css';

function Header() {
//  const bootstrap = useContext(LizardAuthContext)!.bootstrap;

  return (
    <div style={{height: 'var(--header-height)', width: '100%'}}>
      <span className={styles.Title}>
        FloodSmart Parramatta Dashboard
      </span>
    </div>
  );
}

export default Header;
