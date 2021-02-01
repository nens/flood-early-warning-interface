import React from 'react';
import {
  Switch,
  Route,
  useRouteMatch,
} from "react-router-dom";

import TabBar from './TabBar';
import styles from './Tabs.module.css';

interface TabsProps {
  definition: {
    url: string;
    title: string;
    component: React.ReactNode
  }[];
}

function Tabs({definition}: TabsProps) {
  const tabs = definition.map(({url, title}) => ({url, title}));
  let { path } = useRouteMatch();

  return (
    <Switch>
      {definition.map(({url, component}) => (
        <Route path={`${path}${url}`} children={
          <div className={styles.Tabs}>
            <TabBar tabs={tabs} current={url} path={path}/>
            <div>{component}</div>
          </div>
        }/>
      ))}
    </Switch>
  );
}

export default Tabs;
