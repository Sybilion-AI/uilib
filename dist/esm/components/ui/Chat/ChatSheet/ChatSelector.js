import { jsxs, jsx } from 'react/jsx-runtime';
import { useChatsForScopeId } from '../../../../contexts/chat-context.js';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../Select/Select.js';

function ChatSelector({ id, className }) {
    const { chats, currentChatId, setCurrentChatId, newChat } = useChatsForScopeId(id);
    const handleValueChange = (value) => {
        if (value === 'new') {
            newChat();
        }
        else if (value) {
            setCurrentChatId(value);
        }
    };
    const getChatDisplayName = (chat) => {
        if (chat.name) {
            return chat.name;
        }
        if (chat.messages.length > 0) {
            const firstMessage = chat.messages[0];
            return (firstMessage.text.slice(0, 30) +
                (firstMessage.text.length > 30 ? '...' : ''));
        }
        return `Chat ${chat.session_id}`;
    };
    return (jsxs(Select, { value: currentChatId?.toString() ?? '', onValueChange: handleValueChange, children: [jsx(SelectTrigger, { size: "sm", className: className, children: jsx(SelectValue, { placeholder: "Select chat" }) }), jsxs(SelectContent, { children: [jsx(SelectItem, { value: "new", children: "+ New Chat" }), chats.map(chat => (jsx(SelectItem, { value: chat.session_id.toString(), selected: chat.session_id === currentChatId, children: getChatDisplayName(chat) }, chat.session_id)))] })] }));
}

export { ChatSelector };
