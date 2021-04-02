import { useState, useContext } from 'react';
import { LatLng } from 'leaflet';
import { useRasterEvents } from '../api/hooks';
import { useMapEvents, Popup } from 'react-leaflet';
import { RasterIntersection } from '../types/tiles';
import { TimeContext } from '../providers/TimeProvider';
import { arrayMin, dashOrNum } from '../util/functions';

interface FloodModelPopupProps {
  raster: string;
  time: Date;
}

function FloodModelPopup({raster, time}: FloodModelPopupProps) {
  console.log('time:', time);
  const [clickLocation, setClickLocation] = useState<LatLng | null>(null);
  const { now, end } = useContext(TimeContext);
  useMapEvents({
    click: (event) => {
      console.log(event);
      setClickLocation(event.latlng);
    }
  });
  const rasterIntersections: RasterIntersection[] =  (
    clickLocation ?
    [{
      uuid: raster,
      geometry: {type: 'Point', coordinates: [clickLocation.lng, clickLocation.lat]}
    }] : []);

  // There is no simple way to get a value only at one time, so get the whole array
  const rasterEventsResponse = useRasterEvents(
    rasterIntersections,
    now,
    end
  );

  if (clickLocation === null) {
    return null;
  }

  const fetched = rasterEventsResponse.success && rasterEventsResponse.data.length;
  let value = null;
  if (fetched) {
    // Then find the value closest to time
    const events = rasterEventsResponse!.data![0]!;
    const closestIndex = arrayMin(
      events,
      event => Math.abs(time.getTime()-event.timestamp.getTime())
    );
    value = events[closestIndex];
  }

  return (
    <Popup position={clickLocation}>
      {fetched ? (value!.value !== null ? (
      <span>Water depth: {dashOrNum(value!.value)}m</span>
      ) : "Water depth: no water") : "Fetching water depth..."}
    </Popup>
  );
}

export default FloodModelPopup;
