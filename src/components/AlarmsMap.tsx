import React, { useContext } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Polygon } from "geojson";
import { RasterAlarm } from "../types/api";
import { BoundingBox, pointInPolygon } from "../util/bounds";
import { getMapBackgrounds } from "../constants";
import { useConfigContext } from "../providers/ConfigProvider";
import { useRectContext } from "../providers/RectProvider";
import { WarningArea } from "../types/config";
import WarningAreaPolygon from "./WarningAreaPolygon";
import MapCircle from "./MapCircle";
import { HoverAndSelectContext } from "../providers/HoverAndSelectProvider";

interface MapProps {
  alarms: RasterAlarm[];
}

function findAlarmForFeature(alarms: RasterAlarm[], feature: WarningArea | undefined) {
  if (!feature || feature.geometry.type !== "Polygon") {
    return null;
  }

  return (
    alarms.find((alarm) => pointInPolygon(alarm.geometry, feature.geometry as any as Polygon)) ||
    null
  );
}

function findFeatureForAlarm(alarm: RasterAlarm, features: WarningArea[]) {
  return (
    features.find((feature) =>
      pointInPolygon(alarm.geometry, feature.geometry as any as Polygon)
    ) || null
  );
}

function AlarmsMap({ alarms }: MapProps) {
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
      {alarms.map((alarm) => {
        const warningArea = findFeatureForAlarm(alarm, config.flood_warning_areas.features);
        return (
          <MapCircle
            key={`${alarm.uuid}${alarm.latest_trigger.warning_level}`}
            position={[alarm.geometry.coordinates[1], alarm.geometry.coordinates[0]]}
            triggerLevel={alarm.latest_trigger.warning_level}
            clickToTimeseriesUuid={warningArea ? warningArea.properties.timeseries : null}
          />
        );
      })}
      {config.flood_warning_areas.features.map((warningArea, idx) => (
        <WarningAreaPolygon
          key={`${idx}${warningArea.properties.id}`}
          warningArea={warningArea}
          hover={hover?.id === warningArea.id!}
          onHover={() => setHover({ id: "" + warningArea.id!, name: warningArea.properties.name })}
          alarm={findAlarmForFeature(alarms, warningArea)}
          clickToTimeseriesUuid={warningArea.properties.timeseries}
        />
      ))}
    </MapContainer>
  );
}

export default AlarmsMap;
