import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useEffect } from 'react';
import { ChatSelector } from '../ChatSheet/ChatSelector.js';
import { useChatsForScopeId } from '../../../../contexts/chat-context.js';
import useEvent from '../../../../hooks/useEvent.js';
import { SendHorizontalIcon, Trash2Icon } from 'lucide-react';
import { Button } from '../../Button/Button.js';
import { Input } from '../../Input/Input.js';
import S from './ChatPrompt.styl.js';

function ChatPrompt({ onSubmit, placeholder, className, footer, id, onChatDeleted, prefillMessage, }) {
    const [message, setMessage] = useState('');
    const { currentChatId, deleteChat, chats } = useChatsForScopeId(id);
    useEffect(() => {
        if (prefillMessage != null && prefillMessage !== '') {
            setMessage(prefillMessage);
        }
    }, [prefillMessage]);
    const handleDeleteChat = () => {
        if (!currentChatId)
            return;
        const sid = currentChatId;
        deleteChat(sid);
        onChatDeleted?.(sid);
    };
    const handleSubmit = (e) => {
        const trimmedMessage = message.trim();
        if (trimmedMessage) {
            e.preventDefault();
            onSubmit(trimmedMessage);
            setMessage('');
        }
    };
    useEvent({
        event: 'keydown',
        callback: (e) => {
            if (e.key === 'Enter' && !(e.metaKey || e.shiftKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit(e);
                setMessage('');
            }
        },
    });
    return (jsxs("form", { onSubmit: handleSubmit, className: cn(S.root, className), children: [jsx(Input, { type: "textarea", value: message, onChange: e => setMessage(e.target.value), placeholder: placeholder || 'Type a message...', className: cn(S.input) }), jsxs("div", { className: S.actions, children: [jsx(Button, { type: "submit", size: "sm", disabled: !message.trim(), children: jsx(SendHorizontalIcon, { size: 16 }) }), jsx("div", { className: S.notice, children: "Forecast Assistant can make mistakes." }), jsxs("div", { className: S.selectorWrapper, children: [jsx(ChatSelector, { id: id, className: S.selector }), jsx(Button, { type: "button", variant: "ghost", size: "sm", "aria-label": "Delete chat", disabled: !currentChatId || chats.length === 0, onClick: handleDeleteChat, children: jsx(Trash2Icon, { size: 16 }) })] })] }), footer] }));
}

export { ChatPrompt };
