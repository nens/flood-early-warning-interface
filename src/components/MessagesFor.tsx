import { FC } from "react";

import AddMessage from "../components/AddMessage";
import { useUserHasRole } from "../api/hooks";
import { useMessages } from "../api/messages";

export interface MessagesForProps {
  uuid: string;
}

const MessagesFor: FC<MessagesForProps> = ({ uuid }) => {
  const messages = useMessages(uuid);
  const isAdmin = useUserHasRole("admin");

  if (messages.status !== "success") return null;

  return (
    <>
      {messages.messages.map((message, idx) => (
        <div key={`message-${idx}`}>{message.message}</div>
      ))}
      {isAdmin ? <AddMessage uuid={uuid} /> : null}
    </>
  );
};

export default MessagesFor;
