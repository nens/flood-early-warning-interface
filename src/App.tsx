import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import LizardAuthProvider from './providers/LizardAuthProvider';

import Tabs from './components/Tabs';
import AlarmsTab from './components/AlarmsTab';
import Header from './components/Header';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LizardAuthProvider>
        <AppWithAuthentication />
      </LizardAuthProvider>
    </QueryClientProvider>
  );
}

const DamAlarms = () => <p>This is the <strong>dam</strong> alarms component.</p>

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
  title: 'Forecast waterlevel',
  component: <AlarmsTab />
}, {
  url: 'meteo',
  title: 'Meteo',
  component: <DamAlarms />
},{
  url: 'stations',
  title: 'Stations & Graphs',
  component: <AlarmsTab />
},]

function AppWithAuthentication() {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/" exact={true} children={(<Redirect to={'/'+tabDefinition[0].url}/>)} />
        <Route path="/" children={(<Tabs definition={tabDefinition} />)}/>
      </Switch>
    </Router>
  );
}

export default App;
