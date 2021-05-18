// Hooks to do backend requests
// These use useQuery, and return a status / json tuple.

import { useContext } from 'react';
import { useQuery, useQueries } from 'react-query';
import {
  Paginated,
  Bootstrap,
  RasterAlarm,
  Raster,
  Event,
  Events,
  EventsResponse,
  Organisation,
  Timeseries
} from '../types/api';
import { Config } from '../types/config';
import { RasterIntersection } from '../types/tiles';
import { combineUrlAndParams } from '../util/http';
import { arrayMax } from '../util/functions';
import { useOrganisation, useFakeData } from '../providers/ConfigProvider';
import { TimeContext } from '../providers/TimeProvider';

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
export class FetchError extends Error {
  constructor(public res: Response, message?: string) {
    super(message)
  }
}

// Fetch wrapper that throws an error on bad status
export const fetchWithError = async (path: string) => {
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
  const fakeData = useFakeData();
  const organisation = useOrganisation();

  const response = useQuery<Paginated<RasterAlarm>, FetchError>(
    'rasteralarms',
    () => fetchWithError(`/api/v4/rasteralarms/?organisation__uuid=${organisation.uuid}&page_size=1000`),
    {...QUERY_OPTIONS, refetchInterval: 300000, enabled: !fakeData});

  if (fakeData) {
    return fakeData.rasterAlarms as Paginated<RasterAlarm>;
  }

  return response;
}


interface WrappedConfig {
  clientconfig: {
    configuration: Config;
    organisation: Organisation;
  };
}

export function useConfig(slug: string) {
  const response = useQuery<Paginated<WrappedConfig>, FetchError>(
    `config-${slug}`,
    () => fetchWithError(`/api/v4/clientconfigs/?format=json&client=flood-early-warning-interface&slug=${slug}`),
    QUERY_OPTIONS
  );

  return {
    ...response,
    config: (
      response.data && response.data.results && response.data.results.length ?
        response.data.results[0].clientconfig : null)
  };
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

  const success = results.every(result => result.isSuccess) && results.length === uuids.length;

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

  const success = results.every(result => result.isSuccess) && results.length === intersections.length;

  if (success) {
    const data: Events[] = results.map(result => ((result as any).data.data || []).map(
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


interface MaxLevel {
  time: Date | null;
  value: number | null;
}


export function useMaxForecastAtPoint(intersection: RasterIntersection|null): MaxLevel {
  // Figure out where 'max' is in the operation model events array
  // Only look from timestamp 'now'
  const {now, end} = useContext(TimeContext);
  const forecastLevels = useRasterEvents(
    intersection ? [intersection] : [],
    now,
    end
  );

  let value = null;
  let time = null;

  if (forecastLevels.success && forecastLevels.data.length > 0) {
    const events = forecastLevels.data[0];

    if (events !== null && events.length > 0) {
      // Round value to cm, so we don't see a max in the future that shows as the same as
      // current value
      const indexOfMax = arrayMax(
        events,
        event => event.value !== null ? Math.round(event.value*100)/100 : -Infinity
      );

      if (indexOfMax !== -1) {
        time = events[indexOfMax].timestamp;
        value = events[indexOfMax].value;
      }
    }
  }

  return {time, value};
}


export function useTimeseriesMetadata(uuids: string[]) {
  const fakeData = useFakeData();

  // useQueries is a way to run a variable number of fetches with
  // a single hook (otherwise it would be against the hooks rule),
  // while also storing the result of each fetch under its own key.
  const results = useQueries(
    fakeData ? [] :
    uuids.map(uuid => {
      return {
        queryKey: ['timeseries', uuid],
        queryFn: () => fetchWithError(`/api/v3/timeseries/${uuid}/`)
      };
    })
  );

  if (fakeData) {
    return {
      success: true,
      data: uuids.map(uuid => fakeData[`timeseries-metadata-${uuid}`] as Timeseries) || [] as Timeseries[]
    };
  }


  const success = results.every(result => result.isSuccess) && results.length === uuids.length;

  return {
    success,
    data: success ? results.map(result => result.data as Timeseries) : [] as Timeseries[]
  };
}


export function useCurrentLevelTimeseries(uuid: string) {
  // Fetch metadata of a single timeseries and return current level.
  const fakeData = useFakeData();

  const timeseriesResponse = useTimeseriesMetadata(uuid && !fakeData ? [uuid] : []);

  if (fakeData) {
    const metadata = fakeData[`timeseries-metadata-${uuid}`];
    return metadata ? metadata.last_value : null;
  }

  if (timeseriesResponse.success && timeseriesResponse.data.length > 0) {
    const timeseries = timeseriesResponse.data[0];
    return timeseries.last_value;
  }
  return null;
}

export function useTimeseriesEvents(
  uuids: string[],
  start: Date,
  end: Date,
  params={}
): EventsResponse {
  const fakeData = useFakeData();

  let results = useQueries(
    fakeData ? [] : uuids.map((uuid: string) => {
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

  if (fakeData) {
    results = uuids.map((uuid) => {
      return {
        isSuccess: !!fakeData[`timeseries-events-${uuid}`],
        data: fakeData[`timeseries-events-${uuid}`]
      };
    });
  }

  const success = results.every(result => result.isSuccess) && results.length === uuids.length;

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


export type LegendData = {value: number, color: string}[];

export function useLegend(wmsUrl: string, raster: string, styles: string): LegendData | null {
  // Fetch WMS legend and return it

  const url = combineUrlAndParams(
    (new URL(wmsUrl)).pathname, {
      service: 'wms',
      request: 'getlegend',
      layer: raster,
      steps: '10',
      style: styles
    });

  const response = useQuery<{legend: LegendData}, FetchError>(
    `legend-${raster}-${styles}`,
    () => fetchWithError(url),
    QUERY_OPTIONS
  );

  if (response.status === 'success') {
    return response.data.legend;
  } else {
    return null;
  }
}
