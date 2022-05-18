import { useContext } from "react";
import ReactMarkdown from "react-markdown";
import { ConfigContext } from "../providers/ConfigProvider";
import Modal from "./Modal";

interface InfoModalProps {
  closeFunction: () => void;
}

function InfoModal(props: InfoModalProps) {
  const { closeFunction } = props;
  const configContext = useContext(ConfigContext);
  const { config } = configContext;

  if (!config) return null;

  return (
    <Modal close={closeFunction} title="About this dashboard">
      {configContext.currentConfigSlug === "dashboardconfig" ? (
        <img
          alt="Logos of contributing organizations"
          style={{
            display: "block",
            margin: "auto",
            width: "90%",
          }}
          src="static/logos-parramatta.png"
        />
      ) : null}
      <ReactMarkdown>{config.infoText}</ReactMarkdown>
    </Modal>
  );
}

export default InfoModal;
