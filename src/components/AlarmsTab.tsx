import React from 'react';

import { useTimeseriesAlarms } from '../api/hooks';


function AlarmsTab() {
  const response = useTimeseriesAlarms();

  if (response.status === 'ok') {
    const alarms = response.data;

    return (
      <>
      <ul>
        {alarms.results.map(alarm => <li key={alarm.uuid}>{alarm.name}</li>)}
      </ul>
      <ul>
        {alarms.results.map(alarm => <li key={alarm.uuid}>{alarm.name}</li>)}
      </ul>
      <ul>
        {alarms.results.map(alarm => <li key={alarm.uuid}>{alarm.name}</li>)}
      </ul>
      <ul>
        {alarms.results.map(alarm => <li key={alarm.uuid}>{alarm.name}</li>)}
      </ul>
      <ul>
        {alarms.results.map(alarm => <li key={alarm.uuid}>{alarm.name}</li>)}
      </ul>
      <ul>
        {alarms.results.map(alarm => <li key={alarm.uuid}>{alarm.name}</li>)}
      </ul>
      </>
    );
  } else {
    return <p>No alarms yet.</p>
  }
}

export default AlarmsTab;
