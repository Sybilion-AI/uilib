import { jsx, jsxs } from 'react/jsx-runtime';
import cn from 'classnames';
import { InteractiveContent } from '../../InteractiveContent/InteractiveContent.js';
import { TextShimmer } from '../../TextShimmer/TextShimmer.js';
import { MessageRole, GENERATING_DASHBOARD_SYSTEM_TEXT } from '../Chat.types.js';
import { userTextFileAttachmentsFromMessage } from '../userTextFileAttachments.js';
import { AgentMessageContent } from './AgentMessageContent.js';
import S from './ChatMessage.styl.js';
import { UserTextFileAttachmentBubble } from './UserTextFileAttachmentBubble.js';

function ChatMessage({ role, text, userTextFileAttachments, onQuickReply, suppressedQuickReplyKeys, quickReplyDisabled, isLastMessage = true, scriptContinue, onScriptContinue, renderMessageChart, }) {
    const fileAttachments = userTextFileAttachmentsFromMessage({
        userTextFileAttachments,
    });
    const isAssistant = role === MessageRole.ASSISTANT;
    const isSystem = role === MessageRole.SYSTEM;
    return (jsx("div", { className: cn(S.root, S[`role-${role}`]), children: isSystem ? (jsx("div", { className: S.text, children: text === GENERATING_DASHBOARD_SYSTEM_TEXT ? (jsx(TextShimmer, { as: "span", children: text })) : (text) })) : isAssistant ? (jsx(AgentMessageContent, { text: text, onQuickReply: onQuickReply, suppressedQuickReplyKeys: suppressedQuickReplyKeys, quickReplyDisabled: quickReplyDisabled, isLastMessage: isLastMessage, scriptContinue: scriptContinue, onScriptContinue: onScriptContinue, renderMessageChart: renderMessageChart })) : (jsxs("div", { className: S.userColumn, children: [jsx("div", { className: S.text, children: jsx(InteractiveContent, { text: text }) }), fileAttachments.map(attachment => (jsx(UserTextFileAttachmentBubble, { attachment: attachment }, `${attachment.displayName}:${attachment.filename}`)))] })) }));
}

export { ChatMessage };
