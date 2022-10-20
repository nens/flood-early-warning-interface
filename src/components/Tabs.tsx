import React from "react";
import { Routes, Route } from "react-router-dom";

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
  return (
    <Routes>
      {definition.map(({ url, component }) => (
        <Route
          path={`${url}/*`}
          key={url}
          element={<div className={styles.Tabs}>
            <TabBar tabs={definition} current={url} />
            <div className={styles.TabContent}>{component}</div>
          </div>}
        />
      ))}
    </Routes>
  );
}

export default Tabs;
