// Called from ../components/Tabs

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
  const history = useHistory();

  return (
    <Box w="200px" borderRightWidth={2} borderRightColor="var(--primary-color)">
      <VStack align="left">
        {tabs.map(({ url, title }) => (
          <Box
            key={url}
            bg={url === current ? "var(--primary-color)" : undefined}
            color={url === current ? "var(--white-color)" : undefined}
            padding="1"
            _hover={{
              bg: "var(--secondary-color)",
              color: "var(--white-color)",
              cursor: "pointer",
            }}
            onClick={() => history.push(`${path}${url}`)}
          >
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
