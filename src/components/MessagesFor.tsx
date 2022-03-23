import { FC } from "react";
import { BiTrash } from "react-icons/bi";

import AddMessage from "../components/AddMessage";
import { useUserHasRole } from "../api/hooks";
import { useChangeMessages, useMessages } from "../api/messages";

import styles from "./Messages.module.css";

export interface MessagesForProps {
  uuid: string;
}

const MessagesFor: FC<MessagesForProps> = ({ uuid }) => {
  const messages = useMessages(uuid);
  const isAdmin = useUserHasRole("admin");
  const { removeMessage } = useChangeMessages();

  // For admins, show the message with a delete button, and who created it and when. For other
  // users simply show the message.
  return (
    <>
      {messages.messages.map((message, idx) =>
        isAdmin ? (
          <div className={styles.MessagesForAdmin} key={`${idx}-${message.message}`}>
            <div className={styles.MessagesForText}>
              <div>{message.message}</div>
              <div>
                <BiTrash
                  size="20px"
                  style={{ cursor: "pointer" }}
                  onClick={() => removeMessage(uuid, idx, message.message)}
                />
              </div>
            </div>
            <div className={styles.MessagesForAttribution}>
              ({message.date} {message.user})
            </div>
          </div>
        ) : (
          <div key={`${idx}-${message.message}`}>{message.message}</div>
        )
      )}
      {isAdmin ? <AddMessage uuid={uuid} /> : null}
    </>
  );
};

export default MessagesFor;
