import type { Chat, MessageRole } from '#uilib/components/ui/Chat/Chat.types';
export interface ChatContextType {
    newChat: (id: string) => string | undefined;
    setCurrentChatId: (currId: string, id: string) => void;
    endpoint: string;
    setEndpoint: (endpoint: string) => void;
    addMessage: (id: string, chatId: string, role: MessageRole, text: string) => string | undefined;
    removeMessageById: (id: string, chatId: string, messageId: string) => void;
    sendMessage: (id: string, message: string, chatId?: string) => Promise<string>;
    getChatsForDataset: (id: string) => Chat[];
    getCurrentChatId: (id: string) => string | null;
    deleteChat: (datasetId: string, sessionId: string) => void;
}
declare const ChatContext: import("react").Context<ChatContextType>;
export declare function useChats(): ChatContextType;
export declare function useChat(id: string | undefined, chatId: string | undefined): Chat | null;
export declare function useChatsForDataset(id: string): {
    chats: Chat[];
    currentChatId: string;
    setCurrentChatId: (targetId: string) => void;
    newChat: () => string;
    addMessage: (chatId: string, role: MessageRole, text: string) => string;
    removeMessageById: (chatId: string, messageId: string) => void;
    sendMessage: (message: string, chatId?: string) => Promise<string>;
    deleteChat: (sessionId: string) => void;
};
export declare function useCurrentChat(datasetId: string): Chat;
export { ChatContext };
