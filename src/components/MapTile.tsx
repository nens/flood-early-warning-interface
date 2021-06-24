import { useContext, useState } from 'react';

import { MapContainer, TileLayer, WMSTileLayer, CircleMarker } from 'react-leaflet';

import { BoundingBox } from '../util/bounds';
import { MapTile } from '../types/tiles';
import { MeasuringStation } from '../types/api';
import { RectContext } from '../providers/RectProvider';
import { RectResult } from '../util/hooks';
import { getMapBackgrounds } from '../constants';
import { useAssetTypes } from '../api/hooks';
import { useConfigContext } from '../providers/ConfigProvider';
import StationPopup from './StationPopup';

interface Props {
  tile: MapTile;
  full?: boolean;
}

function MapTileComponent({tile, full=false}: Props) {
  const config = useConfigContext();
  const { rect } = useContext(RectContext) as {rect: RectResult};
  const [station, setStation] = useState<MeasuringStation | null>(null);

  const wmsLayers = tile.wmsLayers ?? [];
  const assetTypes = tile.assetTypes ?? [];

  const responses = useAssetTypes(assetTypes);

  const boundingBoxes = config.boundingBoxes;
  const bounds = new BoundingBox(...(boundingBoxes.warningAreas || boundingBoxes.default));
  const mapBackgrounds = getMapBackgrounds(config.mapbox_access_token);

  return (
    <MapContainer
      key={`${rect.width}x${rect.height}`}
      bounds={bounds.toLeafletBounds()}
      style={{height: rect.height, width: rect.width}}
    >
      <TileLayer url={mapBackgrounds[1].url} />
      {wmsLayers.map(({
        url,
        layers,
        zindex=10,
        transparent=true
      }) => (
        <WMSTileLayer
          key={url + layers}
          url={url}
          layers={layers}
          format="image/png"
          transparent={transparent}
          zIndex={zindex}
        />
      ))}
      {responses.map(({isSuccess, data}: any) => {
        if (!isSuccess) return null;

        return data.results.map((asset: any) => {
          if (!asset.url.includes('measuringstations')) return null;

          const station: MeasuringStation = asset;

          return (
            <CircleMarker
              center={[station.geometry.coordinates[1], station.geometry.coordinates[0]]}
              radius={10}
              color="blue"
              key={station.id}
              eventHandlers={{
                click: () => setStation(station)
              }}
            >
            </CircleMarker>
          );
        });
      })}
      {full && station !== null ? (
        <StationPopup
          station={station}
          key={station.id}
          onClose={() => setStation(null)}
        />
      ) : null}
    </MapContainer>
  );
}

export default MapTileComponent;
