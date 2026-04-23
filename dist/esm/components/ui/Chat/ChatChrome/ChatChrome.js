import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import cn from 'classnames';
import { displayLabelForBranchKeyFromMessages, humanizeBranchKey } from '../ChatMessage/presetScript.js';
import { TextShimmer } from '../../TextShimmer/TextShimmer.js';
import { Scroll } from '@homecode/ui';
import { X, PaperPlaneRightIcon, ChartLineIcon } from '@phosphor-icons/react';
import { Button } from '../../Button/Button.js';
import { PanelResizeHandle } from '../../Sidebar/Sidebar.js';
import SidebarStem from '../../Sidebar/Sidebar.styl.js';
import { Chat } from '../Chat.js';
import S from './ChatChrome.styl.js';

function ChatChrome({ showResizeHandle, resizeHandle, onClose, isEmpty, renderPresets, messages, onQuickReply, suppressedQuickReplyKeys, isLoading, scriptContinueLabel, onScriptContinue, renderMessageChart, showBranchActionsRow, showSyntheticBranchButtons, unusedBranchKeys, isScriptComplete, onGenerateDashboard, generatingDashboard, onGenerateDashboardClick, showInlinePresets, isLastMessageFromUser, scrollRef, effectiveScopeId, onPromptSubmit, onChatDeleted, promptPrefill, variant = 'sidebar', footerClassName, emptyState, }) {
    return (jsxs("div", { className: cn(S.panelRoot, S[`variant-${variant}`]), children: [showResizeHandle && resizeHandle ? (jsx(PanelResizeHandle, { edge: "leading", isActive: resizeHandle.isActive, startWidthPx: resizeHandle.startWidthPx, getShellWidth: resizeHandle.getShellWidth, onDragWidth: resizeHandle.onDragWidth, onDragComplete: resizeHandle.onDragComplete, className: cn(SidebarStem.sidebarResizeHandle, S.chatResizeHandle) })) : null, jsx("div", { className: S.panelHeader, children: onClose ? (jsx(Button, { type: "button", variant: "ghost", icon: true, className: S.panelClose, "aria-label": "Close chat", onClick: onClose, children: jsx(X, { className: "size-4" }) })) : null }), jsx("div", { className: S.content, children: jsxs(Chat, { isEmpty: isEmpty, children: [isEmpty ? (jsxs(Fragment, { children: [jsx(Chat.EmptyState, { ...emptyState }), renderPresets('fixed')] })) : (jsx("div", { className: S.scrollWrapper, children: jsxs(Scroll, { y: true, yScrollbarClassName: S.scrollbar, className: S.scroll, innerClassName: S.scrollInner, offset: { y: { before: 56, after: 180 } }, fadeSize: "m", autoHide: true, ref: scrollRef, children: [messages.map((msg, index, arr) => {
                                        const isLast = index === arr.length - 1;
                                        return (jsx(Chat.Message, { role: msg.role, text: msg.text, onQuickReply: onQuickReply, suppressedQuickReplyKeys: suppressedQuickReplyKeys, quickReplyDisabled: isLoading, isLastMessage: isLast, scriptContinue: isLast && scriptContinueLabel
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
                                                !generatingDashboard ? (jsxs(Button, { type: "button", variant: "default", size: "lg", disabled: isLoading, onClick: onGenerateDashboardClick, children: [jsx(ChartLineIcon, {}), "Generate Dashboard"] })) : null] })), showInlinePresets && renderPresets('inline'), isLoading && isLastMessageFromUser && (jsx(TextShimmer, { duration: 1, spread: 5, className: S.loader, children: "Thinking..." }))] }) })), jsx("div", { className: cn(S.footer, footerClassName), children: jsx(Chat.Prompt, { id: effectiveScopeId, onSubmit: onPromptSubmit, disabled: isLoading, onChatDeleted: onChatDeleted, prefillMessage: promptPrefill ?? undefined }) })] }) })] }));
}

export { ChatChrome };
