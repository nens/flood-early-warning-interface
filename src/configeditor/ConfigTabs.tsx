/* Version of components/Tabs for the configeditor */

import React from "react";
import { Routes, Route } from "react-router-dom";
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

  return (
    <Routes>
      {definition.map(({ url, component }) => (
        <Route
          path={`${url}/*`}
          key={url}
          element={
            <Flex>
              <ConfigTabBar tabs={tabs} current={url} />
              <Box flex="1" marginLeft="8">
                {component}
              </Box>
            </Flex>
          }
        />
      ))}
      <Route path="" element={
        <Flex>
          <ConfigTabBar tabs={tabs} current="" />
          <Box flex="1" marginLeft="4">
            {placeholder}
          </Box>
        </Flex>
      } />
    </Routes>
  );
}

export default ConfigTabs;
