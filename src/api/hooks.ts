// Hooks to do backend requests
// These use useQuery, and return a status / json tuple.

import { useQuery } from 'react-query';
import { Paginated, APIError, Bootstrap, TimeseriesAlarm } from '../types/api';
import { Config } from '../types/config';

type ResponseT<T> = {status: "loading"} | {status: "error", "message": string} | {status: "ok", "data": T};


///// React Query helper functions


export function isErrorResponse<T>(data: T | APIError): data is APIError {
  // Return true if JSON response represents an error message.
  return (data && 'message' in data && 'status' in data &&
          typeof data.status === "number" && (data.status >= 400) &&
          data.status < 600);
}

function useTypedQuery<T>(queryKey: string, url: string, options?: Object) {
  // Call useQuery, parse JSON, return the fields we want with the right types.
  const useQueryResponse = useQuery(
    queryKey,
    () => fetch(url).then(r => r.json()),
    options);

  const response = useQueryResponse.data as (T | APIError);
  return {status: useQueryResponse.status, error: useQueryResponse.error, response};
}


function useTypedResponse<T>(queryKey: string, url: string, options?: Object): ResponseT<T> {
  // Unpick various error states.
  const { status, error, response } = useTypedQuery<T>(queryKey, url, options);

  if (status === 'error') {
    return {status: "error", message: error as string};
  }

  if (status === 'loading') {
    return {status: "loading"};
  }

  if (status === 'success') {
    if (isErrorResponse(response)) {
      return {status: "error", message: `Response status ${response.status}`};
    } else {
      return {status: "ok", data: response};
    }
  }

  return {status: "error", message: `Unknown error (${status}`};
}


////// API calls


export function useBootstrap(): ResponseT<Bootstrap> {
  return useTypedResponse<Bootstrap>(
    'bootstrap',
    '/bootstrap/lizard/',
    {retry: false}
  );
}


export function useTimeseriesAlarms(): ResponseT<Paginated<TimeseriesAlarm>> {
  return useTypedResponse<Paginated<TimeseriesAlarm>>(
    'timeseriesalarms',
    '/api/v4/timeseriesalarms/?organisation__uuid=33b32fe8-0317-4390-9ef9-259744c32cc1',
    {retry: false, refetchInterval: 300000});
}

export function useConfig(): ResponseT<Config> {
  return useTypedResponse<Config>(
    'config',
    '/api/v4/clientconfigs/8/',
    {retry: false}
  );
}
