// Makes 'start', 'end' and 'now' Dates available

import React, { useState, useEffect, createContext } from "react";
import { WithChildren } from "../types/util";
import { useConfigContext } from "./ConfigProvider";

const HOUR_IN_MS = 60 * 60 * 1000;

interface Times {
  start: Date;
  now: Date;
  end: Date;
  isDateEdited: boolean;
  setEditedNow?: (d: Date) => void;
  resetEditedNow?: () => void;
}

// Note that this default value is never used, we provide the actual
// default below.
export const TimeContext = createContext<Times>({
  start: new Date(),
  now: new Date(),
  end: new Date(),
  isDateEdited: false,
});

function roundDown(d: Date) {
  const minutes = d.getMinutes();
  d.setMilliseconds(0);
  d.setSeconds(0);
  d.setMinutes(minutes - (minutes % 5));
  return d;
}

function TimeProvider({ children }: WithChildren<{}>) {
  const config = useConfigContext();

  const configuredNow = config.nowDateTimeUTC ? new Date(config.nowDateTimeUTC) : null;

  // Now is real time, updated every 5 minutes
  const [now, setNow] = useState<Date>(roundDown(new Date()));
  // "Edited now" is set by the user, takes precedence if set
  const [editedNow, setEditedNow] = useState<Date | null>(null);

  const getPeriod = (d: Date) => {
    const ms = d.getTime();
    return [new Date(ms - 24 * HOUR_IN_MS), new Date(ms + 12 * HOUR_IN_MS)];
  };

  const isDateEdited = editedNow !== null;
  const usedNow = configuredNow ?? editedNow ?? now;
  const [start, end] = getPeriod(usedNow);

  // Update, taking rounding into account
  useEffect(() => {
    setTimeout(() => setNow(new Date()), 5 * 60 * 1000 - (new Date().getTime() - now.getTime()));
  }, [now]);

  return (
    <TimeContext.Provider
      value={{
        now: usedNow,
        start,
        end,
        isDateEdited,
        setEditedNow,
        resetEditedNow: () => setEditedNow(null),
      }}
    >
      {children}
    </TimeContext.Provider>
  );
}

export default TimeProvider;
