import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import { Flex, Box } from "@chakra-ui/react";

import TabBar from "./TabBar";
import ConfigTabBar from "../configeditor/ConfigTabBar";
import styles from "./Tabs.module.css";

export interface TabDefinition {
  url: string;
  title: string;
  component: React.ReactNode;
}

interface TabsProps {
  definition: TabDefinition[];
  placeholder?: React.ReactNode;
  type?: "floodsmart" | "config";
}

function Tabs({ definition, type = "floodsmart", placeholder }: TabsProps) {
  const tabs = definition.map(({ url, title }) => ({ url, title }));
  let { path } = useRouteMatch();

  return (
    <Switch>
      {definition.map(({ url, component }) => (
        <Route
          path={`${path}${url}`}
          key={url}
          children={
            type === "floodsmart" ? (
              <div className={styles.Tabs}>
                <TabBar tabs={tabs} current={url} path={path} />
                <div className={styles.TabContent}>{component}</div>
              </div>
            ) : (
              <Flex>
                <ConfigTabBar tabs={tabs} current={url} path={path} />
                <Box flex="1" marginLeft="8">
                  {component}
                </Box>
              </Flex>
            )
          }
        />
      ))}
      {placeholder ? (
        <Route path={path}>
          <Flex>
            <ConfigTabBar tabs={tabs} current="" path={path} />
            <Box flex="1" marginLeft="4">
              {placeholder}
            </Box>
          </Flex>
        </Route>
      ) : null}
    </Switch>
  );
}

export default Tabs;
