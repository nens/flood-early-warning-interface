import React, { useState } from "react";
import { MapContainer, TileLayer, WMSTileLayer } from "react-leaflet";
import { BoundingBox } from "../util/bounds";
import { getMapBackgrounds } from "../constants";
import { useConfigContext } from "../providers/ConfigProvider";
import { useRectContext } from "../providers/RectProvider";
import MapSelectBox from "./MapSelectBox";
import GeoserverGetFeatureInfoPopup from "./GeoserverGetFeatureInfoPopup";
import DesignStormsButton from "./DesignStormsButton";
import Legend from "./Legend";

function RainMap() {
  const { boundingBoxes, mapbox_access_token, rainfallWmsLayers, rainLegend } = useConfigContext();
  const rect = useRectContext();
  const [currentLayer, setCurrentLayer] = useState<string>(
    rainfallWmsLayers && rainfallWmsLayers.length ? rainfallWmsLayers[0].wms_layers : ""
  );

  if (!rect.width || !rect.height) return null; // Too early

  const bounds = new BoundingBox(...(boundingBoxes.rainMap || boundingBoxes.default));
  const mapBackgrounds = getMapBackgrounds(mapbox_access_token);

  let wmsTileLayer = null;
  let geoserverFeatureInfo = null;
  let wmsLayerSelect = null;
  if (rainfallWmsLayers && rainfallWmsLayers.length) {
    wmsLayerSelect = (
      <MapSelectBox
        options={rainfallWmsLayers.map((layer) => [layer.wms_layers, layer.title])}
        currentValue={currentLayer}
        setValue={setCurrentLayer}
      />
    );

    const selectedLayer = rainfallWmsLayers.find((layer) => layer.wms_layers === currentLayer);

    if (selectedLayer) {
      wmsTileLayer = (
        <WMSTileLayer
          url={selectedLayer.wms_url}
          layers={selectedLayer.wms_layers}
          key={selectedLayer.wms_layers}
          format={"image/png"}
          transparent={true}
        />
      );
      geoserverFeatureInfo = (
        <GeoserverGetFeatureInfoPopup
          url={selectedLayer.wms_url}
          layer={selectedLayer.wms_layers}
        />
      );
    }
  }

  return (
    <>
      {wmsLayerSelect}
      <DesignStormsButton />
      <Legend steps={rainLegend} />
      <MapContainer
        key={`${rect.width}x${rect.height}`}
        bounds={bounds.toLeafletBounds()}
        style={{ height: rect.height, width: rect.width }}
      >
        <TileLayer url={mapBackgrounds[1].url} />
        {wmsTileLayer}
        {geoserverFeatureInfo}
      </MapContainer>
    </>
  );
}

export default RainMap;
