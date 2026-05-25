import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useRef, useCallback } from 'react';
import { EditorContent } from '@tiptap/react';
import { PaperclipIcon, SendHorizontalIcon } from 'lucide-react';
import { Button } from '../../Button/Button.js';
import S from './ChatPrompt.styl.js';

function ChatPromptComposer({ editor, disabled, trimmedMessage, attachments, attachmentAccept, onAttachmentFiles, onComposerKeyDown, }) {
    const fileInputRef = useRef(null);
    const showAttachButton = Boolean(attachmentAccept && onAttachmentFiles);
    const handleFileInputChange = useCallback((e) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        if (files.length > 0) {
            onAttachmentFiles?.(files);
        }
    }, [onAttachmentFiles]);
    const canSubmit = Boolean(trimmedMessage || attachments.length > 0);
    return (jsxs("div", { className: S.composer, children: [showAttachButton ? (jsxs(Fragment, { children: [jsx("input", { ref: fileInputRef, type: "file", accept: attachmentAccept, multiple: true, className: S.fileInput, disabled: disabled, onChange: handleFileInputChange }), jsx(Button, { type: "button", variant: "ghost", icon: true, size: "sm", className: S.attachButton, "aria-label": "Attach file", disabled: disabled, onClick: e => {
                            e.preventDefault();
                            fileInputRef.current?.click();
                        }, children: jsx(PaperclipIcon, { size: 16 }) })] })) : null, jsx("div", { className: S.editorWrap, onKeyDown: onComposerKeyDown, children: jsx(EditorContent, { editor: editor, className: S.editorMount }) }), jsx("div", { className: S.submitColumn, children: jsx(Button, { type: "submit", size: "sm", disabled: disabled || !canSubmit, onMouseDown: e => e.preventDefault(), children: jsx(SendHorizontalIcon, { size: 16 }) }) })] }));
}

export { ChatPromptComposer };
