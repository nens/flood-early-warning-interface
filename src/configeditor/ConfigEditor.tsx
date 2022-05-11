import { ChakraProvider, Box, Heading } from "@chakra-ui/react";

import EnsureAdminAccess from "../components/EnsureAdminAccess";
import Tabs from "../components/Tabs";
import EditGeneral from "./EditGeneral";

function ConfigEditor() {
  return (
    <EnsureAdminAccess>
      <ChakraProvider>
        <Box w="80%" marginLeft="10%">
          <Heading size="xl" padding="1rem 0">
            FloodSmart configuration pages
          </Heading>
          <Tabs
            type="config"
            definition={[
              { url: "general", title: "General", component: <EditGeneral /> },
              { url: "other", title: "Other tab", component: <p>This is another tab</p> },
            ]}
            placeholder={<p>Configure the application.</p>}
          />
        </Box>
      </ChakraProvider>
    </EnsureAdminAccess>
  );
}

export default ConfigEditor;
