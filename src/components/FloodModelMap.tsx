import React, { useContext, useState } from "react";
import { MapContainer, Pane, TileLayer, WMSTileLayer } from "react-leaflet";
import { getCorrectTextColor } from "./Legend";
import { BoundingBox } from "../util/bounds";
import { getMapBackgrounds } from "../constants";
import { ExtraRasters } from "../types/config";
import { useConfigContext } from "../providers/ConfigProvider";
import { useRectContext } from "../providers/RectProvider";
import { TimeContext } from "../providers/TimeProvider";
import { useRasterMetadata } from "../api/hooks";
import MapSelectBox from "./MapSelectBox";
import FloodModelPopup from "./FloodModelPopup";
import LizardRasterLegend from "./LizardRasterLegend";

type TimePeriod = [string, number];

const TIME_PERIODS: TimePeriod[] = [
  ["T0", 0],
  ["T0 + 4h", 4 * 60 * 60 * 1000],
  ["T0 + 8h", 8 * 60 * 60 * 1000],
  ["T0 + 12h", 12 * 60 * 60 * 1000],
];

function FloodModelMap() {
  const { boundingBoxes, mapbox_access_token, rasters, wmsLayers } = useConfigContext();
  const rect = useRectContext();
  const rasterResponse = useRasterMetadata([rasters.operationalModelDepth]);
  const { now } = useContext(TimeContext);
  const { extraRasters } = useConfigContext();

  const allExtraRasters: ExtraRasters["maps"] = {
    "": { title: extraRasters.title, uuid: "", color: "" },
    ...extraRasters.maps,
  };

  const [currentPeriod, setCurrentPeriod] = useState<string>("T0");
  const [extraRasterTitle, setExtraRasterTitle] = useState<string>("");

  const extraRaster = allExtraRasters[extraRasterTitle] || null;
  const extraRasterResponse = useRasterMetadata(
    extraRaster && extraRaster.uuid ? [extraRaster.uuid] : []
  );

  if (!rect.width || !rect.height) return null; // Too early

  const bounds = new BoundingBox(...(boundingBoxes.floodModelMap || boundingBoxes.default));
  const mapBackgrounds = getMapBackgrounds(mapbox_access_token);

  let wmsLayer = null;
  let extraRasterLayer = null;
  let buildingsLayer = null;
  let legend = null;
  let raster = null;
  let time = now;

  const selectedTimePeriod = TIME_PERIODS.find((period) => period[0] === currentPeriod);
  if (selectedTimePeriod) {
    time = new Date(time.getTime() + selectedTimePeriod[1]);
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
          opacity: 0.8,
        }}
      />
    );

    legend = (
      <LizardRasterLegend
        url={raster.wms_info.endpoint}
        layer={raster.wms_info.layer}
        styles={raster.options.styles}
      />
    );
  }

  if (wmsLayers && wmsLayers.buildingsForFloodMap) {
    const layer = wmsLayers.buildingsForFloodMap;

    buildingsLayer = (
      <WMSTileLayer
        url={layer.wms}
        layers={layer.layer}
        styles={layer.styles}
        format="image/png"
        transparent
      />
    );
  }

  if (extraRasterResponse.success && extraRasterResponse.data.length > 0) {
    const extraRasterMetadata = extraRasterResponse.data[0];

    extraRasterLayer = (
      <WMSTileLayer
        key={extraRasterMetadata.wms_info.layer}
        url={extraRasterMetadata.wms_info.endpoint}
        layers={extraRasterMetadata.wms_info.layer}
        styles={extraRasterMetadata.options.styles}
        format="image/png"
        opacity={0.6}
        transparent
      />
    );
  }

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MapSelectBox
          options={TIME_PERIODS.map((period) => [period[0], period[0]])}
          currentValue={currentPeriod}
          setValue={setCurrentPeriod}
        />
        {Object.keys(extraRasters.maps).length > 0 ? (
          <MapSelectBox
            options={Object.values(allExtraRasters).map((extent) => [extent.title, extent.title])}
            currentValue={extraRasterTitle}
            setValue={setExtraRasterTitle}
          />
        ) : null}
        {extraRasterLayer ? (
          <div
            style={{
              backgroundColor: allExtraRasters[extraRasterTitle].color,
              color: getCorrectTextColor(allExtraRasters[extraRasterTitle].color),
              padding: "0.5rem",
            }}
            key={extraRasterTitle}
          >
            {extraRasters.title}: {extraRasterTitle}
          </div>
        ) : null}
      </div>
      {legend}
      <MapContainer
        key={`${rect.width}x${rect.height}${time.getTime()}`}
        bounds={bounds.toLeafletBounds()}
        style={{ height: rect.height, width: rect.width }}
      >
        {/* By default, all these layers are in Leaflet's "tile pane", which has z-index 200. */}
        {/* We want the extra extent layer between the map background and the rest */}
        <TileLayer url={mapBackgrounds[1].url} />
        {extraRasterLayer ? (
          <Pane name="extra extent pane" style={{ zIndex: 210 }}>
            {extraRasterLayer}
          </Pane>
        ) : null}
        <Pane name="data pane" style={{ zIndex: 220 }}>
          {buildingsLayer}
          {wmsLayer}
        </Pane>
        {raster !== null ? <FloodModelPopup raster={raster.uuid} time={time} /> : null}
      </MapContainer>
    </>
  );
}

export default FloodModelMap;
