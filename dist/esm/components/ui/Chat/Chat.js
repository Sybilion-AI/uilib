import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { ChatPresets } from './ChatPresets/ChatPresets.js';
import S from './Chat.styl.js';
import { ChatEmptyState } from './ChatEmptyState/ChatEmptyState.js';
import { ChatMessage } from './ChatMessage/ChatMessage.js';
import { ChatPrompt } from './ChatPrompt/ChatPrompt.js';

function Chat({ children, className, isEmpty, ...props }) {
    return (jsx("div", { className: cn(S.root, className, isEmpty && S.isEmpty), ...props, children: children }));
}
Chat.Prompt = ChatPrompt;
Chat.Message = ChatMessage;
Chat.Presets = ChatPresets;
Chat.EmptyState = ChatEmptyState;

export { Chat };
