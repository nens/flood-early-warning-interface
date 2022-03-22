import { FC, useState } from "react";
import { useUserHasRole } from "../api/hooks";
import { useChangeMessages } from "../api/messages";

const AddMessage: FC<{ uuid: string }> = ({ uuid }) => {
  const isAdmin = useUserHasRole("admin");
  const [enabled, setEnabled] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState("");

  const { addMessage } = useChangeMessages();

  const onClick = async () => {
    if (!isAdmin || newMessage === "") {
      return;
    }

    setEnabled(false);
    const success = await addMessage(uuid, newMessage);
    if (success) {
      setNewMessage("");
    }
    setEnabled(true);
  };

  return (
    <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 5rem" }}>
      <input
        type="text"
        value={newMessage}
        style={{textAlign: "left", margin: 0, marginRight: "1rem"}}
        onChange={(event) => setNewMessage(event.target.value)}
        disabled={!enabled}
        onKeyDown={(event) => event.key === "Enter" && onClick() }
      />
      <input type="button" value="Add" onClick={onClick} disabled={!enabled} />
    </div>
  );
};

export default AddMessage;
