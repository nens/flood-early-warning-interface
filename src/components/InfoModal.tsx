import ReactMarkdown from "react-markdown";
import Modal from "./Modal";

interface InfoModalProps {
  closeFunction: () => void;
  title: string;
  markdownText: string;
  imageUrl: string;
}

function InfoModal(props: InfoModalProps) {
  const { closeFunction, title, markdownText, imageUrl } = props;

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
