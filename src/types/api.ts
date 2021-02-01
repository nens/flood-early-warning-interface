// Types for API responses

// Utils

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[]
}

export interface APIError {
  status: number;
  code: number;
  message: string;
  detail: string;
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


export interface TimeseriesAlarm {
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
