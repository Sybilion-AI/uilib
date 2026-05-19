import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useChatsForScopeId } from '../../../../contexts/chat-context.js';
import { Trash2Icon } from 'lucide-react';
import { Button } from '../../Button/Button.js';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../Select/Select.js';
import S from './ChatSelector.styl.js';

function ChatSelector({ id, className, onChatDeleted, }) {
    const { chats, currentChatId, setCurrentChatId, newChat, deleteChat } = useChatsForScopeId(id);
    const handleValueChange = (value) => {
        if (value === 'new') {
            newChat();
        }
        else if (value) {
            setCurrentChatId(value);
        }
    };
    const handleDeleteChat = () => {
        if (!currentChatId)
            return;
        const sid = currentChatId;
        deleteChat(sid);
        onChatDeleted?.(sid);
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
        return 'New chat';
    };
    return (jsxs("div", { className: S.wrapper, children: [jsx("div", { className: S.selectGrow, children: jsxs(Select, { variant: "clear", value: currentChatId?.toString() ?? '', onValueChange: handleValueChange, children: [jsx(SelectTrigger, { size: "sm", className: className ? cn(S.selectTrigger, className) : S.selectTrigger, children: jsx(SelectValue, { placeholder: "Select chat" }) }), jsxs(SelectContent, { children: [jsx(SelectItem, { value: "new", children: "+ New Chat" }), chats.map(chat => (jsx(SelectItem, { value: chat.session_id.toString(), selected: chat.session_id === currentChatId, children: getChatDisplayName(chat) }, chat.session_id)))] })] }) }), currentChatId && chats.length > 0 && (jsx(Button, { type: "button", variant: "ghost", size: "sm", className: S.deleteBtn, "aria-label": "Delete chat", onClick: handleDeleteChat, children: jsx(Trash2Icon, { size: 16 }) }))] }));
}

export { ChatSelector };
