import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import cn from 'classnames';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { displayLabelForBranchKeyFromMessages, humanizeBranchKey } from '../ChatMessage/presetScript.js';
import { TextShimmer } from '../../TextShimmer/TextShimmer.js';
import { Scroll } from '@homecode/ui';
import { X, PaperPlaneRightIcon, ChartLineIcon } from '@phosphor-icons/react';
import { Button } from '../../Button/Button.js';
import { DropZone } from '../../DropZone/DropZone.js';
import { PanelResizeHandle } from '../../Sidebar/Sidebar.js';
import SidebarStem from '../../Sidebar/Sidebar.styl.js';
import { Chat } from '../Chat.js';
import { filterToTextAttachments, isAttachmentsDropzoneEnabled, buildAcceptAttr } from '../chatAttachmentAccept.js';
import { extractChatAttachmentItems } from '../chatAttachmentExtract.js';
import S from './ChatChrome.styl.js';

function ChatChrome({ showResizeHandle, resizeHandle, onClose, isEmpty, renderPresets, messages, onQuickReply, suppressedQuickReplyKeys, isLoading, scriptContinueLabel, onScriptContinue, renderMessageChart, showBranchActionsRow, showSyntheticBranchButtons, unusedBranchKeys, isScriptComplete, onGenerateDashboard, generatingDashboard, onGenerateDashboardClick, showInlinePresets, isLastMessageFromUser, scrollRef, effectiveScopeId, onPromptSubmit, onChatDeleted, promptPrefill, footerClassName, emptyState, allowedAttachments, allowPdfAttachments = false, onAttachmentsDropped, }) {
    const filteredAllowedAttachments = useMemo(() => filterToTextAttachments(allowedAttachments), [allowedAttachments]);
    const attachmentsDropzoneEnabled = isAttachmentsDropzoneEnabled(allowedAttachments, allowPdfAttachments);
    const attachmentAccept = useMemo(() => buildAcceptAttr(filteredAllowedAttachments, allowPdfAttachments), [filteredAllowedAttachments, allowPdfAttachments]);
    const [pendingAttachments, setPendingAttachments] = useState([]);
    const [isExtractingAttachments, setIsExtractingAttachments] = useState(false);
    const promptBusy = isLoading || isExtractingAttachments;
    const handleAttachmentFiles = useCallback((files) => {
        if (promptBusy || files.length === 0)
            return;
        setIsExtractingAttachments(true);
        void extractChatAttachmentItems(files, allowPdfAttachments)
            .then(items => {
            if (items.length > 0) {
                setPendingAttachments(prev => [...prev, ...items]);
            }
        })
            .finally(() => setIsExtractingAttachments(false));
    }, [allowPdfAttachments, promptBusy]);
    const handleRemoveAttachment = useCallback((index) => {
        setPendingAttachments(prev => prev.filter((_, i) => i !== index));
    }, []);
    const handlePromptSubmitWithAttachments = useCallback((message, submittedAttachments) => {
        const trimmed = message.trim();
        const attachments = submittedAttachments ?? [];
        if (!trimmed && attachments.length === 0)
            return;
        void onPromptSubmit(trimmed, attachments);
        if (attachments.length > 0 && onAttachmentsDropped) {
            void onAttachmentsDropped(attachments);
        }
        setPendingAttachments([]);
    }, [onAttachmentsDropped, onPromptSubmit]);
    useEffect(() => {
        if (isEmpty)
            return;
        const scrollToBottom = () => {
            const inner = scrollRef.current?.innerElem;
            if (inner) {
                inner.scrollTo({
                    top: inner.scrollHeight + 1000,
                    behavior: 'smooth',
                });
            }
        };
        const inner = scrollRef.current?.innerElem;
        if (inner)
            setTimeout(scrollToBottom, 100);
    }, [isEmpty, messages.length]);
    return (jsxs("div", { className: S.root, children: [showResizeHandle && resizeHandle ? (jsx(PanelResizeHandle, { edge: "leading", isActive: resizeHandle.isActive, startWidthPx: resizeHandle.startWidthPx, getShellWidth: resizeHandle.getShellWidth, onDragWidth: resizeHandle.onDragWidth, onDragComplete: resizeHandle.onDragComplete, className: cn(SidebarStem.sidebarResizeHandle, S.chatResizeHandle) })) : null, jsx("div", { className: S.panelHeader, children: onClose ? (jsx(Button, { type: "button", variant: "ghost", icon: true, className: S.panelClose, "aria-label": "Close chat", onClick: onClose, children: jsx(X, { className: "size-4" }) })) : null }), jsxs("div", { className: S.content, children: [attachmentsDropzoneEnabled ? (jsx(DropZone, { accept: attachmentAccept, label: "Drop text files to attach", multiple: true, ghost: true, overlayScope: "container", disabled: promptBusy, className: S.attachmentDropzone, onFiles: handleAttachmentFiles })) : null, jsxs(Chat, { isEmpty: isEmpty, scopeId: effectiveScopeId, onChatDeleted: onChatDeleted, children: [isEmpty ? (jsxs(Fragment, { children: [jsx(Chat.EmptyState, { ...emptyState }), renderPresets('fixed')] })) : (jsx("div", { className: S.scrollWrapper, children: jsxs(Scroll, { y: true, yScrollbarClassName: S.scrollbar, className: S.scroll, innerClassName: S.scrollInner, offset: { y: { before: 56, after: 180 } }, fadeSize: "m", autoHide: true, ref: scrollRef, children: [messages.map((msg, index, arr) => {
                                            const isLast = index === arr.length - 1;
                                            return (jsx(Chat.Message, { role: msg.role, text: msg.text, userTextFileAttachments: msg.userTextFileAttachments, onQuickReply: onQuickReply, suppressedQuickReplyKeys: suppressedQuickReplyKeys, quickReplyDisabled: isLoading, isLastMessage: isLast, scriptContinue: isLast && scriptContinueLabel
                                                    ? { label: scriptContinueLabel }
                                                    : undefined, onScriptContinue: isLast && scriptContinueLabel
                                                    ? onScriptContinue
                                                    : undefined, renderMessageChart: renderMessageChart }, msg.id));
                                        }), showBranchActionsRow && (jsxs("div", { className: S.branchRow, children: [showSyntheticBranchButtons
                                                    ? unusedBranchKeys.map(key => {
                                                        const label = displayLabelForBranchKeyFromMessages(key, messages) ?? humanizeBranchKey(key);
                                                        return (jsx("span", { className: S.branchBtnWrap, children: jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: isLoading, onClick: () => onQuickReply(key, label), children: [jsx(PaperPlaneRightIcon, {}), label] }) }, key));
                                                    })
                                                    : null, isScriptComplete &&
                                                    onGenerateDashboard &&
                                                    !generatingDashboard ? (jsxs(Button, { type: "button", variant: "default", size: "lg", disabled: isLoading, onClick: onGenerateDashboardClick, children: [jsx(ChartLineIcon, {}), "Generate Dashboard"] })) : null] })), showInlinePresets && renderPresets('inline'), isLoading && isLastMessageFromUser && (jsx(TextShimmer, { duration: 1, spread: 5, className: S.loader, children: "Thinking..." }))] }) })), jsxs("div", { className: cn(S.footer, footerClassName), children: [isEmpty ? (jsx("div", { className: S.notice, children: "Forecast Assistant can make mistakes." })) : null, jsx(Chat.Prompt, { onSubmit: handlePromptSubmitWithAttachments, disabled: promptBusy, attachments: pendingAttachments, onRemoveAttachment: handleRemoveAttachment, prefillMessage: promptPrefill ?? undefined, attachmentAccept: attachmentsDropzoneEnabled ? attachmentAccept : undefined, onAttachmentFiles: attachmentsDropzoneEnabled ? handleAttachmentFiles : undefined })] })] })] })] }));
}

export { ChatChrome };
