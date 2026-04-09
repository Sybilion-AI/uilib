import cn from 'classnames';

import { TextShimmer } from '../../TextShimmer';
import {
  type ChatMessageProps,
  GENERATING_DASHBOARD_SYSTEM_TEXT,
  MessageRole,
} from '../Chat.types';
import { AgentMessageContent } from './AgentMessageContent';
import S from './ChatMessage.styl';

export function ChatMessage({
  role,
  text,
  onQuickReply,
  suppressedQuickReplyKeys,
  quickReplyDisabled,
  isLastMessage = true,
  scriptContinue,
  onScriptContinue,
  renderMessageChart,
}: ChatMessageProps) {
  const isAssistant = role === MessageRole.ASSISTANT;
  const isSystem = role === MessageRole.SYSTEM;

  return (
    <div className={cn(S.root, S[`role-${role}`])}>
      {isSystem ? (
        <div className={S.text}>
          {text === GENERATING_DASHBOARD_SYSTEM_TEXT ? (
            <TextShimmer as="span">{text}</TextShimmer>
          ) : (
            text
          )}
        </div>
      ) : isAssistant ? (
        <AgentMessageContent
          text={text}
          onQuickReply={onQuickReply}
          suppressedQuickReplyKeys={suppressedQuickReplyKeys}
          quickReplyDisabled={quickReplyDisabled}
          isLastMessage={isLastMessage}
          scriptContinue={scriptContinue}
          onScriptContinue={onScriptContinue}
          renderMessageChart={renderMessageChart}
        />
      ) : (
        <div className={S.text}>{text}</div>
      )}
    </div>
  );
}
