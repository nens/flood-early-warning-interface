// Types for API responses

// Utils

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[]
}

// Endpoints. Note that if a field is not in here, that means we don't use it


export interface Bootstrap {
  user: {
    authenticated: boolean;
    username: string;
    first_name: string;
  },
  sso: {
    login: string;
  }
}


export interface RasterAlarm {
  uuid: string;
  name: string;
  thresholds: {
    value: number;
    warning_level: string;
  }[];
  timeseries: string;
  latest_trigger: {
    trigger_time: string;
    value: number;
    value_time: string;
  }[];
}


export interface ObservationType {
  url: string;
  code: string;
  parameter: string;
  unit: string;
  scale: "ratio" | "interval";
  description: string;
  reference_frame?: string;
}


export interface Raster {
  observation_type: ObservationType;
}

// We rewrite both raster and timeseries events immediately to this format
// after receiving them, see api/hooks.ts.
export interface Event {timestamp: Date, value: number | null};
export type Events = Event[];

// API response types
export type EventsResponse = {
  success: true,
  data: Events[]
} | {
  success: false,
  data: null
}

export interface Timeseries {
  observation_type: ObservationType
}
