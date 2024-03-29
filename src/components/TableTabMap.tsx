import React, { useContext } from "react";
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Tooltip } from "react-leaflet";
import { TableTabConfig, TableTabRowConfig } from "../types/config";
import { Feature, FeatureCollection, Position } from "geojson";
import { BoundingBox } from "../util/bounds";
import { getMapBackgrounds } from "../constants";
import { useConfigContext } from "../providers/ConfigProvider";
import { useRectContext } from "../providers/RectProvider";
import { HoverAndSelectContext, Area } from "../providers/HoverAndSelectProvider";
import { LatLngExpression } from "leaflet";
import { useClickOnTableRow } from "./TableTabTable";
import { useAlarm } from "../api/hooks";
import { configThresholdForLevel } from "../util/config";
import If from "./If";

function geojsonToLatLngs(ps: Position[]): LatLngExpression[] {
  return ps.map((point) => [point[1], point[0]] as LatLngExpression);
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
      {tabConfig.rows.map((row) => (
        <FeaturesForRow
          key={row.uuid}
          tabConfig={tabConfig}
          row={row}
          area={hover}
          setArea={setHover}
        />
      ))}
    </MapContainer>
  );
}

function FeaturesForRow({
  tabConfig,
  row,
  area,
  setArea,
}: {
  tabConfig: TableTabConfig;
  row: TableTabRowConfig;
  area: Area;
  setArea: (area: Area) => void;
}) {
  const hover = row.uuid === area?.id;
  const alarm = useAlarm(row.alarmUuid, tabConfig.general.alarmType);

  const threshold = configThresholdForLevel(tabConfig, alarm?.latest_trigger.warning_level ?? "");
  const color = threshold?.color ?? "var(--trigger-none)";
  const rowClick = useClickOnTableRow(row, false);

  const mapLabel = tabConfig.general.mapLabels || "all";
  const showTooltip = mapLabel === "all" || (mapLabel === "onhover" && hover);

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

  const eventHandlers: L.LeafletEventHandlerFnMap = {
    click: rowClick,
    mouseover: () => setArea({ id: row.uuid, name: row.name }),
    mouseout: () => setArea(null),
  };

  return (
    <>
      {features.map((feature, idx) => {
        if (feature.geometry.type === "Polygon") {
          return (
            <Polygon
              key={row.uuid + idx + hover + color}
              positions={[geojsonToLatLngs(feature.geometry.coordinates[0])]}
              eventHandlers={eventHandlers}
              fillOpacity={hover ? 0.8 : 0.4}
              opacity={hover ? 1 : 0.5}
              color={color}
            >
              <If test={showTooltip}>
                <Tooltip permanent>{row.name}</Tooltip>
              </If>
            </Polygon>
          );
        } else if (feature.geometry.type === "LineString") {
          return (
            <Polyline
              key={row.uuid + idx + hover + color}
              positions={geojsonToLatLngs(feature.geometry.coordinates)}
              pathOptions={{ opacity: hover ? 1 : 0.5, color }}
              eventHandlers={eventHandlers}
            >
              <If test={showTooltip}>
                <Tooltip permanent>{row.name}</Tooltip>
              </If>
            </Polyline>
          );
        }
        return null;
      })}
      {row.lat && row.lng ? (
        <CircleMarker
          center={[row.lng, row.lat]}
          radius={10}
          eventHandlers={eventHandlers}
          fillOpacity={hover ? 1 : 0.7}
          color={color}
          key={`${hover}${color}`}
        >
          {features.length === 0 && showTooltip ? <Tooltip permanent>{row.name}</Tooltip> : null}
        </CircleMarker>
      ) : null}
    </>
  );
}

export default TableTabMap;
