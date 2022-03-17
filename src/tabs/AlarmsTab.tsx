import { useState } from "react";

import styles from "../components/Tile.module.css";
import Tile from "../components/Tile";
import TileOverlay from "../components/TileOverlay";
import AlarmsMap from "../components/AlarmsMap";
import AlarmsTable from "../components/AlarmsTable";
import MessagesFor from "../components/MessagesFor";
import { useRasterAlarms } from "../api/hooks";
import { isGaugeAlarm } from "../util/rasterAlarms";

function AlarmsTab() {
  const response = useRasterAlarms();

  const [hoverArea, setHoverArea] = useState<string | null>(null);
  const [messagesArea, setMessagesArea] = useState<string | null>(null);

  if (response.status === "success") {
    const alarms = response.data!;

    const gaugeAlarms = alarms.results.filter(isGaugeAlarm);

    return (
      <div className={styles.TileList}>
        <Tile title="Alarms" size="large" rightText="Trigger levels (mAHD)">
          <AlarmsTable
            alarms={gaugeAlarms}
            hoverArea={messagesArea || hoverArea}
            setHoverArea={setHoverArea}
            messagesArea={messagesArea}
            setMessagesArea={setMessagesArea}
          />
        </Tile>
        <Tile title="Map" size="large">
          <AlarmsMap
            alarms={gaugeAlarms}
            hoverArea={messagesArea || hoverArea}
            setHoverArea={setHoverArea}
          />
          <TileOverlay
            title={`Messages for ${messagesArea}`}
            open={messagesArea !== null}
            height="30%"
            x={() => setMessagesArea(null)}
          >
            {messagesArea !== null ? <MessagesFor uuid={messagesArea} /> : null}
          </TileOverlay>
        </Tile>
      </div>
    );
  } else {
    return <p>Fetching alarms status...</p>;
  }
}

export default AlarmsTab;
