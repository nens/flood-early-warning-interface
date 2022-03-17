import { FC, useState } from "react";
import { useUserHasRole } from "../api/hooks";
import { useAddMessage } from "../api/messages";

const AddMessage: FC<{ uuid: string }> = ({ uuid }) => {
  const isAdmin = useUserHasRole("admin");
  const [newMessage, setNewMessage] = useState("");

  const { addMessage } = useAddMessage();

  const onClick = () => {
    if (!isAdmin || newMessage === "") {
      return;
    }

    addMessage(uuid, newMessage);
  };

  return (
    <p style={{ width: "100%" }}>
      <input
        type="text"
        value={newMessage}
        onChange={(event) => setNewMessage(event.target.value)}
        style={{ width: "80%" }}
      />
      <input type="button" value="Add" onClick={onClick} />
    </p>
  );
};

export default AddMessage;
