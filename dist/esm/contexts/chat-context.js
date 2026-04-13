import { jsx } from 'react/jsx-runtime';
import { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { MessageRole } from '../components/ui/Chat/Chat.types.js';
import { stripJsonDashboardFences } from '../lib/dashboard-spec/stripJsonDashboardFences.js';
import { LS } from '@homecode/ui';

const CHATS_PREFIX = 'chats-';
const CHAT_SCOPE_IDS_REGISTRY_KEY = 'chat-scope-ids';
const ChatContext = createContext(undefined);
function getCurrentChatIdKey(scopeId) {
    return `chat-current-id-${scopeId}`;
}
function getChatsKey(scopeId) {
    return `${CHATS_PREFIX}${scopeId}`;
}
function scopeIdsForUser(userId, all) {
    const prefix = `${userId}-`;
    const out = new Set();
    for (const id of all) {
        if (id.startsWith(prefix))
            out.add(id);
    }
    return out;
}
function discoverScopeIdsFromLS() {
    const scopeIds = new Set();
    const registryRaw = LS.get(CHAT_SCOPE_IDS_REGISTRY_KEY);
    const registry = Array.isArray(registryRaw) ? registryRaw : [];
    registry.forEach((id) => {
        if (typeof id === 'string' && id)
            scopeIds.add(id);
    });
    try {
        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key?.startsWith(CHATS_PREFIX)) {
                const scopeId = key.slice(CHATS_PREFIX.length);
                if (scopeId)
                    scopeIds.add(scopeId);
            }
        }
    }
    catch {
        // ignore
    }
    return scopeIds;
}
function loadChatsFromLS(userId) {
    if (typeof window === 'undefined' || userId === null) {
        return { chats: {}, currentChatId: {} };
    }
    const chats = {};
    const currentChatId = {};
    const scopeIds = scopeIdsForUser(userId, discoverScopeIdsFromLS());
    for (const scopeId of scopeIds) {
        const chatsKey = getChatsKey(scopeId);
        const storedRaw = LS.get(chatsKey);
        const stored = Array.isArray(storedRaw) ? storedRaw : undefined;
        if (stored?.length) {
            chats[scopeId] = stored;
            const ck = getCurrentChatIdKey(scopeId);
            const savedCurrentIdRaw = LS.get(ck);
            const savedCurrentId = typeof savedCurrentIdRaw === 'string' && savedCurrentIdRaw !== ''
                ? savedCurrentIdRaw
                : undefined;
            currentChatId[scopeId] = savedCurrentId ?? stored[0]?.session_id ?? null;
        }
    }
    return { chats, currentChatId };
}
function addScopeIdToRegistry(scopeId) {
    const raw = LS.get(CHAT_SCOPE_IDS_REGISTRY_KEY);
    const registry = Array.isArray(raw) ? [...raw] : [];
    if (!registry.includes(scopeId)) {
        LS.set(CHAT_SCOPE_IDS_REGISTRY_KEY, [...registry, scopeId]);
    }
}
function ChatProvider({ children, userSwitchKey, sendChatMessage: sendChatMessageFn, }) {
    const [chats, setChats] = useState(() => {
        if (userSwitchKey === null)
            return {};
        return loadChatsFromLS(userSwitchKey).chats;
    });
    const [currentChatId, setCurrentChatIdState] = useState(() => {
        if (userSwitchKey === null)
            return {};
        return loadChatsFromLS(userSwitchKey).currentChatId;
    });
    const getChatsForScopeId = useCallback((scopeId) => chats[scopeId] ?? [], [chats]);
    const getCurrentChatId = useCallback((scopeId) => {
        const v = currentChatId[scopeId];
        if (v == null || v === '')
            return null;
        return v;
    }, [currentChatId]);
    const newChat = useCallback((scopeId) => {
        if (userSwitchKey === null)
            return undefined;
        addScopeIdToRegistry(scopeId);
        const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newChat = {
            session_id: sessionId,
            name: '',
            messages: [],
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
    }, [userSwitchKey]);
    const setCurrentChatId = useCallback((currScopeId, sessionId) => {
        if (!sessionId)
            return;
        setCurrentChatIdState(prev => ({ ...prev, [currScopeId]: sessionId }));
        LS.set(getCurrentChatIdKey(currScopeId), sessionId);
    }, []);
    const deleteChat = useCallback((scopeId, sessionId) => {
        const chatsKey = getChatsKey(scopeId);
        const currentKey = getCurrentChatIdKey(scopeId);
        setChats(prev => {
            const scopeChats = prev[scopeId] ?? [];
            const deletedIndex = scopeChats.findIndex(c => c.session_id === sessionId);
            if (deletedIndex === -1) {
                return prev;
            }
            const updatedChats = scopeChats.filter(c => c.session_id !== sessionId);
            LS.set(chatsKey, updatedChats);
            setCurrentChatIdState(prevCurr => {
                if (prevCurr[scopeId] !== sessionId) {
                    return prevCurr;
                }
                const nextId = deletedIndex > 0
                    ? scopeChats[deletedIndex - 1].session_id
                    : (updatedChats[0]?.session_id ?? null);
                if (nextId) {
                    LS.set(currentKey, nextId);
                }
                else {
                    LS.remove(currentKey);
                }
                return { ...prevCurr, [scopeId]: nextId };
            });
            return { ...prev, [scopeId]: updatedChats };
        });
    }, []);
    const addMessage = useCallback((scopeId, chatId, role, text) => {
        if (userSwitchKey === null)
            return undefined;
        addScopeIdToRegistry(scopeId);
        const storedText = stripJsonDashboardFences(text);
        const newMessage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role,
            text: storedText,
            timestamp: Date.now(),
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
    }, [userSwitchKey]);
    const removeMessageById = useCallback((scopeId, chatId, messageId) => {
        if (userSwitchKey === null)
            return;
        setChats(prev => {
            const scopeChats = prev[scopeId] ?? [];
            const updatedChats = scopeChats.map(chat => {
                if (chat.session_id !== chatId)
                    return chat;
                return {
                    ...chat,
                    messages: chat.messages.filter(m => m.id !== messageId),
                };
            });
            const chatsKey = getChatsKey(scopeId);
            LS.set(chatsKey, updatedChats);
            return { ...prev, [scopeId]: updatedChats };
        });
    }, [userSwitchKey]);
    const sendMessage = useCallback(async (scopeId, message, chatId) => {
        const targetChatId = chatId ?? getCurrentChatId(scopeId);
        if (targetChatId === null || targetChatId === '') {
            throw new Error('No chat selected');
        }
        addMessage(scopeId, targetChatId, MessageRole.USER, message);
        try {
            const data = await sendChatMessageFn(message, targetChatId);
            if (data.session_id && data.session_id !== targetChatId) {
                setChats(prev => {
                    const scopeChats = prev[scopeId] ?? [];
                    const updatedChats = scopeChats.map(chat => chat.session_id === targetChatId
                        ? { ...chat, session_id: data.session_id }
                        : chat);
                    const chatsKey = getChatsKey(scopeId);
                    LS.set(chatsKey, updatedChats);
                    return { ...prev, [scopeId]: updatedChats };
                });
                setCurrentChatId(scopeId, data.session_id);
            }
            addMessage(scopeId, data.session_id ? data.session_id : targetChatId, MessageRole.ASSISTANT, data.response);
            return data.response;
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Sorry, I encountered an error processing your message. Please try again.';
            addMessage(scopeId, targetChatId, MessageRole.ASSISTANT, errorMessage);
            throw error;
        }
    }, [addMessage, getCurrentChatId, sendChatMessageFn, setCurrentChatId]);
    useEffect(() => {
        if (userSwitchKey === null) {
            setChats({});
            setCurrentChatIdState({});
            return;
        }
        const loaded = loadChatsFromLS(userSwitchKey);
        const updatedCurrentChatId = { ...loaded.currentChatId };
        for (const [scopeId, scopeChats] of Object.entries(loaded.chats)) {
            if (scopeChats.length > 0 &&
                (updatedCurrentChatId[scopeId] == null ||
                    updatedCurrentChatId[scopeId] === '')) {
                updatedCurrentChatId[scopeId] = scopeChats[0].session_id;
            }
        }
        setChats(loaded.chats);
        setCurrentChatIdState(updatedCurrentChatId);
    }, [userSwitchKey]);
    return (jsx(ChatContext.Provider, { value: {
            newChat,
            setCurrentChatId,
            addMessage,
            removeMessageById,
            sendMessage,
            getChatsForScopeId,
            getCurrentChatId,
            deleteChat,
        }, children: children }));
}
function useChats() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChats must be used within a ChatProvider');
    }
    return context;
}
function useChat(scopeId, chatId) {
    const { getChatsForScopeId } = useChats();
    if (!scopeId || !chatId)
        return null;
    const list = getChatsForScopeId(scopeId);
    return list.find(chat => chat.session_id === chatId) ?? null;
}
function useChatsForScopeId(scopeId) {
    const { getChatsForScopeId, getCurrentChatId, setCurrentChatId, newChat, addMessage, removeMessageById, sendMessage, deleteChat, } = useChats();
    const chats = getChatsForScopeId(scopeId);
    const currentChatId = getCurrentChatId(scopeId);
    return {
        chats,
        currentChatId,
        setCurrentChatId: (targetId) => setCurrentChatId(scopeId, targetId),
        newChat: () => newChat(scopeId),
        addMessage: (chatId, role, text) => addMessage(scopeId, chatId, role, text),
        removeMessageById: (chatId, messageId) => removeMessageById(scopeId, chatId, messageId),
        sendMessage: (message, chatId) => sendMessage(scopeId, message, chatId),
        deleteChat: (sessionId) => deleteChat(scopeId, sessionId),
    };
}
/** @deprecated Use useChatsForScopeId */
function useChatsForDataset(scopeId) {
    return useChatsForScopeId(scopeId);
}
function useCurrentChat(scopeId) {
    const { getCurrentChatId } = useChats();
    const chatId = getCurrentChatId(scopeId);
    return useChat(scopeId, chatId ?? undefined);
}

export { ChatContext, ChatProvider, useChat, useChats, useChatsForDataset, useChatsForScopeId, useCurrentChat };
