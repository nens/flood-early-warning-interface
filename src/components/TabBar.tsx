import React, { useCallback } from 'react';

import {
  Link,
  useHistory
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
  // The following hooks are used to make the tab <li>s clickable using react-router
  const routerHistory = useHistory();
  const handleOnClick = useCallback(
    (link: string) => () => routerHistory.push(link),
    [routerHistory]);

  return (
    <nav className={styles.TabBar}>
      <ol>
        {tabs.map(({url, title}) => (
        <li
          className={url === current ? styles.ActiveTab : styles.InactiveTab}
          onClick={handleOnClick(`${path}${url}`)}
        >
          <Link to={`${path}${url}`} className={styles.linkTest}>{title}</Link>
        </li>
        ))}
      </ol>
    </nav>
  );
}

export default TabBar;
