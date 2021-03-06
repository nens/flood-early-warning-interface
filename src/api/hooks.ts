// Hooks to do backend requests
// These use useQuery, and return a status / json tuple.

import { useQuery, useQueries } from 'react-query';
import {
  Paginated,
  Bootstrap,
  RasterAlarm,
  Raster,
  Event,
  Events,
  EventsResponse,
  Timeseries
} from '../types/api';
import { Config } from '../types/config';
import { RasterIntersection } from '../types/tiles';
import { combineUrlAndParams } from '../util/http';

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


export function useRasterMetadata(uuids: string[]) {
  // useQueries is a way to run a variable number of fetches with
  // a single hook (otherwise it would be against the hooks rule),
  // while also storing the result of each fetch under its own key.
  const results = useQueries(
    uuids.map(uuid => {
      return {
        queryKey: ['raster', uuid],
        queryFn: () => fetchWithError(`/api/v3/rasters/${uuid}/`)
      };
    })
  );

  const success = results.every(result => result.isSuccess);

  return {
    success,
    data: success ? results.map(result => result.data as Raster) : [] as Raster[]
  };
}


export function useRasterEvents(
  intersections: RasterIntersection[],
  start: Date,
  end: Date,
  filters={}
): EventsResponse {
  const results = useQueries(
    intersections.map(({uuid, geometry}: RasterIntersection) => {
      const coordinates = geometry.coordinates;
      const defaults = {
        agg: 'average',
        geom: `POINT (${coordinates[0]} ${coordinates[1]} ${coordinates[2] || 0})`,
        rasters: uuid,
        srs: 'EPSG:4326',
        start: start.toISOString(),
        stop: end.toISOString(),
        format: 'json'
      };

      return {
        queryKey: ['rasterEvents', uuid, coordinates, start, end],
        queryFn: () => fetchWithError(
          combineUrlAndParams('/api/v3/raster-aggregates/', Object.assign(defaults, filters)))
      }
    })
  );

  const success = results.every(result => result.isSuccess);

  if (success) {
    const data: Events[] = results.map(result => ((result as any).data.data).map(
      (dataPoint: [number, number | null]) => {
        return {
          timestamp: new Date(dataPoint[0]),
          value: dataPoint[1]
        } as Event;
      }));

    return {
      success: true,
      data
    };
  } else {
    return {
      success: false,
      data: null
    }
  }
}

export function useTimeseriesMetadata(uuids: string[]) {
  // useQueries is a way to run a variable number of fetches with
  // a single hook (otherwise it would be against the hooks rule),
  // while also storing the result of each fetch under its own key.
  const results = useQueries(
    uuids.map(uuid => {
      return {
        queryKey: ['timeseries', uuid],
        queryFn: () => fetchWithError(`/api/v3/timeseries/${uuid}/`)
      };
    })
  );

  const success = results.every(result => result.isSuccess);

  return {
    success,
    data: success ? results.map(result => result.data as Timeseries) : [] as Timeseries[]
  };
}


export function useTimeseriesEvents(
  uuids: string[],
  start: Date,
  end: Date,
  params={}
): EventsResponse {
  const results = useQueries(
    uuids.map((uuid: string) => {
      let parameters: {[key: string]: any} = {};

      if (params) {
        Object.assign(parameters, params);
      }

      if (start && end) {
        parameters.start = start.getTime();
        parameters.end = end.getTime();
      };

      return {
        queryKey: ['timeseriesEvents', uuid, start, end],
        queryFn: () => fetchWithError(
          combineUrlAndParams(`/api/v3/timeseries/${uuid}/data/`, parameters))
      }
    })
  );

  const success = results.every(result => result.isSuccess);

  if (success) {
    const data: Events[] = results.map(result => ((result as any).data).map(
      (dataPoint: {timestamp: number, max?: number | null, sum: number | null}) => {
        return {
          timestamp: new Date(dataPoint.timestamp),
          value: dataPoint.hasOwnProperty('max') ? dataPoint.max : dataPoint.sum
        } as Event;
      }));

    return {
      success: true,
      data
    };
  } else {
    return {
      success: false,
      data: null
    }
  }
}
