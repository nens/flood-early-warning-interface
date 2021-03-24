// Makes 'start', 'end' and 'now' Dates available

import React, { useState, useEffect, createContext } from 'react';
import { WithChildren } from '../types/util';

const HOUR_IN_MS = 60 * 60 * 1000;

interface Times {
  start: Date,
  now: Date,
  end: Date
}

// Note that this default value is never used, we provide the actual
// default below.
export const TimeContext = createContext<Times>({
  start: new Date(),
  now: new Date(),
  end: new Date()
});


function roundDown(d: Date) {
  const minutes = d.getMinutes();
  d.setMilliseconds(0);
  d.setSeconds(0);
  d.setMinutes(minutes - (minutes % 5));
  return d;
}

function TimeProvider({ children }: WithChildren<{}>) {
  const [now, setNow] = useState<Date>(roundDown(new Date()));

  const getPeriod = (d: Date) => {
    const ms = d.getTime();
    return [
      new Date(ms - 24 * HOUR_IN_MS),
      new Date(ms + 12 * HOUR_IN_MS)
    ];
  };

  const [start, end] = getPeriod(now);

  // Update, taking rounding into account
  useEffect(() => {
    setTimeout(() =>
      setNow(new Date()), (5 * 60 * 1000) - (new Date().getTime() - now.getTime()));
  }, [now]);

  return (
    <TimeContext.Provider value={{now, start, end}}>
      {children}
    </TimeContext.Provider>
  );
}

export default TimeProvider;
