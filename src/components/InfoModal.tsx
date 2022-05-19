import { useContext } from "react";
import ReactMarkdown from "react-markdown";
import { ConfigContext } from "../providers/ConfigProvider";
import Modal from "./Modal";

interface InfoModalProps {
  closeFunction: () => void;
}

function InfoModal(props: InfoModalProps) {
  const { closeFunction } = props;
  const { config } = useContext(ConfigContext);

  if (!config) return null;

  return (
    <Modal close={closeFunction} title="About this dashboard">
      {config.infoImage ? (
        <img
          alt="Logos of contributing organizations"
          style={{
            display: "block",
            margin: "auto",
            width: "90%",
          }}
          src={config.infoImage}
        />
      ) : null}
      <ReactMarkdown children={config.infoText!} />
    </Modal>
  );
}

export default InfoModal;
