import cn from 'classnames';
import { useMemo } from 'react';

import { InteractiveContent } from '#uilib/components/ui/InteractiveContent';
import { TextShimmer } from '#uilib/components/ui/TextShimmer';
import { stripJsonDashboardFences } from '#uilib/lib/dashboard-spec/stripJsonDashboardFences';

import { type ChatMessageProps, MessageRole } from '../Chat.types';
import { userTextFileAttachmentsFromMessage } from '../userTextFileAttachments';
import { AgentMessageContent } from './AgentMessageContent';
import S from './ChatMessage.styl';
import { UserTextFileAttachmentBubble } from './UserTextFileAttachmentBubble';

export function ChatMessage({
  role,
  text,
  inProgress,
  userTextFileAttachments,
  onQuickReply,
  suppressedQuickReplyKeys,
  quickReplyDisabled,
  quickReplyHidden,
  isLastMessage = true,
  scriptContinue,
  onScriptContinue,
  renderMessageChart,
  message,
  renderSystemMessage,
  className,
  textClassName,
}: ChatMessageProps) {
  const fileAttachments = userTextFileAttachmentsFromMessage({
    userTextFileAttachments,
  });
  const isAssistant = role === MessageRole.ASSISTANT;
  const isSystem = role === MessageRole.SYSTEM;
  const assistantDisplayText = useMemo(
    () => (isAssistant ? stripJsonDashboardFences(text) : text),
    [isAssistant, text],
  );

  return (
    <div className={cn(S.root, S[`role-${role}`], className)}>
      {isSystem ? (
        <div className={cn(S.text, textClassName)}>
          {inProgress ? (
            <TextShimmer as="span">{text}</TextShimmer>
          ) : renderSystemMessage && message ? (
            renderSystemMessage(message)
          ) : (
            text
          )}
        </div>
      ) : isAssistant ? (
        <AgentMessageContent
          text={assistantDisplayText}
          textClassName={textClassName}
          onQuickReply={onQuickReply}
          suppressedQuickReplyKeys={suppressedQuickReplyKeys}
          quickReplyDisabled={quickReplyDisabled}
          quickReplyHidden={quickReplyHidden}
          isLastMessage={isLastMessage}
          scriptContinue={scriptContinue}
          onScriptContinue={onScriptContinue}
          renderMessageChart={renderMessageChart}
        />
      ) : (
        <div className={S.userColumn}>
          <div
            className={cn(S.text, textClassName && S.textCustom, textClassName)}
          >
            <InteractiveContent text={text} />
          </div>
          {fileAttachments.map(attachment => (
            <UserTextFileAttachmentBubble
              key={`${attachment.displayName}:${attachment.filename}`}
              attachment={attachment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
