import { ReactNode } from "react";
import {
  Box,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";

import EditTableGeneral from "./edittable/EditTableGeneral";
import EditTableColumns from "./edittable/EditTableColumns";
import EditTableAlarms from "./edittable/EditTableAlarms";
import EditTableRows from "./edittable/EditTableRows";
import EditTableRow from "./edittable/EditTableRow";

interface EditTableTabProps {
  tabKey: string;
}

function AccordionPart({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AccordionItem>
      <Heading pb={4}>
        <AccordionButton
          color="var(--white-color)"
          bg="var(--primary-color)"
          _hover={{ bg: "var(--secondary-color)" }}
        >
          <Box flex="1" textAlign="left">
            {title}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Heading>
      <AccordionPanel pb={4}>{children}</AccordionPanel>
    </AccordionItem>
  );
}

function EditTableTab({ tabKey }: EditTableTabProps) {
  return (
    <Accordion defaultIndex={[0]} allowToggle>
      <AccordionPart title="General settings">
        <EditTableGeneral tabKey={tabKey} />
      </AccordionPart>
      <AccordionPart title="Columns">
        <EditTableColumns tabKey={tabKey} />
      </AccordionPart>
      <AccordionPart title="Alarm thresholds">
        <EditTableAlarms tabKey={tabKey} />
      </AccordionPart>
      <AccordionPart title="Rows">
        <EditTableRows tabKey={tabKey} />
      </AccordionPart>
      <AccordionPart title="Row Properties">
        <EditTableRow tabKey={tabKey} />
      </AccordionPart>
    </Accordion>
  );
}

export default EditTableTab;
