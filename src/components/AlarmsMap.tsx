import React, { useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { Feature, Polygon } from 'geojson';
import { RasterAlarm } from '../types/api';
import { BoundingBox, pointInPolygon } from '../util/bounds';
import { getMapBackgrounds } from '../constants';
import { useConfigContext } from '../providers/ConfigProvider';
import { useRectContext } from '../providers/RectProvider';
import WarningAreaPolygon from './WarningAreaPolygon';

interface MapProps {
  alarms: RasterAlarm[];
  hoverArea: string | null,
  setHoverArea: (uuid: string | null) => void
}

function findAlarmForFeature(alarms: RasterAlarm[], feature: Feature | undefined) {
  if (!feature || feature.geometry.type !== 'Polygon') {
    return null;
  }

  return alarms.find(
    alarm => pointInPolygon(alarm.geometry, feature.geometry as any as Polygon)
  ) || null;
}

function AlarmsMap({ alarms, hoverArea, setHoverArea }: MapProps) {
  const config = useConfigContext();
  const rect = useRectContext();

  const getFeatureStyle = useCallback(
    (feature: Feature | undefined) => {
      if (feature === undefined || feature === null) return {};

      const alarm = findAlarmForFeature(alarms, feature);
      const highlight = feature.id === hoverArea;

      if (alarm) {
        const warning_level = alarm.latest_trigger.warning_level;
        if (warning_level && ['Minor', 'Moderate', 'Major'].indexOf(warning_level) !== -1) {
          return {
            color: `var(--trigger-${warning_level.toLowerCase()})`,
            fillOpacity: highlight ? 0.7 : 0.5,
            opacity: highlight ? 1 : 0.5
          }
        }
      }

      return {
        color: "grey",
        fillOpacity: highlight ? 0.7 : 0.5,
        opacity: highlight ? 1 : 0.5
      };
    }, [alarms, hoverArea]);

  const bounds = new BoundingBox(...config.bounding_box);
  const mapBackgrounds = getMapBackgrounds(config.mapbox_access_token);

  if (!rect.width || !rect.height) return null; // Too early

  return (
    <MapContainer
      key={`${rect.width}x${rect.height}`}
      bounds={bounds.toLeafletBounds()}
      style={{height: rect.height, width: rect.width}}
    >
      <TileLayer url={mapBackgrounds[1].url} />
      {config.flood_warning_areas.features.map((warningArea, idx) => (
        <WarningAreaPolygon
          key={`${idx}${warningArea.properties.id}`}
          warningArea={warningArea}
          hover={hoverArea === warningArea.id!}
          onHover={setHoverArea}
          alarm={findAlarmForFeature(alarms, warningArea)}
        />
      ))}
    </MapContainer>
  );
}

export default AlarmsMap;
