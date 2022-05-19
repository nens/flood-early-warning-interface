/* Version of components/Tabs for the configeditor */

import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import { Flex, Box } from "@chakra-ui/react";

import ConfigTabBar from "../configeditor/ConfigTabBar";

export interface ConfigTabDefinition {
  url: string;
  title: string;
  component: React.ReactNode;
}

interface ConfigTabsProps {
  definition: ConfigTabDefinition[];
  placeholder: React.ReactNode;
}

function ConfigTabs({ definition, placeholder }: ConfigTabsProps) {
  const tabs = definition.map(({ url, title }) => ({ url, title }));
  let { path } = useRouteMatch();

  return (
    <Switch>
      {definition.map(({ url, component }) => (
        <Route
          path={`${path}${url}`}
          key={url}
          children={
            <Flex>
              <ConfigTabBar tabs={tabs} current={url} path={path} />
              <Box flex="1" marginLeft="8">
                {component}
              </Box>
            </Flex>
          }
        />
      ))}
      <Route path={path}>
        <Flex>
          <ConfigTabBar tabs={tabs} current="" path={path} />
          <Box flex="1" marginLeft="4">
            {placeholder}
          </Box>
        </Flex>
      </Route>
    </Switch>
  );
}

export default ConfigTabs;
