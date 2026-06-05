import cn from 'classnames';

import { InteractiveContent } from '#uilib/components/ui/InteractiveContent';
import { TextShimmer } from '#uilib/components/ui/TextShimmer';

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
}: ChatMessageProps) {
  const fileAttachments = userTextFileAttachmentsFromMessage({
    userTextFileAttachments,
  });
  const isAssistant = role === MessageRole.ASSISTANT;
  const isSystem = role === MessageRole.SYSTEM;

  return (
    <div className={cn(S.root, S[`role-${role}`])}>
      {isSystem ? (
        <div className={S.text}>
          {inProgress ? <TextShimmer as="span">{text}</TextShimmer> : text}
        </div>
      ) : isAssistant ? (
        <AgentMessageContent
          text={text}
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
          <div className={S.text}>
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
