import { Popup } from "react-leaflet";
import { MeasuringStation, Timeseries } from "../types/api";
import { useTimeseriesMetadata } from "../api/hooks";
import { useClickToTimeseries } from "../util/config";

import styles from "./IframeMap.module.css";
import { dashOrNum } from "../util/functions";

interface PopupProps {
  station: MeasuringStation;
  onClose: () => void;
  setClickedStation?: (station: MeasuringStation | null) => void;
}

function TimeseriesRow(props: { ts: Timeseries; onClick: (() => void) | null }) {
  const { ts, onClick } = props;

  const toTimeseries = useClickToTimeseries(ts.uuid);

  const click = onClick || toTimeseries;

  return (
    <tr key={ts.uuid}>
      <td>{ts.name}</td>
      <td>{dashOrNum(ts.last_value)}</td>
      <td>{ts.observation_type.unit ?? ""}</td>
      <td>
        <p>
          {toTimeseries ? (
            <input
              type="button"
              value="View in chart"
              onClick={click ?? undefined}
              style={{ margin: "0" }}
            />
          ) : null}
        </p>
      </td>
    </tr>
  );
}

function StationPopup(props: PopupProps) {
  const { station, onClose, setClickedStation } = props;
  const metadataResponse = useTimeseriesMetadata(station.timeseries.map((ts) => ts.uuid));

  if (!metadataResponse.success) {
    return null;
  }

  return (
    <Popup
      position={[station.geometry.coordinates[1], station.geometry.coordinates[0]]}
      maxWidth={500}
      onClose={onClose}
    >
      <h3>{station.name}</h3>
      <table className={styles.PopupTable}>
        <thead>
          <tr>
            <td>
              <strong>Timeseries name</strong>
            </td>
            <td>
              <strong>Last value</strong>
            </td>
            <td>
              <strong>Unit</strong>
            </td>
            <td>
              <strong>To chart</strong>
            </td>
          </tr>
        </thead>
        <tbody>
          {metadataResponse.data!.map((ts) => (
            <TimeseriesRow
              ts={ts}
              onClick={setClickedStation ? () => setClickedStation(station) : null}
            />
          ))}
        </tbody>
      </table>
    </Popup>
  );
}

export default StationPopup;
