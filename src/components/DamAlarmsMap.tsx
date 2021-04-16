import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Dam } from '../types/config';
import { RasterAlarm } from '../types/api';
import { BoundingBox, isSamePoint } from '../util/bounds';
import { getMapBackgrounds } from '../constants';
import { useConfigContext } from '../providers/ConfigProvider';
import { useRectContext } from '../providers/RectProvider';
import MapCircle from './MapCircle';


interface MapProps {
  dams: Dam[];
  alarms: RasterAlarm[];
  hoverDam: string | null;
  setHoverDam: (uuid: string | null) => void;
}

function findAlarmForFeature(alarms: RasterAlarm[], feature: Dam) {
  return alarms.find(
    alarm => isSamePoint(alarm.geometry, feature.geometry)
  ) || null;
}

function DamAlarmsMap({ dams, alarms, hoverDam, setHoverDam }: MapProps) {
  const config = useConfigContext();
  const rect = useRectContext();
  const boundingBoxes = config.boundingBoxes;
  const bounds = new BoundingBox(...(boundingBoxes.dams || boundingBoxes.default));
  const mapBackgrounds = getMapBackgrounds(config.mapbox_access_token);

  if (!rect.width || !rect.height) return null; // Too early

  return (
    <MapContainer
      key={`${rect.width}x${rect.height}`}
      bounds={bounds.toLeafletBounds()}
      style={{height: rect.height, width: rect.width}}
    >
      <TileLayer url={mapBackgrounds[1].url} />
      {dams.map((dam, damIdx) => {
      const alarm = findAlarmForFeature(alarms, dam);
      return (
      <MapCircle
        key={`${damIdx}${hoverDam === dam.properties.name}`}
        position={[dam.geometry.coordinates[1], dam.geometry.coordinates[0]]}
        clickToTimeseriesUuid={dam.properties.timeseries}
        triggerLevel={alarm ? alarm.latest_trigger.warning_level : null}
        label={dam.properties.name}
        onHover={setHoverDam}
        onHoverId={dam.properties.name}
        hover={hoverDam === dam.properties.name}
        />
        );
        })}
    </MapContainer>
  );
}

export default DamAlarmsMap;
