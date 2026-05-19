import { FileChip } from '#uilib/components/ui/FileChip';

import type { ChatAttachmentDropItem } from '../Chat.types';
import S from './ChatPrompt.styl';

type ChatPromptAttachmentsProps = {
  attachments: ChatAttachmentDropItem[];
  onRemove: (index: number) => void;
  disabled?: boolean;
};

export function ChatPromptAttachments({
  attachments,
  onRemove,
  disabled = false,
}: ChatPromptAttachmentsProps) {
  if (attachments.length === 0) return null;

  return (
    <div className={S.attachments}>
      {attachments.map((item, index) => (
        <FileChip
          key={`${item.file.name}-${index}`}
          className={S.attachmentItem}
          name={item.file.name}
          format={item.kind === 'pdf' ? 'pdf' : 'text'}
          hint={
            item.kind === 'pdf'
              ? 'PDF'
              : item.kind === 'docx'
                ? 'Word document'
                : item.kind === 'xlsx'
                  ? 'Spreadsheet'
                  : 'Text file'
          }
          onRemove={() => onRemove(index)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
