import type { Message, UserTextFileAttachment } from './Chat.types';

/** File attachments on a stored message. */
export function userTextFileAttachmentsFromMessage(
  message: Pick<Message, 'userTextFileAttachments'>,
): UserTextFileAttachment[] {
  return message.userTextFileAttachments ?? [];
}
