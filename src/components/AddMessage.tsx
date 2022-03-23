import { FC, useState } from "react";
import { useUserHasRole } from "../api/hooks";
import { useChangeMessages } from "../api/messages";

import styles from "./Messages.module.css";

const AddMessage: FC<{ uuid: string }> = ({ uuid }) => {
  const isAdmin = useUserHasRole("admin");
  const [disabled, setDisabled] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState("");

  const { addMessage } = useChangeMessages();

  const onClick = async () => {
    if (!isAdmin || newMessage === "") {
      return;
    }

    setDisabled(true);
    const success = await addMessage(uuid, newMessage);
    if (success) {
      setNewMessage("");
    }
    setDisabled(false);
  };

  return (
    <div className={styles.AddMessage}>
      <input
        type="text"
        value={newMessage}
        onChange={(event) => setNewMessage(event.target.value)}
        disabled={disabled}
        onKeyDown={(event) => event.key === "Enter" && onClick()}
      />
      <input type="button" value="Add" onClick={onClick} disabled={disabled} />
    </div>
  );
};

export default AddMessage;
