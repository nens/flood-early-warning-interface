import { useState, Fragment } from "react";
import {
  Button,
  Checkbox,
  Heading,
  Grid,
  GridItem,
  IconButton,
  Input,
  Select,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { BsFillArrowUpSquareFill, BsFillArrowDownSquareFill, BsTrashFill } from "react-icons/bs";
import { FaUndo } from "react-icons/fa";

import If from "../components/If";
import { Tab } from "../types/config";
import { ALL_TAB_URLS } from "../constants";
import { getTabKey } from "../providers/ConfigProvider";
import { moveUp, moveDown, remove, change } from "../util/functions";
import { useConfigEdit } from "./hooks";

function EditTabs() {
  const { status, values, updateValues, errors, submit } = useConfigEdit();

  const tabs = values.tabs as Tab[];
  const setTabs = (newTabs: Tab[]) => updateValues({ tabs: newTabs });

  const [deletedTabs, setDeletedTabs] = useState<Tab[]>([]);

  const removeTab = (idx: number) => {
    setDeletedTabs([...deletedTabs, tabs[idx]]);
    setTabs(remove(tabs, idx));
  };

  const undoRemove = (idx: number) => {
    setTabs(tabs.concat([deletedTabs[idx]]));
    setDeletedTabs(remove(deletedTabs, idx));
  };

  const changeTitle = (idx: number, title: string) =>
    setTabs(change(tabs, idx, { ...tabs[idx], title }));

  const changeSlug = (idx: number, slug: string) =>
    setTabs(change(tabs, idx, { ...tabs[idx], slug }));

  const changeUrl = (idx: number, url: string) => setTabs(change(tabs, idx, { ...tabs[idx], url }));

  const changeDraft = (idx: number, draft: boolean) =>
    setTabs(change(tabs, idx, { ...tabs[idx], draft }));

  const moveTabUp = (idx: number) => setTabs(moveUp(tabs, idx));
  const moveTabDown = (idx: number) => setTabs(moveDown(tabs, idx));

  const addTab = () => setTabs(tabs.concat([{ url: "", title: "" }]));

  const allDisabled = status === "fetching";

  return (
    <>
      <Button onClick={addTab} m="4">
        Add Tab
      </Button>
      <Heading size="l" m="4">
        Current Tabs
      </Heading>
      <Text m="4">
        Configure the tabs below. Note that once a tab has had specific configuration added (on
        other pages), its type (and potentially slug) can not be changed anymore.
      </Text>
      <Grid
        templateColumns="40px 40px 300px 150px 400px 75px 40px 1fr"
        templateRows={`repeat(${tabs.length} 1fr)`}
        gap={4}
        m={4}
      >
        {tabs.map((tab, idx) => {
          // The tab key is used for keys, but also for errors and tab configs
          const tabKey = getTabKey(tab);

          // Once a tab has a type (and possibly slug), and
          // configuration in tabConfigs, its type and slug cannot be
          // changed anymore
          const hasType = !!tab.url;
          const needsSlug = hasType && tab.url === "table";
          const hasSlug = !needsSlug || !!tab.slug;
          const hasTabConfig = !!(values.tableTabConfigs && values.tableTabConfigs[tabKey]);

          const changeDisabled = hasType && hasSlug && hasTabConfig;

          return (
            <Fragment key={tabKey}>
              <GridItem>
                <IconButton
                  variant="outline"
                  aria-label="Move up"
                  icon={<BsFillArrowUpSquareFill />}
                  disabled={allDisabled}
                  onClick={() => moveTabUp(idx)}
                />
              </GridItem>
              <GridItem>
                <IconButton
                  variant="outline"
                  aria-label="Move down"
                  icon={<BsFillArrowDownSquareFill />}
                  disabled={allDisabled}
                  onClick={() => moveTabDown(idx)}
                />
              </GridItem>
              <GridItem>
                <Select
                  value={tab.url}
                  placeholder="-- Select tab type --"
                  disabled={changeDisabled || allDisabled}
                  onChange={(e) => changeUrl(idx, e.target.value)}
                >
                  {ALL_TAB_URLS.map((tabUrl) => (
                    <option value={tabUrl} key={tabUrl}>
                      {tabUrl}
                    </option>
                  ))}
                </Select>
              </GridItem>
              <GridItem>
                <Input
                  value={tab.slug || ""}
                  disabled={allDisabled || changeDisabled || !needsSlug}
                  onChange={(e) => changeSlug(idx, e.target.value)}
                />
              </GridItem>
              <GridItem>
                <Input
                  value={tab.title}
                  onChange={(e) => changeTitle(idx, e.target.value)}
                  disabled={allDisabled}
                />
              </GridItem>
              <GridItem>
                <Checkbox
                  isChecked={!!tab.draft}
                  onChange={(e) => changeDraft(idx, e.target.checked)}
                >
                  Draft
                </Checkbox>
              </GridItem>
              <GridItem>
                <IconButton
                  variant="outline"
                  aria-label="delete"
                  icon={<BsTrashFill />}
                  onClick={() => removeTab(idx)}
                  disabled={allDisabled}
                />
              </GridItem>
              <GridItem>
                <Text color="red.600">{errors[tabKey] || null}</Text>
              </GridItem>
            </Fragment>
          );
        })}
      </Grid>
      <If test={"tabs" in errors}>
        <Text m="4" color="red.600">
          {errors.tabs}
        </Text>
      </If>
      <If test={deletedTabs.length > 0}>
        <Heading size="l" m="4">
          Deleted Tabs
        </Heading>
        <Grid
          templateColumns="300px 200px 400px 40px"
          templateRows={`repeat(${deletedTabs.length} 1fr)`}
          gap={4}
          m={4}
        >
          {deletedTabs.map((tab, idx) => {
            const tabKey = getTabKey(tab);
            return (
              <Fragment key={tabKey}>
                <GridItem>
                  <Input defaultValue={tab.url} disabled />
                </GridItem>
                <GridItem>
                  <Input defaultValue={tab.slug} disabled />
                </GridItem>
                <GridItem>
                  <Input defaultValue={tab.title} disabled />
                </GridItem>
                <GridItem>
                  <IconButton
                    variant="outline"
                    aria-label="undo"
                    icon={<FaUndo />}
                    onClick={() => undoRemove(idx)}
                    disabled={allDisabled}
                  />
                </GridItem>
              </Fragment>
            );
          })}
        </Grid>
      </If>
      <Button onClick={submit} m={4} disabled={allDisabled}>
        Submit
      </Button>
      <If test={status === "fetching"}>
        <Spinner />
      </If>
    </>
  );
}

export default EditTabs;
