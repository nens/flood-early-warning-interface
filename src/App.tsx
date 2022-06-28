import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import LizardAuthProvider from "./providers/LizardAuthProvider";
import { Tab } from "./types/config";
import ConfigProvider, { useConfigContext } from "./providers/ConfigProvider";
import ConfigEditor from "./configeditor/ConfigEditor";
import TimeProvider from "./providers/TimeProvider";

import { QUERY_OPTIONS, useUserHasRole } from "./api/hooks";
import Tabs, { TabDefinition } from "./components/Tabs";
import AlarmsTab from "./tabs/AlarmsTab";
import DamAlarmsTab from "./tabs/DamAlarmsTab";
import StationsChartsTab from "./tabs/StationsChartsTab";
import IssuedWarningsTab from "./tabs/IssuedWarningsTab";
import FloodModelTab from "./tabs/FloodModelTab";
import RainfallTab from "./tabs/RainfallTab";
import TableTab from "./tabs/TableTab";
import IframeScreen from "./tabs/IframeScreen";
import Header from "./components/Header";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: QUERY_OPTIONS,
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Switch>
          <Route
            path="/floodsmart/iframe"
            children={
              // No Auth needed
              <ConfigProvider>
                <TimeProvider>
                  <IframeScreen />
                </TimeProvider>
              </ConfigProvider>
            }
          />
          <Route
            path="/"
            children={
              <LizardAuthProvider>
                <ConfigProvider>
                  <TimeProvider>
                    <AppWithAuthentication />
                  </TimeProvider>
                </ConfigProvider>
              </LizardAuthProvider>
            }
          />
        </Switch>
      </Router>
    </QueryClientProvider>
  );
}

const tabComponents: { [url: string]: (tab: Tab) => React.ReactNode } = {
  table: (tab) => <TableTab tab={tab} />,
  alarms: () => <AlarmsTab />,
  damalarms: () => <DamAlarmsTab />,
  waterlevel: () => <FloodModelTab />,
  rainfall: () => <RainfallTab />,
  issuedwarnings: () => <IssuedWarningsTab />,
  stations: () => <StationsChartsTab />,
};

function AppWithAuthentication() {
  const config = useConfigContext();
  const isAdmin = useUserHasRole("admin");

  const title = config.dashboardTitle || "FloodSmart Parramatta Dashboard";

  useEffect(() => {
    document.title = title;
    const el = document.querySelector("meta[name='description']");
    if (el) {
      el.setAttribute("content", title);
    }
  }, [title]);

  const tabsWithComponents: TabDefinition[] = config.tabs
    .filter((tab) => !tab.draft || isAdmin)
    .map((tab) => {
      return {
        title: tab.title,
        url: tab.slug ? `${tab.url}-${tab.slug}` : tab.url,
        component: tab.url in tabComponents ? tabComponents[tab.url](tab) : null,
      };
    })
    .filter((tab) => tab.component);

  if (tabsWithComponents.length === 0) return null;

  return (
    <Router>
      <Switch>
        <Route path="/floodsmart/config/">
          <ConfigEditor />
        </Route>
        <Route
          path="/floodsmart/"
          exact={true}
          children={<Redirect to={"/floodsmart/" + tabsWithComponents[0].url} />}
        />
        <Route path="/floodsmart/">
          <div className="root">
            {/* Class defined in index.css */}
            <Header title={title} />
            <Tabs definition={tabsWithComponents} />
          </div>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
