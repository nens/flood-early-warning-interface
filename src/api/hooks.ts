// Hooks to do backend requests
// These use useQuery, and return a status / json tuple.

import { useContext } from "react";
import { useQuery, useQueries, QueryObserverResult, UseQueryResult } from "react-query";
import {
  Paginated,
  Bootstrap,
  Alarm,
  RasterAlarm,
  TimeseriesAlarm,
  Trigger,
  Raster,
  Event,
  Events,
  EventsResponse,
  MeasuringStation,
  Organisation,
  Timeseries,
} from "../types/api";
import { Point } from "geojson";

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
  const hasFakeRasterAlarms = "rasterAlarms" in fakeData;
  const organisation = useOrganisation();

  const response = useQuery<Paginated<RasterAlarm>, FetchError>(
    "rasteralarms",
    () =>
      fetchWithError(
        `/api/v4/rasteralarms/?organisation__uuid=${organisation.uuid}&page_size=1000`
      ),
    { ...QUERY_OPTIONS, refetchInterval: 300000, enabled: !hasFakeRasterAlarms }
  );

  if (hasFakeRasterAlarms) {
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

export function useTimeseriesAlarms() {
  const organisation = useOrganisation();

  const response = useQuery<Paginated<TimeseriesAlarm>, FetchError>(
    "timeseriesalarms",
    () =>
      fetchWithError(
        `/api/v4/timeseriesalarms/?organisation__uuid=${organisation.uuid}&page_size=1000`
      ),
    { ...QUERY_OPTIONS, refetchInterval: 300000 }
  );

  return {
    status: response.status,
    data: response.isSuccess ? response.data.results : [],
  };
}

export function useTimeseriesAlarmsByTimeseries(timeseriesIds: string[]) {
  /* Return all TimeseriesAlarms that are related to any of the given timeseriesIds. */
  const alarms = useTimeseriesAlarms();

  return {
    status: alarms.status,
    data: alarms.data.filter((alarm) => {
      /* Note that the "timeseries" field of TimeseriesAlarms contains a *URL*, not a UUID. */
      /* We use a "includes" check, as the URL does always contain the UUID. */
      return (
        alarm && alarm.timeseries && timeseriesIds.some((tsid) => alarm.timeseries.includes(tsid))
      );
    }),
  };
}

export function useAlarmTriggers() {
  const rasterAlarmsResponse = useRasterAlarms();
  const timeseriesAlarmsResponse = useTimeseriesAlarms();

  const rasterTriggersResponse = useQueries(
    (rasterAlarmsResponse.status === "success" ? rasterAlarmsResponse.data?.results || [] : []).map(
      (alarm) => {
        return {
          queryKey: ["rastertriggers", alarm.uuid],
          queryFn: () =>
            fetchWithError(`/api/v4/rasteralarms/${alarm.uuid}/triggers/?page_size=1000`),
        };
      }
    )
  ) as QueryObserverResult<Paginated<Trigger>, FetchError>[];

  const timeseriesTriggersResponse = useQueries(
    timeseriesAlarmsResponse.data.map((tsAlarm) => {
      return {
        queryKey: ["timeseriestriggers", tsAlarm.uuid],
        queryFn: () =>
          fetchWithError(`/api/v4/timeseriesalarms/${tsAlarm.uuid}/triggers/?page_size=1000`),
      };
    })
  ) as QueryObserverResult<Paginated<Trigger>, FetchError>[];

  if (rasterAlarmsResponse.status !== "success" || timeseriesAlarmsResponse.status !== "success") {
    return [];
  }

  const responses = rasterTriggersResponse.concat(timeseriesTriggersResponse);
  const alarms = (rasterAlarmsResponse.data!.results as Alarm[]).concat(
    timeseriesAlarmsResponse.data as Alarm[]
  );

  if (
    !responses.every((response) => response.isSuccess) ||
    !responses.length ||
    responses.length !== alarms.length
  ) {
    return [];
  }

  const triggers: { alarm: Alarm; trigger: Trigger }[] = [];

  for (let i = 0; i < responses.length; i++) {
    const alarm = alarms[i];

    for (const trigger of responses[i].data!.results as Trigger[]) {
      triggers.push({
        alarm,
        trigger,
      });
    }
  }

  // Sort on trigger id, highest first -- so latest first
  // XXX
  // This leads to nonsensical results if timeseries and raster alarms are mixed!
  triggers.sort((trig1, trig2) => trig2.trigger.id - trig1.trigger.id);

  return triggers;
}

export function useAlarm(
  uuid: string | null,
  alarmType?: "raster" | "timeseries" | "none"
): RasterAlarm | null {
  // Fetch metadata of either a raster alarm or a timeseries alarm
  // Caution: Return type is RasterAlarm, because most of the metadata is the same!
  const enabledRaster = !!(uuid && alarmType === "raster");
  const enabledTimeseries = !!(uuid && alarmType === "timeseries");

  const rasterAlarmResponse = useQuery(
    ["rasteralarm", uuid],
    () => fetchWithError(`/api/v4/rasteralarms/${uuid}/`),
    { enabled: enabledRaster }
  ) as QueryObserverResult<RasterAlarm, FetchError>;

  const timeseriesAlarmResponse = useQuery(
    ["timeseriesalarm", uuid],
    () => fetchWithError(`/api/v4/timeseriesalarms/${uuid}/`),
    { enabled: enabledTimeseries }
  ) as QueryObserverResult<RasterAlarm, FetchError>;

  if (enabledRaster && rasterAlarmResponse.isSuccess && rasterAlarmResponse.data) {
    return rasterAlarmResponse.data;
  } else if (
    enabledTimeseries &&
    timeseriesAlarmResponse.isSuccess &&
    timeseriesAlarmResponse.data
  ) {
    return timeseriesAlarmResponse.data;
  } else {
    return null;
  }
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

export function useConfig<T extends { version?: number } = Config>(
  slug: string,
  defaults?: T
): UseQueryResult<Wrapped<T>, FetchError> {
  return useQuery<Wrapped<T>, FetchError>(
    ["config", slug],
    async () => {
      const response = await fetchWithError(
        `/api/v4/clientconfigs/?format=json&client=flood-early-warning-interface&slug=${slug}`
      );
      if (response.results && response.results.length) {
        const serverConfig = response.results[0].clientconfig.configuration;

        if (defaults) {
          if ("version" in defaults && serverConfig.version !== defaults.version) {
            // Fix things we changed in the config here, if not handled by defaults.
          }

          // Take defaults, and add the fields returned by the server (that will
          // usually override most or all defaults).
          const configWithDefaults: T = { ...defaults, ...serverConfig };
          return {
            ...response.results[0],
            clientconfig: {
              ...response.results[0].clientconfig,
              configuration: configWithDefaults,
            },
          };
        } else {
          return response.results[0];
        }
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

function useRasterEventsAtPoint(rasterUuid: string, point: Point | null, now: Date, end: Date) {
  const intersections: RasterIntersection[] = point
    ? [
        {
          uuid: rasterUuid,
          geometry: point,
        },
      ]
    : [];

  const eventsResponse = useRasterEvents(intersections, now, end);

  return eventsResponse;
}

export function useMaxForecastAtPoint(
  rasterUuid: string,
  point: Point | null,
  cacheKey?: string
): MaxLevel {
  const { now, end } = useContext(TimeContext);

  const fakeData = useFakeData();
  const hasFakeMaxForecast = "fakeMaxForecast" in fakeData;
  let value = null;
  let time: Date | null = null;

  if (hasFakeMaxForecast) {
    const forecast = fakeData.fakeMaxForecast as MaxForecast;
    if (cacheKey && forecast[cacheKey]) {
      value = forecast[cacheKey].value;
      time = new Date(now.getTime() + forecast[cacheKey].timeToMax * 1000);
    }
  }

  const eventsResponse = useRasterEventsAtPoint(
    rasterUuid,
    hasFakeMaxForecast ? null : point,
    now,
    end
  );

  // Figure out where 'max' is in the operation model events array
  // Only look from timestamp 'now'
  if (!hasFakeMaxForecast && eventsResponse.success && eventsResponse.data.length > 0) {
    const events = eventsResponse.data[0];

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

export function useCurrentRasterValueAtPoint(rasterUuid: string, point: Point | null) {
  const { now, end } = useContext(TimeContext);

  const eventsResponse = useRasterEventsAtPoint(rasterUuid, point, now, end);

  if (
    eventsResponse.success &&
    eventsResponse.data &&
    eventsResponse.data.length > 0 &&
    eventsResponse.data[0].length > 0
  ) {
    return eventsResponse.data[0][0];
  } else {
    return null;
  }
}

export function useTimeseriesMetadata(uuids: string[]) {
  const fakeData = useFakeData();
  const hasFakeData = uuids.some((uuid) => `timeseries-metadata-${uuid}` in fakeData);

  // useQueries is a way to run a variable number of fetches with
  // a single hook (otherwise it would be against the hooks rule),
  // while also storing the result of each fetch under its own key.
  const results = useQueries(
    hasFakeData
      ? []
      : uuids.map((uuid) => {
          return {
            queryKey: ["timeseries", uuid],
            queryFn: () => fetchWithError(`/api/v3/timeseries/${uuid}/`),
          };
        })
  );

  if (hasFakeData) {
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
  // If uuid is falsy (empty string), useTimeseriesMetadata will return an empty array,
  // and this hook returns null.
  const fakeData = useFakeData();
  const hasFakeTimeseries = `timeseries-metadata-${uuid}` in fakeData;

  const timeseriesResponse = useTimeseriesMetadata(uuid && !hasFakeTimeseries ? [uuid] : []);

  if (hasFakeTimeseries) {
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
  const hasFakeTimeseriesEvents = uuids.some((uuid) => `timeseries-events-${uuid}` in fakeData);

  let results: any = useQueries(
    hasFakeTimeseriesEvents
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

  if (hasFakeTimeseriesEvents) {
    results = uuids.map((uuid) => {
      return {
        isSuccess: `timeseries-events-${uuid}` in fakeData,
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
