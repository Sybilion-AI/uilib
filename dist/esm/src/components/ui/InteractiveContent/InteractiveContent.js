import { jsx } from 'react/jsx-runtime';
import { applyFormattingInline, applyFormatting } from '../Chat/ChatMessage/AgentMessageContent.helpers.js';
import S from './InteractiveContent.styl.js';

function InteractiveContent({ text, variant = 'full', }) {
    const parts = variant === 'inline' ? applyFormattingInline(text) : applyFormatting(text);
    return jsx("span", { className: S.root, children: parts });
}

export { InteractiveContent };
