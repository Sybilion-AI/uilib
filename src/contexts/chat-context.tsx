'use client';

import { createContext, useContext } from 'react';

import type { Chat, MessageRole } from '@/components/ui/Chat/Chat.types';

export interface ChatContextType {
  newChat: (id: string) => string | undefined;
  setCurrentChatId: (currId: string, id: string) => void;
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
  addMessage: (
    id: string,
    chatId: string,
    role: MessageRole,
    text: string,
  ) => string | undefined;
  removeMessageById: (id: string, chatId: string, messageId: string) => void;
  sendMessage: (
    id: string,
    message: string,
    chatId?: string,
  ) => Promise<string>;
  getChatsForDataset: (id: string) => Chat[];
  getCurrentChatId: (id: string) => string | null;
  deleteChat: (datasetId: string, sessionId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChats() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChats must be used within ChatContext.Provider');
  }
  return context;
}

export function useChat(id: string | undefined, chatId: string | undefined): Chat | null {
  const { getChatsForDataset } = useChats();
  if (!id || !chatId) return null;
  const chats = getChatsForDataset(id);
  return chats.find(chat => chat.session_id === chatId) ?? null;
}

export function useChatsForDataset(id: string) {
  const {
    getChatsForDataset,
    getCurrentChatId,
    setCurrentChatId,
    newChat,
    addMessage,
    removeMessageById,
    sendMessage,
    deleteChat,
  } = useChats();
  const chats = getChatsForDataset(id);
  const currentChatId = getCurrentChatId(id);

  return {
    chats,
    currentChatId,
    setCurrentChatId: (targetId: string) => setCurrentChatId(id, targetId),
    newChat: () => newChat(id),
    addMessage: (chatId: string, role: MessageRole, text: string) =>
      addMessage(id, chatId, role, text),
    removeMessageById: (chatId: string, messageId: string) =>
      removeMessageById(id, chatId, messageId),
    sendMessage: (message: string, chatId?: string) =>
      sendMessage(id, message, chatId),
    deleteChat: (sessionId: string) => deleteChat(id, sessionId),
  };
}

export function useCurrentChat(datasetId: string) {
  const { getCurrentChatId } = useChats();
  const chatId = getCurrentChatId(datasetId);
  return useChat(datasetId, chatId ?? undefined);
}

export { ChatContext };
