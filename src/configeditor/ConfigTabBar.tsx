// Called from ../components/Tabs

import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { Box, VStack } from "@chakra-ui/react";

import { BASE_URL } from "../App";

interface ConfigTabBarProps {
  tabs: {
    url: string;
    title: string;
  }[];
  current: string;
}

function ConfigTabBar({ tabs, current }: ConfigTabBarProps) {
  const navigate = useNavigate();

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
            onClick={() => navigate(`${BASE_URL}config/${url}`)}
          >
            <Link key={url} to={`${BASE_URL}config/${url}`}>
              {title}
            </Link>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default ConfigTabBar;
