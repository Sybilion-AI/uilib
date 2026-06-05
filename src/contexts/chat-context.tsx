import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  type Chat,
  type ChatSendMessagePayload,
  type Message,
  MessageRole,
  type UserTextFileAttachment,
} from '#uilib/components/ui/Chat/Chat.types';
import { normalizeUserTextFileAttachments } from '#uilib/components/ui/Chat/buildChatSendMessagePayload';
import { stripJsonDashboardFences } from '#uilib/lib/dashboard-spec/stripJsonDashboardFences';
import type { ChatResponse } from '#uilib/types/chat-api.types';
import { LS } from '@homecode/ui';

export type SendChatMessageFn = (
  message: string,
  targetChatId: string,
) => Promise<ChatResponse>;

export type {
  ChatSendMessagePayload,
  UserTextFileAttachment,
} from '#uilib/components/ui/Chat/Chat.types';

const CHATS_PREFIX = 'chats-';
const CHAT_SCOPE_IDS_REGISTRY_KEY = 'chat-scope-ids';

export type AddChatMessageOptions = {
  userTextFileAttachments?: UserTextFileAttachment[];
  /** SYSTEM-only: mark as transient progress placeholder (shimmer until removed). */
  inProgress?: boolean;
};

export type UpdateChatMessagePatch = {
  role?: MessageRole;
  text?: string;
  inProgress?: boolean;
};

export type NewChatOptions = {
  /** When set, seeds the new session's messages (e.g. continue dialog in reports). */
  seedMessages?: readonly Message[];
};

export interface ChatContextType {
  /** Returns the new session id, or undefined if no user / not created. */
  newChat: (scopeId: string, options?: NewChatOptions) => string | undefined;
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
  sendMessage: (
    scopeId: string,
    message: string | ChatSendMessagePayload,
    chatId?: string,
  ) => Promise<string>;
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

function getCurrentChatIdKey(scopeId: string) {
  return `chat-current-id-${scopeId}`;
}

function getChatsKey(scopeId: string) {
  return `${CHATS_PREFIX}${scopeId}`;
}

function scopeIdsForUser(userId: number, all: Set<string>): Set<string> {
  const prefix = `${userId}-`;
  const out = new Set<string>();
  for (const id of all) {
    if (id.startsWith(prefix)) out.add(id);
  }
  return out;
}

function discoverScopeIdsFromLS(): Set<string> {
  const scopeIds = new Set<string>();
  const registryRaw = LS.get(CHAT_SCOPE_IDS_REGISTRY_KEY);
  const registry = Array.isArray(registryRaw) ? registryRaw : [];
  registry.forEach((id: unknown) => {
    if (typeof id === 'string' && id) scopeIds.add(id);
  });
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(CHATS_PREFIX)) {
        const scopeId = key.slice(CHATS_PREFIX.length);
        if (scopeId) scopeIds.add(scopeId);
      }
    }
  } catch {
    // ignore
  }
  return scopeIds;
}

function loadChatsFromLS(userId: number | null): {
  chats: Record<string, Chat[]>;
  currentChatId: Record<string, string | null>;
} {
  if (typeof window === 'undefined' || userId === null) {
    return { chats: {}, currentChatId: {} };
  }
  const chats: Record<string, Chat[]> = {};
  const currentChatId: Record<string, string | null> = {};
  const scopeIds = scopeIdsForUser(userId, discoverScopeIdsFromLS());
  for (const scopeId of scopeIds) {
    const chatsKey = getChatsKey(scopeId);
    const storedRaw = LS.get(chatsKey);
    const stored = Array.isArray(storedRaw) ? storedRaw : undefined;
    if (stored?.length) {
      chats[scopeId] = stored;
      const ck = getCurrentChatIdKey(scopeId);
      const savedCurrentIdRaw = LS.get(ck);
      const savedCurrentId =
        typeof savedCurrentIdRaw === 'string' && savedCurrentIdRaw !== ''
          ? savedCurrentIdRaw
          : undefined;
      currentChatId[scopeId] = savedCurrentId ?? stored[0]?.session_id ?? null;
    }
  }
  return { chats, currentChatId };
}

function addScopeIdToRegistry(scopeId: string) {
  const raw = LS.get(CHAT_SCOPE_IDS_REGISTRY_KEY);
  const registry = Array.isArray(raw) ? [...raw] : [];
  if (!registry.includes(scopeId)) {
    LS.set(CHAT_SCOPE_IDS_REGISTRY_KEY, [...registry, scopeId]);
  }
}

/** Shallow-clone messages for seeding another session; drops in-progress rows. */
function cloneMessagesForNewSession(messages: readonly Message[]): Message[] {
  return messages
    .filter(message => !message.inProgress)
    .map(message => ({
      ...message,
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
    if (userSwitchKey === null) return {};
    return loadChatsFromLS(userSwitchKey).chats;
  });
  const [currentChatId, setCurrentChatIdState] = useState<
    Record<string, string | null>
  >(() => {
    if (userSwitchKey === null) return {};
    return loadChatsFromLS(userSwitchKey).currentChatId;
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

  const newChat = useCallback(
    (scopeId: string, options?: NewChatOptions): string | undefined => {
      if (userSwitchKey === null) return undefined;
      addScopeIdToRegistry(scopeId);

      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const seededMessages =
        options?.seedMessages && options.seedMessages.length > 0
          ? cloneMessagesForNewSession(options.seedMessages)
          : [];
      const newChat: Chat = {
        session_id: sessionId,
        name: '',
        messages: seededMessages,
      };

      setChats(prev => {
        const currentChats = prev[scopeId] ?? [];
        const updatedChats = [newChat, ...currentChats];

        const chatsKey = getChatsKey(scopeId);
        LS.set(chatsKey, updatedChats);

        return {
          ...prev,
          [scopeId]: updatedChats,
        };
      });
      setCurrentChatIdState(prev => ({ ...prev, [scopeId]: sessionId }));
      LS.set(getCurrentChatIdKey(scopeId), sessionId);
      return sessionId;
    },
    [userSwitchKey],
  );

  const setCurrentChatId = useCallback(
    (currScopeId: string, sessionId: string) => {
      if (!sessionId) return;
      setCurrentChatIdState(prev => ({ ...prev, [currScopeId]: sessionId }));
      LS.set(getCurrentChatIdKey(currScopeId), sessionId);
    },
    [],
  );

  const deleteChat = useCallback((scopeId: string, sessionId: string) => {
    const chatsKey = getChatsKey(scopeId);
    const currentKey = getCurrentChatIdKey(scopeId);

    setChats(prev => {
      const scopeChats = prev[scopeId] ?? [];
      const deletedIndex = scopeChats.findIndex(
        c => c.session_id === sessionId,
      );
      if (deletedIndex === -1) {
        return prev;
      }
      const updatedChats = scopeChats.filter(c => c.session_id !== sessionId);
      LS.set(chatsKey, updatedChats);

      setCurrentChatIdState(prevCurr => {
        if (prevCurr[scopeId] !== sessionId) {
          return prevCurr;
        }
        const nextId =
          deletedIndex > 0
            ? scopeChats[deletedIndex - 1].session_id
            : (updatedChats[0]?.session_id ?? null);
        if (nextId) {
          LS.set(currentKey, nextId);
        } else {
          LS.remove(currentKey);
        }
        return { ...prevCurr, [scopeId]: nextId };
      });

      return { ...prev, [scopeId]: updatedChats };
    });
  }, []);

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
      const storedText = stripJsonDashboardFences(text);
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
      };

      setChats(prev => {
        const scopeChats = prev[scopeId] ?? [];
        const updatedChats = scopeChats.map(chat => {
          if (chat.session_id === chatId) {
            return { ...chat, messages: [...chat.messages, newMessage] };
          }
          return chat;
        });

        const chatsKey = getChatsKey(scopeId);
        LS.set(chatsKey, updatedChats);

        return { ...prev, [scopeId]: updatedChats };
      });
      return newMessage.id;
    },
    [userSwitchKey],
  );

  const removeMessageById = useCallback(
    (scopeId: string, chatId: string, messageId: string) => {
      if (userSwitchKey === null) return;
      setChats(prev => {
        const scopeChats = prev[scopeId] ?? [];
        const updatedChats = scopeChats.map(chat => {
          if (chat.session_id !== chatId) return chat;
          return {
            ...chat,
            messages: chat.messages.filter(m => m.id !== messageId),
          };
        });
        const chatsKey = getChatsKey(scopeId);
        LS.set(chatsKey, updatedChats);
        return { ...prev, [scopeId]: updatedChats };
      });
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
      setChats(prev => {
        const scopeChats = prev[scopeId] ?? [];
        const updatedChats = scopeChats.map(chat => {
          if (chat.session_id !== chatId) return chat;
          return {
            ...chat,
            messages: chat.messages.map(message => {
              if (message.id !== messageId) return message;
              const next: Message = { ...message };
              if (patch.role != null) {
                next.role = patch.role;
              }
              if (patch.text != null) {
                next.text = stripJsonDashboardFences(patch.text);
              }
              if (patch.inProgress === true) {
                next.inProgress = true;
              } else if (
                patch.inProgress === false ||
                (patch.role != null && patch.role !== MessageRole.SYSTEM)
              ) {
                delete next.inProgress;
              }
              return next;
            }),
          };
        });
        const chatsKey = getChatsKey(scopeId);
        LS.set(chatsKey, updatedChats);
        return { ...prev, [scopeId]: updatedChats };
      });
    },
    [userSwitchKey],
  );

  const setChatMessages = useCallback(
    (scopeId: string, chatId: string, messages: Message[]) => {
      if (userSwitchKey === null) return;
      addScopeIdToRegistry(scopeId);
      const cloned = messages.map(message => ({ ...message }));

      setChats(prev => {
        const scopeChats = prev[scopeId] ?? [];
        const updatedChats = scopeChats.map(chat => {
          if (chat.session_id !== chatId) return chat;
          return { ...chat, messages: cloned };
        });

        const chatsKey = getChatsKey(scopeId);
        LS.set(chatsKey, updatedChats);

        return { ...prev, [scopeId]: updatedChats };
      });
    },
    [userSwitchKey],
  );

  const sendMessage = useCallback(
    async (
      scopeId: string,
      message: string | ChatSendMessagePayload,
      chatId?: string,
    ): Promise<string> => {
      const targetChatId = chatId ?? getCurrentChatId(scopeId);
      if (targetChatId === null || targetChatId === '') {
        throw new Error('No chat selected');
      }

      const apiPayload =
        typeof message === 'string' ? message : message.apiMessage;

      if (typeof message === 'string') {
        addMessage(scopeId, targetChatId, MessageRole.USER, message);
      } else {
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

      const pendingChatSessionId = targetChatId;
      beginOutboundPending(scopeId, pendingChatSessionId);
      try {
        const data = await sendChatMessageFn(apiPayload, pendingChatSessionId);

        if (data.session_id && data.session_id !== pendingChatSessionId) {
          setChats(prev => {
            const scopeChats = prev[scopeId] ?? [];
            const updatedChats = scopeChats.map(chat =>
              chat.session_id === pendingChatSessionId
                ? { ...chat, session_id: data.session_id! }
                : chat,
            );

            const chatsKey = getChatsKey(scopeId);
            LS.set(chatsKey, updatedChats);

            return { ...prev, [scopeId]: updatedChats };
          });
          setCurrentChatId(scopeId, data.session_id);
        }

        addMessage(
          scopeId,
          data.session_id ? data.session_id : pendingChatSessionId,
          MessageRole.ASSISTANT,
          data.response,
        );

        return data.response;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Sorry, I encountered an error processing your message. Please try again.';

        addMessage(
          scopeId,
          pendingChatSessionId,
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
      beginOutboundPending,
      endOutboundPending,
      getCurrentChatId,
      sendChatMessageFn,
      setCurrentChatId,
    ],
  );

  useEffect(() => {
    if (userSwitchKey === null) {
      setChats({});
      setCurrentChatIdState({});
      setOutboundPendingByKey({});
      setPanelBusyCount(0);
      return;
    }

    const loaded = loadChatsFromLS(userSwitchKey);
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
        setCurrentChatId,
        addMessage,
        removeMessageById,
        updateMessageById,
        setChatMessages,
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
    addMessage,
    removeMessageById,
    updateMessageById,
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
