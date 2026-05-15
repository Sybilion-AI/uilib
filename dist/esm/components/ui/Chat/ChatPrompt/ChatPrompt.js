import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import useEvent from '../../../../hooks/useEvent.js';
import { SendHorizontalIcon } from 'lucide-react';
import { Button } from '../../Button/Button.js';
import { Input } from '../../Input/Input.js';
import { syncChatPromptTextareaHeight } from './ChatPrompt.helpers.js';
import S from './ChatPrompt.styl.js';

function ChatPrompt({ onSubmit, placeholder, className, footer, prefillMessage, }) {
    const [message, setMessage] = useState('');
    const inputRef = useRef(null);
    useLayoutEffect(() => {
        const el = inputRef.current;
        if (!el)
            return;
        syncChatPromptTextareaHeight(el, message);
    }, [message]);
    useEffect(() => {
        if (prefillMessage != null && prefillMessage !== '') {
            setMessage(prefillMessage);
        }
    }, [prefillMessage]);
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
    return (jsxs("form", { onSubmit: handleSubmit, className: cn(S.root, className), children: [jsxs("div", { className: S.composer, children: [jsx("div", { className: S.notice, children: "Forecast Assistant can make mistakes." }), jsx(Input, { ref: inputRef, type: "textarea", rows: 1, value: message, onChange: e => setMessage(e.target.value), placeholder: placeholder || 'Type a message...', className: cn(S.input) }), jsx("div", { className: S.submitColumn, children: jsx(Button, { type: "submit", size: "sm", disabled: !message.trim(), children: jsx(SendHorizontalIcon, { size: 16 }) }) })] }), footer] }));
}

export { ChatPrompt };
