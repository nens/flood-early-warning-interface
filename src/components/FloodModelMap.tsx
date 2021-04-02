import React, { useContext, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import { BoundingBox } from '../util/bounds';
import { getMapBackgrounds } from '../constants';
import { useConfigContext } from '../providers/ConfigProvider';
import { useRectContext } from '../providers/RectProvider';
import { TimeContext } from '../providers/TimeProvider';
import { useRasterMetadata } from '../api/hooks';
import MapSelectBox from './MapSelectBox';
import FloodModelPopup from './FloodModelPopup';

type TimePeriod = [string, number];

const TIME_PERIODS: TimePeriod[] = [
  ["T0", 0],
  ["T0 + 4h", 4 * 60 * 60 * 1000],
  ["T0 + 8h", 8 * 60 * 60 * 1000],
  ["T0 + 12h", 12 * 60 * 60 * 1000]
];

function FloodModelMap() {
  const { bounding_box, mapbox_access_token, rasters } = useConfigContext();
  const rect = useRectContext();
  const rasterResponse = useRasterMetadata([rasters.operationalModelDepth]);
  const { now } = useContext(TimeContext);
  const [currentPeriod, setCurrentPeriod] = useState<string>("T0");

  if (!rect.width || !rect.height) return null; // Too early

  const bounds = new BoundingBox(...bounding_box);
  const mapBackgrounds = getMapBackgrounds(mapbox_access_token);

  let wmsLayer = null;
  let raster = null;
  let time = now;

  const selectedTimePeriod = TIME_PERIODS.find(period => period[0] === currentPeriod);
  if (selectedTimePeriod) {
    time = new Date(time.getTime() + selectedTimePeriod[1]);
  } else {
    console.error("TIME PERIOD NOT FOUND");
  }

  if (rasterResponse.success && rasterResponse.data.length > 0) {
    raster = rasterResponse.data[0];
    wmsLayer = (
      <WMSTileLayer
        url={raster.wms_info.endpoint}
        params={{
          layers: raster.wms_info.layer,
          styles: raster.options.styles,
          // @ts-ignore -- TS definitions don't know time parameter
          time: time.toISOString(),
          opacity: 0.8
        }}
      />
    );
  }

  return (
    <>
      <MapSelectBox
        options={TIME_PERIODS.map(period => [period[0], period[0]])}
        currentValue={currentPeriod}
        setValue={setCurrentPeriod}
      />
      <MapContainer
        key={`${rect.width}x${rect.height}${time.getTime()}`}
        bounds={bounds.toLeafletBounds()}
        style={{height: rect.height, width: rect.width}}
      >
        <TileLayer url={mapBackgrounds[1].url} />
        {wmsLayer}
        {raster !== null ? <FloodModelPopup raster={raster.uuid} time={time} /> : null}
      </MapContainer>
    </>
  );
}

export default FloodModelMap;
