import React from 'react';

import {
  Link
} from "react-router-dom";

import styles from './TabBar.module.css';

interface TabBarProps {
  tabs: {
    url: string;
    title: string;
  }[];
  current: string;
  path: string;
}

function TabBar({tabs, current, path}: TabBarProps) {
  return (
    <nav className={styles.TabBar}>
      <ol>
        {tabs.map(({url, title}) => (
          <li className={url === current ? styles.ActiveTab : styles.InactiveTab}>
            <Link to={`${path}${url}`}>{title}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default TabBar;
