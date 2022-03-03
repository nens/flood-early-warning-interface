import { QUERY_OPTIONS, fetchWithError, FetchError } from "./hooks";
import { useQuery } from "react-query";
import { LatLng } from "leaflet";
import { FeatureCollection } from "geojson";
import { combineUrlAndParams } from "../util/http";

export interface ClickProps {
  bbox: string;
  position: LatLng;
  width: number;
  height: number;
  x: number;
  y: number;
}

export function useFeatureInfo(url: string, layer: string, click: ClickProps) {
  const { bbox, width, height, x, y } = click;

  const proxiedUrl = `/proxy/${url}`;

  const response = useQuery<FeatureCollection, FetchError>(
    `feature-info-${url}-${layer}-${width}-${height}-${x}-${y}`,
    () =>
      fetchWithError(
        combineUrlAndParams(proxiedUrl, {
          SERVICE: "WMS",
          REQUEST: "GetFeatureInfo",
          SRS: "EPSG:4326",
          VERSION: "1.1.1",
          INFO_FORMAT: "application/json",
          BBOX: bbox,
          HEIGHT: "" + height,
          WIDTH: "" + width,
          LAYERS: layer,
          QUERY_LAYERS: layer,
          FEATURE_COUNT: "100",
          X: "" + x,
          Y: "" + y,
        })
      ),
    QUERY_OPTIONS
  );

  if (response.status !== "success") return null;

  if (!response.data.features || response.data.features.length === 0) return null;

  return response.data.features[0].properties;
}
