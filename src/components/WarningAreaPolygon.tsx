import React from 'react';
import * as L from 'leaflet';
import { Polygon, Tooltip } from 'react-leaflet';
import { WarningArea } from '../types/config';
import { RasterAlarm } from '../types/api';
import { TRIGGER_LEVELS } from '../constants';
import { useClickToTimeseries } from '../util/config';

interface WarningAreaPolygonProps {
  warningArea: WarningArea;
  hover: boolean;
  onHover: (id: string|null) => void;
  alarm: RasterAlarm | null;
  clickToTimeseriesUuid?: string | null;
}

function WarningAreaPolygon({
  warningArea,
  hover,
  onHover,
  alarm,
  clickToTimeseriesUuid
}: WarningAreaPolygonProps) {
  const onClick = useClickToTimeseries(clickToTimeseriesUuid || "");

  const positions = warningArea.geometry.coordinates[0].map(
    point => [point[1], point[0]] as L.LatLngExpression
  );

  const triggerLevel = alarm ? alarm.latest_trigger.warning_level : null;

  const trigger = (triggerLevel && TRIGGER_LEVELS.indexOf(triggerLevel.toLowerCase()) !== -1 ?
                   `var(--trigger-${triggerLevel.toLowerCase()})` :
                   'var(--trigger-none)');

  return (
    <Polygon
      positions={positions} color={trigger}
      key={""+hover+triggerLevel} // Otherwise it doesn't update
      eventHandlers={{
        mouseover: () => onHover(""+warningArea.id!),
        mouseout: () => onHover(null),
        click: onClick ?? undefined
      }}
      fillOpacity={hover ? 0.7 : 0.5}
      opacity={hover ? 1 : 0.5}
    >
      <Tooltip permanent>{warningArea.properties.name}</Tooltip>
    </Polygon>
  );
}

    export default WarningAreaPolygon;
