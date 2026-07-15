import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

import {
  type Chat,
  type ChatMeta,
  type ChatSendMessagePayload,
  type Message,
  MessageRole,
  type UserTextFileAttachment,
} from '#uilib/components/ui/Chat/Chat.types';
import { normalizeUserTextFileAttachments } from '#uilib/components/ui/Chat/buildChatSendMessagePayload';
import {
  normalizeJsonDashboardChatText,
  stripJsonDashboardFences,
} from '#uilib/lib/dashboard-spec/stripJsonDashboardFences';
import type { ChatResponse } from '#uilib/types/chat-api.types';

import { isEphemeralChatScope } from './chatPersistence';
import {
  addScopeIdToRegistry,
  countSessionReferences,
  deleteSessionBlob,
  linkSessionToScope as linkSessionToScopeStorage,
  loadChatsFromSessionStorage,
  loadScopeIndex,
  loadSession,
  persistScopeIndex,
  persistSession,
  removeSessionFromScope,
  renameSessionId,
} from './chatSessionStorage';
import type { LinkSessionToScopeOptions } from './chatSessionStorage';

export type SendChatMessageFn = (
  message: string,
  targetChatId: string,
) => Promise<ChatResponse>;

export type {
  ChatSendMessagePayload,
  UserTextFileAttachment,
} from '#uilib/components/ui/Chat/Chat.types';

export type AddChatMessageOptions = {
  userTextFileAttachments?: UserTextFileAttachment[];
  /** SYSTEM-only: mark as transient progress placeholder (shimmer until removed). */
  inProgress?: boolean;
  meta?: ChatMeta;
};

export type UpdateChatMessagePatch = {
  role?: MessageRole;
  text?: string;
  inProgress?: boolean;
  meta?: ChatMeta;
};

export type NewChatOptions = {
  /** When set, seeds the new session's messages (e.g. continue dialog in reports). */
  seedMessages?: readonly Message[];
};

export type { LinkSessionToScopeOptions } from './chatSessionStorage';

export type SendMessageResult = {
  response: string;
  sessionId: string;
};

export interface ChatContextType {
  /** Returns the new session id, or undefined if no user / not created. */
  newChat: (scopeId: string, options?: NewChatOptions) => string | undefined;
  /** Attach an existing session to a scope without cloning messages. */
  linkSessionToScope: (
    scopeId: string,
    sessionId: string,
    options?: LinkSessionToScopeOptions,
  ) => void;
  setCurrentChatId: (currScopeId: string, sessionId: string) => void;
  addMessage: (
    scopeId: string,
    chatId: string,
    role: MessageRole,
    text: string,
    options?: AddChatMessageOptions,
  ) => string | undefined;
  removeMessageById: (
    scopeId: string,
    chatId: string,
    messageId: string,
  ) => void;
  updateMessageById: (
    scopeId: string,
    chatId: string,
    messageId: string,
    patch: UpdateChatMessagePatch,
  ) => void;
  /** Replaces all messages on a session (e.g. seeding from another chat). */
  setChatMessages: (
    scopeId: string,
    chatId: string,
    messages: Message[],
  ) => void;
  /** Shallow-merge keys into `chat.meta` and persist. */
  updateChatMeta: (scopeId: string, chatId: string, patch: ChatMeta) => void;
  sendMessage: (
    scopeId: string,
    message: string | ChatSendMessagePayload,
    chatId?: string,
  ) => Promise<SendMessageResult>;
  getChatsForScopeId: (scopeId: string) => Chat[];
  getCurrentChatId: (scopeId: string) => string | null;
  deleteChat: (scopeId: string, sessionId: string) => void;
  /**
   * Ref-count of in-flight `sendChatMessage` requests keyed by
   * `outboundPendingKey(scopeId, chatSessionId)` (session id at send start).
   */
  outboundPendingByKey: Readonly<Record<string, number>>;
  /** Ref-count of chat panels reporting UI busy (outbound wait, preset scripts, etc.). */
  panelBusyCount: number;
  acquirePanelBusy: () => void;
  releasePanelBusy: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

/** Stable composite key; avoids collisions if `scopeId` contains `:`. */
export function outboundPendingKey(scopeId: string, chatSessionId: string) {
  return `${scopeId}\0${chatSessionId}`;
}

function applySessionUpdate(
  prev: Record<string, Chat[]>,
  sessionId: string,
  updater: (chat: Chat) => Chat,
): Record<string, Chat[]> {
  let updatedChat: Chat | null = null;
  const next: Record<string, Chat[]> = {};
  for (const [scopeId, scopeChats] of Object.entries(prev)) {
    const idx = scopeChats.findIndex(chat => chat.session_id === sessionId);
    if (idx === -1) {
      next[scopeId] = scopeChats;
      continue;
    }
    const chat = updater(scopeChats[idx]);
    updatedChat = chat;
    const scopeNext = [...scopeChats];
    scopeNext[idx] = chat;
    next[scopeId] = scopeNext;
  }
  if (updatedChat) persistSession(updatedChat);
  return next;
}

function remapSessionIdInMemory(
  prev: Record<string, Chat[]>,
  oldSessionId: string,
  newSessionId: string,
): Record<string, Chat[]> {
  const next: Record<string, Chat[]> = {};
  for (const [scopeId, scopeChats] of Object.entries(prev)) {
    next[scopeId] = scopeChats.map(chat =>
      chat.session_id === oldSessionId
        ? { ...chat, session_id: newSessionId }
        : chat,
    );
  }
  return next;
}

/** Shallow-clone messages for seeding another session; drops in-progress rows. */
function cloneMessagesForNewSession(messages: readonly Message[]): Message[] {
  return messages
    .filter(message => !message.inProgress)
    .map(message => ({
      ...message,
      text: stripJsonDashboardFences(message.text),
      ...(message.meta ? { meta: { ...message.meta } } : {}),
      ...(message.userTextFileAttachments
        ? {
            userTextFileAttachments: message.userTextFileAttachments.map(
              attachment => ({ ...attachment }),
            ),
          }
        : {}),
    }));
}

export interface ChatProviderProps {
  children: ReactNode;
  /** When null, chat state is cleared (logged out). When set, only LS rows for scopes starting with `${userId}-` are loaded. */
  userSwitchKey: number | null;
  sendChatMessage: SendChatMessageFn;
}

export function ChatProvider({
  children,
  userSwitchKey,
  sendChatMessage: sendChatMessageFn,
}: ChatProviderProps) {
  const [chats, setChats] = useState<Record<string, Chat[]>>(() => {
    if (userSwitchKey === null || typeof window === 'undefined') return {};
    return loadChatsFromSessionStorage(userSwitchKey).chats;
  });
  const [currentChatId, setCurrentChatIdState] = useState<
    Record<string, string | null>
  >(() => {
    if (userSwitchKey === null || typeof window === 'undefined') return {};
    return loadChatsFromSessionStorage(userSwitchKey).currentChatId;
  });

  const [outboundPendingByKey, setOutboundPendingByKey] = useState<
    Record<string, number>
  >({});
  const [panelBusyCount, setPanelBusyCount] = useState(0);

  const acquirePanelBusy = useCallback(() => {
    setPanelBusyCount(count => count + 1);
  }, []);

  const releasePanelBusy = useCallback(() => {
    setPanelBusyCount(count => Math.max(0, count - 1));
  }, []);

  const beginOutboundPending = useCallback(
    (scopeId: string, chatSessionId: string) => {
      const key = outboundPendingKey(scopeId, chatSessionId);
      setOutboundPendingByKey(prev => ({
        ...prev,
        [key]: (prev[key] ?? 0) + 1,
      }));
    },
    [],
  );

  const endOutboundPending = useCallback(
    (scopeId: string, chatSessionId: string) => {
      const key = outboundPendingKey(scopeId, chatSessionId);
      setOutboundPendingByKey(prev => {
        const next = { ...prev };
        const n = (next[key] ?? 0) - 1;
        if (n <= 0) delete next[key];
        else next[key] = n;
        return next;
      });
    },
    [],
  );

  const getChatsForScopeId = useCallback(
    (scopeId: string): Chat[] => chats[scopeId] ?? [],
    [chats],
  );

  const getCurrentChatId = useCallback(
    (scopeId: string): string | null => {
      const v = currentChatId[scopeId];
      if (v == null || v === '') return null;
      return v;
    },
    [currentChatId],
  );

  const setCurrentChatId = useCallback(
    (currScopeId: string, sessionId: string) => {
      if (!sessionId) return;
      setCurrentChatIdState(prev => ({ ...prev, [currScopeId]: sessionId }));
      const index = loadScopeIndex(currScopeId);
      if (index) {
        persistScopeIndex(currScopeId, {
          ...index,
          currentSessionId: sessionId,
        });
      }
    },
    [],
  );

  const linkSessionToScope = useCallback(
    (
      scopeId: string,
      sessionId: string,
      options?: LinkSessionToScopeOptions,
    ) => {
      if (userSwitchKey === null) return;
      linkSessionToScopeStorage(scopeId, sessionId, options);
      setChats(prev => {
        const sessionFromLs = loadSession(sessionId);
        let sessionFromMemory: Chat | null = null;
        for (const scopeChats of Object.values(prev)) {
          const found = scopeChats.find(chat => chat.session_id === sessionId);
          if (
            found &&
            (!sessionFromMemory ||
              found.messages.length > sessionFromMemory.messages.length)
          ) {
            sessionFromMemory = found;
          }
        }
        const session =
          sessionFromMemory &&
          (!sessionFromLs ||
            sessionFromMemory.messages.length >= sessionFromLs.messages.length)
            ? sessionFromMemory
            : sessionFromLs;
        if (!session) return prev;
        if (session === sessionFromMemory) {
          persistSession(sessionFromMemory);
        }
        const scopeChats = prev[scopeId] ?? [];
        const exists = scopeChats.some(chat => chat.session_id === sessionId);
        const updatedChats = exists
          ? scopeChats.map(chat =>
              chat.session_id === sessionId ? session : chat,
            )
          : [session, ...scopeChats];
        return { ...prev, [scopeId]: updatedChats };
      });
      if (options?.makeCurrent !== false) {
        setCurrentChatIdState(prev => ({ ...prev, [scopeId]: sessionId }));
      }
    },
    [userSwitchKey],
  );

  const newChat = useCallback(
    (scopeId: string, options?: NewChatOptions): string | undefined => {
      if (userSwitchKey === null) return undefined;
      addScopeIdToRegistry(scopeId);

      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const seededMessages =
        options?.seedMessages && options.seedMessages.length > 0
          ? cloneMessagesForNewSession(options.seedMessages)
          : [];
      const created: Chat = {
        session_id: sessionId,
        name: '',
        messages: seededMessages,
      };

      persistSession(created);
      linkSessionToScopeStorage(scopeId, sessionId, { makeCurrent: true });

      setChats(prev => {
        const scopeChats = prev[scopeId] ?? [];
        const isEphemeral = isEphemeralChatScope(scopeId);
        if (isEphemeral) {
          for (const old of scopeChats) {
            if (old.session_id !== sessionId) {
              removeSessionFromScope(scopeId, old.session_id);
              if (countSessionReferences(userSwitchKey, old.session_id) === 0) {
                deleteSessionBlob(old.session_id);
              }
            }
          }
        }
        const updatedChats = isEphemeral ? [created] : [created, ...scopeChats];
        return { ...prev, [scopeId]: updatedChats };
      });
      setCurrentChatIdState(prev => ({ ...prev, [scopeId]: sessionId }));
      return sessionId;
    },
    [userSwitchKey],
  );

  const deleteChat = useCallback(
    (scopeId: string, sessionId: string) => {
      const scopeChats = chats[scopeId] ?? [];
      const deletedIndex = scopeChats.findIndex(
        chat => chat.session_id === sessionId,
      );
      if (deletedIndex === -1) return;

      removeSessionFromScope(scopeId, sessionId);
      if (
        userSwitchKey != null &&
        countSessionReferences(userSwitchKey, sessionId) === 0
      ) {
        deleteSessionBlob(sessionId);
      }

      setChats(prev => {
        const currentScopeChats = prev[scopeId] ?? [];
        return {
          ...prev,
          [scopeId]: currentScopeChats.filter(
            chat => chat.session_id !== sessionId,
          ),
        };
      });

      setCurrentChatIdState(prevCurr => {
        if (prevCurr[scopeId] !== sessionId) return prevCurr;
        const index = loadScopeIndex(scopeId);
        const nextId =
          index?.currentSessionId ??
          (deletedIndex > 0 ? scopeChats[deletedIndex - 1].session_id : null);
        return { ...prevCurr, [scopeId]: nextId };
      });
    },
    [chats, userSwitchKey],
  );

  const addMessage = useCallback(
    (
      scopeId: string,
      chatId: string,
      role: MessageRole,
      text: string,
      options?: AddChatMessageOptions,
    ) => {
      if (userSwitchKey === null) return undefined;
      addScopeIdToRegistry(scopeId);
      const storedText =
        role === MessageRole.ASSISTANT
          ? normalizeJsonDashboardChatText(text)
          : stripJsonDashboardFences(text);
      const attachments =
        role === MessageRole.USER
          ? options?.userTextFileAttachments
          : undefined;
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role,
        text: storedText,
        timestamp: Date.now(),
        ...(attachments?.length
          ? { userTextFileAttachments: attachments }
          : {}),
        ...(options?.inProgress ? { inProgress: true } : {}),
        ...(options?.meta ? { meta: { ...options.meta } } : {}),
      };

      setChats(prev =>
        applySessionUpdate(prev, chatId, chat => ({
          ...chat,
          messages: [...chat.messages, newMessage],
        })),
      );
      return newMessage.id;
    },
    [userSwitchKey],
  );

  const removeMessageById = useCallback(
    (scopeId: string, chatId: string, messageId: string) => {
      if (userSwitchKey === null) return;
      setChats(prev =>
        applySessionUpdate(prev, chatId, chat => ({
          ...chat,
          messages: chat.messages.filter(message => message.id !== messageId),
        })),
      );
    },
    [userSwitchKey],
  );

  const updateMessageById = useCallback(
    (
      scopeId: string,
      chatId: string,
      messageId: string,
      patch: UpdateChatMessagePatch,
    ) => {
      if (userSwitchKey === null) return;
      setChats(prev =>
        applySessionUpdate(prev, chatId, chat => ({
          ...chat,
          messages: chat.messages.map(message => {
            if (message.id !== messageId) return message;
            const next: Message = { ...message };
            if (patch.role != null) {
              next.role = patch.role;
            }
            if (patch.text != null) {
              const targetRole = patch.role ?? message.role;
              next.text =
                targetRole === MessageRole.ASSISTANT
                  ? normalizeJsonDashboardChatText(patch.text)
                  : stripJsonDashboardFences(patch.text);
            }
            if (patch.inProgress === true) {
              next.inProgress = true;
            } else if (
              patch.inProgress === false ||
              (patch.role != null && patch.role !== MessageRole.SYSTEM)
            ) {
              delete next.inProgress;
            }
            if (patch.meta != null) {
              next.meta = { ...next.meta, ...patch.meta };
            }
            return next;
          }),
        })),
      );
    },
    [userSwitchKey],
  );

  const setChatMessages = useCallback(
    (scopeId: string, chatId: string, messages: Message[]) => {
      if (userSwitchKey === null) return;
      addScopeIdToRegistry(scopeId);
      const cloned = messages.map(message => ({
        ...message,
        text:
          message.role === MessageRole.ASSISTANT
            ? message.text
            : stripJsonDashboardFences(message.text),
        ...(message.meta ? { meta: { ...message.meta } } : {}),
      }));

      setChats(prev =>
        applySessionUpdate(prev, chatId, chat => ({
          ...chat,
          messages: cloned,
        })),
      );
    },
    [userSwitchKey],
  );

  const updateChatMeta = useCallback(
    (scopeId: string, chatId: string, patch: ChatMeta) => {
      if (userSwitchKey === null) return;
      setChats(prev =>
        applySessionUpdate(prev, chatId, chat => ({
          ...chat,
          meta: { ...chat.meta, ...patch },
        })),
      );
    },
    [userSwitchKey],
  );

  const sendMessage = useCallback(
    async (
      scopeId: string,
      message: string | ChatSendMessagePayload,
      chatId?: string,
    ): Promise<SendMessageResult> => {
      const targetChatId = chatId ?? getCurrentChatId(scopeId);
      if (targetChatId === null || targetChatId === '') {
        throw new Error('No chat selected');
      }

      const apiPayload =
        typeof message === 'string' ? message : message.apiMessage;

      if (typeof message === 'string') {
        addMessage(scopeId, targetChatId, MessageRole.USER, message);
      } else if (!message.omitUserMessage) {
        addMessage(
          scopeId,
          targetChatId,
          MessageRole.USER,
          message.displayText,
          {
            userTextFileAttachments: normalizeUserTextFileAttachments(message),
          },
        );
      }

      let progressMessageId: string | undefined;
      if (typeof message !== 'string' && message.systemProgressLabel) {
        progressMessageId = addMessage(
          scopeId,
          targetChatId,
          MessageRole.SYSTEM,
          message.systemProgressLabel,
          { inProgress: true },
        );
      }

      const pendingChatSessionId = targetChatId;
      beginOutboundPending(scopeId, pendingChatSessionId);
      let effectiveSessionId = pendingChatSessionId;
      try {
        const data = await sendChatMessageFn(apiPayload, pendingChatSessionId);

        effectiveSessionId =
          data.session_id && data.session_id !== pendingChatSessionId
            ? data.session_id
            : pendingChatSessionId;

        if (
          data.session_id &&
          data.session_id !== pendingChatSessionId &&
          userSwitchKey != null
        ) {
          renameSessionId(userSwitchKey, pendingChatSessionId, data.session_id);
          setChats(prev =>
            remapSessionIdInMemory(prev, pendingChatSessionId, data.session_id),
          );
          setCurrentChatId(scopeId, data.session_id);
        }

        if (progressMessageId) {
          removeMessageById(scopeId, effectiveSessionId, progressMessageId);
          progressMessageId = undefined;
        }

        addMessage(
          scopeId,
          effectiveSessionId,
          MessageRole.ASSISTANT,
          data.response,
        );

        return { response: data.response, sessionId: effectiveSessionId };
      } catch (error) {
        if (progressMessageId) {
          removeMessageById(scopeId, effectiveSessionId, progressMessageId);
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Sorry, I encountered an error processing your message. Please try again.';

        addMessage(
          scopeId,
          effectiveSessionId,
          MessageRole.ASSISTANT,
          errorMessage,
        );
        throw error;
      } finally {
        endOutboundPending(scopeId, pendingChatSessionId);
      }
    },
    [
      addMessage,
      removeMessageById,
      beginOutboundPending,
      endOutboundPending,
      getCurrentChatId,
      sendChatMessageFn,
      setCurrentChatId,
      userSwitchKey,
    ],
  );

  // Layout effect so LS hydration finishes before child `useEffect` hooks that
  // may call `newChat()` when `?chat=open` opens the panel on first mount.
  useLayoutEffect(() => {
    if (userSwitchKey === null) {
      setChats({});
      setCurrentChatIdState({});
      setOutboundPendingByKey({});
      setPanelBusyCount(0);
      return;
    }

    const loaded = loadChatsFromSessionStorage(userSwitchKey);
    const updatedCurrentChatId = { ...loaded.currentChatId };
    for (const [scopeId, scopeChats] of Object.entries(loaded.chats)) {
      if (
        scopeChats.length > 0 &&
        (updatedCurrentChatId[scopeId] == null ||
          updatedCurrentChatId[scopeId] === '')
      ) {
        updatedCurrentChatId[scopeId] = scopeChats[0].session_id;
      }
    }

    setChats(loaded.chats);
    setCurrentChatIdState(updatedCurrentChatId);
  }, [userSwitchKey]);

  return (
    <ChatContext.Provider
      value={{
        newChat,
        linkSessionToScope,
        setCurrentChatId,
        addMessage,
        removeMessageById,
        updateMessageById,
        setChatMessages,
        updateChatMeta,
        sendMessage,
        getChatsForScopeId,
        getCurrentChatId,
        deleteChat,
        outboundPendingByKey,
        panelBusyCount,
        acquirePanelBusy,
        releasePanelBusy,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const isChatEmpty = (chat: Chat | null): boolean =>
  chat?.messages.length === 0;

export function useChats() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChats must be used within a ChatProvider');
  }
  return context;
}

export function useChat(
  scopeId: string | undefined,
  chatId: string | undefined,
): Chat | null {
  const { getChatsForScopeId } = useChats();
  return useMemo(() => {
    if (!scopeId || !chatId) return null;
    return (
      getChatsForScopeId(scopeId)?.find(chat => chat.session_id === chatId) ??
      null
    );
  }, [scopeId, chatId, getChatsForScopeId]);
}

export function useChatOutboundPending(
  scopeId: string | undefined | null,
  chatSessionId: string | null | undefined,
): boolean {
  const { outboundPendingByKey } = useChats();
  return useMemo(() => {
    if (!scopeId || !chatSessionId) return false;
    const key = outboundPendingKey(scopeId, chatSessionId);
    return (outboundPendingByKey[key] ?? 0) > 0;
  }, [scopeId, chatSessionId, outboundPendingByKey]);
}

/** True when chat is waiting on API or panel UI busy (safe outside ChatProvider). */
export function useIsChatLoading(): boolean {
  const context = useContext(ChatContext);
  return useMemo(() => {
    if (!context) return false;
    const outboundPending = Object.values(context.outboundPendingByKey).some(
      count => count > 0,
    );
    return outboundPending || context.panelBusyCount > 0;
  }, [context?.outboundPendingByKey, context?.panelBusyCount]);
}

/** Syncs chat panel `isLoading` into context for touch-overlay suppression. */
export function useSyncChatPanelBusy(isLoading: boolean): void {
  const acquirePanelBusy = useContext(ChatContext)?.acquirePanelBusy;
  const releasePanelBusy = useContext(ChatContext)?.releasePanelBusy;
  useEffect(() => {
    if (!isLoading || !acquirePanelBusy || !releasePanelBusy) return;
    acquirePanelBusy();
    return () => {
      releasePanelBusy();
    };
  }, [isLoading, acquirePanelBusy, releasePanelBusy]);
}

export function useChatsForScopeId(scopeId: string) {
  const {
    getChatsForScopeId,
    getCurrentChatId,
    setCurrentChatId,
    newChat,
    linkSessionToScope,
    addMessage,
    removeMessageById,
    updateMessageById,
    updateChatMeta,
    setChatMessages,
    sendMessage,
    deleteChat,
  } = useChats();
  const chats = getChatsForScopeId(scopeId);
  const currentChatId = getCurrentChatId(scopeId);
  const currentChat = useChat(scopeId, currentChatId ?? undefined);
  const isOutboundPending = useChatOutboundPending(scopeId, currentChatId);

  return {
    chats,
    currentChat,
    currentChatId,
    isOutboundPending,
    setCurrentChatId: (targetId: string) => setCurrentChatId(scopeId, targetId),
    linkSessionToScope: (
      sessionId: string,
      options?: LinkSessionToScopeOptions,
    ) => linkSessionToScope(scopeId, sessionId, options),
    newChat: (options?: NewChatOptions) => newChat(scopeId, options),
    addMessage: (
      chatId: string,
      role: MessageRole,
      text: string,
      options?: AddChatMessageOptions,
    ) => addMessage(scopeId, chatId, role, text, options),
    removeMessageById: (chatId: string, messageId: string) =>
      removeMessageById(scopeId, chatId, messageId),
    updateMessageById: (
      chatId: string,
      messageId: string,
      patch: UpdateChatMessagePatch,
    ) => updateMessageById(scopeId, chatId, messageId, patch),
    sendMessage: (message: string | ChatSendMessagePayload, chatId?: string) =>
      sendMessage(scopeId, message, chatId),
    updateChatMeta: (chatId: string, patch: ChatMeta) =>
      updateChatMeta(scopeId, chatId, patch),
    setChatMessages: (chatId: string, messages: Message[]) =>
      setChatMessages(scopeId, chatId, messages),
    deleteChat: (sessionId: string) => deleteChat(scopeId, sessionId),
  };
}

/** @deprecated Use useChatsForScopeId */
export function useChatsForDataset(scopeId: string) {
  return useChatsForScopeId(scopeId);
}

export function useCurrentChat(scopeId: string) {
  const { getCurrentChatId } = useChats();
  const chatId = getCurrentChatId(scopeId);
  return useChat(scopeId, chatId ?? undefined);
}

export { ChatContext };
