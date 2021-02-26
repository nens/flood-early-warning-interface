// Hooks to do backend requests
// These use useQuery, and return a status / json tuple.

import { useQuery } from 'react-query';
import { Paginated, Bootstrap, RasterAlarm } from '../types/api';
import { Config } from '../types/config';


///// React Query helper functions

export const QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000,
  retry: false as const,
  refetchOnMount: false as const,
  refetchOnWindowsFocus: false as const,
  refetchOnReconnect: true as const,
  refetchIntervalInBackground: true as const,
  refetchInterval: false as const,
};

// Error to throw if status code isn't 2xx
class FetchError extends Error {
  constructor(public res: Response, message?: string) {
    super(message)
  }
}

// Fetch wrapper that throws an error on bad status
const fetchWithError = async (path: string) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const response = await fetch(path, {
    method: 'GET',
    headers,
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new FetchError(response, `Received status: ${response.status}`)
  }
};

////// API calls

export function useBootstrap() {
  return useQuery<Bootstrap, FetchError>(
    'bootstrap',
    () => fetchWithError('/bootstrap/lizard/'),
    QUERY_OPTIONS
  );
}


export function useRasterAlarms() {
  return useQuery<Paginated<RasterAlarm>, FetchError>(
    'rasteralarms',
    () => fetchWithError('/api/v4/rasteralarms/?organisation__uuid=33b32fe8-0317-4390-9ef9-259744c32cc1&page_size=1000'),
    {...QUERY_OPTIONS, refetchInterval: 300000});
}


export function useConfig() {
  return useQuery<Config, FetchError>(
    'config',
    () => fetchWithError('/api/v4/clientconfigs/3/?format=json'),
    QUERY_OPTIONS
  );
}
