import { useState } from "react";
import { useMapEvent, Popup } from "react-leaflet";

import { ClickProps, useFeatureInfo } from "../api/geoserverHooks";
import { useConfigContext } from "../providers/ConfigProvider";

import styles from "./GeoserverGetFeatureInfoPopup.module.css";

interface GeoserverGetFeatureInfoPopupProps {
  url: string;
  layer: string;
}

interface FeatureInfoSubComponentProps {
  url: string;
  layer: string;
  click: ClickProps;
  close: () => void;
}

function GetFeatureInfoSubComponent({ url, layer, click, close }: FeatureInfoSubComponentProps) {
  const config = useConfigContext();

  const featureInfo = useFeatureInfo(url, layer, click);

  if (featureInfo === null) return null;

  return (
    <Popup position={click.position} onClose={close}>
      {config.rainPopupFields.map((field) => (
        <div className={styles.PopupRow} key={field.description}>
          <div className={styles.PopupField}>{field.description}</div>
          <div className={styles.PopupValue}>{featureInfo[field.field]}</div>
        </div>
      ))}
    </Popup>
  );
}

function GeoserverGetFeatureInfoPopup({ url, layer }: GeoserverGetFeatureInfoPopupProps) {
  const [click, setClick] = useState<ClickProps | null>(null);

  const map = useMapEvent("click", (event) => {
    const { x, y } = event.containerPoint;
    const { x: width, y: height } = map.getSize();

    const click = {
      bbox: map.getBounds().toBBoxString(),
      position: event.latlng,
      width: Math.round(width),
      height: Math.round(height),
      x: Math.round(x),
      y: Math.round(y),
    };

    setClick(click);
  });

  if (click === null) return null;

  return (
    <GetFeatureInfoSubComponent
      url={url}
      layer={layer}
      click={click}
      close={() => setClick(null)}
    />
  );
}

export default GeoserverGetFeatureInfoPopup;
