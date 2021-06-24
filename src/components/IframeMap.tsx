import { useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, CircleMarker } from 'react-leaflet';
import { MeasuringStation } from '../types/api';
import { BoundingBox } from '../util/bounds';
import { getMapBackgrounds } from '../constants';
import { useConfigContext } from '../providers/ConfigProvider';
import { useRectContext } from '../providers/RectProvider';
import { useMeasuringStations } from '../api/hooks';
import StationPopup from './StationPopup';

function IframeMap(props: {setClickedStation: (station: MeasuringStation|null) => void}) {
  const { setClickedStation } = props;

  const config = useConfigContext();
  const rect = useRectContext();
  const [station, setStation] = useState<MeasuringStation | null>(null);

  const boundingBoxes = config.boundingBoxes;
  const bounds = new BoundingBox(...(boundingBoxes.warningAreas || boundingBoxes.default));
  const mapBackgrounds = getMapBackgrounds(config.mapbox_access_token);

  const measuringStations = useMeasuringStations();

  if (measuringStations.status !== 'success') {
    return null;
  }

  const stations = measuringStations.data.results;

  return (
    <MapContainer
      key={`${rect.width}x${rect.height}`}
      bounds={bounds.toLeafletBounds()}
      style={{height: rect.height, width: rect.width}}
    >
      <TileLayer url={mapBackgrounds[1].url} />
      <WMSTileLayer
        url="https://geoserver9.lizard.net/geoserver/parramatta/wms?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1"
        layers="gauges"
        format="image/png"
        transparent={true}
        zIndex={5000}
      />
      <WMSTileLayer
        url="https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms?service=WMS&request=GetMap"
        layers="v0227_parramatta_rainfall_db:v0227_parramatta_river"
        format="image/png"
        transparent={true}
        zIndex={10}
      />
      <WMSTileLayer
        url="https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms?service=WMS&request=GetMap"
        layers="v0227_parramatta_rainfall_db:v0227_parramatta_creeks"
        format="image/png"
        transparent={true}
        zIndex={10}
      />
      <WMSTileLayer
        url="https://geoserver9.lizard.net/geoserver/parramatta/wms?service=WMS&request=GetMap"
        layers="lga_parra"
        format="image/png"
        transparent={true}
        zIndex={10}
      />
      {stations.map(station => {
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
      })}
      {station !== null &&
       <StationPopup
         station={station}
         onClose={() => setStation(null)}
         setClickedStation={setClickedStation}
       />
      }
    </MapContainer>
  );
}

export default IframeMap;
