import React, { useContext, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { Feature, Polygon } from 'geojson';
import { RasterAlarm } from '../types/api';
import { BoundingBox, pointInPolygon } from '../util/bounds';
import { useConfig } from '../api/hooks';
import { getMapBackgrounds } from '../constants';
import { RectContext } from '../providers/RectProvider';
import { RectResult } from '../util/hooks';


interface MapProps {
  alarms: RasterAlarm[];
  hoverAlarm: string | null,
  setHoverAlarm: (uuid: string | null) => void
}

function findAlarmForFeature(alarms: RasterAlarm[], feature: Feature | undefined) {
  if (!feature || feature.geometry.type !== 'Polygon') {
    return null;
  }

  return alarms.find(
    alarm => pointInPolygon(alarm.geometry, feature.geometry as any as Polygon)
  );
}

function AlarmsMap({ alarms, hoverAlarm, setHoverAlarm }: MapProps) {
  const configResult = useConfig();
  const { rect } = useContext(RectContext) as {rect: RectResult};

  console.log('HoverAlarm: ', hoverAlarm);

  const getFeatureStyle = useCallback(
    (feature: Feature | undefined) => {
      const alarm = findAlarmForFeature(alarms, feature);

      const highlight = alarm && alarm.uuid === hoverAlarm;

      if (alarm) {
        const warning_level = alarm.latest_trigger.warning_level;
        console.log("Styling alarm!");
        if (warning_level) {
          return {
            color: `var(--trigger-${warning_level})`,
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
    }, [alarms, hoverAlarm]);

  const setHoverEffects = useCallback(
    (feature: Feature<Polygon>, layer) => {
      const alarm = findAlarmForFeature(alarms, feature);

      if (alarm) {
        layer.on({
          mouseover: () => setHoverAlarm(alarm.uuid),
          mouseout: () => setHoverAlarm(null)
        });
      }
    }, [alarms, setHoverAlarm]);

  if (configResult.isFetching || configResult.isError || !configResult.data) return null;
  const config = configResult.data.clientconfig.configuration;

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
      <GeoJSON
        // Key is a trick to let layer redraw when hoverAlarm changes
        key={"warning_areas" + alarms.length + hoverAlarm}
        data={config.flood_warning_areas}
        style={getFeatureStyle}
        onEachFeature={setHoverEffects}
      />
    </MapContainer>
  );
}

export default AlarmsMap;
