import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import LizardAuthProvider from './providers/LizardAuthProvider';
import ConfigProvider from './providers/ConfigProvider';

import { QUERY_OPTIONS } from './api/hooks';
import Tabs from './components/Tabs';
import AlarmsTab from './tabs/AlarmsTab';
import StationsChartsTab from './tabs/StationsChartsTab';
import FloodModelTab from './tabs/FloodModelTab';
import RainfallTab from './tabs/RainfallTab';
import Header from './components/Header';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: QUERY_OPTIONS
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LizardAuthProvider>
        <ConfigProvider>
          <AppWithAuthentication />
        </ConfigProvider>
      </LizardAuthProvider>
    </QueryClientProvider>
  );
}

const DamAlarms = () => <p>This is the <strong>dam alarms</strong> component.</p>

const tabDefinition = [{
  url: 'alarms',
    title: 'Alarms',
    component: <AlarmsTab />
}, {
  url: 'damalarms',
    title: 'Dam Alarms',
    component: <DamAlarms />
}, {
  url: 'waterlevel',
    title: 'Flood Model Extent and Depths',
    component: <FloodModelTab />
}, {
  url: 'rainfall',
    title: 'Rainfall',
    component: <RainfallTab/>
},{
  url: 'stations',
    title: 'Stations & Graphs',
    component: <StationsChartsTab />
},]

function AppWithAuthentication() {
return (
<Router>
  <Header />
  <Switch>
    <Route path="/floodsmart/" exact={true} children={(<Redirect to={'/floodsmart/'+tabDefinition[0].url}/>)} />
    <Route path="/floodsmart/" children={(<Tabs definition={tabDefinition} />)}/>
  </Switch>
</Router>
);
}

export default App;
