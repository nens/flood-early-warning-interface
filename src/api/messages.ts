// Code involving retrieving and saving messages from the API
// They are stored in a separate clientconfig with the slug "messages".

// Clientconfigs have a "revision" that is increased a new version is saved;
// if two clients try to change the same revision, the second one gets an error.
// In that case, we don't save, and instead mark our cache as stale so that the
// version updated by the first client is retrieved.

import { QueryStatus, useQueryClient } from "react-query";
import { useOrganisation } from "../providers/ConfigProvider";
import { Organisation } from "../types/api";
import { useOrganisationUser, useConfig, OrganisationUser, Wrapped, useBootstrap } from "./hooks";

export interface Message {
  message: string;
  date: string;
  user: string;
}

export interface Messages {
  [key: string]: Message[];
}

// Used as initial value for the first message to be saved.
function makeEmptyMessages(organisation: Organisation, portal: string): Wrapped<Messages> {
  return {
    revision: 0,
    comment: "",
    clientconfig: {
      client: "flood-early-warning-interface",
      slug: "messages",
      portal,
      configuration: {}, // Actual messages
      organisation,
    },
  };
}

// Returns the messages for a given id, rather than the whole object.
export function useMessages(id: string): { status: QueryStatus; messages: Message[] } {
  const messages = useConfig<Messages>("messages");
  return {
    status: messages.status,
    messages:
      messages.data?.clientconfig?.configuration && messages.data.clientconfig.configuration[id]
        ? messages.data.clientconfig.configuration[id]
        : [],
  };
}

// Actually sends the request to the API to update the config.
// Returns the new config object if successful, null if not.
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

// This hook returns two functions, addMessage and removeMessage, that
// can then be used to add and remove messages.
// There is quite some overlap between the two functions but they are
// slightly different; addMessage returned a boolean that indicates whether
// removal was successful or not, because if the request was successful,
// the input field for the message needs to be cleared.
// Factoring out the common parts doesn't seem completely worth it right now.
export function useChangeMessages() {
  const queryClient = useQueryClient();
  const messagesResponse = useConfig<Messages>("messages");
  const organisationUser = useOrganisationUser();
  const organisation = useOrganisation();
  const bootstrap = useBootstrap();

  const addMessage = async (uuid: string, message: string): Promise<boolean> => {
    const currentMessages = messagesResponse.data?.clientconfig.configuration;
    if (!organisationUser || messagesResponse.status !== "success") return false;

    // Get portal from bootstrap
    if (!bootstrap.isSuccess) return false;
    const portal = bootstrap.data!.domain;

    const newMessage = {
      message,
      date: new Date().toLocaleString(),
      user: organisationUser.email,
    };

    const newMessages: Messages = currentMessages ? { ...currentMessages } : {};
    newMessages[uuid] = [...(newMessages[uuid] || []), newMessage];

    const updatedMessages = await updateMessages(
      messagesResponse.data || makeEmptyMessages(organisation, portal),
      newMessages,
      organisationUser,
      organisation
    );

    if (updatedMessages) {
      // Replace React Query cache with new version and return true
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

    // Get portal from bootstrap
    if (!bootstrap.isSuccess) return;
    const portal = bootstrap.data!.domain;

    const currentMessagesInUuid = currentMessages[uuid];

    if (!currentMessagesInUuid) return; // Nothing to remove.

    const currentMessage = currentMessagesInUuid[index];

    if (!currentMessage || currentMessage.message !== message) return;

    const newMessagesInUuid = currentMessagesInUuid;
    newMessagesInUuid.splice(index, 1); // Actually remove the message

    const updatedMessages = await updateMessages(
      messagesResponse.data || makeEmptyMessages(organisation, portal),
      { ...currentMessages, [uuid]: newMessagesInUuid },
      organisationUser,
      organisation
    );

    if (updatedMessages) {
      // Replace React Query cache with new version and return true
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
