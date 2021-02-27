import React, { useContext } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { BoundingBox } from '../util/bounds';
import { useConfig } from '../api/hooks';
import { getMapBackgrounds } from '../constants';
import { RectContext } from '../providers/RectProvider';
import { RectResult } from '../util/hooks';


function AlarmsMap() {
  const configResult = useConfig();
  const { rect } = useContext(RectContext) as {rect: RectResult};
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
      <GeoJSON data={config.flood_warning_areas} />
    </MapContainer>
  );
}

export default AlarmsMap;
