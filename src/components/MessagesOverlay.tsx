import { FC, useContext } from "react";
import TileOverlay from "../components/TileOverlay";
import { HoverAndSelectContext } from "../providers/HoverAndSelectProvider";
import MessagesFor from "./MessagesFor";

const MessagesOverlay: FC<{}> = () => {
  const { select, setSelect } = useContext(HoverAndSelectContext);

  return (
    <TileOverlay
      title={`Messages for ${select?.name}`}
      open={select !== null}
      height="30%"
      x={() => setSelect(null)}
    >
      {select !== null ? <MessagesFor uuid={select.id} /> : null}
    </TileOverlay>
  );
};

export default MessagesOverlay;
