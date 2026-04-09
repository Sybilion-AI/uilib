import {
  applyFormatting,
  applyFormattingInline,
} from '#uilib/components/ui/Chat/ChatMessage/AgentMessageContent.helpers';

import S from './InteractiveContent.styl';

interface InteractiveContentProps {
  text: string;
  variant?: 'full' | 'inline';
}

export function InteractiveContent({
  text,
  variant = 'full',
}: InteractiveContentProps) {
  const parts =
    variant === 'inline' ? applyFormattingInline(text) : applyFormatting(text);

  return <span className={S.root}>{parts}</span>;
}
