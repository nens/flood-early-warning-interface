import styles from "../components/Tile.module.css";
import Tile from "../components/Tile";
import AlarmsMap from "../components/AlarmsMap";
import AlarmsTable from "../components/AlarmsTable";
import MessagesOverlay from "../components/MessagesOverlay";
import { useRasterAlarms } from "../api/hooks";
import { isGaugeAlarm } from "../util/rasterAlarms";
import HoverAndSelectProvider from "../providers/HoverAndSelectProvider";

function AlarmsTab() {
  const response = useRasterAlarms();

  if (response.status === "success") {
    const alarms = response.data!;

    const gaugeAlarms = alarms.results.filter(isGaugeAlarm);

    return (
      <HoverAndSelectProvider>
        <div className={styles.TileList}>
          <Tile title="Alarms" size="large" rightText="Trigger levels (mAHD)">
            <AlarmsTable alarms={gaugeAlarms} />
          </Tile>
          <Tile title="Map" size="large">
            <AlarmsMap alarms={gaugeAlarms} />
            <MessagesOverlay />
          </Tile>
        </div>
      </HoverAndSelectProvider>
    );
  } else {
    return <p>Fetching alarms status...</p>;
  }
}

export default AlarmsTab;
