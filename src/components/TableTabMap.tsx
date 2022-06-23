import React, { useContext } from "react";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import { TableTabConfig, TableTabRowConfig } from "../types/config";
import { Feature, FeatureCollection, Position } from "geojson";
import { RasterAlarm } from "../types/api";
import { BoundingBox, pointInPolygon } from "../util/bounds";
import { getMapBackgrounds } from "../constants";
import { useConfigContext } from "../providers/ConfigProvider";
import { useRectContext } from "../providers/RectProvider";
import { WarningArea } from "../types/config";
import WarningAreaPolygon from "./WarningAreaPolygon";
import MapCircle from "./MapCircle";
import { HoverAndSelectContext } from "../providers/HoverAndSelectProvider";
import { LatLng, LatLngExpression } from "leaflet";

function geojsonToLatLngs(ps: Position[]): LatLngExpression[] {
  return ps.map(point => [point[1], point[0]] as LatLngExpression);
}

interface TableTabMapProps {
  tabConfig: TableTabConfig;
}

function TableTabMap({ tabConfig }: TableTabMapProps) {
  const config = useConfigContext();
  const rect = useRectContext();
  const { hover, setHover } = useContext(HoverAndSelectContext);
  const boundingBoxes = config.boundingBoxes;
  const bounds = new BoundingBox(...(boundingBoxes.warningAreas || boundingBoxes.default));
  const mapBackgrounds = getMapBackgrounds(config.mapbox_access_token);

  if (!rect.width || !rect.height) return null; // Too early

  return (
    <MapContainer
      key={`${rect.width}x${rect.height}`}
      bounds={bounds.toLeafletBounds()}
      style={{ height: rect.height, width: rect.width }}
    >
      <TileLayer url={mapBackgrounds[1].url} />
      {tabConfig.rows.map(row => (
        <FeaturesForRow key={row.uuid} row={row} />
      ))}
    </MapContainer>
  );
}

function FeaturesForRow({row}: {row: TableTabRowConfig}) {
  // Draw map things for this feature.
  let features: Feature[] = [];
  try {
    if (row.mapGeometry) {
      const parsed = JSON.parse(row.mapGeometry);
      if (parsed && parsed.type === "Feature") {
        features = [parsed as Feature];
      } else if (parsed && parsed.type === "FeatureCollection") {
        features = (parsed as FeatureCollection).features;
      }
    }
  } catch (e) {
    // Misformed JSON? Can be ignored.
  }

  return (
    <>
      {features.map((feature, idx) => {
        if (feature.geometry.type === "Polygon") {
          const hover = false;
          return (
            <Polygon
              key={row.uuid + idx}
              positions={[geojsonToLatLngs(feature.geometry.coordinates[0])]}
              fillOpacity={hover ? 0.8 : 0.4}
              opacity={hover ? 1 : 0.5}
            />
          );
        }
      })}
    </>
  );
}

export default TableTabMap;
