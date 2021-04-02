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
  onHover?: (id: string | null) => void;
  onHoverId?: string;
  hover?: boolean
}

function MapCircle({
  position,
  clickToTimeseriesUuid,
  label,
  triggerLevel,
  onHover,
  onHoverId,
  hover=false
}: MapCircleProps) {
  const onClick = useClickToTimeseries(clickToTimeseriesUuid || "");
  const trigger = (triggerLevel && TRIGGER_LEVELS.indexOf(triggerLevel.toLowerCase()) !== -1 ?
                   `var(--trigger-${triggerLevel.toLowerCase()})` :
                   'var(--trigger-none)');

  const eventHandlers: L.LeafletEventHandlerFnMap = {click: onClick};

  if (onHover && onHoverId) {
    eventHandlers.mouseover = () => onHover(onHoverId);
    eventHandlers.mouseout = () => onHover(null);
  }

  return (
    <CircleMarker
      center={position}
      eventHandlers={eventHandlers}
      radius={10}
      color={trigger}
      fillColor={trigger}
      fillOpacity={hover ? 1 : 0.7}
      key={`${triggerLevel}${hover}`}
    >
      {label ? <Tooltip permanent>{label}</Tooltip> : null}
    </CircleMarker>
  );
}

export default MapCircle;
