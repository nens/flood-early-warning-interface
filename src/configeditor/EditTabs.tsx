import {
  Box,
  Checkbox,
  Input,
  IconButton,
  Button,
  HStack,
  VStack,
  FormControl,
  FormLabel,
  Text,
  Textarea,
  FormErrorMessage,
} from "@chakra-ui/react";
import { BsFillArrowUpSquareFill, BsFillArrowDownSquareFill } from "react-icons/bs";
import { Tab } from "../types/config";
import { DEFAULT_TABS } from "../constants";
import { useConfigEdit } from "./hooks";


function EditTabs() {
  const { status, values, setValues, errors, submit } = useConfigEdit([
    "tabs"
  ]);

  const tabs = values.tabs as Tab[];

  const removeTab = (tab: Tab) => {};
  const changeTitle = (tab: Tab, title: string) => {};

  return (
    <VStack align="left">
    {tabs.map((tab) => (
      <HStack key={tab.url}>
        <Checkbox isChecked={true} onChange={() => removeTab(tab)} />
        <IconButton variant="outline" aria-label="Move up" icon={<BsFillArrowUpSquareFill />} />
        <IconButton variant="outline" aria-label="Move down" icon={<BsFillArrowDownSquareFill />} />
        <Input value={tab.title} onChange={(e) => changeTitle(tab, e.target.value)} />
        <Text>Tab&nbsp;"{tab.url}"</Text>
      </HStack>
    ))}
    </VStack>
  );
}

export default EditTabs;
