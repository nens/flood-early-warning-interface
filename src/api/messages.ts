import { QueryStatus } from "react-query";
import { useOrganisation } from "../providers/ConfigProvider";
import { Organisation } from "../types/api";
import { useOrganisationUser, useConfig, OrganisationUser } from "./hooks";

export interface Message {
  message: string;
  date: string;
  user: string;
}

export interface Messages {
  [key: string]: Message[];
}

export interface MessagesClientConfig {
  revision: number;
  comment: string;
  clientconfig: {
    id?: number;
    portal?: string;
    client: string;
    slug: string;
    configuration: Messages;
    organisation?: string;
  };
}

const EMPTY_MESSAGES: MessagesClientConfig = {
  revision: 0,
  comment: "",
  clientconfig: {
    client: "flood-early-warning-interface",
    slug: "messages",
    portal:
      window.location.hostname === "localhost"
        ? "nxt3.staging.lizard.net"
        : window.location.hostname,
    configuration: {
      "fwa.1": [{ message: "Hello world", date: new Date().toLocaleString(), user: "remco" }],
    },
  },
};

function useMessagesQuery(): { status: QueryStatus; messages: MessagesClientConfig | null } {
  const configurationResponse = useConfig("messages");
  return {
    status: configurationResponse.status,
    messages: configurationResponse.config as unknown as MessagesClientConfig | null,
  };
}

export function useMessages(uuid: string): { status: QueryStatus; messages: Message[] } {
  const messages = useMessagesQuery();
  console.log("MESSAGES", messages);
  return {
    status: messages.status,
    messages: messages.messages?.clientconfig.configuration[uuid] || [],
  };
}

async function updateMessages(
  currentConfig: MessagesClientConfig,
  newMessages: Messages,
  organisationUser: OrganisationUser,
  organisation: Organisation
) {
  // Copy.
  const newConfig = { ...currentConfig };
  newConfig.clientconfig = { ...currentConfig.clientconfig };
  newConfig.clientconfig.configuration = { ...newMessages };

  // Set things that need to be set
  newConfig.comment = `Updated by ${organisationUser.username}`;
  newConfig.clientconfig.organisation = organisation.uuid;

  // Either POST to the /clientconfigs/ URL for a new config, or PUT
  // to a specific ID to update an existing
  const url =
    newConfig.clientconfig.id !== undefined
      ? `/api/v4/clientconfigs/${newConfig.clientconfig.id}/`
      : `/api/v4/clientconfigs/`;
  const method = newConfig.clientconfig.id !== undefined ? "PUT" : "POST";

  // Send a fetch request.
  await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(newConfig),
  });

  return true;
}

export function useAddMessage() {
  const messagesResponse = useMessagesQuery();
  const organisationUser = useOrganisationUser();
  const organisation = useOrganisation();

  const addMessage = (uuid: string, message: string): boolean => {
    const currentConfig = messagesResponse.messages;
    if (!organisationUser || messagesResponse.status !== "success") return false;

    const newMessage = {
      message,
      date: new Date().toLocaleString(),
      user: organisationUser.email,
    };

    const newMessages = currentConfig ? { ...currentConfig.clientconfig.configuration } : {};
    newMessages[uuid] = [...(newMessages[uuid] || []), newMessage];

    updateMessages(currentConfig || EMPTY_MESSAGES, newMessages, organisationUser, organisation);

    return true;
  };

  return { addMessage };
}
