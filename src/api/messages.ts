import { QueryStatus, useQueryClient } from "react-query";
import { useOrganisation } from "../providers/ConfigProvider";
import { Organisation } from "../types/api";
import { useOrganisationUser, useConfig, OrganisationUser, Wrapped } from "./hooks";

export interface Message {
  message: string;
  date: string;
  user: string;
}

export interface Messages {
  [key: string]: Message[];
}

function makeEmptyMessages(organisation: Organisation): Wrapped<Messages> {
  return {
    revision: 0,
    comment: "",
    clientconfig: {
      client: "flood-early-warning-interface",
      slug: "messages",
      portal:
        window.location.hostname === "localhost"
          ? "parramatta.lizard.net"
          : window.location.hostname,
      configuration: {}, // Actual messages
      organisation,
    },
  };
}

export function useMessages(uuid: string): { status: QueryStatus; messages: Message[] } {
  const messages = useConfig<Messages>("messages");
  return {
    status: messages.status,
    messages:
      messages.data?.clientconfig?.configuration && messages.data.clientconfig.configuration[uuid]
        ? messages.data.clientconfig.configuration[uuid]
        : [],
  };
}

async function updateMessages(
  currentConfig: Wrapped<Messages>,
  newMessages: Messages,
  organisationUser: OrganisationUser,
  organisation: Organisation
) {
  // Copy.
  const newConfig: Wrapped<Messages> = { ...currentConfig };
  newConfig.clientconfig = { ...currentConfig.clientconfig };
  newConfig.clientconfig.configuration = { ...newMessages };

  // Set things that need to be set
  newConfig.comment = `Updated by ${organisationUser.username}`;
  // @ts-expect-error  A string is sent to the backend, not the whole organisation
  newConfig.clientconfig.organisation = organisation.uuid;

  // Either POST to the /clientconfigs/ URL for a new config, or PUT
  // to a specific ID to update an existing
  const url =
    newConfig.clientconfig.id !== undefined
      ? `/api/v4/clientconfigs/${newConfig.clientconfig.id}/`
      : `/api/v4/clientconfigs/`;

  const method = newConfig.clientconfig.id !== undefined ? "PUT" : "POST";

  // Send a fetch request.
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(newConfig),
  });

  if (response.ok) {
    return (await response.json()) as Wrapped<Messages>;
  } else {
    return null;
  }
}

export function useChangeMessages() {
  const queryClient = useQueryClient();
  const messagesResponse = useConfig<Messages>("messages");
  const organisationUser = useOrganisationUser();
  const organisation = useOrganisation();

  const addMessage = async (uuid: string, message: string): Promise<boolean> => {
    const currentMessages = messagesResponse.data?.clientconfig.configuration;
    if (!organisationUser || messagesResponse.status !== "success") return false;

    const newMessage = {
      message,
      date: new Date().toLocaleString(),
      user: organisationUser.email,
    };

    const newMessages: Messages = currentMessages ? { ...currentMessages } : {};
    newMessages[uuid] = [...(newMessages[uuid] || []), newMessage];

    const updatedMessages = await updateMessages(
      messagesResponse.data || makeEmptyMessages(organisation),
      newMessages,
      organisationUser,
      organisation
    );

    if (updatedMessages) {
      // Replace React Query cache with new version and return true
      //      queryClient.invalidateQueries(["config", "messages"]);
      queryClient.setQueryData(["config", "messages"], updatedMessages);
      return true;
    } else {
      // Invalidate React Query cache (apparently something changed, e.g.
      // another session added a message to the backend config) and the
      // state needs to be refetched.
      queryClient.invalidateQueries(["config", "messages"]);
      return false;
    }
  };

  const removeMessage = async (uuid: string, index: number, message: string) => {
    const currentMessages = messagesResponse.data?.clientconfig.configuration;

    if (!currentMessages || !organisationUser || messagesResponse.status !== "success") return;

    const currentMessagesInUuid = currentMessages[uuid];

    if (!currentMessagesInUuid) return; // Nothing to remove.

    const currentMessage = currentMessagesInUuid[index];

    if (!currentMessage || currentMessage.message !== message) return;

    const newMessagesInUuid = currentMessagesInUuid;
    newMessagesInUuid.splice(index, 1); // Actually remove the message

    const updatedMessages = await updateMessages(
      messagesResponse.data || makeEmptyMessages(organisation),
      { ...currentMessages, [uuid]: newMessagesInUuid },
      organisationUser,
      organisation
    );

    if (updatedMessages) {
      // Replace React Query cache with new version and return true
      //      queryClient.invalidateQueries(["config", "messages"]);
      queryClient.setQueryData(["config", "messages"], updatedMessages);
      return;
    } else {
      // Invalidate React Query cache (apparently something changed, e.g.
      // another session added a message to the backend config) and the
      // state needs to be refetched.
      queryClient.invalidateQueries(["config", "messages"]);
      return;
    }
  };

  return { addMessage, removeMessage };
}
