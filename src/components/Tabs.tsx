import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import { Tab } from "../types/config";
import TabBar from "./TabBar";
import styles from "./Tabs.module.css";

export interface TabDefinition extends Tab {
  component: React.ReactNode;
}

interface TabsProps {
  definition: TabDefinition[];
}

function Tabs({ definition }: TabsProps) {
  let { path } = useRouteMatch();

  return (
    <Switch>
      {definition.map(({ url, component }) => (
        <Route path={`${path}${url}`} key={url}>
          <div className={styles.Tabs}>
            <TabBar tabs={definition} current={url} path={path} />
            <div className={styles.TabContent}>{component}</div>
          </div>
        </Route>
      ))}
    </Switch>
  );
}

export default Tabs;
