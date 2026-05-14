import { ReactNode } from 'react';
import { type Chat, MessageRole } from '#uilib/components/ui/Chat/Chat.types';
import type { ChatResponse } from '#uilib/types/chat-api.types';
export type SendChatMessageFn = (message: string, targetChatId: string) => Promise<ChatResponse>;
export interface ChatContextType {
    /** Returns the new session id, or undefined if no user / not created. */
    newChat: (scopeId: string) => string | undefined;
    setCurrentChatId: (currScopeId: string, sessionId: string) => void;
    addMessage: (scopeId: string, chatId: string, role: MessageRole, text: string) => string | undefined;
    removeMessageById: (scopeId: string, chatId: string, messageId: string) => void;
    sendMessage: (scopeId: string, message: string, chatId?: string) => Promise<string>;
    getChatsForScopeId: (scopeId: string) => Chat[];
    getCurrentChatId: (scopeId: string) => string | null;
    deleteChat: (scopeId: string, sessionId: string) => void;
}
declare const ChatContext: import("react").Context<ChatContextType>;
export interface ChatProviderProps {
    children: ReactNode;
    /** When null, chat state is cleared (logged out). When set, only LS rows for scopes starting with `${userId}-` are loaded. */
    userSwitchKey: number | null;
    sendChatMessage: SendChatMessageFn;
}
export declare function ChatProvider({ children, userSwitchKey, sendChatMessage: sendChatMessageFn, }: ChatProviderProps): import("react/jsx-runtime").JSX.Element;
export declare const isChatEmpty: (chat: Chat | null) => boolean;
export declare function useChats(): ChatContextType;
export declare function useChat(scopeId: string | undefined, chatId: string | undefined): Chat | null;
export declare function useChatsForScopeId(scopeId: string): {
    chats: Chat[];
    currentChat: Chat;
    currentChatId: string;
    setCurrentChatId: (targetId: string) => void;
    newChat: () => string;
    addMessage: (chatId: string, role: MessageRole, text: string) => string;
    removeMessageById: (chatId: string, messageId: string) => void;
    sendMessage: (message: string, chatId?: string) => Promise<string>;
    deleteChat: (sessionId: string) => void;
};
/** @deprecated Use useChatsForScopeId */
export declare function useChatsForDataset(scopeId: string): {
    chats: Chat[];
    currentChat: Chat;
    currentChatId: string;
    setCurrentChatId: (targetId: string) => void;
    newChat: () => string;
    addMessage: (chatId: string, role: MessageRole, text: string) => string;
    removeMessageById: (chatId: string, messageId: string) => void;
    sendMessage: (message: string, chatId?: string) => Promise<string>;
    deleteChat: (sessionId: string) => void;
};
export declare function useCurrentChat(scopeId: string): Chat;
export { ChatContext };
