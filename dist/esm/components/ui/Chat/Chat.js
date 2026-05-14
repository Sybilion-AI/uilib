import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { ChatPresets } from './ChatPresets/ChatPresets.js';
import S from './Chat.styl.js';
import { ChatEmptyState } from './ChatEmptyState/ChatEmptyState.js';
import { ChatMessage } from './ChatMessage/ChatMessage.js';
import { ChatPrompt } from './ChatPrompt/ChatPrompt.js';
import { ChatSelector } from './ChatSheet/ChatSelector.js';

function Chat({ children, className, isEmpty, scopeId, onChatDeleted, ...props }) {
    return (jsxs("div", { className: cn(S.root, className, isEmpty && S.isEmpty), ...props, children: [scopeId ? (jsx("div", { className: S.header, children: jsx(ChatSelector, { id: scopeId, onChatDeleted: onChatDeleted }) })) : null, children] }));
}
Chat.Prompt = ChatPrompt;
Chat.Message = ChatMessage;
Chat.Presets = ChatPresets;
Chat.EmptyState = ChatEmptyState;

export { Chat };
