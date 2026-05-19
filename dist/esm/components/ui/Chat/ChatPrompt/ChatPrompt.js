import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import useEvent from '../../../../hooks/useEvent.js';
import { PaperclipIcon, SendHorizontalIcon } from 'lucide-react';
import { Button } from '../../Button/Button.js';
import { Input } from '../../Input/Input.js';
import { syncChatPromptTextareaHeight } from './ChatPrompt.helpers.js';
import S from './ChatPrompt.styl.js';
import { ChatPromptAttachments } from './ChatPromptAttachments.js';

function ChatPrompt({ onSubmit, placeholder, className, footer, prefillMessage, attachments = [], onRemoveAttachment, disabled = false, attachmentAccept, onAttachmentFiles, }) {
    const [message, setMessage] = useState('');
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const showAttachButton = Boolean(attachmentAccept && onAttachmentFiles);
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
        const hasAttachments = attachments.length > 0;
        if (trimmedMessage || hasAttachments) {
            e.preventDefault();
            onSubmit(trimmedMessage, hasAttachments ? attachments : undefined);
            setMessage('');
        }
    };
    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        if (files.length > 0) {
            onAttachmentFiles?.(files);
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
    return (jsxs("form", { onSubmit: handleSubmit, className: cn(S.root, className), children: [jsx(ChatPromptAttachments, { attachments: attachments, onRemove: index => onRemoveAttachment?.(index), disabled: disabled }), jsxs("div", { className: S.composer, children: [showAttachButton ? (jsxs(Fragment, { children: [jsx("input", { ref: fileInputRef, type: "file", accept: attachmentAccept, multiple: true, className: S.fileInput, disabled: disabled, onChange: handleFileInputChange }), jsx(Button, { type: "button", variant: "ghost", icon: true, size: "sm", className: S.attachButton, "aria-label": "Attach file", disabled: disabled, onClick: e => {
                                    e.preventDefault();
                                    fileInputRef.current?.click();
                                }, children: jsx(PaperclipIcon, { size: 16 }) })] })) : null, jsx(Input, { ref: inputRef, type: "textarea", rows: 1, value: message, onChange: e => setMessage(e.target.value), placeholder: placeholder || 'Type a message...', className: cn(S.input) }), jsx("div", { className: S.submitColumn, children: jsx(Button, { type: "submit", size: "sm", disabled: disabled || (!message.trim() && attachments.length === 0), children: jsx(SendHorizontalIcon, { size: 16 }) }) })] }), footer] }));
}

export { ChatPrompt };
