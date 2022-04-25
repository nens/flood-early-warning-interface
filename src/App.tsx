import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import LizardAuthProvider from "./providers/LizardAuthProvider";
import ConfigProvider, { useConfigContext } from "./providers/ConfigProvider";
import TimeProvider from "./providers/TimeProvider";

import { QUERY_OPTIONS } from "./api/hooks";
import Tabs, { TabDefinition } from "./components/Tabs";
import AlarmsTab from "./tabs/AlarmsTab";
import DamAlarmsTab from "./tabs/DamAlarmsTab";
import StationsChartsTab from "./tabs/StationsChartsTab";
import IssuedWarningsTab from "./tabs/IssuedWarningsTab";
import FloodModelTab from "./tabs/FloodModelTab";
import RainfallTab from "./tabs/RainfallTab";
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

const tabComponents: { [url: string]: React.ReactNode } = {
  alarms: <AlarmsTab />,
  damalarms: <DamAlarmsTab />,
  waterlevel: <FloodModelTab />,
  rainfall: <RainfallTab />,
  issuedwarnings: <IssuedWarningsTab />,
  stations: <StationsChartsTab />
};

const defaultTabs = [
  {
    url: "alarms",
    title: "FloodSmart Warnings",
  },
  {
    url: "damalarms",
    title: "Dam Alarms",
  },
  {
    url: "waterlevel",
    title: "Flood Model Extent and Depths",
  },
  {
    url: "rainfall",
    title: "Rainfall Forecast and Totals",
  },
  {
    url: "stations",
    title: "Stations & Graphs",
  },
  {
    url: "issuedwarnings",
    title: "Issued Warnings",
  },
];

function AppWithAuthentication() {
  const config = useConfigContext();

  const tabs = config.tabs ?? defaultTabs;
  const tabsWithComponents: TabDefinition[] = tabs
    .map((tab) => {
      return { ...tab, component: tabComponents[tab.url] };
    })
    .filter((tab) => tab.component);

  const title = config.dashboardTitle || "FloodSmart Parramatta Dashboard";

  useEffect(() => {
    document.title = title;
    const el = document.querySelector("meta[name='description']");
    if (el) {
      el.setAttribute("content", title);
    }
  }, [title]);

  if (tabsWithComponents.length === 0) return null;

  return (
    <Router>
      <Switch>
        <Route
          path="/floodsmart/"
          exact={true}
          children={<Redirect to={"/floodsmart/" + tabsWithComponents[0].url} />}
        />
        <Route
          path="/floodsmart/"
          children={
            <>
              <Header title={title} />
              <Tabs definition={tabsWithComponents} />
            </>
          }
        />
      </Switch>
    </Router>
  );
}

export default App;
