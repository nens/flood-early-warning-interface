import { useRef, useState } from "react";
import { useRect } from "../util/hooks";
import RectProvider from "../providers/RectProvider";
import IframeMap from "../components/IframeMap";
import { MeasuringStation } from "../types/api";
import Tile from "../components/Tile";
import TimeseriesTile from "../components/TimeseriesTile";

function IframeScreen() {
  // We compute the size of the content div and supply it in a context to children
  const contentDivRef = useRef<HTMLDivElement>(null);
  const [clickedStation, setClickedStation] = useState<MeasuringStation | null>(null);
  const rect = useRect(contentDivRef);

  return (
    <RectProvider rect={rect}>
      <div
        ref={contentDivRef}
        style={{
          width: "100%",
          height: "100%",
          position: "fixed",
          border: "none",
          top: 0,
          left: 0,
        }}
      >
        {clickedStation === null && <IframeMap setClickedStation={setClickedStation} />}
        {clickedStation !== null && (
          <Tile size="full" title={clickedStation.name} x={() => setClickedStation(null)}>
            <TimeseriesTile
              tile={{
                // Fake a tile with only the timeseries of this station
                id: -1,
                type: "timeseries",
                colors: [],
                legendStrings: [],
                title: clickedStation.name,
                shortTitle: clickedStation.name,
                timeseries: clickedStation.timeseries.map((ts) => ts.uuid),
              }}
              full
            />
          </Tile>
        )}
      </div>
    </RectProvider>
  );
}

export default IframeScreen;
