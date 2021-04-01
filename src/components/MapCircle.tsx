import React from 'react';
import * as L from 'leaflet';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { TRIGGER_LEVELS } from '../constants';
import { useClickToTimeseries } from '../util/config';

interface MapCircleProps {
  position: L.LatLngExpression;
  label?: string | null;
  triggerLevel?: string | null;
  clickToTimeseriesUuid?: string | null;
}

function MapCircle({position, clickToTimeseriesUuid, label, triggerLevel}: MapCircleProps) {
  const onClick = useClickToTimeseries(clickToTimeseriesUuid || "");
  const trigger = (triggerLevel && TRIGGER_LEVELS.indexOf(triggerLevel.toLowerCase()) !== -1 ?
                   `var(--trigger-${triggerLevel.toLowerCase()})` :
                   'var(--trigger-none)');
  return (
    <CircleMarker
      center={position}
      eventHandlers={{click: () => { console.log('Click!'); onClick()}}}
      radius={10}
      color={trigger}
      fillColor={trigger}
      fillOpacity={1}
      key={triggerLevel}
    >
      {label ? <Tooltip permanent>{label}</Tooltip> : null}
    </CircleMarker>
  );
}

export default MapCircle;
