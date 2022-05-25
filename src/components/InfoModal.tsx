import { useContext } from "react";
import ReactMarkdown from "react-markdown";
import { ConfigContext } from "../providers/ConfigProvider";
import Modal from "./Modal";

interface InfoModalProps {
  closeFunction: () => void;
  title: string;
  markdownText: string;
  imageUrl: string;
}

function InfoModal(props: InfoModalProps) {
  const { closeFunction, title, markdownText, imageUrl } = props;
  const { config } = useContext(ConfigContext);

  if (!config) return null;

  return (
    <Modal close={closeFunction} title={title}>
      {imageUrl ? (
        <img
          alt="Logos of contributing organizations"
          style={{
            display: "block",
            margin: "auto",
            width: "90%",
          }}
          src={imageUrl}
        />
      ) : null}
      <ReactMarkdown children={markdownText} />
    </Modal>
  );
}

export default InfoModal;
