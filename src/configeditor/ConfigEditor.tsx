import { ChakraProvider, Box, Heading } from "@chakra-ui/react";

import EnsureAdminAccess from "../components/EnsureAdminAccess";
import ConfigTabs from "./ConfigTabs";
import EditBoundingBoxes from "./EditBoundingBoxes";
import EditGeneral from "./EditGeneral";
// import EditTabs from "./EditTabs";

function ConfigEditor() {
  return (
    <EnsureAdminAccess>
      <ChakraProvider>
        <Box w="80%" marginLeft="10%">
          <Heading size="xl" padding="1rem 0">
            FloodSmart configuration pages
          </Heading>
          <ConfigTabs
            definition={[
              { url: "general", title: "General", component: <EditGeneral /> },
              { url: "boundingBoxes", title: "Bounding boxes", component: <EditBoundingBoxes /> },
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
