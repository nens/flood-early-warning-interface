// Called from ../components/Tabs

import React, { useCallback } from "react";

import { Link, useHistory } from "react-router-dom";
import { Box, VStack } from "@chakra-ui/react";

interface ConfigTabBarProps {
  tabs: {
    url: string;
    title: string;
  }[];
  current: string;
  path: string;
}

function ConfigTabBar({ tabs, current, path }: ConfigTabBarProps) {
  return (
    <Box w="200px">
      <VStack align="left">
        {tabs.map(({ url, title }) => (
          <Box key={url} bg={url === current ? "lime" : undefined} padding="1">
            <Link key={url} to={`${path}${url}`}>
              {title}
            </Link>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default ConfigTabBar;
