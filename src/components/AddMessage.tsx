import { FC, useState } from "react";
import { useUserHasRole } from "../api/hooks";
import { useAddMessage } from "../api/messages";

const AddMessage: FC<{ uuid: string }> = ({ uuid }) => {
  const isAdmin = useUserHasRole("admin");
  const [enabled, setEnabled] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState("");

  const { addMessage } = useAddMessage();

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
    <p style={{ width: "100%" }}>
      <input
        type="text"
        value={newMessage}
        onChange={(event) => setNewMessage(event.target.value)}
        style={{ width: "80%" }}
        disabled={!enabled}
      />
      <input type="button" value="Add" onClick={onClick} disabled={!enabled} />
    </p>
  );
};

export default AddMessage;
