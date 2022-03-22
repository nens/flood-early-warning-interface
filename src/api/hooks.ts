// Hooks to do backend requests
// These use useQuery, and return a status / json tuple.

import { useContext } from "react";
import { useQuery, useQueries, QueryObserverResult, UseQueryResult } from "react-query";
import {
  Paginated,
  Bootstrap,
  RasterAlarm,
  Trigger,
  Raster,
  Event,
  Events,
  EventsResponse,
  MeasuringStation,
  Organisation,
  Timeseries,
} from "../types/api";
import { Config, MaxForecast } from "../types/config";
import { RasterIntersection } from "../types/tiles";
import { combineUrlAndParams } from "../util/http";
import { arrayMax } from "../util/functions";
import { useOrganisation, useFakeData } from "../providers/ConfigProvider";
import { TimeContext } from "../providers/TimeProvider";

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
    super(message);
  }
}

// Fetch wrapper that throws an error on bad status
export const fetchWithError = async (path: string) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const response = await fetch(path, {
    method: "GET",
    headers,
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new FetchError(response, `Received status: ${response.status}`);
  }
};

////// API calls

export function useBootstrap() {
  return useQuery<Bootstrap, FetchError>(
    "bootstrap",
    () => fetchWithError("/bootstrap/lizard/"),
    QUERY_OPTIONS
  );
}

export function useMeasuringStations() {
  return useQuery<Paginated<MeasuringStation>, FetchError>(
    "measuringstations",
    () =>
      fetchWithError(
        // Hardcoded! XXX
        "/api/v3/measuringstations/?format=json&in_bbox=150.86%2C-33.84%2C151.05%2C-33.73&page_size=1000"
      ),
    QUERY_OPTIONS
  );
}

export function useAssetTypes(assetTypes: string[]) {
  return useQueries(
    assetTypes.map((assetType) => {
      return {
        queryKey: ["assetType", assetType],
        queryFn: () =>
          fetchWithError(
            `/api/v3/${assetType}/?format=json&in_bbox=150.86%2C-33.84%2C151.05%2C-33.73&page_size=1000`
          ),
      };
    })
  );
}

export function useRasterAlarms() {
  const fakeData = useFakeData();
  const organisation = useOrganisation();

  const response = useQuery<Paginated<RasterAlarm>, FetchError>(
    "rasteralarms",
    () =>
      fetchWithError(
        `/api/v4/rasteralarms/?organisation__uuid=${organisation.uuid}&page_size=1000`
      ),
    { ...QUERY_OPTIONS, refetchInterval: 300000, enabled: !fakeData }
  );

  if (fakeData) {
    return {
      status: "success",
      data: fakeData.rasterAlarms as Paginated<RasterAlarm>,
    };
  }

  return {
    status: response.status,
    data: response.data,
  };
}

export function useRasterAlarmTriggers() {
  const alarmsResponse = useRasterAlarms();

  const triggersResponse = useQueries(
    (alarmsResponse.status === "success" ? alarmsResponse.data?.results || [] : []).map((alarm) => {
      return {
        queryKey: ["rastertriggers", alarm.uuid],
        queryFn: () =>
          fetchWithError(`/api/v4/rasteralarms/${alarm.uuid}/triggers/?page_size=1000`),
      };
    })
  ) as QueryObserverResult<Paginated<Trigger>, FetchError>[];

  if (alarmsResponse.status !== "success") {
    return [];
  }

  if (
    !triggersResponse.every((response) => response.isSuccess) ||
    !triggersResponse.length ||
    triggersResponse.length !== alarmsResponse.data!.results.length
  ) {
    return [];
  }

  const triggers: { alarm: RasterAlarm; trigger: Trigger }[] = [];

  for (let i = 0; i < triggersResponse.length; i++) {
    const alarm = alarmsResponse.data!.results[i]!;

    for (const trigger of triggersResponse[i].data!.results as Trigger[]) {
      triggers.push({
        alarm,
        trigger,
      });
    }
  }

  // Sort on trigger id, highest first -- so latest first
  triggers.sort((trig1, trig2) => trig2.trigger.id - trig1.trigger.id);

  return triggers;
}

// We use different client config objects (for the configuration of the whole app, and for
// messages), they have a number of fields in common.
export interface Wrapped<T> {
  revision: number;
  comment: string;
  clientconfig: {
    id?: number;
    client: string;
    slug: string;
    portal: string;
    configuration: T;
    organisation: Organisation;
  };
}

export function useConfig<T = Config>(slug: string): UseQueryResult<Wrapped<T>, FetchError> {
  return useQuery<Wrapped<T>, FetchError>(
    ["config", slug],
    async () => {
      const response = await fetchWithError(
        `/api/v4/clientconfigs/?format=json&client=flood-early-warning-interface&slug=${slug}`
      );
      if (response.results && response.results.length) {
        return response.results[0];
      } else {
        return null;
      }
    },
    QUERY_OPTIONS
  );
}

export function useRasterMetadata(uuids: string[]) {
  // useQueries is a way to run a variable number of fetches with
  // a single hook (otherwise it would be against the hooks rule),
  // while also storing the result of each fetch under its own key.
  const results = useQueries(
    uuids.map((uuid) => {
      return {
        queryKey: ["raster", uuid],
        queryFn: () => fetchWithError(`/api/v3/rasters/${uuid}/`),
      };
    })
  );

  const success = results.every((result) => result.isSuccess) && results.length === uuids.length;

  return {
    success,
    data: success ? results.map((result) => result.data as Raster) : ([] as Raster[]),
  };
}

export function useRasterEvents(
  intersections: RasterIntersection[],
  start: Date,
  end: Date,
  filters = {}
): EventsResponse {
  const results = useQueries(
    intersections.map(({ uuid, geometry }: RasterIntersection) => {
      const coordinates = geometry.coordinates;
      const defaults = {
        agg: "average",
        geom: `POINT (${coordinates[0]} ${coordinates[1]} ${coordinates[2] || 0})`,
        rasters: uuid,
        srs: "EPSG:4326",
        start: start.toISOString(),
        stop: end.toISOString(),
        format: "json",
      };

      return {
        queryKey: ["rasterEvents", uuid, coordinates, start, end],
        queryFn: () =>
          fetchWithError(
            combineUrlAndParams("/api/v3/raster-aggregates/", Object.assign(defaults, filters))
          ),
      };
    })
  );

  const success =
    results.every((result) => result.isSuccess) && results.length === intersections.length;

  if (success) {
    const data: Events[] = results.map((result) =>
      ((result as any).data.data || []).map((dataPoint: [number, number | null]) => {
        return {
          timestamp: new Date(dataPoint[0]),
          value: dataPoint[1],
        } as Event;
      })
    );

    return {
      success: true,
      data,
    };
  } else {
    return {
      success: false,
      data: null,
    };
  }
}

interface MaxLevel {
  time: Date | null;
  value: number | null;
}

export function useMaxForecastAtPoint(rasterUuid: string, alarm: RasterAlarm | null): MaxLevel {
  const fakeData = useFakeData();
  const { now, end } = useContext(TimeContext);

  let fake = false;
  let value = null;
  let time: Date | null = null;

  const uuid: string | null = alarm && alarm.uuid ? alarm.uuid : null;

  if (fakeData && fakeData.fakeMaxForecast) {
    fake = true;
    const forecast = fakeData.fakeMaxForecast as MaxForecast;
    if (uuid && forecast[uuid]) {
      value = forecast[uuid].value;
      time = new Date(now.getTime() + forecast[uuid].timeToMax * 1000);
    }
  }

  const intersection: RasterIntersection | null =
    alarm && alarm.geometry
      ? {
          uuid: rasterUuid,
          geometry: alarm.geometry,
        }
      : null;

  // Figure out where 'max' is in the operation model events array
  // Only look from timestamp 'now'
  const forecastLevels = useRasterEvents(intersection && !fake ? [intersection] : [], now, end);

  if (!fake && forecastLevels.success && forecastLevels.data.length > 0) {
    const events = forecastLevels.data[0];

    if (events !== null && events.length > 0) {
      // Round value to cm, so we don't see a max in the future that shows as the same as
      // current value
      const indexOfMax = arrayMax(events, (event) =>
        event.value !== null ? Math.round(event.value * 100) / 100 : -Infinity
      );

      if (indexOfMax !== -1) {
        time = events[indexOfMax].timestamp;
        value = events[indexOfMax].value;
      }
    }
  }

  return { time, value };
}

export function useTimeseriesMetadata(uuids: string[]) {
  const fakeData = useFakeData();

  // useQueries is a way to run a variable number of fetches with
  // a single hook (otherwise it would be against the hooks rule),
  // while also storing the result of each fetch under its own key.
  const results = useQueries(
    fakeData
      ? []
      : uuids.map((uuid) => {
          return {
            queryKey: ["timeseries", uuid],
            queryFn: () => fetchWithError(`/api/v3/timeseries/${uuid}/`),
          };
        })
  );

  if (fakeData) {
    return {
      success: true,
      data:
        uuids.map((uuid) => fakeData[`timeseries-metadata-${uuid}`] as Timeseries) ||
        ([] as Timeseries[]),
    };
  }

  const success = results.every((result) => result.isSuccess) && results.length === uuids.length;

  return {
    success,
    data: success ? results.map((result) => result.data as Timeseries) : ([] as Timeseries[]),
  };
}

export function useCurrentLevelTimeseries(uuid: string) {
  // Fetch metadata of a single timeseries and return current level.
  const fakeData = useFakeData();

  const timeseriesResponse = useTimeseriesMetadata(uuid && !fakeData ? [uuid] : []);

  if (fakeData) {
    const metadata = fakeData[`timeseries-metadata-${uuid}`] as unknown as Timeseries;
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
  params = {}
): EventsResponse {
  const fakeData = useFakeData();

  let results: any = useQueries(
    fakeData
      ? []
      : uuids.map((uuid: string) => {
          let parameters: { [key: string]: any } = {};

          if (params) {
            Object.assign(parameters, params);
          }

          if (start && end) {
            parameters.start = start.getTime();
            parameters.end = end.getTime();
          }

          return {
            queryKey: ["timeseriesEvents", uuid, start, end],
            queryFn: () =>
              fetchWithError(combineUrlAndParams(`/api/v3/timeseries/${uuid}/data/`, parameters)),
          };
        })
  );

  if (fakeData) {
    results = uuids.map((uuid) => {
      return {
        isSuccess: !!fakeData[`timeseries-events-${uuid}`],
        data: fakeData[`timeseries-events-${uuid}`],
      };
    });
  }

  const success =
    results.every((result: any) => result.isSuccess) && results.length === uuids.length;

  if (success) {
    const data: Events[] = results.map((result: any) =>
      result.data.map(
        (dataPoint: { timestamp: number; max?: number | null; sum: number | null }) => {
          return {
            timestamp: new Date(dataPoint.timestamp),
            value: dataPoint.hasOwnProperty("max") ? dataPoint.max : dataPoint.sum,
          } as Event;
        }
      )
    );

    return {
      success: true,
      data,
    };
  } else {
    return {
      success: false,
      data: null,
    };
  }
}

export type LegendData = { value: number; color: string }[];

export function useLegend(wmsUrl: string, raster: string, styles: string): LegendData | null {
  // Fetch WMS legend and return it

  const url = combineUrlAndParams(new URL(wmsUrl).pathname, {
    service: "wms",
    request: "getlegend",
    layer: raster,
    steps: "10",
    style: styles,
  });

  const response = useQuery<{ legend: LegendData }, FetchError>(
    `legend-${raster}-${styles}`,
    () => fetchWithError(url),
    QUERY_OPTIONS
  );

  if (response.status === "success") {
    return response.data.legend;
  } else {
    return null;
  }
}

export type UserRole = "user" | "admin" | "supplier" | "manager";

export interface OrganisationUser {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  roles: UserRole[];
}

export function useOrganisationUser(): OrganisationUser | null {
  const organisation = useOrganisation();

  const userResponse = useQuery<OrganisationUser, FetchError>(
    "organisationUser",
    () => fetchWithError(`/api/v4/organisations/${organisation.uuid}/users/me`),
    QUERY_OPTIONS
  );

  if (userResponse.isSuccess) return userResponse.data;
  return null;
}

export function useUserHasRole(role: UserRole): boolean {
  const organisationUser = useOrganisationUser();

  return organisationUser !== null && organisationUser.roles.indexOf(role) !== -1;
}
