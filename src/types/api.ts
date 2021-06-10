// Types for API responses
import { Point } from 'geojson';

// Utils

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[]
}

// Endpoints. Note that if a field is not in here, that means we don't use it


export interface Organisation {
  url: string;
  uuid: string;
  name: string;
}

export interface MeasuringStation {
  geometry: Point;
  url: string;
  id: number;
  organisation: Organisation;
  last_modified: string;
  name: string;
  timeseries: Timeseries[];
}

export interface Bootstrap {
  user: {
    authenticated: boolean;
    username: string;
    first_name: string;
  },
  sso: {
    login: string;
    logout: string;
  }
}


export interface RasterAlarm {
  uuid: string;
  name: string;
  thresholds: {
    value: number;
    warning_level: string;
  }[];
  intersection: {
    raster: string; // Note: that is the raster's *URL*, not it's uuid
  };
  timeseries: string;
  latest_trigger: {
    trigger_time: string;
    value: number;
    value_time: string;
    warning_level: string | null;
  };
  geometry: Point;
}

export interface Trigger {
  id: number;
  trigger_time: string; // ISO timestamp
  value: number;
  value_time: string; // ISO timestamp
  warning_level: string | null;
  threshold_value: number | null;
  threshold_time: string | null; // ISO timestamp
  // Also 'first_time' (?) and 'message_sent', but we don't use them anyway
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
  uuid: string;
  url: string;
  observation_type: ObservationType;
  last_modified: string;
  wms_info: {
    endpoint: string;
    layer: string
  };
  options: {
    styles: string;
  }
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
  observation_type: ObservationType;
  last_value: number;
  parameter: string;
  reference_frame: string;
  name: string;
  uuid: string;
}
