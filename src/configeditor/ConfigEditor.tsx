import { ChakraProvider, Box, Heading, IconButton } from "@chakra-ui/react";
import { BiArrowBack } from "react-icons/bi";

import EnsureAdminAccess from "../components/EnsureAdminAccess";
import { getTabKey, useConfigContext } from "../providers/ConfigProvider";
import ConfigTabs, { ConfigTabDefinition } from "./ConfigTabs";
import EditBoundingBoxes from "./EditBoundingBoxes";
import EditGeneral from "./EditGeneral";
import EditTableTab from "./EditTableTab";
import EditTabs from "./EditTabs";

function ConfigEditor() {
  const config = useConfigContext();

  const tabs: ConfigTabDefinition[] = [
    { url: "general", title: "General", component: <EditGeneral /> },
    { url: "boundingBoxes", title: "Bounding boxes", component: <EditBoundingBoxes /> },
    { url: "tabs", title: "Tabs", component: <EditTabs /> },
  ];

  // Add a config tab for each configurable tab.
  config.tabs.forEach((tab) => {
    if (tab.url === "table" && tab.slug) {
      const tabKey = getTabKey(tab);
      tabs.push({
        url: tabKey,
        title: `Table ${tab.slug}`,
        component: <EditTableTab tabKey={tabKey} />,
      });
    }
  });

  return (
    <EnsureAdminAccess>
      <ChakraProvider>
        <Box w="100%">
          <Heading
            size="xl"
            padding="1rem 10%"
            bgColor="var(--primary-color)"
            color="var(--white-color)"
          >
            <IconButton
              icon={<BiArrowBack />}
              aria-label="Back to Dashboard"
              variant="ghost"
              marginRight="1rem"
              title="Back to Dashboard"
              colorScheme="blue"
              onClick={() => (window.location.href = "/floodsmart/")}
            />
            FloodSmart configuration pages
          </Heading>
          <Box w="80%" marginLeft="10%" marginTop="1rem" color="var(--primary-color)">
            <ConfigTabs definition={tabs} placeholder={<p>Configure the application.</p>} />
          </Box>
        </Box>
      </ChakraProvider>
    </EnsureAdminAccess>
  );
}

export default ConfigEditor;
