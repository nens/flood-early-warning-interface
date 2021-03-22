import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { BoundingBox } from '../util/bounds';
import { getMapBackgrounds } from '../constants';
import { useConfigContext } from '../providers/ConfigProvider';
import { useRectContext } from '../providers/RectProvider';

function RainMap() {
  const { bounding_box, mapbox_access_token } = useConfigContext();
  const rect = useRectContext();

  if (!rect.width || !rect.height) return null; // Too early

  const bounds = new BoundingBox(...bounding_box);
  const mapBackgrounds = getMapBackgrounds(mapbox_access_token);

  return (
    <MapContainer
      key={`${rect.width}x${rect.height}`}
      bounds={bounds.toLeafletBounds()}
      style={{height: rect.height, width: rect.width}}
    >
      <TileLayer url={mapBackgrounds[1].url} />
    </MapContainer>
  );
}

export default RainMap;
