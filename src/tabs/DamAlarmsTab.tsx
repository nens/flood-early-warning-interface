import styles from "../components/Tile.module.css";
import Tile from "../components/Tile";
import DamAlarmsMap from "../components/DamAlarmsMap";
import DamAlarmsTable from "../components/DamAlarmsTable";
import { useRasterAlarms } from "../api/hooks";
import { isDamAlarm } from "../util/rasterAlarms";
import { useConfigContext } from "../providers/ConfigProvider";
import MessagesOverlay from "../components/MessagesOverlay";
import HoverAndSelectProvider from "../providers/HoverAndSelectProvider";

function DamAlarmsTab() {
  const response = useRasterAlarms();
  const { dams } = useConfigContext();

  if (response.status === "success") {
    const alarms = response.data!;

    const damAlarms = alarms.results.filter(isDamAlarm);

    return (
      <HoverAndSelectProvider>
        <div className={styles.TileList}>
          <Tile title="Alarms" size="large" rightText="DSEP triggers (mAHD)">
            <DamAlarmsTable dams={dams.features} damAlarms={damAlarms} />
          </Tile>
          <Tile title="Map" size="large">
            <DamAlarmsMap dams={dams.features} alarms={damAlarms} />
            <MessagesOverlay />
          </Tile>
        </div>
      </HoverAndSelectProvider>
    );
  } else {
    return <p>Fetching alarms status...</p>;
  }
}

export default DamAlarmsTab;
