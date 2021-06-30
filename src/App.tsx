import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import LizardAuthProvider from './providers/LizardAuthProvider';
import ConfigProvider from './providers/ConfigProvider';
import TimeProvider from './providers/TimeProvider';

import { QUERY_OPTIONS } from './api/hooks';
import Tabs from './components/Tabs';
import AlarmsTab from './tabs/AlarmsTab';
import DamAlarmsTab from './tabs/DamAlarmsTab';
import StationsChartsTab from './tabs/StationsChartsTab';
import IssuedWarningsTab from './tabs/IssuedWarningsTab';
import FloodModelTab from './tabs/FloodModelTab';
import RainfallTab from './tabs/RainfallTab';
import IframeScreen from './tabs/IframeScreen';
import Header from './components/Header';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: QUERY_OPTIONS
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Switch>
          <Route path="/floodsmart/iframe" children={(
            // No Auth needed
            <ConfigProvider>
              <TimeProvider>
                <IframeScreen />
              </TimeProvider>
            </ConfigProvider>
          )} />
          <Route path="/" children={(
            <LizardAuthProvider>
              <ConfigProvider>
                <TimeProvider>
                  <AppWithAuthentication />
                </TimeProvider>
              </ConfigProvider>
            </LizardAuthProvider>
          )} />
        </Switch>
      </Router>
    </QueryClientProvider>
  );
}

const tabDefinition = [{
  url: 'alarms',
  title: 'FloodSmart Warnings',
  component: <AlarmsTab />
}, {
  url: 'damalarms',
  title: 'Dam Alarms',
  component: <DamAlarmsTab />
}, {
  url: 'waterlevel',
  title: 'Flood Model Extent and Depths',
  component: <FloodModelTab />
}, {
  url: 'rainfall',
  title: 'Rainfall Forecast and Totals',
  component: <RainfallTab/>
},{
  url: 'stations',
  title: 'Stations & Graphs',
  component: <StationsChartsTab />
}, {
  url: 'issuedwarnings',
  title: 'Issued Warnings',
  component: <IssuedWarningsTab />
}
]

function AppWithAuthentication() {
  return (
    <Router>
      <Switch>
        <Route path="/floodsmart/" exact={true} children={(<Redirect to={'/floodsmart/'+tabDefinition[0].url}/>)} />
        <Route path="/floodsmart/" children={(
          <>
            <Header/>
            <Tabs definition={tabDefinition} />
          </>
        )}/>
      </Switch>
    </Router>
  );
}

export default App;
