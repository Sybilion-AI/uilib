import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useEffect } from 'react';
import useEvent from '../../../../hooks/useEvent.js';
import { SendHorizontalIcon } from 'lucide-react';
import { Button } from '../../Button/Button.js';
import { Input } from '../../Input/Input.js';
import S from './ChatPrompt.styl.js';

function ChatPrompt({ onSubmit, placeholder, className, footer, prefillMessage, }) {
    const [message, setMessage] = useState('');
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
    return (jsxs("form", { onSubmit: handleSubmit, className: cn(S.root, className), children: [jsx(Input, { type: "textarea", value: message, onChange: e => setMessage(e.target.value), placeholder: placeholder || 'Type a message...', className: cn(S.input) }), jsxs("div", { className: S.actions, children: [jsx(Button, { type: "submit", size: "sm", disabled: !message.trim(), children: jsx(SendHorizontalIcon, { size: 16 }) }), jsx("div", { className: S.notice, children: "Forecast Assistant can make mistakes." })] }), footer] }));
}

export { ChatPrompt };
