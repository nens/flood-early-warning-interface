import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Modal from "./Modal";
import { useConfigContext } from "../providers/ConfigProvider";

import styles from "./DesignStormsButton.module.css";

function RainfallModalButton() {
  const [showModal, setShowModal] = useState<boolean>(false);

  const { rainfallModalTitle, rainfallModalContent } = useConfigContext();

  return (
    <>
      <div className={styles.Button} onClick={() => setShowModal(true)}>
        {rainfallModalTitle}
      </div>
      {showModal ? (
        <Modal title={rainfallModalTitle ?? ""} close={() => setShowModal(false)}>
          <ReactMarkdown
            children={rainfallModalContent ?? ""}
            components={{
              /* Open links in new tab */
              a: ({ children, ...props }) => (
                <a target="_blank" {...props}>
                  {children}
                </a>
              ),
            }}
          />
        </Modal>
      ) : null}
    </>
  );
}

export default RainfallModalButton;
