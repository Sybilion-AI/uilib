import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useRef, useCallback } from 'react';
import S from './ChatPrompt.styl.js';
import { ChatPromptAttachments } from './ChatPromptAttachments.js';
import { ChatPromptComposer } from './ChatPromptComposer.js';
import { useChatPromptEditor } from './useChatPromptEditor.js';

function ChatPrompt({ onSubmit, placeholder, className, footer, prefillMessage, slashCommandItems, onSlashItemCommand, attachments = [], onRemoveAttachment, disabled = false, attachmentAccept, onAttachmentFiles, }) {
    const attachmentsCount = attachments.length;
    const emitSubmitRef = useRef(() => { });
    const { editor, trimmedMessage, resetAfterSend, handleComposerKeyDown } = useChatPromptEditor({
        disabled,
        placeholder,
        slashCommandItems,
        onSlashItemCommand,
        prefillMessage,
        attachmentsCount,
        onEnterSubmit: () => emitSubmitRef.current(),
    });
    const emitSubmitAndClear = useCallback(() => {
        if (!editor)
            return;
        if (!trimmedMessage && attachmentsCount === 0)
            return;
        const msg = trimmedMessage;
        resetAfterSend();
        onSubmit(msg, attachmentsCount > 0 ? attachments : undefined);
    }, [
        attachments,
        attachmentsCount,
        editor,
        onSubmit,
        resetAfterSend,
        trimmedMessage,
    ]);
    emitSubmitRef.current = emitSubmitAndClear;
    const handleSubmitForm = useCallback((e) => {
        e?.preventDefault();
        emitSubmitAndClear();
    }, [emitSubmitAndClear]);
    if (!editor) {
        return null;
    }
    return (jsxs("form", { onSubmit: handleSubmitForm, className: cn(S.root, className), children: [jsx(ChatPromptAttachments, { attachments: attachments, onRemove: index => onRemoveAttachment?.(index), disabled: disabled }), jsx(ChatPromptComposer, { editor: editor, disabled: disabled, trimmedMessage: trimmedMessage, attachments: attachments, attachmentAccept: attachmentAccept, onAttachmentFiles: onAttachmentFiles, onComposerKeyDown: handleComposerKeyDown }), footer] }));
}

export { ChatPrompt };
