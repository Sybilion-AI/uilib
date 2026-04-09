import { createContext, useContext } from 'react';

const ChatContext = createContext(undefined);
function useChats() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChats must be used within ChatContext.Provider');
    }
    return context;
}
function useChat(id, chatId) {
    const { getChatsForDataset } = useChats();
    if (!id || !chatId)
        return null;
    const chats = getChatsForDataset(id);
    return chats.find(chat => chat.session_id === chatId) ?? null;
}
function useChatsForDataset(id) {
    const { getChatsForDataset, getCurrentChatId, setCurrentChatId, newChat, addMessage, removeMessageById, sendMessage, deleteChat, } = useChats();
    const chats = getChatsForDataset(id);
    const currentChatId = getCurrentChatId(id);
    return {
        chats,
        currentChatId,
        setCurrentChatId: (targetId) => setCurrentChatId(id, targetId),
        newChat: () => newChat(id),
        addMessage: (chatId, role, text) => addMessage(id, chatId, role, text),
        removeMessageById: (chatId, messageId) => removeMessageById(id, chatId, messageId),
        sendMessage: (message, chatId) => sendMessage(id, message, chatId),
        deleteChat: (sessionId) => deleteChat(id, sessionId),
    };
}
function useCurrentChat(datasetId) {
    const { getCurrentChatId } = useChats();
    const chatId = getCurrentChatId(datasetId);
    return useChat(datasetId, chatId ?? undefined);
}

export { ChatContext, useChat, useChats, useChatsForDataset, useCurrentChat };
